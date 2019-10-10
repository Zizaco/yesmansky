import * as BABYLON from '@babylonjs/core/Legacy/legacy'
import { HardwareInfo } from "../Infrastructure/HardwareInfo"
import { TextureBuilder } from './TextureBuilder'
import { ColorGradientFactory } from './ColorGradientFactory'
import { NoiseSettings, PlanetOptions } from './types'

const normalize = (val, min, max) => ((val - min) / (max - min))
const hashStringToInt = (s: string) => {
  return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
}

class PlanetMaterial {
  name: string
  options: PlanetOptions
  scene: BABYLON.Scene
  _noiseSettings: NoiseSettings
  _raw: BABYLON.StandardMaterial
  _rawAtmosphere: BABYLON.StandardMaterial
  _superRaw: BABYLON.Material
  heightMap: BABYLON.DynamicTexture
  diffuseMap: BABYLON.DynamicTexture
  specularMap: BABYLON.DynamicTexture
  bumpMap: BABYLON.DynamicTexture

  constructor(name: string = 'planetTexture', options: PlanetOptions, scene: BABYLON.Scene) {
    this.name = name
    this.scene = scene
    this.options = options
    this._noiseSettings = [
      // { shift: 0, passes: 10, strength: 0.8, roughness: 0.6, resistance: 0.70, min: 0.2, hard: false }, // base
      // { shift: 18, passes: 15, strength: 0.8, roughness: 0.3, resistance: 0.65, min: 0.2, hard: true }, // erosion
      { "shift": 5, "passes": 14, "strength": 0.65, "roughness": 0.2, "resistance": 0.6, "min": 0.3, "hard": true }
    ]
  }

  get raw(): BABYLON.StandardMaterial {
    if (!this._raw) {
      this.generateMaterial(this.scene)
    }

    return this._raw
  }

  get rawAtmosphere(): BABYLON.StandardMaterial {
    if (!this._rawAtmosphere) {
      this.generateAtmosphere(this.scene)
    }

    return this._rawAtmosphere
  }

  set noiseSettings(value: NoiseSettings) {
    if (this._raw) {
      const oldRawMaterial = this._raw
      setTimeout(() => oldRawMaterial.dispose(true, true), 2000)
      this.bumpMap.dispose()
      this.bumpMap = undefined
    }
    this._noiseSettings = value
    this.generateMaterial(this.scene)
  }

  get noiseSettings(): NoiseSettings {
    return this._noiseSettings
  }

  dispose() {
    if (this._raw) {
      this.heightMap.dispose
      this._rawAtmosphere.dispose(true, true)
      setTimeout(() => this._raw.dispose(true, true), 5000)
    }
  }

  /**
   * New procedural material generation
   */
  protected generateMaterial(scene): BABYLON.Material {
    this._raw = new BABYLON.StandardMaterial(this.name, scene);

    this.generateBaseTextures(256).then(() => {
      this._raw.diffuseTexture = this.diffuseMap
      this._raw.specularTexture = this.specularMap
      this._raw.bumpTexture = this.bumpMap
      this._raw.bumpTexture.level = 0.2

      this.generateBaseTextures(512).then(() => {
        this._raw.diffuseTexture.dispose()
        this._raw.specularTexture.dispose()
        this._raw.bumpTexture.dispose()

        this._raw.diffuseTexture = this.diffuseMap
        this._raw.specularTexture = this.specularMap
        this._raw.bumpTexture = this.bumpMap
        this._raw.bumpTexture.level = 0.3

        this.generateBaseTextures(HardwareInfo.hasGoodVideoCard() ? 2048 : 1024).then(() => {
          this._raw.diffuseTexture.dispose()
          this._raw.specularTexture.dispose()
          this._raw.bumpTexture.dispose()


          this._raw.diffuseTexture = this.diffuseMap
          this._raw.specularTexture = this.specularMap
          this._raw.bumpTexture = this.bumpMap
          this._raw.bumpTexture.level = 0.45

          // this._superRaw = this.buildShader(this.diffuseMap, this.specularMap, this.bumpMap)
        }).catch((e) => console.error(e))
      })
    })

    this._raw.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    this._raw.specularPower = 14

    return this._raw
  }

  protected generateAtmosphere(scene): BABYLON.Material {
    this._rawAtmosphere = new BABYLON.StandardMaterial(`${this.name}Atmosphere`, scene);
    this._rawAtmosphere.reflectionTexture = new BABYLON.Texture("textures/atmosphere.png", scene);
    this._rawAtmosphere.diffuseTexture = new BABYLON.Texture("textures/planetClouds1.jpg", scene);
    this._rawAtmosphere.reflectionTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
    this._rawAtmosphere.alpha = 0.5
    this._rawAtmosphere.alphaMode = BABYLON.Engine.ALPHA_ADD
    this._rawAtmosphere.specularPower = 2.5
    this._rawAtmosphere.zOffset = -5
    this._rawAtmosphere.specularColor = new BABYLON.Color3(0.1, 0.3, 0.5)

    return this._rawAtmosphere
  }

