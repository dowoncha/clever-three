import { BufferGeometry, BufferAttribute, Vector3 } from 'three'

export class RoundedBoxGeometry extends BufferGeometry {
  constructor (width, height, depth, radius, radiusSegments) {
    super(BufferGeometry)
    this.type = 'RoundedBoxGeometry'
    this.width = !isNaN(width) ? width : 1
    this.height = !isNaN(height) ? height : 1
    this.depth = !isNaN(depth) ? depth : 1
    this.radius = !isNaN(radius) ? radius : 0.15
    this.radius = Math.min(
      this.radius,
      Math.min(this.width, Math.min(this.height, Math.min(this.depth))) * 0.5
    )
    this.radiusSegments = !isNaN(radiusSegments)
      ? Math.max(1, Math.floor(radiusSegments))
      : 1
    this.edgeHalfWidth = this.width / 2 - this.radius
    this.edgeHalfHeight = this.height / 2 - this.radius
    this.edgeHalfDepth = this.depth / 2 - this.radius

    this.parameters = {
      width: this.width,
      height: this.height,
      depth: this.depth,
      radius: this.radius,
      radiusSegments: this.radiusSegments
    }

    this.rs1 = this.radiusSegments + 1 // radius segments + 1
    this.totalVertexCount = (this.rs1 * this.radiusSegments + 1) << 3
    this.positions = new BufferAttribute(
      new Float32Array(this.totalVertexCount * 3), 3
    )
    this.normals = new BufferAttribute(
      new Float32Array(this.totalVertexCount * 3), 3
    )
    this.cornerVerts = []
    this.cornerNormals = []
    this.normal = new Vector3()
    this.vertex = new Vector3()
    this.vertexPool = []
    this.normalPool = []
    this.indices = []
    this.lastVertex = this.rs1 * this.radiusSegments
    this.cornerVertNumber = this.rs1 * this.radiusSegments + 1

    this.doVertices()
    this.doFaces()
    this.doCorners()
    this.doHeightEdges()
    this.doWidthEdges()
    this.doDepthEdges()

    var index = 0
    for (let i = 0; i < this.vertexPool.length; i++) {
      this.positions.setXYZ(
        index,
        this.vertexPool[i].x,
        this.vertexPool[i].y,
        this.vertexPool[i].z
      )
      this.normals.setXYZ(
        index,
        this.normalPool[i].x,
        this.normalPool[i].y,
        this.normalPool[i].z
      )
      index++
    }

    this.setIndex(new BufferAttribute(new Uint16Array(this.indices), 1))
    this.setAttribute('position', this.positions)
    this.setAttribute('normal', this.normals)
  }

  doVertices () {
    const cornerLayout = [
      new Vector3(1, 1, 1),
      new Vector3(1, 1, -1),
      new Vector3(-1, 1, -1),
      new Vector3(-1, 1, 1),
      new Vector3(1, -1, 1),
      new Vector3(1, -1, -1),
      new Vector3(-1, -1, -1),
      new Vector3(-1, -1, 1)
    ]
    for (let i = 0; i < 8; i++) {
      this.cornerVerts.push([])
      this.cornerNormals.push([])
    }
    const halfPI = Math.PI / 2
    const cornerOffset = new Vector3(
      this.edgeHalfWidth, this.edgeHalfHeight, this.edgeHalfDepth
    )
    for (let j = 0; j <= this.radiusSegments; j++) {
      const v = j / this.radiusSegments
      const va = v * halfPI
      const cosVa = Math.cos(va)
      const sinVa = Math.sin(va)
      if (j === this.radiusSegments) {
        this.vertex.set(0, 1, 0)
        const vert = this.vertex.clone().multiplyScalar(
          this.radius
        ).add(cornerOffset)
        this.cornerVerts[0].push(vert)
        this.vertexPool.push(vert)
        const norm = this.vertex.clone()
        this.cornerNormals[0].push(norm)
        this.normalPool.push(norm)
        continue
      }
      for (let k = 0; k <= this.radiusSegments; k++) {
        const u = k / this.radiusSegments
        const ha = u * halfPI
        this.vertex.x = cosVa * Math.cos(ha)
        this.vertex.y = sinVa
        this.vertex.z = cosVa * Math.sin(ha)
        const vert = this.vertex.clone().multiplyScalar(
          this.radius
        ).add(cornerOffset)
        this.cornerVerts[0].push(vert)
        this.vertexPool.push(vert)
        const norm = this.vertex.clone().normalize()
        this.cornerNormals[0].push(norm)
        this.normalPool.push(norm)
      }
    }
    for (let l = 1; l < 8; l++) {
      for (let m = 0; m < this.cornerVerts[0].length; m++) {
        const vert = this.cornerVerts[0][m].clone().multiply(cornerLayout[l])
        this.cornerVerts[l].push(vert)
        this.vertexPool.push(vert)
        const norm = this.cornerNormals[0][m].clone().multiply(cornerLayout[l])
        this.cornerNormals[l].push(norm)
        this.normalPool.push(norm)
      }
    }
  }

