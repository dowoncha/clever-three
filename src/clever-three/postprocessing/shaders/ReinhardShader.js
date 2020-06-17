import { defaultVertexShader } from '../../glsl/common'
import { Vector2 } from 'three'

export default {
  uniforms: {
    tDiffuse: { value: null },
    reinhardAmount: { value: 1.0 },
    contrast: { value: 0.92 },
    saturation: { value: 1.2 },
    brightness: { value: 2.1 },
    vignetteMix: { value: 0.6 },
    vignetteSize: { value: new Vector2(0.45, 0.45) },
    vignetteRoundness: { value: 0.21 },
    vignetteSmoothness: { value: 0.42 },
    amount: { value: 0.5 }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform float amount;
  uniform float reinhardAmount;
  uniform float contrast;
  uniform float saturation;
  uniform float brightness;
  uniform vec2 vignetteSize;
  uniform float vignetteRoundness;
  uniform float vignetteSmoothness;
  uniform float vignetteMix;
  uniform sampler2D tDiffuse;
  const float W = 1.2;
  const float T = 7.5;
  float filmicReinhardCurve (in float x) {
    float q = ( T * T + 1.0 ) * x * x;
    return q / ( q + x + T * T );
  }
  vec3 filmicReinhard (in vec3 c) {
    float w = filmicReinhardCurve( W );
    return vec3(
      filmicReinhardCurve( c.r ),
      filmicReinhardCurve( c.g ),
      filmicReinhardCurve( c.b ) ) / w;
  }
  vec3 ContrastSaturationBrightness (
    in vec3 color, in float brt, in float sat, in float con
  ) {
    const float AvgLumR = 0.5;
    const float AvgLumG = 0.5;
    const float AvgLumB = 0.5;
    const vec3 LumCoeff = vec3(0.2125, 0.7154, 0.0721);
    vec3 AvgLumin  = vec3(AvgLumR, AvgLumG, AvgLumB);
    vec3 brtColor  = color * brt;
    vec3 intensity = vec3(dot(brtColor, LumCoeff));
    vec3 satColor  = mix(intensity, brtColor, sat);
    vec3 conColor  = mix(AvgLumin, satColor, con);
    return conColor;
  }
  float sdSquare(in vec2 point, in float width) {
    vec2 d = abs(point) - width;
    return min(max(d.x, d.y),0.0) + length(max(d, 0.0));
  }
  float vignette(
    in vec2 uv, in vec2 size, in float roundness, in float smoothness
  ) {
    uv -= 0.5;
    float minWidth = min(size.x, size.y);
    uv.x = sign(uv.x) * clamp(abs(uv.x) - abs(minWidth - size.x), 0.0, 1.0);
    uv.y = sign(uv.y) * clamp(abs(uv.y) - abs(minWidth - size.y), 0.0, 1.0);
    float boxSize = minWidth * (1.0 - roundness);
    float dist = sdSquare(uv, boxSize) - (minWidth * roundness);
    return 1.0 - smoothstep(0.0, smoothness, dist);
  }
  
  void main () {
    vec4 texel = texture2D( tDiffuse, vUv );
    vec3 reinhard = filmicReinhard(texel.rgb);
    vec3 color = texel.rgb;
    color = mix(texel.rgb, reinhard, reinhardAmount);
    color = ContrastSaturationBrightness(
      color, brightness, saturation, contrast
    );
    float v = vignette(
      vUv, vignetteSize, vignetteRoundness, vignetteSmoothness
    );
    vec3 vig = color * v;
    color = mix(color, vig, vignetteMix);
    color = mix(texel.rgb, color, amount);
    gl_FragColor = vec4(color, texel.w);
  }`
}
