// Common trigonometric constants ============================================
const halfPi = Math.PI / 2.0 //    π / 2 [ rad(deg(π/2)) or 90°
const gAng = 2.399963229728 //     τ / φ / φ [golden angle: pi * (3 - sqrt(5))]
const radian = 180.0 / Math.PI //  180 / π
// ===========================================================================

// Common Math functions =====================================================
export const isFloat = (n) => {
  return (
    ('.'.indexOf(n.toString())) &&
      (
        (typeof (n) === 'number' && n % 1 !== 0) ||
          !isNaN(parseFloat(n))
      )
  )
}

export const isAnyFloat = (n) => {
  return (
    ('.'.indexOf(n.toString())) &&
      (
        (typeof (n) === 'number') || !isNaN(parseFloat(n))
      )
  )
}

export const normalize = (n, max) => {
  return ((n / max) - 0.5) * 2.0
}

export const normalizeMinMax = (n, min, max) => {
  return (n - min) / (max - min)
}

export const mod = (n, m) => {
  return ((n % m) + m) % m
}

export const clamp = (n, min, max) => {
  return (n <= min) ? min : (n >= max) ? max : n
}

export const notCloseEnough = (target, n) => {
  return (Math.abs(target - n) > 0.01)
}

export const oscillate = (s, e, t, ts) => {
  return (e - s) / 2.0 + s + Math.sin(t * ts) * (e - s) / 2.0
}

export const round = (n, digits) => {
  return Number(n.toFixed(digits))
}

export const ease = (target, n, factor) => {
  return round((target - n) * factor, 5)
}

export const easeInSine = (elapsed, initial, change, duration) => {
  return -change * Math.cos((elapsed / duration) * halfPi) + change + initial
}

export const easeOutSine = (elapsed, initial, change, duration) => {
  return change * Math.sin((elapsed / duration) * halfPi) + initial
}

export const easeInQuad = (elapsed, initial, change, duration) => {
  return change * (elapsed /= duration) * elapsed + initial
}

export const easeOutQuad = (elapsed, initial, change, duration) => {
  return -change * (elapsed /= duration) * (elapsed - 2) + initial
}

export const degToRad = (degrees) => {
  return degrees * Math.PI / 180.0
}

export const radToDeg = (rad) => {
  return rad * radian
}

export const randomRange = (min, max) => {
  return min + Math.random() * (max - min)
}

export const intRandomRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const lerp = (n, min, max) => {
  return min + (max - min) * n
}

export const mix = (x, y, a) => {
  return (a <= 0) ? x : (a >= 1) ? y : x + a * (y - x)
}

export const coinFlip = (chance) => {
  return (Math.random() < chance)
}

export const polar = (rad1, rad2, radius) => {
  return [
    Math.cos(rad1) * Math.cos(rad2) * radius,
    Math.sin(rad1) * radius,
    Math.cos(rad1) * Math.sin(rad2) * radius
  ]
}

export const cartesianToSpherical = (x, y, z) => {
  const r = Math.sqrt(x * x + y * y + z * z)
  const theta = Math.acos(z / r)
  const phi = Math.atan2(y, x)
  return { r, theta, phi }
}

export const sphericalToCartesian = (r, theta, phi) => {
  const x = r * Math.sin(theta) * Math.cos(phi)
  const y = r * Math.sin(theta) * Math.sin(phi)
  const z = r * Math.cos(theta)
  return { x, y, z }
}

export const fibonacciSphere = (samples, scale) => {
  const points = []
  for (let i = 0; i < samples; i++) {
    const y = 1.0 - (i / (samples - 1)) * 2.0
    const radius = Math.sqrt(1.0 - y * y)
    const theta = gAng * i
    const x = Math.cos(theta) * radius
    const z = Math.sin(theta) * radius
    points.push({
      x: x * scale,
      y: y * scale,
      z: z * scale
    })
  }
  return points
}

export const avgArr = (arr) => {
  return (arr.reduce((sum, b) => { return sum + b }) / arr.length)
}

export const arrayMin = (array) => {
  if (array.length === 0) return Infinity
  var min = array[0]
  for (var i = 1, l = array.length; i < l; ++i) {
    if (array[i] < min) min = array[i]
  }
  return min
}

export const arrayMax = (array) => {
  if (array.length === 0) return -Infinity
  var max = array[0]
  for (var i = 1, l = array.length; i < l; ++i) {
    if (array[i] > max) max = array[i]
  }
  return max
}

export const pickFromArray = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}
// ===========================================================================
