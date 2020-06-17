import {
  Vector2, Color, WebGLRenderTarget, UniformsUtils, ShaderMaterial,
  Vector3, MeshBasicMaterial, LinearFilter, RGBAFormat, AdditiveBlending
} from 'three'

import RenderingPass from './RenderingPass'
import LuminosityHighPassShader from '../shaders/LuminosityHighPassShader'
import CopyShader from '../shaders/CopyShader'
import { defaultVertexShader } from '../../glsl/common'

export default class BloomPass extends RenderingPass {
  constructor (resolution, strength, radius, threshold) {
    super()

    this.BlurDirectionX = new Vector2(1.0, 0.0)
    this.BlurDirectionY = new Vector2(0.0, 1.0)

    this.strength = (strength !== undefined) ? strength : 1
    this.radius = radius
    this.threshold = threshold
    this.resolution = (resolution !== undefined)
      ? new Vector2(resolution.x, resolution.y)
      : new Vector2(256, 256)

    this.clearColor = new Color(0, 0, 0)

    const pars = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat
    }

    this.rTargsH = []
    this.rTargsV = []
    this.nMips = 5
    let resx = Math.round(this.resolution.x / 2)
    let resy = Math.round(this.resolution.y / 2)

    this.renderTargetBright = new WebGLRenderTarget(
      resx, resy, pars
    )
    this.renderTargetBright.texture.name = 'UnrealBloomPass.bright'
    this.renderTargetBright.texture.generateMipmaps = false

    for (let i = 0; i < this.nMips; i++) {
      const renderTargetHorizonal = new WebGLRenderTarget(
        resx, resy, pars
      )
      renderTargetHorizonal.texture.name = 'UnrealBloomPass.h' + i
      renderTargetHorizonal.texture.generateMipmaps = false
      this.rTargsH.push(renderTargetHorizonal)
      const renderTargetVertical = new WebGLRenderTarget(
        resx, resy, pars
      )
      renderTargetVertical.texture.name = 'UnrealBloomPass.v' + i
      renderTargetVertical.texture.generateMipmaps = false
      this.rTargsV.push(renderTargetVertical)
      resx = Math.round(resx / 2)
      resy = Math.round(resy / 2)
    }

    const highPassShader = LuminosityHighPassShader
    this.highPassUniforms = UniformsUtils.clone(highPassShader.uniforms)

    this.highPassUniforms.luminosityThreshold.value = threshold
    this.highPassUniforms.smoothWidth.value = 0.01

    this.materialHighPassFilter = new ShaderMaterial({
      uniforms: this.highPassUniforms,
      vertexShader: highPassShader.vertexShader,
      fragmentShader: highPassShader.fragmentShader,
      defines: {}
    })

    this.sepBlurMat = []
    const kernelSizeArray = [3, 5, 7, 9, 11]
    resx = Math.round(this.resolution.x / 2)
    resy = Math.round(this.resolution.y / 2)

    for (let i = 0; i < this.nMips; i++) {
      this.sepBlurMat.push(this.getSeperableBlurMaterial(kernelSizeArray[i]))
      this.sepBlurMat[i].uniforms.texSize.value = new Vector2(resx, resy)
      resx = Math.round(resx / 2)
      resy = Math.round(resy / 2)
    }
    this.compMat = this.getCompositeMaterial(this.nMips)
    this.compMat.uniforms.blurTexture1.value = this.rTargsV[0].texture
    this.compMat.uniforms.blurTexture2.value = this.rTargsV[1].texture
    this.compMat.uniforms.blurTexture3.value = this.rTargsV[2].texture
    this.compMat.uniforms.blurTexture4.value = this.rTargsV[3].texture
    this.compMat.uniforms.blurTexture5.value = this.rTargsV[4].texture
    this.compMat.uniforms.bloomStrength.value = strength
    this.compMat.uniforms.bloomRadius.value = 0.1
    this.compMat.needsUpdate = true

