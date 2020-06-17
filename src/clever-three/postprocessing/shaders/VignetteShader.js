import { defaultVertexShader } from '../../glsl/common'

export default {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.0 }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform float offset;
  uniform float darkness;
  uniform sampler2D tDiffuse;
    void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
    gl_FragColor = vec4(mix(texel.rgb, vec3(1.0 - darkness), dot(uv, uv)), texel.a);
  }`
}
