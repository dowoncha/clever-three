import { defaultVertexShader } from '../../glsl/common'
import { Vector3 } from 'three'

export default {
  uniforms: {
    tDiffuse: { value: null },
    tint: { value: new Vector3(1.0, 1.0, 1.0) },
    amount: { value: 1.0 }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform float amount;
  uniform vec3 tint;
  uniform sampler2D tDiffuse;
  void main () {
    vec4 texel = texture2D( tDiffuse, vUv );
    float gray = dot(texel.rgb, vec3(0.299, 0.587, 0.114)) * 1.1;
    vec3 color = mix(texel.rgb, gray * tint, amount);
    gl_FragColor = vec4(color, texel.w);
  }`
}
