export const defaultVertexShader = `
varying vec2 vUv;
void main () {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4 (position, 1.0);
}`

export const defaultSamplerFragment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D iChannel0;
void main () {
  gl_FragColor = texture2D(iChannel0, vUv);
}`
