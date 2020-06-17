export const uv = `
  vec2 uv = (vUv - 0.5) * 2.0;
  float maxr = max(resolution.x, resolution.y);
  float minr = min(resolution.x, resolution.y);
  bool maxx = ( resolution.x > resolution.y );
  float ar = maxr / minr;
  if (maxx) { uv.x *= ar; } else { uv.y *= ar; }
`

export const uvm = `
${uv}
  vec2 mp = vec2( mouse.x, -mouse.y );
  if (maxx) { mp.x *= ar; } else { mp.y *= ar; }
`

export const nzClamp = `
float nzClamp(in float x) {
  return clamp(x, 0.1, 1.0);
}
vec3 nzClamp(in vec3 x) {
  return clamp(x, 0.1, 1.0);
}
`

export const hueRotate = `
vec3 hueRotate(in vec3 c, in float a) {
  vec2 zhPI = vec2(0.0, 1.57079632679);
  vec2 s = sin(vec2(radians(a)) + zhPI);
  vec3 rot = vec3(0.57735026919, s);
  vec3 cc = cross(rot.xxx, c);
  float dc = dot(rot.xxx, c);
  return mix(rot.xxx * dc, c, rot.z) + cc * rot.y;
}
`

export const rotate = `
mat2 rotate(in float x) {
  float c = cos(x);
  float s = sin(x);
  return mat2( c, -s, s, c);
}
`

export const hsv2rgb = `
vec3 hsv2rgb(in vec3 c) {
  c.yz = clamp(c.yz, 0.0, 1.0);
  vec3 t = vec3(0.0, 0.666666666667, 0.333333333333);
  vec3 ct = cos(3.14159265359 * (c.x + t)) - 1.0;
  return c.z * (1.0 + 0.5 * c.y * ct);
}
`

export const ssin = `
float ssin(in float x) {
  float st = sin(6.283185307180 * x * 0.5);
  return 0.636619772367 * atan(st / 0.1) * 2.0;
}
`

export const curve = `
vec2 curve(in vec2 uv) {
  uv = (uv - 0.5) * 2.0;
  uv *= 1.1;
  uv.x *= 1.0 + pow(abs(uv.y / 5.0), 2.0);
  uv.y *= 1.0 + pow(abs(uv.x / 4.0), 2.0);
  uv = uv / 2.0 + 0.5;
  uv = uv * 0.92 + 0.04;
  return uv;
}
`

export const vignette = `
vec3 vignette(in vec2 uv, in vec3 col, in float inten, in bool rev) {
  uv *= 1.0 - uv.yx;
  float vig = pow(abs(uv.x * uv.y * 15.0), 0.25 + inten);
  return (rev)
    ? col /= vec3(vig)
    : col *= vec3(vig);
}
vec4 vignette(in vec2 uv, in vec4 col, in float inten, in bool rev) {
  uv *= 1.0 - uv.yx;
  float vig = pow(abs(uv.x * uv.y * 15.0), 0.25 + inten);
  return (rev)
    ? col /= vec4(vig)
    : col *= vec4(vig);
}
`

export const distances = `
float distances () {
${uvm}
  float magA = 13.0; float magB = magA * 0.01;
  float bdist = clamp(-magA * distance(mp, uv), -magA, magA);
  float tdist = smoothstep(-1.0, 5.0, 2.0 - magB * bdist);
  return tdist;
}
`

export const hex = `
float hex(in vec2 uv) {
  uv = abs(uv);
  return fract(
    max(
      fract(fract(uv.x * 0.5) + fract(uv.y * 0.86602540378)),
      fract(uv.x)
    )
  );
}
`

export const getHex = `
vec4 getHex(in vec2 uv) {
  vec2 f = vec2(1.0, 1.73205080757);
  vec4 hc = floor(vec4(uv, uv - vec2(0.5, 1.0)) / f.xyxy) + 0.5;
  vec4 h = vec4(uv - hc.xy * f, uv - (hc.zw + 0.5) * f);
  float hxy = dot(h.xy, h.xy);
  float hzw = dot(h.zw, h.zw);
  return (hxy < hzw)
      ? vec4(h.xy, hc.xy)
      : vec4(h.zw, hc.zw + 9.73);
}
`

export const rand = `
float rand(in vec2 uv) {
  float d = dot(uv.xy, vec2(12.9898, 78.233));
  return fract(sin(d) * 43758.545312);
}
`

export const dfNoise21 = `
float dfNoise21(in vec2 uv) {
  vec3 p = fract(vec3(uv.xyx) * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
`

export const permute = `
vec3 permute(in vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}
`

export const verySimplex = `
${permute}
float verySimplex(in vec2 v) {
  const vec4 C = vec4(
      +0.211324865405187,
      +0.366025403784439,
      -0.577350269189626,
      +0.024390243902439
  );
  const vec2 D = vec2(
      1.79284291400159,
      0.85373472095314
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y)
      ? vec2(1.0, 0.0)
      : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
      permute(
          i.y + vec3(0.0, i1.y, 1.0)
      ) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(0.5 - vec3(
      dot(x0, x0),
      dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)
  ), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= D.x - D.y * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`

export const simplexSimplex = `
#define MOD3 vec3(.1031,.11369,.13787)
vec3 hash33(in vec3 p3) {
  p3 = fract(p3 * MOD3);
  p3 += dot(p3, p3.yxz + 19.19);
  return -1.0 + 2.0 * fract(
    vec3(
      (p3.x + p3.y) * p3.z,
      (p3.x + p3.z) * p3.y,
      (p3.y + p3.z) * p3.x
    )
  );
}
float simplexSimplex(in vec3 p) {
  const float K1 = 0.333333333;
  const float K2 = 0.166666667;
  vec3 i = floor(p + (p.x + p.y + p.z) * K1);
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
  vec3 e = step(vec3(0.0), d0 - d0.yzx);
  vec3 i1 = e * (1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);
  vec3 d1 = d0 - (i1 - 1.0 * K2);
  vec3 d2 = d0 - (i2 - 2.0 * K2);
  vec3 d3 = d0 - (1.0 - 3.0 * K2);
  vec4 h = max(
    0.6 - vec4(
      dot(d0, d0),
      dot(d1, d1),
      dot(d2, d2),
      dot(d3, d3)
    ),
    0.0
  );
  vec4 n = h * h * h * h * vec4(
    dot(d0, hash33(i)),
    dot(d1, hash33(i + i1)),
    dot(d2, hash33(i + i2)),
    dot(d3, hash33(i + 1.0))
  );

  return dot(vec4(31.316), n);
}
`

export const cpNoise = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(
    dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)
  ));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(
    dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)
  ));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(
    vec4(n000, n100, n010, n110),
    vec4(n001, n101, n011, n111),
    fade_xyz.z
  );
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}
float pnoise(vec3 P, vec3 rep) {
  vec3 Pi0 = mod(floor(P), rep);
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(
    dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)
  ));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(
    dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)
  ));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(
    vec4(n000, n100, n010, n110),
    vec4(n001, n101, n011, n111),
    fade_xyz.z
  );
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}
`
