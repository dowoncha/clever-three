import {
  OrthographicCamera, WebGLRenderTarget, ShaderMaterial, Scene, PlaneGeometry,
  Mesh, DataTexture, Float32Array, RepeatWrapping, NearestFilter, RGBAFormat,
  FloatType
} from 'three'

import { defaultVertexShader } from '../../glsl/common'

export default class FBOUtils {
  constructor (textureWidth, renderer, simulationShader) {
    this.textureWidth = textureWidth
    this.halfWidth = this.textureWidth * 0.5
    this.renderer = renderer
    this.simulationShader = simulationShader

    this.gl = this.renderer.getContext()

    if (!this.gl.getExtension('OES_texture_float')) {
      window.alert('No OES_texture_float support for float textures!')
      return
    }

    if (!this.gl.getParameter(this.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) === 0) {
      window.alert('No support for vertex shader textures!')
      return
    }

    this.cameraRTT = new OrthographicCamera(
      -this.halfWidth,
      this.halfWidth,
      this.halfWidth,
      -this.halfWidth,
      -1000000,
      1000000
    )

    this.cameraRTT.position.z = 100

    this.rtTexturePos = new WebGLRenderTarget(
      this.textureWidth,
      this.textureWidth,
      {
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
        stencilBuffer: false
      }
    )

    this.texture_cpu_to_gpu_vertex_shader = defaultVertexShader
    this.texture_cpu_to_gpu_fragment_shader = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tPositions;
    void main() {
        vec4 pos = texture2D( tPositions, vUv );
        gl_FragColor = pos;
    }`

    this.cpu_gpu_material = new ShaderMaterial({
      uniforms: {
        tPositions: { type: 't', value: null }
      },
      vertexShader: this.texture_cpu_to_gpu_vertex_shader,
      fragmentShader: this.texture_cpu_to_gpu_fragment_shader
    })

    this.sceneRTTPos = new Scene()
    this.sceneRTTPos.add(this.cameraRTT)

    this.plane = new PlaneGeometry(
      this.textureWidth,
      this.textureWidth
    )

    this.quad = new Mesh(this.plane, this.simulationShader)
    this.quad.position.z = -5000
    this.sceneRTTPos.add(this.quad)

    this.createTextureFromData = this.createTextureFromData.bind(this)
    this.renderToTexture = this.renderToTexture.bind(this)
    this.pushDataToTexture = this.pushDataToTexture.bind(this)
    this.simulate = this.simulate.bind(this)
  }

  createTextureFromData (width, height, data, options) {
    options || (options = {})

    const texture = new DataTexture(
      new Float32Array(data),
      width,
      height,
      RGBAFormat,
      FloatType,
      null,
      RepeatWrapping,
      RepeatWrapping,
      NearestFilter,
      NearestFilter
    )

    texture.needsUpdate = true

    return texture
  }

  renderToTexture (texture, renderToTexture) {
    this.cpu_gpu_material.uniforms.tPositions.value = texture
    this.renderer.setRenderTarget(renderToTexture)
    this.renderer.render(this.sceneRTTPos, this.cameraRTT)
    this.renderer.setRenderTarget(null)
  }

  pushDataToTexture (data, renderToTexture) {
    const texture = this.createTextureFromData(
      this.textureWidth,
      this.textureWidth,
      data
    )

    this.renderToTexture(texture, renderToTexture)
  }

  simulate (target) {
    this.renderer.setRenderTarget(target)
    this.renderer.render(this.sceneRTTPos, this.cameraRTT)
    this.renderer.setRenderTarget(null)
  }
}
