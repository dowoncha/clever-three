import { Vector2 } from 'three'
import { defaultVertexShader } from '../../glsl/common'

export default {
  uniforms: {
    tDiffuse: { value: null },
    mixAmount: { value: 0.0 },
    amount: { value: 20.0 },
    resolution: { value: new Vector2() }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform float amount;
  uniform float mixAmount;
  uniform vec2 resolution;
  uniform sampler2D tDiffuse;
  float curve ( float x ) {
    x = x * 2.0 - 1.0;
    return -x * abs( x ) * 0.5 + x + 0.5;
  }
  vec4 blur ( sampler2D source, vec2 size, vec2 uv, float radius ) {
    if (radius >= 1.0) {
      vec4 A = vec4( 0.0 );
      vec4 C = vec4( 0.0 );
      float height = 1.0 / size.y;
      float divisor = 0.0;
      float weight = 0.0;
      float radiusMultiplier = 1.0 / radius;
      for ( float y = -20.0; y <= 20.0; y++ ) {
        A = texture2D( source, uv + vec2( 0.0, y * height ) );
        weight = curve( 1.0 - ( abs( y ) * radiusMultiplier ) );
        C += A * weight;
        divisor += weight;
      }
      return vec4( C.r / divisor, C.g / divisor, C.b / divisor, 1.0 );
    }
    return texture2D( source, uv );
  }
  void main (){
  vec4 original = texture2D( tDiffuse, vUv );
  vec4 blurred = blur( tDiffuse, resolution.xy, vUv, amount );
  gl_FragColor = mix( original, blurred, mixAmount );
  }`
}
