// Common trigonometric constants ============================================
const halfPi = Math.PI / 2.0 //    π / 2 [ rad(deg(π/2)) or 90°
const gAng = 2.399963229728 //     τ / φ / φ [golden angle: pi * (3 - sqrt(5))]
const radian = 180.0 / Math.PI //  180 / π
// ===========================================================================

// Common Math functions =====================================================
/**
 * Checks if number is a an integer (or round float).
 * @param {number} n Number to be ckecked
 * @return {boolean} True if n is an integer or a round float
 */
export const isInt = Number.isInteger || function (n) {
  return (
    typeof n === 'number' &&
    isFinite(n) &&
    Math.floor(n) === n
  )
}

/**
 * Returns a normalized value (between -1.0 and 1.0) from the provided number
 * given its provided maximum range value.
 * Eg. normalize(15.0, 20.0) returns 0.5.
 * @param {number} n Value to be normalized
 * @param {number} max Maximum range value
 * @return {number} Normalized value
 */
export const normalize = (n, max) => {
  return ((n / max) - 0.5) * 2.0
}

/**
 * Returns a normalized value (between 0.0 and 1.0) from the provided number
 * given a range between (inclusive) provided Minimum and Maximum values.
 * Eg. normalizeMinMax(17.5, 15.0, 20.0) returns 0.5.
 * @param {number} n Value to be normalized
 * @param {number} min Minimum range value
 * @param {number} max Maximum range value
 * @return {number} Normalized value
 */
export const normalizeMinMax = (n, min, max) => {
  return (n - min) / (max - min)
}

/**
 * Finds the remainder after the dividion of one number (n), by another (m)
 * which is called the modulus of the operation.
 * @param {number} n Dividend
 * @param {number} m Divisor
 * @return {number} Remainder
 */
export const mod = (n, m) => {
  return ((n % m) + m) % m
}

/**
 * Constrain a provided number (n) to lie between two further provided
 * values (min and max).
 * @param {number} n Number to be constrained
 * @param {number} min Minimum value that value (n) should be constrained to
 * @param {number} max Maximum value that value (n) should be constrained to
 * @return {number} Constrained value
 */
export const clamp = (n, min, max) => {
  return (n <= min) ? min : (n >= max) ? max : n
}

/**
 * Checks if a provided number (n) is close enough to a further provided
 * value (target) given a provided threshold (threshold). Will return true
 * if the absolute distance between n and target is less than threshold.
 * @param {number} n Number to be checked regarding approximation to target
 * @param {number} target Target value that number (n) is getting closer to
 * @param {number} threshold Threshold to be considered close enough
 * @return {boolean} True if n is not close enough to target given threshold
 */
export const notCloseEnough = (n, target, threshold = 0.00015) => {
  return (Math.abs(target - n) > threshold)
}

/**
 * Returns a value that will keep oscillating between (exclusive due to
 * precision) a given range (composed by start and end values) in function
 * of the provided timer and timeScale (time multiplier).
 * @param {number} start Start of the range to oscillate between
 * @param {number} end End of the range to oscillate between
 * @param {number} timer Timer value
 * @param {number} timeScale Timer multiplier
 * @return {number} Oscillating value
 */
export const oscillate = (start, end, timer, timeScale) => {
  return (
    (end - start) / 2.0 + start + Math.sin(timer * timeScale) *
    (end - start) / 2.0
  )
}

/**
 * Rounds a provided value (n) to a given further provided amount of decimal
 * places (digits).
 * @param {number} n Number to round
 * @param {number} digits Amount of decimal places to round the number to
 * @return {number} Rounded value
 */
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

/**
 * Converts a given angle value from degrees to radians.
 * @param {number} degrees Value (in degrees) to be converted to radians
 * @return {number} Value in radians
 */
export const degToRad = (degrees) => {
  return degrees * Math.PI / 180.0
}

/**
 * Converts a given angle value from radians ro degrees.
 * @param {number} rad Value (in radians) to be converted to degrees
 * @return {number} Value in degrees
 */
export const radToDeg = (rad) => {
  return rad * radian
}

/**
 * Generates a pseudo-random float between (inclusive) provided minumum
 * and maximum values.
 * @param {number} min Minumum value
 * @param {*} max Maximum value
 * @return {number} Pseudo-random generated float between min and max
 */
export const randomRange = (min, max) => {
  return min + Math.random() * (max - min)
}

/**
 * Generates and returns a pseudo-random round value (int) bentween
 * (inclusive) provided minimum and maximum values.
 * @param {number} min Minimum value
 * @param {number} max Maximum value
 * @return {number} Rounded pseudo-random generated number
 */
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
