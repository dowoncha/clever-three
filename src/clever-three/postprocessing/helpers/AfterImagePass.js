import {
  WebGLRenderTarget, UniformsUtils, ShaderMaterial, MeshBasicMaterial,
  LinearFilter, RGBAFormat, NearestFilter
} from 'three'

import Pass from './Pass'
import AfterImageShader from '../shaders/AfterImageShader'

export default class AfterImagePass extends Pass {
  constructor (resolution, damp) {
    super()

    this.damp = damp
    this.shader = AfterImageShader
    this.uniforms = UniformsUtils.clone(this.shader.uniforms)
    this.uniforms.damp.value = this.damp !== undefined ? this.damp : 0.96

    this.textureComp = new WebGLRenderTarget(
      resolution.x,
      resolution.y,
      {
        minFilter: LinearFilter,
        magFilter: NearestFilter,
        format: RGBAFormat
      }
    )

    this.textureOld = new WebGLRenderTarget(
      resolution.x,
      resolution.y,
      {
        minFilter: LinearFilter,
        magFilter: NearestFilter,
        format: RGBAFormat
      }
    )

    this.shaderMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.shader.vertexShader,
      fragmentShader: this.shader.fragmentShader
    })

    this.compFsQuad = new Pass.FullScreenQuad(this.shaderMaterial)
    this.material = new MeshBasicMaterial()
    this.copyFsQuad = new Pass.FullScreenQuad(this.material)
  }

  render (renderer, writeBuffer, readBuffer) {
    this.uniforms.tOld.value = this.textureOld.texture
    this.uniforms.tNew.value = readBuffer.texture
    renderer.setRenderTarget(this.textureComp)
    this.compFsQuad.render(renderer)
    this.copyFsQuad.material.map = this.textureComp.texture
    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.copyFsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      this.copyFsQuad.render(renderer)
    }
    const temp = this.textureOld
    this.textureOld = this.textureComp
    this.textureComp = temp
  }

  setSize (width, height) {
    this.textureComp.setSize(width, height)
    this.textureOld.setSize(width, height)
  }

  setDamp (damp) {
    this.damp = damp
    this.uniforms.damp.value = this.damp
  }
}
