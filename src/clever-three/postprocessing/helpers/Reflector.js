import {
  Mesh, Color, Plane, Vector3, Matrix4, Vector4, PerspectiveCamera,
  WebGLRenderTarget, DepthTexture, ShaderMaterial,
  LinearFilter, RGBFormat, UnsignedShortType, UniformsUtils, MathUtils
} from 'three'

var Reflector = function (geometry, options) {
  Mesh.call(this, geometry)
  this.type = 'Reflector'
  var scope = this

  options = options || {}
  var color = (options.color !== undefined)
    ? new Color(options.color)
    : new Color(0x7F7F7F)
  var textureWidth = options.textureWidth || 512
  var textureHeight = options.textureHeight || 512
  var clipBias = options.clipBias || 0
  var shader = options.shader || Reflector.ReflectorShader
  var recursion = options.recursion !== undefined ? options.recursion : 0

  var reflectorPlane = new Plane()
  var normal = new Vector3()
  var reflectorWorldPosition = new Vector3()
  var cameraWorldPosition = new Vector3()
  var rotationMatrix = new Matrix4()
  var lookAtPosition = new Vector3(0, 0, -1)
  var clipPlane = new Vector4()
  var viewport = new Vector4()
  var view = new Vector3()
  var target = new Vector3()
  var q = new Vector4()

  var textureMatrix = new Matrix4()
  var virtualCamera = new PerspectiveCamera()

  var parameters = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBFormat,
    stencilBuffer: false
  }

  var renderTarget = new WebGLRenderTarget(
    textureWidth, textureHeight, parameters
  )

  renderTarget.depthBuffer = true
  renderTarget.depthTexture = new DepthTexture()
  renderTarget.depthTexture.type = UnsignedShortType

  if (
    !MathUtils.isPowerOfTwo(textureWidth) ||
    !MathUtils.isPowerOfTwo(textureHeight)
  ) {
    renderTarget.texture.generateMipmaps = false
  }

  var material = new ShaderMaterial({
    uniforms: UniformsUtils.clone(shader.uniforms),
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    transparent: true
  })

  material.uniforms.tDiffuse.value = renderTarget.texture
  material.uniforms.tDepth.value = renderTarget.depthTexture
  material.uniforms.color.value = color
  material.uniforms.textureMatrix.value = textureMatrix

  this.material = material
  this.renderOrder = -Infinity // render first

  this.onBeforeRender = function (renderer, scene, camera) {
    if ('recursion' in camera.userData) {
      if (camera.userData.recursion === recursion) return
      camera.userData.recursion++
    }

    reflectorWorldPosition.setFromMatrixPosition(scope.matrixWorld)
    cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld)

    rotationMatrix.extractRotation(scope.matrixWorld)

    normal.set(0, 0, 1)
    normal.applyMatrix4(rotationMatrix)

    view.subVectors(reflectorWorldPosition, cameraWorldPosition)

    if (view.dot(normal) > 0) return

    view.reflect(normal).negate()
    view.add(reflectorWorldPosition)

    rotationMatrix.extractRotation(camera.matrixWorld)

    lookAtPosition.set(0, 0, -1)
    lookAtPosition.applyMatrix4(rotationMatrix)
    lookAtPosition.add(cameraWorldPosition)

    target.subVectors(reflectorWorldPosition, lookAtPosition)
    target.reflect(normal).negate()
    target.add(reflectorWorldPosition)

    virtualCamera.position.copy(view)
    virtualCamera.up.set(0, 1, 0)
    virtualCamera.up.applyMatrix4(rotationMatrix)
    virtualCamera.up.reflect(normal)
    virtualCamera.lookAt(target)

    virtualCamera.far = camera.far

    virtualCamera.updateMatrixWorld()
    virtualCamera.projectionMatrix.copy(camera.projectionMatrix)

    virtualCamera.userData.recursion = 0

    this.material.uniforms.cameraNear.value = camera.near
    this.material.uniforms.cameraFar.value = camera.far
    textureMatrix.set(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0
    )
    textureMatrix.multiply(virtualCamera.projectionMatrix)
    textureMatrix.multiply(virtualCamera.matrixWorldInverse)
    textureMatrix.multiply(scope.matrixWorld)

    reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition)
    reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse)

    clipPlane.set(
      reflectorPlane.normal.x,
      reflectorPlane.normal.y,
      reflectorPlane.normal.z,
      reflectorPlane.constant
    )

    var projectionMatrix = virtualCamera.projectionMatrix

    q.x = (
      Math.sign(clipPlane.x) + projectionMatrix.elements[8]
    ) / projectionMatrix.elements[0]

    q.y = (
      Math.sign(clipPlane.y) + projectionMatrix.elements[9]
    ) / projectionMatrix.elements[5]

    q.z = -1.0
    q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14]

    clipPlane.multiplyScalar(2.0 / clipPlane.dot(q))
    projectionMatrix.elements[2] = clipPlane.x
    projectionMatrix.elements[6] = clipPlane.y
    projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias
    projectionMatrix.elements[14] = clipPlane.w

    scope.visible = false
    var currentRenderTarget = renderer.getRenderTarget()
    var currentVrEnabled = renderer.xr.enabled
    var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate
    renderer.xr.enabled = false
    renderer.shadowMap.autoUpdate = false

    renderer.setRenderTarget(renderTarget)
    renderer.clear()
    renderer.render(scene, virtualCamera)
    // renderer.render(scene, virtualCamera, renderTarget, true)

    renderer.xr.enabled = currentVrEnabled
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate

    renderer.setRenderTarget(currentRenderTarget)

    var bounds = camera.bounds
    if (bounds !== undefined) {
      var size = renderer.getSize()
      var pixelRatio = renderer.getPixelRatio()
      viewport.x = bounds.x * size.width * pixelRatio
      viewport.y = bounds.y * size.height * pixelRatio
      viewport.z = bounds.z * size.width * pixelRatio
      viewport.w = bounds.w * size.height * pixelRatio
      renderer.state.viewport(viewport)
    }

    scope.visible = true
  }
  this.getRenderTarget = function () { return renderTarget }
}

