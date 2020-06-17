import { Vector2 } from 'three'
import { defaultVertexShader } from '../../glsl/common'

export default {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new Vector2() },
    time: { value: 0.0 },
    amount: { value: 1.0 },
    desaturation: { value: 0.5 },
    distort: { value: 1.0 },
    curveUV: { value: true }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
precision highp float;
varying vec2 vUv;
uniform vec2 resolution;
uniform float time, amount, desaturation, distort;
uniform bool curveUV;
uniform sampler2D tDiffuse;
vec2 curve(in vec2 uv) {
  uv = (uv - 0.5) * 2.0;
  uv *= 1.1;
  uv.x *= 1.0 + pow((abs(uv.y / 5.0)), 2.0);
  uv.y *= 1.0 + pow((abs(uv.x / 4.0)), 2.0);
  uv  = (uv / 2.0) + 0.5;
  uv =  uv *0.92 + 0.04;
  return uv;
}
vec2 curve(in vec2 uv, in float r) {
  uv = (uv - 0.5) * 2.0;
  uv = r * uv / sqrt(r * r - dot(uv, uv));
  uv = (uv * 0.5) + 0.5;
  return uv;
}
vec3 colorShift(in sampler2D tex, in vec2 uv, in vec2 o, in float distort) {
  float x = (
    sin(0.3 * time + uv.y * 21.0) *
    sin(0.7 * time + uv.y * 29.0) *
    sin(0.3 + 0.33 * time + uv.y * 31.0) *
    0.0017 * distort
  );
  vec3 col = vec3(0.0);
  col.r = texture2D(tex, vec2(x + uv.x + 0.001 * o.x, uv.y + 0.001 * o.y)).x + 0.05;
  col.g = texture2D(tex, vec2(x + uv.x + 0.000 * o.x, uv.y - 0.002 * o.y)).y + 0.05;
  col.b = texture2D(tex, vec2(x + uv.x - 0.002 * o.x, uv.y + 0.000 * o.y)).z + 0.05;
  col.r += 0.08 * texture2D(tex, 0.75 * vec2(x + +0.025 * o.x, -0.027 * o.y) + vec2(uv.x + 0.001 * o.x, uv.y + 0.001 * o.y)).x;
  col.g += 0.05 * texture2D(tex, 0.75 * vec2(x + -0.022 * o.x, -0.020 * o.y) + vec2(uv.x + 0.000 * o.x, uv.y - 0.002 * o.y)).y;
  col.b += 0.08 * texture2D(tex, 0.75 * vec2(x + -0.020 * o.x, -0.018 * o.y) + vec2(uv.x - 0.002 * o.x, uv.y + 0.000 * o.y)).z;
  col = clamp(col * 0.6 + 0.4 * col * col * 1.0, 0.0, 1.0);
  return col;
}
float scanLine(in vec2 uv) {
  return sin(resolution.y * uv.y * 0.7 - time * 10.0) * 0.021;
}
vec3 desat(in vec3 col, in float amt) {
  return mix(col, vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))), amt);
}
void main ( void ) {
  vec2 cUv = (curveUV) ? curve(vUv) : vUv;
  vec2 uv = (vUv - 0.5) * 2.0;
  vec4 tex = texture2D(tDiffuse, cUv);
  vec3 col = vec3(0.0);
  col = colorShift(tDiffuse, cUv, vec2(0.7, 0.7), distort);
  float vig = (0.0 + 1.0 * 16.0 * cUv.x * cUv.y * (1.0 - cUv.x) * (1.0 - cUv.y));
  col *= vec3(pow(abs(vig), 0.4));
  col *= vec3(0.95, 1.05, 0.95);
  col = desat(col, desaturation);
  col *= 2.1 - scanLine(cUv);
  col *= 1.0 + 0.01 * sin(110.0 * time);
  if (cUv.x < 0.0 || cUv.x > 1.0) { col *= 0.0; }
  if (cUv.y < 0.0 || cUv.y > 1.0) { col *= 0.0; }
  col *= 1.0 - 0.5 * vec3(clamp((mod(gl_FragCoord.x, 3.0) - 1.0) * 2.0, 0.0, 1.0));
  col *= 1.0 - 0.5 * vec3(clamp((mod(gl_FragCoord.y, 2.0) - 1.0) * 2.0, 0.0, 1.0));
  col = mix(tex.rgb, col, amount);
  gl_FragColor = vec4(col, 1.0);
}
`
}
