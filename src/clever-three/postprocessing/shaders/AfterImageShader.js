import { defaultVertexShader } from '../../glsl/common'

export default {
  uniforms: {
    damp: { value: 0.96 },
    tOld: { value: null },
    tNew: { value: null }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform float damp;
  uniform sampler2D tOld;
  uniform sampler2D tNew;
  vec4 when_gt(vec4 x, float y) {
    return max(sign(x - y), 0.0);
  }
  void main() {
    vec4 texelOld = texture2D(tOld, vUv);
    vec4 texelNew = texture2D(tNew, vUv);
    texelOld *= damp * when_gt(texelOld, 0.1);
    gl_FragColor = max(texelNew, texelOld);
  }
  `
}
