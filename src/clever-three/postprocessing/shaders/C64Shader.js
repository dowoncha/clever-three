import { defaultVertexShader } from '../../glsl/common'

export default {
  uniforms: {
    tDiffuse: { value: null },
    res: { value: 8.0 },
    amount: { value: 1.0 }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform float amount;
  uniform float res;
  uniform sampler2D tDiffuse;
  vec3 findClosest(in vec3 ref) {
    vec3 old = vec3 (100.0 * 255.0);
    #define try(new) old = mix (new, old, step (length (old-ref), length (new-ref)));
    try (vec3 (  0.0,   0.0,   0.0)); //  0 - black           (YPbPr = 0.0  ,  0.0 ,  0.0 )
    try (vec3 (133.0,  59.0,  81.0)); //  1 - magenta         (YPbPr = 0.25 ,  0.0 ,  0.5 )
    try (vec3 ( 80.0,  71.0, 137.0)); //  2 - dark blue       (YPbPr = 0.25 ,  0.5 ,  0.0 )
    try (vec3 (233.0,  93.0, 240.0)); //  3 - purple          (YPbPr = 0.5  ,  1.0 ,  1.0 )
    try (vec3 (  0.0, 104.0,  82.0)); //  4 - dark green      (YPbPr = 0.25 ,  0.0 , -0.5 )
    try (vec3 (146.0, 146.0, 146.0)); //  5 - gray #1         (YPbPr = 0.5  ,  0.0 ,  0.0 )
    try (vec3 (  0.0, 168.0, 241.0)); //  6 - medium blue     (YPbPr = 0.5  ,  1.0 , -1.0 )
    try (vec3 (202.0, 195.0, 248.0)); //  7 - light blue      (YPbPr = 0.75 ,  0.5 ,  0.0 )
    try (vec3 ( 81.0,  92.0,  15.0)); //  8 - brown           (YPbPr = 0.25 , -0.5 ,  0.0 )
    try (vec3 (235.0, 127.0,  35.0)); //  9 - orange          (YPbPr = 0.5  , -1.0 ,  1.0 )
    try (vec3 (241.0, 166.0, 191.0)); // 11 - pink            (YPbPr = 0.75 ,  0.0 ,  0.5 )
    try (vec3 (  0.0, 201.0,  41.0)); // 12 - green           (YPbPr = 0.5  , -1.0 , -1.0 )
    try (vec3 (203.0, 211.0, 155.0)); // 13 - yellow          (YPbPr = 0.75 , -0.5 ,  0.0 )
    try (vec3 (154.0, 220.0, 203.0)); // 14 - aqua            (YPbPr = 0.75 ,  0.0 , -0.5 )
    try (vec3 (255.0, 255.0, 255.0)); // 15 - white           (YPbPr = 1.0  ,  0.0 ,  0.0 )
    try (vec3 (120.0,  41.0,  34.0)); //  2 - red             (YPbPr = 0.25 , -0.383 ,  0.924 )
    try (vec3 (135.0, 214.0, 221.0)); //  3 - cyan            (YPbPr = 0.75 ,  0.383 , -0.924 )
    try (vec3 (170.0,  95.0, 182.0)); //  4 - purple          (YPbPr = 0.5  ,  0.707 ,  0.707 )
    try (vec3 ( 85.0, 160.0,  73.0)); //  5 - green           (YPbPr = 0.5  , -0.707 , -0.707 )
    try (vec3 ( 64.0,  49.0, 141.0)); //  6 - blue            (YPbPr = 0.25 ,  1.0   ,  0.0   )
    try (vec3 (191.0, 206.0, 114.0)); //  7 - yellow          (YPbPr = 0.75 , -1.0   ,  0.0   )
    try (vec3 (170.0, 116.0,  73.0)); //  8 - orange          (YPbPr = 0.5  , -0.707 ,  0.707 )
    try (vec3 (234.0, 180.0, 137.0)); //  9 - light orange    (YPbPr = 0.75 , -0.707 ,  0.707 )
    try (vec3 (184.0, 105.0,  98.0)); // 10 - light red       (YPbPr = 0.5  , -0.383 ,  0.924 )
    try (vec3 (199.0, 255.0, 255.0)); // 11 - light cyan      (YPbPr = 1.0  ,  0.383 , -0.924 )
    try (vec3 (234.0, 159.0, 246.0)); // 12 - light purple    (YPbPr = 0.75 ,  0.707 ,  0.707 )
    try (vec3 (148.0, 224.0, 137.0)); // 13 - light green     (YPbPr = 0.75 , -0.707 , -0.707 )
    try (vec3 (128.0, 113.0, 204.0)); // 14 - light blue      (YPbPr = 0.5  ,  1.0   ,  0.0   )
    try (vec3 (255.0, 255.0, 178.0)); // 15 - light yellow    (YPbPr = 1.0  , -1.0   ,  0.0   )
    try (vec3 (161.0,  77.0,  67.0)); //  2 - red             (YPbPr = 0.313 , -0.383 ,  0.924 )
    try (vec3 (106.0, 193.0, 200.0)); //  3 - cyan            (YPbPr = 0.625 ,  0.383 , -0.924 )
    try (vec3 (162.0,  86.0, 165.0)); //  4 - purple          (YPbPr = 0.375 ,  0.707 ,  0.707 )
    try (vec3 ( 92.0, 173.0,  95.0)); //  5 - green           (YPbPr = 0.5   , -0.707 , -0.707 )
    try (vec3 ( 79.0,  68.0, 156.0)); //  6 - blue            (YPbPr = 0.25  ,  1.0   ,  0.0   )
    try (vec3 (203.0, 214.0, 137.0)); //  7 - yellow          (YPbPr = 0.75  , -1.0   ,  0.0   )
    try (vec3 (163.0, 104.0,  58.0)); //  8 - orange          (YPbPr = 0.375 , -0.707 ,  0.707 )
    try (vec3 (110.0,  83.0,  11.0)); //  9 - brown           (YPbPr = 0.25  , -0.924 ,  0.383 )
    try (vec3 (204.0, 127.0, 118.0)); // 10 - light red       (YPbPr = 0.5   , -0.383 ,  0.924 )
    try (vec3 ( 99.0,  99.0,  99.0)); // 11 - dark grey       (YPbPr = 0.313 ,  0.0   ,  0.0   )
    try (vec3 (139.0, 139.0, 139.0)); // 12 - grey            (YPbPr = 0.469 ,  0.0   ,  0.0   )
    try (vec3 (155.0, 227.0, 157.0)); // 13 - light green     (YPbPr = 0.75  , -0.707 , -0.707 )
    try (vec3 (138.0, 127.0, 205.0)); // 14 - light blue      (YPbPr = 0.469 ,  1.0   ,  0.0   )
    try (vec3 (175.0, 175.0, 175.0)); // 15 - light grey      (YPbPr = 0.625  , 0.0   ,  0.0   )
    try (vec3 ( 62.0, 184.0,  73.0)); //  2 - medium green    (YPbPr = 0.53 , -0.509 , -0.755 )
    try (vec3 (116.0, 208.0, 125.0)); //  3 - light green     (YPbPr = 0.67 , -0.377 , -0.566 )
    try (vec3 ( 89.0,  85.0, 224.0)); //  4 - dark blue       (YPbPr = 0.40 ,  1.0   , -0.132 )
    try (vec3 (128.0, 128.0, 241.0)); //  5 - light blue      (YPbPr = 0.53 ,  0.868 , -0.075 )
    try (vec3 (185.0,  94.0,  81.0)); //  6 - dark red        (YPbPr = 0.47 , -0.321 ,  0.679 )
    try (vec3 (101.0, 219.0, 239.0)); //  7 - cyan            (YPbPr = 0.73 ,  0.434 , -0.887 )
    try (vec3 (219.0, 101.0,  89.0)); //  8 - medium red      (YPbPr = 0.53 , -0.377 ,  0.868 )
    try (vec3 (255.0, 137.0, 125.0)); //  9 - light red       (YPbPr = 0.67 , -0.377 ,  0.868 )
    try (vec3 (204.0, 195.0,  94.0)); // 10 - dark yellow     (YPbPr = 0.73 , -0.755 ,  0.189 )
    try (vec3 (222.0, 208.0, 135.0)); // 11 - light yellow    (YPbPr = 0.80 , -0.566 ,  0.189 )
    try (vec3 ( 58.0, 162.0,  65.0)); // 12 - dark green      (YPbPr = 0.47 , -0.453 , -0.642 )
    try (vec3 (183.0, 102.0, 181.0)); // 13 - magenta         (YPbPr = 0.53 ,  0.377 ,  0.491 )
    try (vec3 (204.0, 204.0, 204.0)); // 14 - grey            (YPbPr = 0.80 ,  0.0   ,  0.0   )
    try (vec3 (226.0, 226.0, 226.0)); // L90
    try (vec3 (198.0, 198.0, 198.0)); // L80
    try (vec3 (171.0, 171.0, 171.0)); // L70
    try (vec3 (145.0, 145.0, 145.0)); // L60
    try (vec3 (119.0, 119.0, 119.0)); // L50
    try (vec3 ( 94.0,  94.0,  94.0)); // L40
    try (vec3 ( 71.0,  71.0,  71.0)); // L30
    try (vec3 ( 48.0,  48.0,  48.0)); // L20
    return old;
  }
  float ditherMatrix(float x, float y) {
    return (
      mix(mix(mix(mix(mix(mix(0.0,32.0,step(1.0,y)),mix(8.0,40.0,step(3.0,y)),step(2.0,y)),
      mix(mix(2.0,34.0,step(5.0,y)),mix(10.0,42.0,step(7.0,y)),step(6.0,y)),step(4.0,y)),
      mix(mix(mix(48.0,16.0,step(1.0,y)),mix(56.0,24.0,step(3.0,y)),step(2.0,y)),
      mix(mix(50.0,18.0,step(5.0,y)),mix(58.0,26.0,step(7.0,y)),step(6.0,y)),step(4.0,y)),step(1.0,x)),
      mix(mix(mix(mix(12.0,44.0,step(1.0,y)),mix(4.0,36.0,step(3.0,y)),step(2.0,y)),
      mix(mix(14.0,46.0,step(5.0,y)),mix(6.0,38.0,step(7.0,y)),step(6.0,y)),step(4.0,y)),
      mix(mix(mix(60.0,28.0,step(1.0,y)),mix(52.0,20.0,step(3.0,y)),step(2.0,y)),
      mix(mix(62.0,30.0,step(5.0,y)),mix(54.0,22.0,step(7.0,y)),step(6.0,y)),step(4.0,y)),step(3.0,x)),step(2.0,x)),
      mix(mix(mix(mix(mix(3.0,35.0,step(1.0,y)),mix(11.0,43.0,step(3.0,y)),step(2.0,y)),
      mix(mix(1.0,33.0,step(5.0,y)),mix(9.0,41.0,step(7.0,y)),step(6.0,y)),step(4.0,y)),
      mix(mix(mix(51.0,19.0,step(1.0,y)),mix(59.0,27.0,step(3.0,y)),step(2.0,y)),
      mix(mix(49.0,17.0,step(5.0,y)),mix(57.0,25.0,step(7.0,y)),step(6.0,y)),step(4.0,y)),step(5.0,x)),
      mix(mix(mix(mix(15.0,47.0,step(1.0,y)),mix(7.0,39.0,step(3.0,y)),step(2.0,y)),
      mix(mix(13.0,45.0,step(5.0,y)),mix(5.0,37.0,step(7.0,y)),step(6.0,y)),step(4.0,y)),
      mix(mix(mix(63.0,31.0,step(1.0,y)),mix(55.0,23.0,step(3.0,y)),step(2.0,y)),
      mix(mix(61.0,29.0,step(5.0,y)),mix(53.0,21.0,step(7.0,y)),step(6.0,y)),step(4.0,y)),step(7.0,x)),step(6.0,x)),step(4.0,x))
    );
  }
  vec3 dither(in vec3 col, in vec2 uv) {
    col *= 255.0;
    col += ditherMatrix (mod (uv.x, res), mod (uv.y, res)) ;
    col = findClosest(clamp(col, 0.0, 255.0));
    return col / 255.0;
  }
  void main(void) {
    vec2 uv = vUv;
    vec4 tex = texture2D(tDiffuse, uv);
    vec3 color = dither(tex.rgb, uv);
    gl_FragColor=vec4(mix(tex.rgb, color, amount), 1.0);
  }
  `
}
