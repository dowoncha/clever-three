import {
  Color, FrontSide, LinearFilter, MathUtils, Matrix4, Mesh, PerspectiveCamera,
  Plane, RGBFormat, ShaderMaterial, UniformsLib, UniformsUtils, Vector2,
  Vector3, Vector4, WebGLRenderTarget
} from 'three'

class Water extends Mesh {
  constructor (geometry, options) {
    super(geometry)

    this.options = {
      textureWidth: options.textureWidth || 512,
      textureHeight: options.textureHeight || 512,
      clipBias: options.clipBias || 0.0,
      alpha: options.alpha || 1.0,
      time: options.time || 0.0,
      noiseSampler: options.noiseSampler || null,
      normalSampler: options.waterNormals || null,
      sunDirection: options.sunDirection || new Vector3(0.70707, 0.70707, 0.0),
      sunColor: new Color(options.sunColor || 0xffffff),
      waterColor: new Color(options.waterColor || 0x7F7F7F),
      eye: options.eye || new Vector3(0, 0, 0),
      distortionScale: options.distortionScale || 20.0,
      side: options.side || FrontSide,
      fog: options.fog || false
    }

    const mirrorPlane = new Plane()
    const normal = new Vector3()
    const mirrorWorldPosition = new Vector3()
    const cameraWorldPosition = new Vector3()
    const rotationMatrix = new Matrix4()
    const lookAtPosition = new Vector3(0, 0, -1)
    const clipPlane = new Vector4()
    const view = new Vector3()
    const target = new Vector3()
    const q = new Vector4()
    const textureMatrix = new Matrix4()
    const mirrorCamera = new PerspectiveCamera()
    const parameters = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBFormat,
      stencilBuffer: false
    }

    const renderTarget = new WebGLRenderTarget(
      this.options.textureWidth,
      this.options.textureHeight,
      parameters
    )

    const wNotPoT = !MathUtils.isPowerOfTwo(this.options.textureWidth)
    const hNotPoT = !MathUtils.isPowerOfTwo(this.options.textureHeight)

    if (wNotPoT || hNotPoT) { renderTarget.texture.generateMipmaps = false }

