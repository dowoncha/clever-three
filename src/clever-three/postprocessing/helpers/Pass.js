import { OrthographicCamera, PlaneBufferGeometry, Mesh } from 'three'

export default class Pass {
  constructor () {
    this.enabled = true
    this.needsSwap = true
    this.clear = false
    this.renderToScreen = false
  }

  setSize (width, height) { }

  render (renderer, writeBuffer, readBuffer, delta, maskActive) {
    console.error('THREE.Pass: .render() must be implemented in derived pass.')
  }
}

Pass.FullScreenQuad = (function () {
  var camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  var geometry = new PlaneBufferGeometry(2, 2)

  var FullScreenQuad = function (material) {
    this._mesh = new Mesh(geometry, material)
  }

  Object.defineProperty(FullScreenQuad.prototype, 'material', {

    get: function () {
      return this._mesh.material
    },

    set: function (value) {
      this._mesh.material = value
    }

  })

  Object.assign(FullScreenQuad.prototype, {

    dispose: function () {
      this._mesh.geometry.dispose()
    },

    render: function (renderer) {
      renderer.render(this._mesh, camera)
    }

  })

  return FullScreenQuad
})()
