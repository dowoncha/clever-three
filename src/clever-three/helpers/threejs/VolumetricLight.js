import {
  Object3D, Color, RawShaderMaterial, FrontSide, DoubleSide, AdditiveBlending,
  MeshBasicMaterial, CylinderBufferGeometry, IcosahedronBufferGeometry,
  Matrix4, Vector3, Mesh
} from 'three'

export class VolumetricLight extends Object3D {
  constructor (options) {
    super()

    // Constructor settings ==================================================
    options = options || {}
    this.options = {
      radiusTop: options.radiusTop || 0.075,
      radiusBottom: options.radiusBottom || 0.8,
      height: options.height || 1.0,
      radialSegments: options.radialSegments || 72,
      heightSegments: options.heightSegments || 10,
      openEnded: false,
      color: options.color || new Color(0xffffff),
      strength: options.strength || 0.5,
      spread: options.spread || 6.0,
      maxDistance: options.maxDistance || 1.0,
      scale: options.scale || 1.0
    }
    this.color = this.options.color
    // =======================================================================

    // Shaders' uniforms =====================================================
    this.coneUniforms = {
      color: { type: 'c', value: this.options.color },
      maxDistance: { type: 'f', value: this.options.maxDistance },
      strength: { type: 'f', value: this.options.strength },
      spread: { type: 'f', value: this.options.spread }
    }

    this.glowUniforms = {
      color: { type: 'c', value: this.options.color },
      strength: { type: 'f', value: this.options.strength * 0.5 },
      spread: { type: 'f', value: this.options.spread }
    }
    // =======================================================================

    // Shaders ===============================================================
    const volumetricConeVertex = `
    precision highp float;
    attribute vec3 position;
    attribute vec3 normal;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat4 modelMatrix;
    uniform mat3 normalMatrix;
    uniform float maxDistance;
    varying vec3 e;
    varying vec3 n;
    varying float vFalloff;
    void main() {
      vFalloff = 1.0 - length(position) / maxDistance;
      vec3 direction = normalMatrix * vec3(0.0, 1.0, 0.0);
      e = normalize(vec3(modelViewMatrix * vec4(position, 1.0)));
      n = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
    `
    const volumetricConeFragment = `
    precision highp float;
    uniform float maxDistance;
    uniform vec3 color;
    uniform float strength;
    uniform float spread;
    varying float vFalloff;
    varying vec3 e;
    varying vec3 n;
    void main() {
      float softEdge = pow(abs(dot(normalize(e), normalize(n))), spread);
      float opacity = vFalloff * softEdge;
      gl_FragColor = vec4(color, strength * opacity);
    }
    `
    const volumetricGlowVertex = `
    precision highp float;
    attribute vec3 position;
    attribute vec3 normal;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat4 modelMatrix;
    uniform mat3 normalMatrix;
    uniform float spread;
    varying float vRim;
    void main() {
      vec3 e = normalize(vec3(modelViewMatrix * vec4(position, 1.0)));
      vec3 n = normalize(normalMatrix * normal);
      vRim = 50.*position.z * pow(abs(dot(e, n)), spread);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
    `
    const volumetricGlowFragment = `
    precision highp float;
    uniform vec3 color;
    uniform float strength;
    varying float vRim;
    void main() {
      gl_FragColor = vec4(color, strength * vRim);
    }
    `
    // =======================================================================

    // Materials =============================================================
    const coneMaterial = new RawShaderMaterial({
      uniforms: this.coneUniforms,
      vertexShader: volumetricConeVertex,
      fragmentShader: volumetricConeFragment,
      side: DoubleSide,
      depthWrite: false,
      depthTest: true,
      transparent: true,
      blending: AdditiveBlending
    })

    const glowMaterial = new RawShaderMaterial({
      uniforms: this.glowUniforms,
      vertexShader: volumetricGlowVertex,
      fragmentShader: volumetricGlowFragment,
      side: FrontSide,
      depthWrite: false,
      depthTest: true,
      transparent: true,
      blending: AdditiveBlending
    })

    const lightMaterial = new MeshBasicMaterial({
      color: this.options.color
    })
    // =======================================================================

    // Geometries ============================================================
    const coneGeometry = new CylinderBufferGeometry(
      this.options.radiusTop,
      this.options.radiusBottom,
      this.options.height,
      this.options.radialSegments,
      this.options.heightSegments,
      this.options.openEnded
    )
    coneGeometry.applyMatrix4(new Matrix4().makeRotationX(-Math.PI * 0.5))
    coneGeometry.applyMatrix4(new Matrix4().makeTranslation(0, 0, 0.5))

    const glowGeometry = new IcosahedronBufferGeometry(
      this.options.radiusTop, 3
    )

    const lightGeometry = new CylinderBufferGeometry(
      this.options.radiusBottom, this.options.radiusBottom, 0.01, 72
    )
    lightGeometry.applyMatrix4(new Matrix4().makeRotationX(-Math.PI * 0.5))
    // =======================================================================

    const pos = new Vector3()
    this.coneMesh = new Mesh(coneGeometry, coneMaterial.clone())
    this.coneMesh.scale.set(
      2 * this.options.scale,
      2 * this.options.scale,
      5 * this.options.scale
    )
    this.glowMesh = new Mesh(glowGeometry, glowMaterial.clone())
    this.glowMesh.position.copy(pos).multiplyScalar(0.45)
    this.glowMesh.scale.setScalar(12 * this.options.scale)
    this.lightMesh = new Mesh(lightGeometry, lightMaterial)
    this.lightMesh.scale.setScalar(0.1)

    this.add(this.lightMesh)
    this.add(this.glowMesh)
    this.add(this.coneMesh)
  }
}
