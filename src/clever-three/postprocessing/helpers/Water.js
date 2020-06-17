import {
  Clock, Color, LinearEncoding, Matrix4, Mesh, RepeatWrapping, ShaderMaterial,
  TextureLoader, UniformsLib, UniformsUtils, Vector2, Vector4
} from 'three'
import { Reflector } from './Reflector'
import { Refractor } from './Refractor'
import { cpNoise, simplexSimplex } from '../shaders/FragMethods'
var Water = function (geometry, options) {
  Mesh.call(this, geometry)

  this.type = 'Water'

  var scope = this

  options = options || {}

  var color = (options.color !== undefined)
    ? new Color(options.color)
    : new Color(0xFFFFFF)

  var textureWidth = options.textureWidth || 512
  var textureHeight = options.textureHeight || 512
  var clipBias = options.clipBias || 0
  var flowDirection = options.flowDirection || new Vector2(1, 0)
  var flowSpeed = options.flowSpeed || 0.03
  var reflectivity = options.reflectivity || 0.02
  var scale = options.scale || 1
  var shader = options.shader || Water.WaterShader
  var encoding = options.encoding !== undefined ? options.encoding : LinearEncoding

  var textureLoader = new TextureLoader()

  var flowMap = options.flowMap || undefined

  var normalMap0 = options.normalMap0 || textureLoader.load(
    '/files/images/textures/water_normal_01.jpg'
  )

  var normalMap1 = options.normalMap1 || textureLoader.load(
    '/files/images/textures/water_normal_02.jpg'
  )

  var cycle = 0.15
  var halfCycle = cycle * 0.5
  var textureMatrix = new Matrix4()
  var clock = new Clock()

  if (Reflector === undefined) {
    console.error('THREE.Water: Required component Reflector not found.')
    return
  }
  if (Refractor === undefined) {
    console.error('THREE.Water: Required component Refractor not found.')
    return
  }

  var reflector = new Reflector(geometry, {
    textureWidth: textureWidth,
    textureHeight: textureHeight,
    clipBias: clipBias,
    encoding: encoding
  })

  var refractor = new Refractor(geometry, {
    textureWidth: textureWidth,
    textureHeight: textureHeight,
    clipBias: clipBias,
    encoding: encoding
  })

  reflector.matrixAutoUpdate = false
  refractor.matrixAutoUpdate = false

  this.material = new ShaderMaterial({
    uniforms: UniformsUtils.merge([
      UniformsLib.fog,
      shader.uniforms
    ]),
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    transparent: true,
    fog: true
  })

  if (flowMap !== undefined) {
    this.material.defines.USE_FLOWMAP = ''
    this.material.uniforms.tFlowMap = {
      type: 't',
      value: flowMap
    }
  } else {
    this.material.uniforms.flowDirection = {
      type: 'v2',
      value: flowDirection
    }
  }

  normalMap0.wrapS = normalMap0.wrapT = RepeatWrapping
  normalMap1.wrapS = normalMap1.wrapT = RepeatWrapping

  this.material.uniforms.tReflectionMap.value = reflector.getRenderTarget().texture
  this.material.uniforms.tRefractionMap.value = refractor.getRenderTarget().texture
  this.material.uniforms.tNormalMap0.value = normalMap0
  this.material.uniforms.tNormalMap1.value = normalMap1

  this.material.uniforms.color.value = color
  this.material.uniforms.reflectivity.value = reflectivity
  this.material.uniforms.textureMatrix.value = textureMatrix

  this.material.uniforms.config.value.x = 0
  this.material.uniforms.config.value.y = halfCycle
  this.material.uniforms.config.value.z = halfCycle
  this.material.uniforms.config.value.w = scale

  function updateTextureMatrix (camera) {
    textureMatrix.set(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0
    )
    textureMatrix.multiply(camera.projectionMatrix)
    textureMatrix.multiply(camera.matrixWorldInverse)
    textureMatrix.multiply(scope.matrixWorld)
  }

  function updateFlow () {
    var delta = clock.getDelta()
    var config = scope.material.uniforms.config

    config.value.x += flowSpeed * delta
    config.value.y = config.value.x + halfCycle

    if (config.value.x >= cycle) {
      config.value.x = 0
      config.value.y = halfCycle
    } else if (config.value.y >= cycle) {
      config.value.y = config.value.y - cycle
    }
  }

  this.onBeforeRender = function (renderer, scene, camera) {
    updateTextureMatrix(camera)
    updateFlow()
    scope.visible = false
    reflector.matrixWorld.copy(scope.matrixWorld)
    refractor.matrixWorld.copy(scope.matrixWorld)
    reflector.onBeforeRender(renderer, scene, camera)
    refractor.onBeforeRender(renderer, scene, camera)
    scope.visible = true
  }
}

