import { Vector2, Vector3 } from 'three'

import CopyShader from './shaders/CopyShader'
import RGBShiftShader from './shaders/RGBShiftShader'
import BadVHSShader from './shaders/BadVHSShader'
import GrainShader from './shaders/GrainShader'
import BlurShader from './shaders/BlurShader'
import ASCIIShader from './shaders/ASCIIShader'
import DitherShader from './shaders/DitherShader'
import FXAAShader from './shaders/FXAAShader'
import CRTShader from './shaders/CRTShader'
import TintShader from './shaders/TintShader'
import SepiaShader from './shaders/SepiaShader'
import ReinhardShader from './shaders/ReinhardShader'
import DitherColorShader from './shaders/DitherColorShader'
import C64Shader from './shaders/C64Shader'

import ShaderPass from './helpers/ShaderPass'
import EffectComposer from './helpers/EffectComposer'
import RenderPass from './helpers/RenderPass'
import BloomPass from './helpers/BloomPass'
import AfterImagePass from './helpers/AfterImagePass'

export class PostProcessing {
  constructor (renderer, scene, camera, width, height) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.width = width
    this.height = height

    const composer = new EffectComposer(this.renderer)
    const res = new Vector2(this.width, this.height)
    const tRes = new Vector2(1.0 / this.width, 1.0 / this.height)

    composer.setSize(this.width, this.height)

    const renderPass = new RenderPass(this.scene, this.camera)
    renderPass.name = 'renderPass'

    // FXAA ==================================================================
    const fxaaPass = new ShaderPass(FXAAShader)
    fxaaPass.name = 'fxaaPass'
    fxaaPass.enabled = false
    fxaaPass.renderToScreen = false
    fxaaPass.uniforms.resolution.value = tRes
    this.fxaaPass = fxaaPass
    // =======================================================================

    // Reinhard filmic pass ==================================================
    const reinhardPass = new ShaderPass(ReinhardShader)
    reinhardPass.name = 'reinhardPass'
    reinhardPass.enabled = false
    reinhardPass.renderToScreen = false
    reinhardPass.uniforms.reinhardAmount.value = 1.0
    reinhardPass.uniforms.contrast.value = 0.92
    reinhardPass.uniforms.saturation.value = 1.2
    reinhardPass.uniforms.brightness.value = 2.1
    reinhardPass.uniforms.vignetteMix.value = 0.6
    reinhardPass.uniforms.vignetteSize.value = new Vector2(0.45, 0.45)
    reinhardPass.uniforms.vignetteRoundness.value = 0.21
    reinhardPass.uniforms.vignetteSmoothness.value = 0.42
    reinhardPass.uniforms.amount.value = 0.5
    this.reinhardPass = reinhardPass
    // =======================================================================

    // Bloom =================================================================
    const bloomPass = new BloomPass(res, 5, 0.7, 0.3)
    bloomPass.name = 'bloomPass'
    bloomPass.enabled = false
    bloomPass.renderToScreen = false
    this.bloomPass = bloomPass
    // =======================================================================

    // After image pass ======================================================
    const afterImagePass = new AfterImagePass(res, 0.96)
    afterImagePass.name = 'afterImagePass'
    afterImagePass.enabled = false
    afterImagePass.renderToScreen = false
    this.afterImagePass = afterImagePass
    // =======================================================================

    // Dither ================================================================
    const ditherPass = new ShaderPass(DitherShader)
    ditherPass.name = 'ditherPass'
    ditherPass.enabled = false
    ditherPass.renderToScreen = false
    ditherPass.uniforms.res.value = 8.0
    ditherPass.uniforms.amount.value = 1.0
    this.ditherPass = ditherPass
    // =======================================================================