    const mirrorShader = {
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        UniformsLib.lights,
        {
          mouse: { value: new Vector2() },
          noiseSampler: { value: null },
          normalSampler: { value: null },
          mirrorSampler: { value: null },
          alpha: { value: 1.0 },
          time: { value: 0.0 },
          size: { value: 1.0 },
          distortionScale: { value: 20.0 },
          textureMatrix: { value: new Matrix4() },
          sunColor: { value: new Color(0x7F7F7F) },
          sunDirection: { value: new Vector3(0.70707, 0.70707, 0) },
          eye: { value: new Vector3() },
          waterColor: { value: new Color(0x555555) }
        }
      ]),
      vertexShader: `
      uniform mat4 textureMatrix;
      uniform float time;
      varying vec4 mirrorCoord;
      varying vec4 worldPosition;
      #include <common>
      #include <fog_pars_vertex>
      #include <shadowmap_pars_vertex>
      #include <logdepthbuf_pars_vertex>
      void main() {
        mirrorCoord = modelMatrix * vec4( position, 1.0 );
        worldPosition = mirrorCoord.xyzw;
        mirrorCoord = textureMatrix * mirrorCoord;
        vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
      #include <logdepthbuf_vertex>
      #include <fog_vertex>
      #include <shadowmap_vertex>
      }
      `,
      fragmentShader: `
      uniform sampler2D noiseSampler;
      uniform sampler2D mirrorSampler;
      uniform float alpha;
      uniform float time;
      uniform float size;
      uniform float distortionScale;
      uniform sampler2D normalSampler;
      uniform vec3 sunColor;
      uniform vec3 sunDirection;
      uniform vec3 eye;
      uniform vec2 mouse;
      uniform vec3 waterColor;
      varying vec4 mirrorCoord;
      varying vec4 worldPosition;
      const mat2 mtx = mat2( 0.80,  0.60, -0.60,  0.80 );
      vec4 getNoise( vec2 uv ) {
        vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
        vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
        vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
        vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
        vec4 noise = texture2D( normalSampler, uv0 ) +
          texture2D( normalSampler, uv1 ) +
          texture2D( normalSampler, uv2 ) +
          texture2D( normalSampler, uv3 );
        return noise * 0.5 - 1.0;
      }
      void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
        vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
        float direction = max( 0.0, dot( eyeDirection, reflection ) );
        specularColor += pow( direction, shiny ) * sunColor * spec;
        diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
      }
      float noise ( in vec2 x ) {
          vec2 p = floor( x );
          vec2 f = fract( x );
          f = f * f * ( 3.0 - 2.0 * f );
          float a = texture2D( noiseSampler, ( p + vec2( 0.5, 0.5 ) ) / 256.0, 0.0 ).x;
          float b = texture2D( noiseSampler, ( p + vec2( 1.5, 0.5 ) ) / 256.0, 0.0 ).x;
          float c = texture2D( noiseSampler, ( p + vec2( 0.5, 1.5 ) ) / 256.0, 0.0 ).x;
          float d = texture2D( noiseSampler, ( p + vec2( 1.5, 1.5 ) ) / 256.0, 0.0 ).x;
          return mix( mix( a, b, f.x ), mix( c, d, f.x ), f.y );
      }
      float fbm ( in vec2 p, in vec2 m, in vec2 uv ) {
          float mp = ( 10.0 - length( ( ( ( uv - 0.5 ) - m * 2.0 ) * 10.0 ) ) ) * 0.25;
          float f = 0.0;
          f += 0.500000 * noise( p ); p = mtx * ( p - m * 3.6 * mp * 0.9 ) * 2.02;
          f += 0.250000 * noise( p ); p = mtx * ( p - m * 3.0 * mp * 0.7 ) * 2.03;
          f += 0.125000 * noise( p ); p = mtx * ( p - m * 2.4 * mp * 0.5 ) * 2.01;
          f += 0.062500 * noise( p ); p = mtx * ( p - m * 1.8 * mp * 0.3 ) * 2.04;
          f += 0.031250 * noise( p ); p = mtx * ( p - m * 1.2 * mp * 0.1 ) * 2.01;
          f += 0.015625 * noise( p - m );
          return f / 0.96875;
      }
      #include <common>
      #include <packing>
      #include <bsdfs>
      #include <fog_pars_fragment>
      #include <logdepthbuf_pars_fragment>
      #include <lights_pars_begin>
      #include <shadowmap_pars_fragment>
      #include <shadowmask_pars_fragment>
      void main() {
      #include <logdepthbuf_fragment>
      vec4 noise = getNoise( worldPosition.xz * size );
      vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );
      vec3 diffuseLight = vec3(0.0);
      vec3 specularLight = vec3(0.0);
      vec3 worldToEye = eye-worldPosition.xyz;
      vec3 eyeDirection = normalize( worldToEye );
      sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );
      float distance = length(worldToEye);
      vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
      vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );
      float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
      float rf0 = 0.3;
      float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
      vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
      vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);
      vec3 outgoingLight = albedo;
      gl_FragColor = vec4( outgoingLight, alpha );
      //gl_FragColor = vec4( eyeDirection * reflectance, 1.0 );
      #include <tonemapping_fragment>
      #include <fog_fragment>
      }
      `
    }
    const material = new ShaderMaterial({
      fragmentShader: mirrorShader.fragmentShader,
      vertexShader: mirrorShader.vertexShader,
      uniforms: UniformsUtils.clone(mirrorShader.uniforms),
      lights: true,
      side: this.options.side,
      fog: this.options.fog
    })
    material.uniforms.mirrorSampler.value = renderTarget.texture
    material.uniforms.textureMatrix.value = textureMatrix
    material.uniforms.alpha.value = this.options.alpha
    material.uniforms.time.value = this.options.time
    material.uniforms.noiseSampler.value = this.options.noiseSampler
    material.uniforms.normalSampler.value = this.options.normalSampler
    material.uniforms.sunColor.value = this.options.sunColor
    material.uniforms.waterColor.value = this.options.waterColor
    material.uniforms.sunDirection.value = this.options.sunDirection
    material.uniforms.distortionScale.value = this.options.distortionScale
    material.uniforms.eye.value = this.options.eye

    this.material = material

    this.onBeforeRender = (renderer, scene, camera) => {
      mirrorWorldPosition.setFromMatrixPosition(this.matrixWorld)
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld)
      rotationMatrix.extractRotation(this.matrixWorld)
      normal.set(0, 0, 1)
      normal.applyMatrix4(rotationMatrix)
      view.subVectors(mirrorWorldPosition, cameraWorldPosition)

      // Avoid rendering when mirror is facing away
      if (view.dot(normal) > 0) { return }

      view.reflect(normal).negate()
      view.add(mirrorWorldPosition)
      rotationMatrix.extractRotation(camera.matrixWorld)
      lookAtPosition.set(0, 0, -1)
      lookAtPosition.applyMatrix4(rotationMatrix)
      lookAtPosition.add(cameraWorldPosition)
      target.subVectors(mirrorWorldPosition, lookAtPosition)
      target.reflect(normal).negate()
      target.add(mirrorWorldPosition)
      mirrorCamera.position.copy(view)
      mirrorCamera.up.set(0, 1, 0)
      mirrorCamera.up.applyMatrix4(rotationMatrix)
      mirrorCamera.up.reflect(normal)
      mirrorCamera.lookAt(target)
      mirrorCamera.far = camera.far // Used in WebGLBackground
      mirrorCamera.updateMatrixWorld()
      mirrorCamera.projectionMatrix.copy(camera.projectionMatrix)
      // Update the texture matrix
      textureMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0)
      textureMatrix.multiply(mirrorCamera.projectionMatrix)
      textureMatrix.multiply(mirrorCamera.matrixWorldInverse)
      // Now update projection matrix with new clip plane,
      // implementing code from: http://www.terathon.com/code/oblique.html
      // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
      mirrorPlane.setFromNormalAndCoplanarPoint(normal, mirrorWorldPosition)
      mirrorPlane.applyMatrix4(mirrorCamera.matrixWorldInverse)
      clipPlane.set(mirrorPlane.normal.x, mirrorPlane.normal.y, mirrorPlane.normal.z, mirrorPlane.constant)
      const projectionMatrix = mirrorCamera.projectionMatrix
      q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0]
      q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5]
      q.z = -1.0
      q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14]
      // Calculate the scaled plane vector
      clipPlane.multiplyScalar(2.0 / clipPlane.dot(q))
      // Replacing the third row of the projection matrix
      projectionMatrix.elements[2] = clipPlane.x
      projectionMatrix.elements[6] = clipPlane.y
      projectionMatrix.elements[10] = clipPlane.z + 1.0 - this.options.clipBias
      projectionMatrix.elements[14] = clipPlane.w

      this.options.eye.setFromMatrixPosition(camera.matrixWorld)

      const currentRenderTarget = renderer.getRenderTarget()
      const currentXrEnabled = renderer.xr.enabled
      const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate
      this.visible = false

      renderer.xr.enabled = false // Avoid camera modification and recursion
      renderer.shadowMap.autoUpdate = false // Avoid re-computing shadows
      renderer.setRenderTarget(renderTarget)

      if (renderer.autoClear === false) { renderer.clear() }

      renderer.render(scene, mirrorCamera)
      this.visible = true
      renderer.xr.enabled = currentXrEnabled
      renderer.shadowMap.autoUpdate = currentShadowAutoUpdate
      renderer.setRenderTarget(currentRenderTarget)

      // Restore viewport
      const viewport = camera.viewport
      if (viewport !== undefined) { renderer.state.viewport(viewport) }
    }
  }
}

export { Water }
