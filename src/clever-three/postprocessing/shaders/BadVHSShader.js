import { Vector2 } from 'three'
import { defaultVertexShader } from '../../glsl/common'

export default {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new Vector2() },
    time: { value: 0.0 },
    h_distort: { value: 0.0021 },
    v_distort: { value: 0.0025 },
    g_amount: { value: 0.175 },
    mix_amount: { value: 1.0 },
    glitch: { value: true },
    scanlines: { value: true },
    screencurve: { value: true },
    offset: { value: 0.5 }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform float time;
  uniform float h_distort;
  uniform float v_distort;
  uniform float g_amount;
  uniform float mix_amount;
  uniform bool glitch;
  uniform bool scanlines;
  uniform bool screencurve;
  uniform float offset;
  const vec3 FRACTG = vec3(95.4337, 96.4337, 97.4337);
  float gaussian(float z, float u, float o) {
    return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
  }
  vec3 film_grain_color () {
    vec2 ps = vec2(1.0) / resolution.xy;
    vec2 uv = gl_FragCoord.xy * ps;
    float t = time * 2.0;
    float seed = dot(uv, vec2(12.9898, 78.233));
    float noise = fract(sin(seed) * 43758.5453 + t);
    noise = gaussian( noise, 0.0, 0.5 );
    return vec3( noise );
  }
  float stepm(float a, float b, float c) { return step(c, sin(time + a * cos(time * b))); }
  vec3 bad_vhs (vec2 uv, in float off ) {
    float tmod = mod( time * 0.25, 3.0 ), looky_mod = uv.y - tmod;
    float window = 1.0 / ( 1.0 + 20.0 * looky_mod * looky_mod );
    if ( glitch ) {
      uv.x = uv.x + sin( uv.y * 10.0 + time ) / 100.0 * stepm( 4.0, 4.0, 0.3 ) * ( 1.0 + cos( time * 80.0 ) ) * window * 0.25;
    }
    if ( glitch ) {
      float v_shift = v_distort * stepm( 2.0, 3.0, 0.9 ) * ( sin( time ) * sin( time * 20.0 ) + ( 0.5 + 0.1 * sin( time * 200.0 ) * cos( time ) ) );
      uv.y = mod( uv.y + v_shift, 5.0 );
    }
    vec3 desat_color;
    float _r, _g, _b;
    float x = sin( 0.3 * time + uv.y * 21.0 ) * sin( 0.7 * time + uv.y * 29.0 ) * sin( 0.3 + 0.33 * time + uv.y * 31.0 ) * h_distort;
    _r = texture2D( tDiffuse, vec2( x + uv.x + 0.001 * off, uv.y + 0.001 * off ) ).x + 0.05;
    _g = texture2D( tDiffuse, vec2( x + uv.x + 0.000 * off, uv.y - 0.002 * off ) ).y + 0.05;
    _b = texture2D( tDiffuse, vec2( x + uv.x - 0.002 * off, uv.y + 0.000 * off ) ).z + 0.05;
    _r += 0.08 * texture2D( tDiffuse, 0.75 * vec2( x +  0.012 * off, -0.013 * off ) + vec2( uv.x + 0.001 * off, uv.y + 0.001 * off ) ).x;
    _g += 0.05 * texture2D( tDiffuse, 0.75 * vec2( x + -0.011 * off, -0.010 * off ) + vec2( uv.x + 0.000 * off, uv.y - 0.002 * off ) ).y;
    _b += 0.08 * texture2D( tDiffuse, 0.75 * vec2( x + -0.010 * off, -0.009 * off ) + vec2( uv.x - 0.002 * off, uv.y + 0.000 * off ) ).z;
    float _luma = 0.3 * _r + 0.6 * _g + 0.1 * _b;
    float _desat = 0.4;
    desat_color = vec3(
      _r + _desat * ( _luma - _r ),
      _g + _desat * ( _luma - _g ),
      _b + _desat * ( _luma - _b )
    );
    desat_color = clamp( desat_color, 0.0, 1.0 );
    return desat_color;
  }
  vec2 curve(vec2 uv) {
    uv = (uv - 0.5) * 2.0;
    uv *= 1.1;
    uv.x *= 1.0 + pow((abs(uv.y / 5.0)), 2.0);
    uv.y *= 1.0 + pow((abs(uv.x / 4.0)), 2.0);
    uv = (uv / 2.0) + 0.5;
    uv =  uv * 0.92 + 0.04;
    return uv;
  }
  void main (void) {
    vec2 uv = vUv;
    vec4 originalColor = texture2D(tDiffuse, uv);
    vec2 curveduv = (screencurve) ? curve(uv) : uv;
    vec3 grain = film_grain_color();
    vec3 vhs_col = bad_vhs(curveduv, offset) + grain * g_amount;
    if ( screencurve ) {
      float vig = (0.0 + 1.0 * 16.0 * uv.x * uv.y * (1.0 - curveduv.x) * (1.0 - curveduv.y));
      vhs_col *= vec3(pow(abs(vig), 0.5));
    }
    float scans = clamp(0.35 + 0.35 * sin(3.5 * time + uv.y * resolution.y * 1.5), 0.0, 1.0);
    float s = (scanlines) ? pow(abs(scans), 1.33) : 1.0;
    vhs_col = vhs_col * vec3( 1.4 + 1.7 * s);
    if ( screencurve ) {
      if (curveduv.x < 0.0 || curveduv.x > 1.0) { vhs_col *= 0.0; }
      if (curveduv.y < 0.0 || curveduv.y > 1.0) { vhs_col *= 0.0; }
    }
    vec4 badVHS = vec4(2.0 - inversesqrt(vhs_col) * 1.05, 1.0);
    gl_FragColor = mix(originalColor, badVHS, mix_amount);
  }`
}