Reflector.prototype = Object.create(Mesh.prototype)
Reflector.prototype.constructor = Reflector
Reflector.ReflectorShader = {
  uniforms: {
    color: { type: 'c', value: null },
    tDiffuse: { type: 't', value: null },
    tDepth: { type: 't', value: null },
    textureMatrix: { type: 'm4', value: null },
    cameraNear: { type: 'f', value: 0 },
    cameraFar: { type: 'f', value: 0 },
    fogColor: { type: 'c', value: new Vector3(0, 0, 0) },
    fogNear: { type: 'f', value: 0 },
    fogFar: { type: 'f', value: 1500 }
  },
  vertexShader: `
  uniform mat4 textureMatrix;
  varying vec4 vUv;
  void main() {
    vUv = textureMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  fragmentShader: `
  #include <packing>
  uniform vec3 color;
  uniform sampler2D tDiffuse;
  uniform sampler2D tDepth;
  uniform float cameraNear;
  uniform float cameraFar;
  uniform vec3 fogColor;
  uniform float fogNear;
  uniform float fogFar;
  varying vec4 vUv;
  float blendOverlay(in float base, in float blend) {
    return(
      (base < 0.5)
        ? (2.0 * base * blend)
        : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend))
    );
  }
  vec3 blendOverlay(in vec3 base, in vec3 blend) {
    return vec3(
      blendOverlay(base.r, blend.r),
      blendOverlay(base.g, blend.g),
      blendOverlay(base.b, blend.b)
    );
  }
  float readDepth(in sampler2D depthSampler, in vec4 coord) {
    float fragCoordZ = texture2DProj(depthSampler, coord).x;
    float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
    return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
  }
  void main() {
    vec4 base = texture2DProj(tDiffuse, vUv);
    float depth = readDepth(tDepth, vUv);
    float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
    gl_FragColor = vec4(blendOverlay(base.rgb, color), 1.0 - (depth * 7000.0));
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor);
  }
  `
}

export { Reflector }
