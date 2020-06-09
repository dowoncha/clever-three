// Seeded pseudo random generator ============================================
//
// Usage: this.prng = new Math.seedrandom(123456)
// replace 123456 by any seed you want.
// Get your random numbers by const myVariable = this.prng()
(function (global, pool, math) {
  var width = 256
  var chunks = 6
  var digits = 52
  var rngname = 'random'
  var startdenom = math.pow(width, chunks)
  var significance = math.pow(2, digits)
  var overflow = significance * 2
  var mask = width - 1
  var nodecrypto
  function seedrandom (seed, options, callback) {
    var key = []
    options = (options === true) ? { entropy: true } : (options || {})
    var shortseed = mixkey(flatten(
      options.entropy
        ? [seed, tostring(pool)]
        : (seed == null)
          ? autoseed() : seed, 3
    ), key)
    var arc4 = new ARC4(key)
    var prng = function () {
      var n = arc4.g(chunks)
      var d = startdenom
      var x = 0
      while (n < significance) {
        n = (n + x) * width
        d *= width
        x = arc4.g(1)
      }
      while (n >= overflow) {
        n /= 2
        d /= 2
        x >>>= 1
      }
      return (n + x) / d
    }
    prng.int32 = function () { return arc4.g(4) | 0 }
    prng.quick = function () { return arc4.g(4) / 0x100000000 }
    prng.double = prng
    mixkey(tostring(arc4.S), pool)
    return (options.pass || callback ||
        function (prng, seed, isMathCall, state) {
          if (state) {
            if (state.S) { copy(state, arc4) }
            prng.state = function () { return copy(arc4, {}) }
          }
          if (isMathCall) {
            math[rngname] = prng
            return seed
          } else {
            return prng
          }
        })(
      prng,
      shortseed,
      'global' in options ? options.global : (this === math),
      options.state
    )
  }
  function ARC4 (key) {
    var t; var keylen = key.length
    var me = this; var i = 0; var j = me.i = me.j = 0; var s = me.S = []
    if (!keylen) { key = [keylen++] }
    while (i < width) { s[i] = i++ }
    for (i = 0; i < width; i++) {
      s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))]
      s[j] = t
    }
    (me.g = function (count) {
      var t; var r = 0
      var i = me.i; var j = me.j; var s = me.S
      while (count--) {
        t = s[i = mask & (i + 1)]
        r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))]
      }
      me.i = i; me.j = j
      return r
    })(width)
  }
  function copy (f, t) {
    t.i = f.i
    t.j = f.j
    t.S = f.S.slice()
    return t
  }
  function flatten (obj, depth) {
    var result = []; var typ = (typeof obj); var prop
    if (depth && typ === 'object') {
      for (prop in obj) {
        try { result.push(flatten(obj[prop], depth - 1)) } catch (e) {}
      }
    }
    return (result.length ? result : typ === 'string' ? obj : obj + '\0')
  }
  function mixkey (seed, key) {
    var stringseed = seed + ''; var smear; var j = 0
    while (j < stringseed.length) {
      key[mask & j] =
        mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++))
    }
    return tostring(key)
  }
  function autoseed () {
    try {
      var out
      if (nodecrypto && (out = nodecrypto.randomBytes)) {
        out = out(width)
      } else {
        out = new Uint8Array(width);
        (global.crypto || global.msCrypto).getRandomValues(out)
      }
      return tostring(out)
    } catch (e) {
      var browser = global.navigator
      var plugins = browser && browser.plugins
      return [+new Date(), global, plugins, global.screen, tostring(pool)]
    }
  }
  function tostring (a) { return String.fromCharCode.apply(0, a) }
  mixkey(math.random(), pool)
  if ((typeof module) === 'object' && module.exports) {
    module.exports = seedrandom
    try { nodecrypto = require('crypto') } catch (ex) {}
  } else {
    math['seed' + rngname] = seedrandom
  }
})(this, [], Math)
// ===========================================================================

// Common trigonometric constants ============================================
const pi = Math.PI //              π or acos(-1.0) or 180°
const tau = Math.PI * 2.0 //       τ = π * 2 or 360°
const tdPi = 2.0 / Math.PI //      2 / π
const halfPi = Math.PI / 2.0 //    π / 2 [ rad(deg(π/2)) or 90°
const phi = 1.618033988750 //      φ (golden ratio) (√(5)-1)/2
const rPhi = 0.618033988750 //     1 / φ
const rPhi2 = 0.381966011250 //    1 / φ²
const gAng = 2.399963229728 //     τ / φ / φ [golden angle: pi * (3 - sqrt(5))]
const ttp = 0.333333333333 //      1 / 3 or 33%
const ssp = 0.666666666667 //      1 / 1.5 or 66%
const stp = 0.166666666667 //      1 / 6
const radian = 180.0 / Math.PI //  180 / π
const degrees = Math.PI / 180.0 // π / 180
// ===========================================================================

export {
  pi, tau, tdPi, halfPi, phi, rPhi, rPhi2, gAng, ttp, ssp, stp, radian, degrees
}

export { tEasings } from './TEasings'

export {
  isFloat, isAnyFloat, normalize, normalizeMinMax, mod, clamp, notCloseEnough,
  oscillate, round, ease, easeInSine, easeOutSine, easeInQuad, easeOutQuad,
  degToRad, radToDeg, randomRange, intRandomRange, lerp, mix, coinFlip,
  polar, cartesianToSpherical, sphericalToCartesian, fibonacciSphere, avgArr,
  arrayMin, arrayMax, pickFromArray
} from './Common'