  doCorners () {
    const flips = [true, false, true, false, false, true, false, true]
    const lastRowOffset = this.rs1 * (this.radiusSegments - 1)
    for (let i = 0; i < 8; i++) {
      const cornerOffset = this.cornerVertNumber * i
      for (let j = 0; j < this.radiusSegments - 1; j++) {
        const r1 = j * this.rs1
        const r2 = (j + 1) * this.rs1
        for (let k = 0; k < this.radiusSegments; k++) {
          const k1 = k + 1
          const a = cornerOffset + r1 + k
          const b = cornerOffset + r1 + k1
          const c = cornerOffset + r2 + k
          const d = cornerOffset + r2 + k1
          if (!flips[i]) {
            this.indices.push(a)
            this.indices.push(b)
            this.indices.push(c)
            this.indices.push(b)
            this.indices.push(d)
            this.indices.push(c)
          } else {
            this.indices.push(a)
            this.indices.push(c)
            this.indices.push(b)
            this.indices.push(b)
            this.indices.push(c)
            this.indices.push(d)
          }
        }
      }
      for (let l = 0; l < this.radiusSegments; l++) {
        const a = cornerOffset + lastRowOffset + l
        const b = cornerOffset + lastRowOffset + l + 1
        const c = cornerOffset + this.lastVertex
        if (!flips[i]) {
          this.indices.push(a)
          this.indices.push(b)
          this.indices.push(c)
        } else {
          this.indices.push(a)
          this.indices.push(c)
          this.indices.push(b)
        }
      }
    }
  }

  doFaces () {
    let a = this.lastVertex
    let b = this.lastVertex + this.cornerVertNumber
    let c = this.lastVertex + this.cornerVertNumber * 2
    let d = this.lastVertex + this.cornerVertNumber * 3
    this.indices.push(a)
    this.indices.push(b)
    this.indices.push(c)
    this.indices.push(a)
    this.indices.push(c)
    this.indices.push(d)
    a = this.lastVertex + this.cornerVertNumber * 4
    b = this.lastVertex + this.cornerVertNumber * 5
    c = this.lastVertex + this.cornerVertNumber * 6
    d = this.lastVertex + this.cornerVertNumber * 7
    this.indices.push(a)
    this.indices.push(c)
    this.indices.push(b)
    this.indices.push(a)
    this.indices.push(d)
    this.indices.push(c)
    a = 0
    b = this.cornerVertNumber
    c = this.cornerVertNumber * 4
    d = this.cornerVertNumber * 5
    this.indices.push(a)
    this.indices.push(c)
    this.indices.push(b)
    this.indices.push(b)
    this.indices.push(c)
    this.indices.push(d)
    a = this.cornerVertNumber * 2
    b = this.cornerVertNumber * 3
    c = this.cornerVertNumber * 6
    d = this.cornerVertNumber * 7
    this.indices.push(a)
    this.indices.push(c)
    this.indices.push(b)
    this.indices.push(b)
    this.indices.push(c)
    this.indices.push(d)
    a = this.radiusSegments
    b = this.radiusSegments + this.cornerVertNumber * 3
    c = this.radiusSegments + this.cornerVertNumber * 4
    d = this.radiusSegments + this.cornerVertNumber * 7
    this.indices.push(a)
    this.indices.push(b)
    this.indices.push(c)
    this.indices.push(b)
    this.indices.push(d)
    this.indices.push(c)
    a = this.radiusSegments + this.cornerVertNumber
    b = this.radiusSegments + this.cornerVertNumber * 2
    c = this.radiusSegments + this.cornerVertNumber * 5
    d = this.radiusSegments + this.cornerVertNumber * 6
    this.indices.push(a)
    this.indices.push(c)
    this.indices.push(b)
    this.indices.push(b)
    this.indices.push(c)
    this.indices.push(d)
  }