    const bloomFactors = [1.0, 0.8, 0.6, 0.4, 0.2]
    this.compMat.uniforms.bloomFactors.value = bloomFactors
    this.bloomTintColors = [
      new Vector3(1, 1, 1),
      new Vector3(1, 1, 1),
      new Vector3(1, 1, 1),
      new Vector3(1, 1, 1),
      new Vector3(1, 1, 1)
    ]
    this.compMat.uniforms.bloomTintColors.value = this.bloomTintColors

    const copyShader = CopyShader

    this.copyUniforms = UniformsUtils.clone(copyShader.uniforms)
    this.copyUniforms.opacity.value = 1.0

    this.materialCopy = new ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: copyShader.vertexShader,
      fragmentShader: copyShader.fragmentShader,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    })

    this.enabled = true
    this.needsSwap = false
    this.oldClearColor = new Color()
    this.oldClearAlpha = 1
    this.basic = new MeshBasicMaterial()
  }

  setStrength (strength) {
    this.strength = strength
    this.compMat.uniforms.bloomStrength.value = strength
  }

  setRadius (radius) {
    this.radius = radius
    this.compMat.uniforms.bloomRadius.value = radius
  }

  setThreshold (threshold) {
    this.threshold = threshold
    this.highPassUniforms.luminosityThreshold.value = this.threshold
  }

  dispose () {
    const il = this.rTargsH.length
    const jl = this.rTargsV.length
    for (let i = 0; i < il; i++) {
      this.rTargsH[i].dispose()
    }
    for (let j = 0; j < jl; j++) {
      this.rTargsV[j].dispose()
    }
    this.renderTargetBright.dispose()
  }

  setSize (width, height) {
    let resx = Math.round(width / 2)
    let resy = Math.round(height / 2)
    this.renderTargetBright.setSize(resx, resy)

    for (let i = 0; i < this.nMips; i++) {
      this.rTargsH[i].setSize(resx, resy)
      this.rTargsV[i].setSize(resx, resy)
      this.sepBlurMat[i].uniforms.texSize.value = new Vector2(resx, resy)
      resx = Math.round(resx / 2)
      resy = Math.round(resy / 2)
    }
  }

  render (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    this.oldClearColor.copy(renderer.getClearColor())
    this.oldClearAlpha = renderer.getClearAlpha()
    const oldAutoClear = renderer.autoClear
    renderer.autoClear = false

    renderer.setClearColor(this.clearColor, 0)

    if (maskActive) { renderer.context.disable(renderer.context.STENCIL_TEST) }

    if (this.renderToScreen) {
      this.quad.material = this.basic
      this.basic.map = readBuffer.texture
      renderer.setRenderTarget(null)
      renderer.clear()
      renderer.render(this.scene, this.camera)
    }

    this.highPassUniforms.tDiffuse.value = readBuffer.texture
    this.highPassUniforms.luminosityThreshold.value = this.threshold
    this.quad.material = this.materialHighPassFilter

    renderer.setRenderTarget(this.renderTargetBright)
    renderer.clear()
    renderer.render(this.scene, this.camera)

    let inputRenderTarget = this.renderTargetBright

    for (let i = 0; i < this.nMips; i++) {
      this.quad.material = this.sepBlurMat[i]
      this.sepBlurMat[i].uniforms.colorTexture.value = inputRenderTarget.texture
      this.sepBlurMat[i].uniforms.direction.value = this.BlurDirectionX
      renderer.setRenderTarget(this.rTargsH[i])
      renderer.clear()
      renderer.render(this.scene, this.camera)

      this.sepBlurMat[i].uniforms.colorTexture.value = this.rTargsH[i].texture
      this.sepBlurMat[i].uniforms.direction.value = this.BlurDirectionY
      renderer.setRenderTarget(this.rTargsV[i])
      renderer.clear()
      renderer.render(this.scene, this.camera)
      inputRenderTarget = this.rTargsV[i]
    }

    this.quad.material = this.compMat
    this.compMat.uniforms.bloomStrength.value = this.strength
    this.compMat.uniforms.bloomRadius.value = this.radius
    this.compMat.uniforms.bloomTintColors.value = this.bloomTintColors
    renderer.setRenderTarget(this.rTargsH[0])
    renderer.clear()
    renderer.render(this.scene, this.camera)

    this.quad.material = this.materialCopy
    this.copyUniforms.tDiffuse.value = this.rTargsH[0].texture

    if (maskActive) { renderer.context.enable(renderer.context.STENCIL_TEST) }

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      renderer.render(this.scene, this.camera)
    } else {
      renderer.setRenderTarget(readBuffer)
      renderer.render(this.scene, this.camera)
    }

    renderer.setClearColor(this.oldClearColor, this.oldClearAlpha)
    renderer.autoClear = oldAutoClear
  }

  getSeperableBlurMaterial (kernelRadius) {
    return new ShaderMaterial({
      defines: {
        KERNEL_RADIUS: kernelRadius,
        SIGMA: kernelRadius
      },
      uniforms: {
        colorTexture: { value: null },
        texSize: { value: new Vector2(0.5, 0.5) },
        direction: { value: new Vector2(0.5, 0.5) }
      },
      vertexShader: defaultVertexShader,
      fragmentShader: `
#include <common>
varying vec2 vUv;
uniform sampler2D colorTexture;
uniform vec2 texSize;
uniform vec2 direction;
float gaussianPdf(in float x, in float sigma) {
  return 0.39894 * exp( -0.5 * x * x / ( sigma * sigma)) / sigma;
}void main() {
  vec2 invSize = 1.0 / texSize;
  float fSigma = float(SIGMA);
  float weightSum = gaussianPdf(0.0, fSigma);
  vec3 diffuseSum = texture2D(colorTexture, vUv).rgb * weightSum;
  for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
    float x = float(i);
    float w = gaussianPdf(x, fSigma);
    vec2 uvOffset = direction * invSize * x;
    vec3 sample1 = texture2D(colorTexture, vUv + uvOffset).rgb;
    vec3 sample2 = texture2D(colorTexture, vUv - uvOffset).rgb;
    diffuseSum += (sample1 + sample2) * w;
    weightSum += 2.0 * w;
  }
  gl_FragColor = vec4(diffuseSum / weightSum, 1.0);
}
`
    })
  }

  getCompositeMaterial (nMips) {
    return new ShaderMaterial({
      defines: {
        NUM_MIPS: nMips
      },
      uniforms: {
        blurTexture1: { value: null },
        blurTexture2: { value: null },
        blurTexture3: { value: null },
        blurTexture4: { value: null },
        blurTexture5: { value: null },
        dirtTexture: { value: null },
        bloomStrength: { value: 1.0 },
        bloomFactors: { value: null },
        bloomTintColors: { value: null },
        bloomRadius: { value: 0.0 }
      },
      vertexShader: defaultVertexShader,
      fragmentShader: `
precision highp float;
varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform sampler2D dirtTexture;
uniform float bloomStrength;
uniform float bloomRadius;
uniform float bloomFactors[NUM_MIPS];
uniform vec3 bloomTintColors[NUM_MIPS];
float lerpBloomFactor(const in float factor) {
  float mirrorFactor = 1.2 - factor;
  return mix(factor, mirrorFactor, bloomRadius);
}
void main() {
  gl_FragColor = bloomStrength * (
    lerpBloomFactor(bloomFactors[0]) *
    vec4(bloomTintColors[0], 1.0) *
    texture2D(blurTexture1, vUv) + lerpBloomFactor(bloomFactors[1]) *
    vec4(bloomTintColors[1], 1.0) *
    texture2D(blurTexture2, vUv) + lerpBloomFactor(bloomFactors[2]) *
    vec4(bloomTintColors[2], 1.0) *
    texture2D(blurTexture3, vUv) + lerpBloomFactor(bloomFactors[3]) *
    vec4(bloomTintColors[3], 1.0) *
    texture2D(blurTexture4, vUv) + lerpBloomFactor(bloomFactors[4]) *
    vec4(bloomTintColors[4], 1.0) *
    texture2D(blurTexture5, vUv)
  );
}
`
    })
  }
}
