import { defaultVertexShader } from '../../glsl/common'

export default {
  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1.0 }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform float opacity;
  uniform sampler2D tDiffuse;
  void main () {
    vec4 texel = texture2D( tDiffuse, vUv );
    gl_FragColor = opacity * texel;
  }`
}
