import {
  OrthographicCamera, Scene, Mesh, PlaneBufferGeometry
} from 'three'

import Pass from './Pass'

export default class RenderingPass extends Pass {
  constructor () {
    super()
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.scene = new Scene()
    this.quad = new Mesh(new PlaneBufferGeometry(2, 2), null)
    this.scene.name = 'effectcomposer_scene'
    this.quad.name = 'effectcomposer_quad'
    this.quad.frustumCulled = false
    this.scene.add(this.quad)
  }
}