  doHeightEdges () {
    for (let i = 0; i < 4; i++) {
      const cOffset = i * this.cornerVertNumber
      const cRowOffset = 4 * this.cornerVertNumber + cOffset
      // eslint-disable-next-line no-self-compare
      const needsFlip = i & 1 === 1
      for (let j = 0; j < this.radiusSegments; j++) {
        const j1 = j + 1
        const a = cOffset + j
        const b = cOffset + j1
        const c = cRowOffset + j
        const d = cRowOffset + j1
        if (!needsFlip) {
          this.indices.push(a)
          this.indices.push(b)
          this.indices.push(c)
          this.indices.push(b)
          this.indices.push(d)
          this.indices.push(c)
        } else {
          this.indices.push(a)
          this.indices.push(c)
          this.indices.push(b)
          this.indices.push(b)
          this.indices.push(c)
          this.indices.push(d)
        }
      }
    }
  }

  doDepthEdges () {
    const cStarts = [0, 2, 4, 6]
    const cEnds = [1, 3, 5, 7]
    for (let i = 0; i < 4; i++) {
      const cStart = this.cornerVertNumber * cStarts[i]
      const cEnd = this.cornerVertNumber * cEnds[i]
      const needsFlip = i <= 1
      for (let u = 0; u < this.radiusSegments; u++) {
        const urs1 = u * this.rs1
        const u1rs1 = (u + 1) * this.rs1
        const a = cStart + urs1
        const b = cStart + u1rs1
        const c = cEnd + urs1
        const d = cEnd + u1rs1
        if (needsFlip) {
          this.indices.push(a)
          this.indices.push(c)
          this.indices.push(b)
          this.indices.push(b)
          this.indices.push(c)
          this.indices.push(d)
        } else {
          this.indices.push(a)
          this.indices.push(b)
          this.indices.push(c)
          this.indices.push(b)
          this.indices.push(d)
          this.indices.push(c)
        }
      }
    }
  }

  doWidthEdges () {
    const end = this.radiusSegments - 1
    const cStarts = [0, 1, 4, 5]
    const cEnds = [3, 2, 7, 6]
    const needsFlip = [0, 1, 1, 0]
    for (let i = 0; i < 4; i++) {
      const cStart = cStarts[i] * this.cornerVertNumber
      const cEnd = cEnds[i] * this.cornerVertNumber
      for (let u = 0; u <= end; u++) {
        const a = cStart + this.radiusSegments + u * this.rs1
        const b = cStart + (
          u !== end
            ? this.radiusSegments + (u + 1) * this.rs1
            : this.cornerVertNumber - 1
        )
        const c = cEnd + this.radiusSegments + u * this.rs1
        const d = cEnd + (
          u !== end
            ? this.radiusSegments + (u + 1) * this.rs1
            : this.cornerVertNumber - 1
        )
        if (!needsFlip[i]) {
          this.indices.push(a)
          this.indices.push(b)
          this.indices.push(c)
          this.indices.push(b)
          this.indices.push(d)
          this.indices.push(c)
        } else {
          this.indices.push(a)
          this.indices.push(c)
          this.indices.push(b)
          this.indices.push(b)
          this.indices.push(c)
          this.indices.push(d)
        }
      }
    }
  }
}
