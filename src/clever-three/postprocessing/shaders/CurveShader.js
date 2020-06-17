import { Vector2 } from 'three'
import { defaultVertexShader } from '../../glsl/common'

export default {
  uniforms: {
    resolution: { value: new Vector2() }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  varying vec2 vUv;
  vec2 curve( in vec2 uv ) {
    uv = (uv - 0.5) * 2.0;
    uv *= 1.1;
    uv.x *= 1.0 + pow((abs(uv.y / 5.0)), 2.0);
    uv.y *= 1.0 + pow((abs(uv.x / 4.0)), 2.0);
    uv = (uv / 2.0) + 0.5;
    uv = uv * 0.92 + 0.04;
    return uv;
  }
  void main() {
    vec2 uv = curve(vUv);
    gl_FragColor = texture2D(tDiffuse, uv);
  }`
}