    // Dither color ==========================================================
    const ditherColorPass = new ShaderPass(DitherColorShader)
    ditherColorPass.name = 'ditherColorPass'
    ditherColorPass.enabled = false
    ditherColorPass.renderToScreen = false
    ditherColorPass.uniforms.res.value = 8.0
    ditherColorPass.uniforms.amount.value = 1.0
    ditherColorPass.uniforms.mode.value = 0.0
    ditherColorPass.uniforms.effectDuration.value = 6.0
    ditherColorPass.uniforms.time.value = 0.0
    this.ditherColorPass = ditherColorPass
    // =======================================================================

    // 64 colors pass ========================================================
    const c64Pass = new ShaderPass(C64Shader)
    c64Pass.name = 'c64Pass'
    c64Pass.enabled = false
    c64Pass.renderToScreen = false
    c64Pass.uniforms.res.value = 8.0
    c64Pass.uniforms.amount.value = 1.0
    this.c64Pass = c64Pass
    // =======================================================================

    // ASCII =================================================================
    const ASCIIPass = new ShaderPass(ASCIIShader)
    ASCIIPass.name = 'ASCIIPass'
    ASCIIPass.enabled = false
    ASCIIPass.renderToScreen = false
    ASCIIPass.uniforms.resolution.value = res
    ASCIIPass.uniforms.zoom.value = 1.0
    ASCIIPass.uniforms.amount.value = 1.0
    ASCIIPass.uniforms.bypass.value = false
    this.ASCIIPass = ASCIIPass
    // =======================================================================

    // RGB Shift =============================================================
    const rgbShiftPass = new ShaderPass(RGBShiftShader)
    rgbShiftPass.name = 'rgbShiftPass'
    rgbShiftPass.enabled = false
    rgbShiftPass.renderToScreen = false
    rgbShiftPass.uniforms.amount.value = 0.004
    rgbShiftPass.uniforms.angle.value = 0.0
    this.rgbShiftPass = rgbShiftPass
    // =======================================================================

    // Bad VHS ===============================================================
    const badVHSPass = new ShaderPass(BadVHSShader)
    badVHSPass.name = 'badVHSPass'
    badVHSPass.enabled = false
    badVHSPass.renderToScreen = false
    badVHSPass.uniforms.time.value = 0.0
    badVHSPass.uniforms.h_distort.value = 0.0021
    badVHSPass.uniforms.v_distort.value = 0.0025
    badVHSPass.uniforms.glitch.value = false
    badVHSPass.uniforms.g_amount.value = 0.0
    badVHSPass.uniforms.mix_amount.value = 1.0
    badVHSPass.uniforms.resolution.value = res
    badVHSPass.uniforms.offset.value = 0.5
    this.badVHSPass = badVHSPass
    // =======================================================================

    // Cheap Blur ============================================================
    const blurPass = new ShaderPass(BlurShader)
    blurPass.name = 'blurPass'
    blurPass.enabled = false
    blurPass.renderToScreen = false
    blurPass.uniforms.amount.value = 20.0
    blurPass.uniforms.mixAmount.value = 0.0
    blurPass.uniforms.resolution.value = res
    this.blurPass = blurPass
    // =======================================================================

    // Gaussian Grain ========================================================
    const grainPass = new ShaderPass(GrainShader)
    grainPass.name = 'grainPass'
    grainPass.enabled = false
    grainPass.renderToScreen = false
    grainPass.uniforms.time.value = 0.0
    grainPass.uniforms.amount.value = 0.175
    grainPass.uniforms.resolution.value = res
    this.grainPass = grainPass
    // =======================================================================

    // CRT Emulator ==========================================================
    const crtPass = new ShaderPass(CRTShader)
    crtPass.name = 'crtPass'
    crtPass.enabled = false
    crtPass.renderToScreen = false
    crtPass.uniforms.time.value = 0.0
    crtPass.uniforms.desaturation.value = 0.5
    crtPass.uniforms.distort.value = 1.0
    crtPass.uniforms.amount.value = 1.0
    crtPass.uniforms.curveUV.value = true
    crtPass.uniforms.resolution.value = res
    this.crtPass = crtPass
    // =======================================================================