Water.prototype = Object.create(Mesh.prototype)
Water.prototype.constructor = Water

Water.WaterShader = {
  uniforms: {
    time: { type: 'f', value: 0 },
    color: { type: 'c', value: null },
    reflectivity: { type: 'f', value: 0 },
    tReflectionMap: { type: 't', value: null },
    tRefractionMap: { type: 't', value: null },
    tNormalMap0: { type: 't', value: null },
    tNormalMap1: { type: 't', value: null },
    textureMatrix: { type: 'm4', value: null },
    config: { type: 'v4', value: new Vector4() }
  },
  vertexShader: `
  #include <common>
  #include <fog_pars_vertex>
  #include <logdepthbuf_pars_vertex>
  ${simplexSimplex}
  ${cpNoise}
  uniform float time;
  uniform mat4 textureMatrix;
  varying vec4 vCoord;
  varying vec2 vUv;
  varying vec3 vToEye;
  void main() {
    vUv = uv;
    // vec3 d = position * 0.5 + time * 0.5;
    // float displacement = 2.0 * cnoise(d);
    // displacement *= 2.0 * simplexSimplex(d);
    // vec3 newPos = position + (normal * displacement);
    vCoord = textureMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vToEye = cameraPosition - worldPosition.xyz;
    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
    #include <logdepthbuf_vertex>
    #include <fog_vertex>
  }
  `,
  fragmentShader: `
  #include <common>
  #include <fog_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  uniform sampler2D tReflectionMap;
  uniform sampler2D tRefractionMap;
  uniform sampler2D tNormalMap0;
  uniform sampler2D tNormalMap1;
  #ifdef USE_FLOWMAP
    uniform sampler2D tFlowMap;
  #else
    uniform vec2 flowDirection;
  #endif
  uniform vec3 color;
  uniform float reflectivity;
  uniform vec4 config;
  varying vec4 vCoord;
  varying vec2 vUv;
  varying vec3 vToEye;
  void main() {
    #include <logdepthbuf_fragment>
    float flowMapOffset0 = config.x;
    float flowMapOffset1 = config.y;
    float halfCycle = config.z;
    float scale = config.w;
    vec3 toEye = normalize( vToEye );
    vec2 flow;
    #ifdef USE_FLOWMAP
      flow = texture2D(tFlowMap, vUv).rg * 2.0 - 1.0;
    #else
      flow = flowDirection;
    #endif
    flow.x *= - 1.0;
    vec4 normalColor0 = texture2D(
      tNormalMap0,
      (vUv * scale) + flow * flowMapOffset0
    );
    vec4 normalColor1 = texture2D(
      tNormalMap1,
      (vUv * scale) + flow * flowMapOffset1
    );
    float flowLerp = abs(
      halfCycle - flowMapOffset0
    ) / halfCycle;
    vec4 normalColor = mix(normalColor0, normalColor1, flowLerp);
    vec3 normal = normalize(
      vec3(
        normalColor.r * 2.0 - 1.0,
        normalColor.b,
        normalColor.g * 2.0 - 1.0
      )
    );
    float theta = max(dot(toEye, normal), 0.0 );
    float reflectance = reflectivity + (1.0 - reflectivity) * pow(abs((1.0 - theta )), 5.0);
    vec3 coord = vCoord.xyz / vCoord.w;
    vec2 uv = coord.xy + coord.z * normal.xz * 0.05;
    vec4 reflectColor = texture2D( tReflectionMap, vec2(1.0 - uv.x, uv.y));
    vec4 refractColor = texture2D( tRefractionMap, uv );
    vec3 c = color;
    // vec2 duv = vUv * 15.0;
    // c.r += floor(duv.x);
    // c.g += floor(duv.y);
    gl_FragColor = vec4(c, 1.0) * mix(refractColor, reflectColor, reflectance);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
  }
  `
}

export { Water }
