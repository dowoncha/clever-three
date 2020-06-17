export const cubicBezier = `
vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t) {
  float tn = 1.0 - t;
  return tn * tn * tn * p0 + 3.0 * tn * tn * t * c0 + 3.0 * tn * t * t * c1 + t * t * t * p1;
}
vec2 cubicBezier(vec2 p0, vec2 c0, vec2 c1, vec2 p1, float t) {
  float tn = 1.0 - t;
  return tn * tn * tn * p0 + 3.0 * tn * tn * t * c0 + 3.0 * tn * t * t * c1 + t * t * t * p1;
}
`

export const easeBackInOut = `
float easeBackInOut(float p, float amplitude) {
  amplitude *= 1.525;
  return ((p *= 2.0) < 1.0) ? 0.5 * p * p * ((amplitude + 1.0) * p - amplitude) : 0.5 * ((p -= 2.0) * p * ((amplitude + 1.0) * p + amplitude) + 2.0);
}
float easeBackInOut(float p) {
  return easeBackInOut(p, 1.70158);
}
float easeBackInOut(float t, float b, float c, float d, float amplitude) {
  return b + easeBackInOut(t / d, amplitude) * c;
}
float easeBackInOut(float t, float b, float c, float d) {
  return b + easeBackInOut(t / d) * c;
}
`

export const easeBackIn = `
float easeBackIn(float p, float amplitude) {
  return p * p * ((amplitude + 1.0) * p - amplitude);
}
float easeBackIn(float p) {
  return easeBackIn(p, 1.70158);
}
float easeBackIn(float t, float b, float c, float d, float amplitude) {
  return b + easeBackIn(t / d, amplitude) * c;
}
float easeBackIn(float t, float b, float c, float d) {
  return b + easeBackIn(t / d) * c;
}
`

export const easeBackOut = `
float easeBackOut(float p, float amplitude) {
  return ((p = p - 1.0) * p * ((amplitude + 1.0) * p + amplitude) + 1.0);
}
float easeBackOut(float p) {
  return easeBackOut(p, 1.70158);
}
float easeBackOut(float t, float b, float c, float d, float amplitude) {
  return b + easeBackOut(t / d, amplitude) * c;
}
float easeBackOut(float t, float b, float c, float d) {
  return b + easeBackOut(t / d) * c;
}
`

export const easeBezier = `
float easeBezier(float p, vec4 curve) {
  float ip = 1.0 - p;
  return (3.0 * ip * ip * p * curve.xy + 3.0 * ip * p * p * curve.zw + p * p * p).y;
}
float easeBezier(float t, float b, float c, float d, vec4 curve) {
  return b + easeBezier(t / d, curve) * c;
}
`

export const easeBounceInOut = `
float easeBounceInOut(float p) {
  bool invert = (p < 0.5);
  p = invert ? (1.0 - (p * 2.0)) : ((p * 2.0) - 1.0);
  if (p < 1.0 / 2.75) {
      p = 7.5625 * p * p;
  } else if (p < 2.0 / 2.75) {
      p = 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
  } else if (p < 2.5 / 2.75) {
      p = 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
  } else {
      p = 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
  }
  return invert ? (1.0 - p) * 0.5 : p * 0.5 + 0.5;
}
float easeBounceInOut(float t, float b, float c, float d) {
  return b + easeBounceInOut(t / d) * c;
}
`

export const easeBounceIn = `
float easeBounceIn(float p) {
  if ((p = 1.0 - p) < 1.0 / 2.75) {
      return 1.0 - (7.5625 * p * p);
  } else if (p < 2.0 / 2.75) {
      return 1.0 - (7.5625 * (p -= 1.5 / 2.75) * p + 0.75);
  } else if (p < 2.5 / 2.75) {
      return 1.0 - (7.5625 * (p -= 2.25 / 2.75) * p + 0.9375);
  }
  return 1.0 - (7.5625 * (p -= 2.625 / 2.75) * p + 0.984375);
}
float easeBounceIn(float t, float b, float c, float d) {
  return b + easeBounceIn(t / d) * c;
}
`

export const easeBounceOut = `
float easeBounceOut(float p) {
  if (p < 1.0 / 2.75) {
      return 7.5625 * p * p;
  } else if (p < 2.0 / 2.75) {
      return 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
  } else if (p < 2.5 / 2.75) {
      return 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
  }
  return 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
}
float easeBounceOut(float t, float b, float c, float d) {
  return b + easeBounceOut(t / d) * c;
}
`