  async generateBaseTextures(resolution: number) {
    const settings = { layers: 10, strength: 0.8, roughness: 0.6, resistance: 0.70, min: 0.5 }
    const oldHeightMap = this.heightMap

    this.heightMap = new BABYLON.DynamicTexture("planetHeightMap", resolution, this.scene, true)
    this.specularMap = new BABYLON.DynamicTexture("planetSpecularMap", resolution, this.scene, true)
    this.diffuseMap = new BABYLON.DynamicTexture("planetDiffuseMap", resolution, this.scene, true)

    const heightMapCtx = this.heightMap.getContext();
    const specularMapCtx = this.specularMap.getContext();
    const diffuseMapCtx = this.diffuseMap.getContext();

    const colorGradient = ColorGradientFactory.generateGradient(hashStringToInt(this.options.terrainSeed))

    const sphereNormalTexture = new Image();
    sphereNormalTexture.src = `textures/planetObjectSpaceNormal.png`;
    await new Promise((resolve) => {
      sphereNormalTexture.onload = () => resolve()
    })

    console.time('generateBaseTextures')

    heightMapCtx.drawImage(sphereNormalTexture as CanvasImageSource, 0, 0, resolution, resolution)
    const heightMapImage = heightMapCtx.getImageData(0, 0, resolution, resolution)

    specularMapCtx.fillStyle = 'rgb(0,0,0)'
    specularMapCtx.fillRect(0, 0, resolution, resolution)
    const specularMapImage = specularMapCtx.getImageData(0, 0, resolution, resolution)

    const gradient = diffuseMapCtx.createLinearGradient(0,0,255,0)
    for (const color of colorGradient) {
      gradient.addColorStop(color.a / 255, `rgb(${color.r},${color.g},${color.b})`)
    }
    diffuseMapCtx.fillStyle = gradient;
    diffuseMapCtx.fillRect(0, 0, 256, 5);
    const diffuseMapImage = diffuseMapCtx.getImageData(0, 0, resolution, resolution)

    const { heightDataResult, specularDataResult, diffuseDataResult } = await TextureBuilder.buildTextures(hashStringToInt(this.options.terrainSeed), this._noiseSettings, heightMapImage, specularMapImage, diffuseMapImage)

    heightMapCtx.putImageData(heightMapImage, 0, 0);
    specularMapCtx.putImageData(specularMapImage, 0, 0);
    diffuseMapCtx.putImageData(diffuseMapImage, 0, 0);
    this.heightMap.update();
    this.specularMap.update();
    this.diffuseMap.update();
    this.bumpMap = this.generateNormalMap(heightMapImage, resolution)

    if (oldHeightMap) {
      setTimeout(() => oldHeightMap.dispose(), 2000)
    }

    console.timeEnd('generateBaseTextures')
    console.log(resolution)
  }

  generateNormalMap(heightMapImage: ImageData, resolution: number): BABYLON.DynamicTexture {
    const TEX_RES = resolution
    let oldBumpMap: BABYLON.DynamicTexture

    if (this.bumpMap) {
      oldBumpMap = this.bumpMap
    }
    this.bumpMap = new BABYLON.DynamicTexture("planetBumpMap", resolution, this.scene, true)

    const bumpCtx = this.bumpMap.getContext()
    bumpCtx.fillStyle = 'rgb(128,128,255)'
    bumpCtx.fillRect(0, 0, TEX_RES, TEX_RES)
    if (oldBumpMap) {
      bumpCtx.drawImage((oldBumpMap.getContext().canvas as any), 0, 0, TEX_RES, TEX_RES)
    }
    const bumpImageData = bumpCtx.getImageData(0, 0, TEX_RES, TEX_RES)

    const convolute = (pixels: ImageData, output: ImageData, weights: number[], opaque: number, channel: string[] = ['r','g', 'b']) => {
      var side = Math.round(Math.sqrt(weights.length));
      var halfSide = Math.floor(side / 2);
      var src = pixels.data;
      var sw = pixels.width;
      var sh = pixels.height;
      // pad output by the convolution matrix
      var w = sw;
      var h = sh;
      var dst = output.data;
      // go through the destination image pixels
      var alphaFac = opaque ? 1 : 0;
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var sy = y;
          var sx = x;
          var dstOff = (y * w + x) * 4;
          // calculate the weighed sum of the source image pixels that
          // fall under the convolution matrix
          var r = 0, g = 0, b = 0, a = 0;
          for (var cy = 0; cy < side; cy++) {
            for (var cx = 0; cx < side; cx++) {
              var scy = sy + cy - halfSide;
              var scx = sx + cx - halfSide;
              if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                var srcOff = (scy * sw + scx) * 4;
                var wt = weights[cy * side + cx];
                r += src[srcOff] * wt;
                g += src[srcOff + 1] * wt;
                b += src[srcOff + 2] * wt;
                a += src[srcOff + 3] * wt;
              }
            }
          }
          channel.includes('r') ? dst[dstOff] += r / 3 : null
          channel.includes('g') ? dst[dstOff + 1] += g / 3 : null
          channel.includes('b') ? dst[dstOff + 2] += b / 3 : null
          dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
      }
      return output;
    }

    const xNormalImage = convolute(
      heightMapImage,
      bumpImageData,
      [-1, 0, 1,
      -2, 0, 2,
      -1, 0, 1],
      1,
      ['r']
    )

    const yNormalImage = convolute(
      heightMapImage,
      bumpImageData,
      [1, 2, 1,
        0, 0, 0,
        -1, -2, -1],
      1,
      ['g']
    )

    bumpCtx.putImageData(yNormalImage, 0, 0)

    this.bumpMap.update();
    return this.bumpMap
  }
}

export { PlanetMaterial }
