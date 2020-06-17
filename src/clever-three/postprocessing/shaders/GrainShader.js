import { Vector2 } from 'three'
import { defaultVertexShader } from '../../glsl/common'

export default {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new Vector2() },
    time: { value: 0.0 },
    amount: { value: 0.175 }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform float time;
  uniform float amount;
  float gaussian (float z, float u, float o) {
      return (
          (1.0 / (o * sqrt(2.0 * 3.14159265359))) *
          (exp(-(((z - u) * (z - u)) / (2.0 * (o * o)))))
      );
  }
  vec3 gaussgrain () {
      vec2 ps = vec2(1.0) / resolution.xy;
      vec2 uv = gl_FragCoord.xy * ps;
      float t = time * 2.0;
      float seed = dot(uv, vec2(12.9898, 78.233));
      float noise = fract(sin(seed) * 43758.5453123 + t);
      noise = gaussian(noise, 0.0, 0.5);
      return vec3(noise);
  }
  void main (void) {
      vec2 uv = vUv;
      vec4 originalColor = texture2D(tDiffuse, uv);
      vec3 grain = gaussgrain();
      vec3 col = originalColor.rgb + (grain * amount);
      gl_FragColor = vec4(col, 1.0);
  }`
}