export const easeCircInOut = `
float easeCircInOut(float p) {
  return ((p *= 2.0) < 1.0) ? -0.5 * (sqrt(1.0 - p * p) - 1.0) : 0.5 * (sqrt(1.0 - (p -= 2.0) * p) + 1.0);
}
float easeCircInOut(float t, float b, float c, float d) {
  return b + easeCircInOut(t / d) * c;
}
`

export const easeCircIn = `
float easeCircIn(float p) {
  return -(sqrt(1.0 - p * p) - 1.0);
}
float easeCircIn(float t, float b, float c, float d) {
  return b + easeCircIn(t / d) * c;
}
`

export const easeCircOut = `
float easeCircOut(float p) {
  return sqrt(1.0 - (p = p - 1.0) * p);
}
float easeCircOut(float t, float b, float c, float d) {
  return b + easeCircOut(t / d) * c;
}
`

export const easeCubicInOut = `
float easeCubicInOut(float t) {
  return (t /= 0.5) < 1.0 ? 0.5 * t * t * t : 0.5 * ((t-=2.0) * t * t + 2.0);
}
float easeCubicInOut(float t, float b, float c, float d) {
  return b + easeCubicInOut(t / d) * c;
}
`

export const easeCubicIn = `
float easeCubicIn(float t) {
  return t * t * t;
}
float easeCubicIn(float t, float b, float c, float d) {
  return b + easeCubicIn(t / d) * c;
}
`

export const easeCubicOut = `
float easeCubicOut(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}
float easeCubicOut(float t, float b, float c, float d) {
  return b + easeCubicOut(t / d) * c;
}
`

export const easeElasticInOut = `
float easeElasticInOut(float p, float amplitude, float period) {
  float p1 = max(amplitude, 1.0);
  float p2 = period / min(amplitude, 1.0);
  float p3 = p2 / PI2 * (asin(1.0 / p1));
  return ((p *= 2.0) < 1.0) ? -0.5 * (p1 * pow(2.0, 10.0 * (p -= 1.0)) * sin((p - p3) * PI2 / p2)) : p1 * pow(2.0, -10.0 * (p -= 1.0)) * sin((p - p3) * PI2 / p2) * 0.5 + 1.0;
}
float easeElasticInOut(float p) {
  return easeElasticInOut(p, 1.0, 0.3);
}
float easeElasticInOut(float t, float b, float c, float d, float amplitude, float period) {
  return b + easeElasticInOut(t / d, amplitude, period) * c;
}
float easeElasticInOut(float t, float b, float c, float d) {
  return b + easeElasticInOut(t / d) * c;
}
`

export const easeElasticIn = `
float easeElasticIn(float p, float amplitude, float period) {
  float p1 = max(amplitude, 1.0);
  float p2 = period / min(amplitude, 1.0);
  float p3 = p2 / PI2 * (asin(1.0 / p1));
  return -(p1 * pow(2.0, 10.0 * (p -= 1.0)) * sin((p - p3) * PI2 / p2));
}
float easeElasticIn(float p) {
  return easeElasticIn(p, 1.0, 0.3);
}
float easeElasticIn(float t, float b, float c, float d, float amplitude, float period) {
  return b + easeElasticIn(t / d, amplitude, period) * c;
}
float easeElasticIn(float t, float b, float c, float d) {
  return b + easeElasticIn(t / d) * c;
}
`

export const easeElasticOut = `
float easeElasticOut(float p, float amplitude, float period) {
  float p1 = max(amplitude, 1.0);
  float p2 = period / min(amplitude, 1.0);
  float p3 = p2 / PI2 * (asin(1.0 / p1));
  return p1 * pow(2.0, -10.0 * p) * sin((p - p3) * PI2 / p2) + 1.0;
}
float easeElasticOut(float p) {
  return easeElasticOut(p, 1.0, 0.3);
}
float easeElasticOut(float t, float b, float c, float d, float amplitude, float period) {
  return b + easeElasticOut(t / d, amplitude, period) * c;
}
float easeElasticOut(float t, float b, float c, float d) {
  return b + easeElasticOut(t / d) * c;
}
`

