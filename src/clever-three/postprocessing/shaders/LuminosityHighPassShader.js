import { Color } from 'three'
import { defaultVertexShader } from '../../glsl/common'

export default {
  shaderID: 'luminosityHighPass',
  uniforms: {
    tDiffuse: { type: 't', value: null },
    luminosityThreshold: { type: 'f', value: 1.0 },
    smoothWidth: { type: 'f', value: 1.0 },
    defaultColor: { type: 'c', value: new Color(0x000000) },
    defaultOpacity: { type: 'f', value: 0.0 }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform vec3 defaultColor;
  uniform float defaultOpacity;
  uniform float luminosityThreshold;
  uniform float smoothWidth;
  void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float v = dot(texel.xyz, luma);
    vec4 outputColor = vec4(defaultColor.rgb, defaultOpacity);
    float alpha = smoothstep(luminosityThreshold, luminosityThreshold + smoothWidth, v);
    gl_FragColor = mix(outputColor, texel, alpha);
  }`
}