    // Tint ==================================================================
    const tintPass = new ShaderPass(TintShader)
    tintPass.name = 'tintPass'
    tintPass.enabled = false
    tintPass.renderToScreen = false
    tintPass.uniforms.amount.value = 1.0
    tintPass.uniforms.tint.value = new Vector3(1.0, 1.0, 1.0)
    this.tintPass = tintPass
    // =======================================================================

    // Sepia =================================================================
    const sepiaPass = new ShaderPass(SepiaShader)
    sepiaPass.name = 'sepiaPass'
    sepiaPass.enabled = false
    sepiaPass.renderToScreen = false
    sepiaPass.uniforms.amount.value = 1.0
    this.sepiaPass = sepiaPass
    // =======================================================================

    // Copy Shader ===========================================================
    const copyShader = new ShaderPass(CopyShader)
    copyShader.name = 'copyShader'
    copyShader.enabled = true
    copyShader.renderToScreen = true
    this.copyShader = copyShader
    // =======================================================================

    composer.addPass(renderPass)
    composer.addPass(copyShader)

    this.composer = composer
    this.render = this.render.bind(this)
  }

  enablePass (pass) {
    this.composer.insertPass(pass, this.composer.passes.length - 1)
  }

  setFXAAPass (settings) {
    if (this.fxaaPass.enabled === true) {
      this.fxaaPass.uniforms.resolution.value = settings.resolution || this.fxaaPass.uniforms.resolution.value
    } else {
      if (this.fxaaPass.enabled === false && settings.enabled) {
        this.enablePass(this.fxaaPass)
        this.fxaaPass.enabled = true
      }
    }
  }

  setReinhardPass (settings) {
    if (this.reinhardPass.enabled === true) {
      this.reinhardPass.uniforms.reinhardAmount.value = settings.reinhardAmount || this.reinhardPass.uniforms.reinhardAmount.value
      this.reinhardPass.uniforms.contrast.value = settings.contrast || this.reinhardPass.uniforms.contrast.value
      this.reinhardPass.uniforms.saturation.value = settings.saturation || this.reinhardPass.uniforms.saturation.value
      this.reinhardPass.uniforms.brightness.value = settings.brightness || this.reinhardPass.uniforms.brightness.value
      this.reinhardPass.uniforms.vignetteMix.value = settings.vignetteMix || this.reinhardPass.uniforms.vignetteMix.value
      this.reinhardPass.uniforms.vignetteSize.value = settings.vignetteSize || this.reinhardPass.uniforms.vignetteSize.value
      this.reinhardPass.uniforms.vignetteRoundness.value = settings.vignetteRoundness || this.reinhardPass.uniforms.vignetteRoundness.value
      this.reinhardPass.uniforms.vignetteSmoothness.value = settings.vignetteSmoothness || this.reinhardPass.uniforms.vignetteSmoothness.value
      this.reinhardPass.uniforms.amount.value = settings.amount || this.reinhardPass.uniforms.amount.value
    } else {
      if (this.reinhardPass.enabled === false && settings.enabled) {
        this.enablePass(this.reinhardPass)
        this.reinhardPass.enabled = true
      }
    }
  }

  setBloomPass (settings) {
    if (this.bloomPass.enabled === true) {
      this.bloomPass.setStrength(settings.strength || this.bloomPass.strength)
      this.bloomPass.setRadius(settings.radius || this.bloomPass.radius)
      this.bloomPass.setThreshold(settings.threshold || this.bloomPass.threshold)
    } else {
      if (this.bloomPass.enabled === false && settings.enabled) {
        this.enablePass(this.bloomPass)
        this.bloomPass.enabled = true
      }
    }
  }

  setAfterImagePass (settings) {
    if (this.afterImagePass.enabled === true) {
      this.afterImagePass.setDamp(settings.damp || this.afterImagePass.damp)
    } else {
      if (this.afterImagePass.enabled === false && settings.enabled) {
        this.enablePass(this.afterImagePass)
        this.afterImagePass.enabled = true
      }
    }
  }

  setDitherPass (settings) {
    if (this.ditherPass.enabled === true) {
      this.ditherPass.uniforms.res.value = settings.res || this.ditherPass.uniforms.res.value
      this.ditherPass.uniforms.amount.value = settings.amount || this.ditherPass.uniforms.amount.value
    } else {
      if (this.ditherPass.enabled === false && settings.enabled) {
        this.enablePass(this.ditherPass)
        this.ditherPass.enabled = true
      }
    }
  }

  setDitherColorPass (settings) {
    if (this.ditherColorPass.enabled === true) {
      this.ditherColorPass.uniforms.res.value = settings.res || this.ditherColorPass.uniforms.res.value
      this.ditherColorPass.uniforms.amount.value = settings.amount || this.ditherColorPass.uniforms.amount.value
      this.ditherColorPass.uniforms.mode.value = settings.mode || this.ditherColorPass.uniforms.mode.value
      this.ditherColorPass.uniforms.effectDuration.value = settings.effectDuration || this.ditherColorPass.uniforms.effectDuration.value
      this.ditherColorPass.uniforms.time.value = settings.time || this.ditherColorPass.uniforms.time.value
    } else {
      if (this.ditherColorPass.enabled === false && settings.enabled) {
        this.enablePass(this.ditherColorPass)
        this.ditherColorPass.enabled = true
      }
    }
  }

  setC64Pass (settings) {
    if (this.c64Pass.enabled === true) {
      this.c64Pass.uniforms.res.value = settings.res || this.c64Pass.uniforms.res.value
      this.c64Pass.uniforms.amount.value = settings.amount || this.c64Pass.uniforms.amount.value
    } else {
      if (this.c64Pass.enabled === false && settings.enabled) {
        this.enablePass(this.c64Pass)
        this.c64Pass.enabled = true
      }
    }
  }

  setASCIIPass (settings) {
    if (this.ASCIIPass.enabled === true) {
      this.ASCIIPass.uniforms.resolution.value = settings.resolution || this.ASCIIPass.uniforms.resolution.value
      this.ASCIIPass.uniforms.zoom.value = settings.zoom || this.ASCIIPass.uniforms.zoom.value
      this.ASCIIPass.uniforms.amount.value = settings.amount || this.ASCIIPass.uniforms.amount.value
      this.ASCIIPass.uniforms.bypass.value = settings.bypass || this.ASCIIPass.uniforms.bypass.value
    } else {
      if (this.ASCIIPass.enabled === false && settings.enabled) {
        this.enablePass(this.ASCIIPass)
        this.ASCIIPass.enabled = true
      }
    }
  }

  setRGBShiftPass (settings) {
    if (this.rgbShiftPass.enabled === true) {
      this.rgbShiftPass.uniforms.amount.value = settings.amount || this.rgbShiftPass.uniforms.amount.value
      this.rgbShiftPass.uniforms.angle.value = settings.angle || this.rgbShiftPass.uniforms.angle.value
    } else {
      if (this.rgbShiftPass.enabled === false && settings.enabled) {
        this.enablePass(this.rgbShiftPass)
        this.rgbShiftPass.enabled = true
      }
    }
  }

  setBadVHSPass (settings) {
    if (this.badVHSPass.enabled === true) {
      this.badVHSPass.uniforms.time.value = settings.time || this.badVHSPass.uniforms.time.value
      this.badVHSPass.uniforms.h_distort.value = settings.h_distort || this.badVHSPass.uniforms.h_distort.value
      this.badVHSPass.uniforms.v_distort.value = settings.v_distort || this.badVHSPass.uniforms.v_distort.value
      this.badVHSPass.uniforms.glitch.value = settings.glitch || this.badVHSPass.uniforms.glitch.value
      this.badVHSPass.uniforms.g_amount.value = settings.g_amount || this.badVHSPass.uniforms.g_amount.value
      this.badVHSPass.uniforms.mix_amount.value = settings.mix_amount || this.badVHSPass.uniforms.mix_amount.value
      this.badVHSPass.uniforms.resolution.value = settings.resolution || this.badVHSPass.uniforms.resolution.value
      this.badVHSPass.uniforms.scanlines.value = settings.scanlines || this.badVHSPass.uniforms.scanlines.value
      this.badVHSPass.uniforms.screencurve.value = settings.screencurve || this.badVHSPass.uniforms.screencurve.value
      this.badVHSPass.uniforms.offset.value = settings.offset | this.badVHSPass.uniforms.offset.value
    } else {
      if (this.badVHSPass.enabled === false && settings.enabled) {
        this.enablePass(this.badVHSPass)
        this.badVHSPass.enabled = true
      }
    }
  }

  setBlurPass (settings) {
    if (this.blurPass.enabled === true) {
      this.blurPass.uniforms.amount.value = settings.amount || this.blurPass.uniforms.amount.value
      this.blurPass.uniforms.mixAmount.value = settings.mixAmount || this.blurPass.uniforms.mixAmount.value
      this.blurPass.uniforms.resolution.value = settings.resolution || this.blurPass.uniforms.resolution.value
    } else {
      if (this.blurPass.enabled === false && settings.enabled) {
        this.enablePass(this.blurPass)
        this.blurPass.enabled = true
      }
    }
  }

  setGrainPass (settings) {
    if (this.grainPass.enabled === true) {
      this.grainPass.uniforms.time.value = settings.time || this.grainPass.uniforms.time.value
      this.grainPass.uniforms.amount.value = settings.amount || this.grainPass.uniforms.amount.value
      this.grainPass.uniforms.resolution.value = settings.resolution || this.grainPass.uniforms.resolution.value
    } else {
      if (this.grainPass.enabled === false && settings.enabled) {
        this.enablePass(this.grainPass)
        this.grainPass.enabled = true
      }
    }
  }

  setCRTPass (settings) {
    if (this.crtPass.enabled === true) {
      this.crtPass.uniforms.time.value = settings.time || this.crtPass.uniforms.time.value
      this.crtPass.uniforms.desaturation.value = settings.desaturation || this.crtPass.uniforms.desaturation.value
      this.crtPass.uniforms.distort.value = settings.distort || this.crtPass.uniforms.distort.value
      this.crtPass.uniforms.amount.value = settings.amount || this.crtPass.uniforms.amount.value
      this.crtPass.uniforms.curveUV.value = settings.curveUV || this.crtPass.uniforms.curveUV.value
      this.crtPass.uniforms.resolution.value = settings.resolution || this.crtPass.uniforms.resolution.value
    } else {
      if (this.crtPass.enabled === false && settings.enabled) {
        this.enablePass(this.crtPass)
        this.crtPass.enabled = true
      }
    }
  }

  setTintPass (settings) {
    if (this.tintPass.enabled === true) {
      this.tintPass.uniforms.amount.value = settings.amount || this.tintPass.uniforms.amount.value
      this.tintPass.uniforms.tint.value = settings.tint || this.tintPass.uniforms.tint.value
    } else {
      if (this.tintPass.enabled === false && settings.enabled) {
        this.enablePass(this.tintPass)
        this.tintPass.enabled = true
      }
    }
  }

  setSepiaPass (settings) {
    if (this.sepiaPass.enabled === true) {
      this.sepiaPass.uniforms.amount.value = settings.amount || this.sepiaPass.uniforms.amount.value
    } else {
      if (this.sepiaPass.enabled === false && settings.enabled) {
        this.enablePass(this.sepiaPass)
        this.sepiaPass.enabled = true
      }
    }
  }

  render (delta) {
    this.composer.render(delta)
  }
}
