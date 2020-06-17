import { Shape, ExtrudeBufferGeometry } from 'three'

const roundedExtrudedPolygonGeometry = (
  radius,
  length,
  sides,
  steps = 1,
  bevelThickness = 0.01,
  bevelSize = 0.01,
  bevelSteps = 1
) => {
  const polygonShape = new Shape()
  polygonShape.moveTo(radius, 0)
  for (let j = 0; j < sides; j++) {
    const a = j * 2 * Math.PI / sides
    const x = radius * Math.cos(a)
    const y = radius * Math.sin(a)
    polygonShape.lineTo(x, y)
  }

  const extrudeSettings = {
    steps: steps,
    depth: length,
    bevelEnabled: true,
    bevelThickness: bevelThickness,
    bevelSize: bevelSize,
    bevelSegments: bevelSteps
  }

  const geometry = new ExtrudeBufferGeometry(polygonShape, extrudeSettings)
  return geometry
}

export { roundedExtrudedPolygonGeometry }