export const easeExpoInOut = `
float easeExpoInOut(float p) {
  return ((p *= 2.0) < 1.0) ? 0.5 * pow(2.0, 10.0 * (p - 1.0)) : 0.5 * (2.0 - pow(2.0, -10.0 * (p - 1.0)));
}
float easeExpoInOut(float t, float b, float c, float d) {
  return b + easeExpoInOut(t / d) * c;
}
`

export const easeExpoIn = `
float easeExpoIn(float p) {
  return pow(2.0, 10.0 * (p - 1.0));
}
float easeExpoIn(float t, float b, float c, float d) {
  return b + easeExpoIn(t / d) * c;
}
`

export const easeExpoOut = `
float easeExpoOut(float p) {
  return 1.0 - pow(2.0, -10.0 * p);
}
float easeExpoOut(float t, float b, float c, float d) {
  return b + easeExpoOut(t / d) * c;
}
`

export const easeQuadInOut = `
float easeQuadInOut(float t) {
  float p = 2.0 * t * t;
  return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
}
float easeQuadInOut(float t, float b, float c, float d) {
  return b + easeQuadInOut(t / d) * c;
}
`

export const easeQuadIn = `
float easeQuadIn(float t) {
  return t * t;
}
float easeQuadIn(float t, float b, float c, float d) {
return b + easeQuadIn(t / d) * c;
}
`

export const easeQuadOut = `
float easeQuadOut(float t) {
  return -t * (t - 2.0);
}
float easeQuadOut(float t, float b, float c, float d) {
  return b + easeQuadOut(t / d) * c;
}
`

export const easeQuartInOut = `
float easeQuartInOut(float t) {
  return t < 0.5 ? 8.0 * pow(t, 4.0) : -8.0 * pow(t - 1.0, 4.0) + 1.0;
}
float easeQuartInOut(float t, float b, float c, float d) {
  return b + easeQuartInOut(t / d) * c;
}
`

export const easeQuartIn = `
float easeQuartIn(float t) {
  return t * t * t * t;
}
float easeQuartIn(float t, float b, float c, float d) {
  return b + easeQuartIn(t / d) * c;
}
`

export const easeQuartOut = `
float easeQuartOut(float t) {
  return 1.0 - pow(1.0 - t, 4.0);
}
float easeQuartOut(float t, float b, float c, float d) {
  return b + easeQuartOut(t / d) * c;
}
`

export const easeQuintInOut = `
float easeQuintInOut(float t) {
  return (t /= 0.5) < 1.0 ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2.0) * t * t * t * t + 2.0);
}
float easeQuintInOut(float t, float b, float c, float d) {
  return b + easeQuintInOut(t / d) * c;
}
`

export const easeQuintIn = `
float easeQuintIn(float t) {
  return pow(t, 5.0);
}
float easeQuintIn(float t, float b, float c, float d) {
  return b + easeQuintIn(t / d) * c;
}
`

export const easeQuintOut = `
float easeQuintOut(float t) {
  return (t -= 1.0) * t * t * t * t + 1.0;
}
float easeQuintOut(float t, float b, float c, float d) {
  return b + easeQuintOut(t / d) * c;
}
`

export const easeSineInOut = `
float easeSineInOut(float p) {
  return -0.5 * (cos(PI * p) - 1.0);
}
float easeSineInOut(float t, float b, float c, float d) {
  return b + easeSineInOut(t / d) * c;
}
`

export const easeSineIn = `
float easeSineIn(float p) {
  return -cos(p * 1.57079632679) + 1.0;
}
float easeSineIn(float t, float b, float c, float d) {
  return b + easeSineIn(t / d) * c;
}
`
export const easeSineOut = `
float easeSineOut(float p) {
  return sin(p * 1.57079632679);
}
float easeSineOut(float t, float b, float c, float d) {
  return b + easeSineOut(t / d) * c;
}
`

export const quadraticBezier = `
vec3 quadraticBezier(vec3 p0, vec3 c0, vec3 p1, float t) {
  float tn = 1.0 - t;
  return tn * tn * p0 + 2.0 * tn * t * c0 + t * t * p1;
}
vec2 quadraticBezier(vec2 p0, vec2 c0, vec2 p1, float t) {
  float tn = 1.0 - t;
  return tn * tn * p0 + 2.0 * tn * t * c0 + t * t * p1;
}
`
