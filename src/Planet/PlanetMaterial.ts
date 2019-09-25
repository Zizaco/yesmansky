import * as BABYLON from "babylonjs"
import OpenSimplexNoise from 'open-simplex-noise'
import { HardwareInfo } from "../Infrastructure/HardwareInfo"
import { TextureBuilder } from './TextureBuilder'

const normalize = (val, min, max) => ((val - min) / (max - min))

class PlanetMaterial {
  scene: BABYLON.Scene
  _raw: BABYLON.StandardMaterial
  heightMap: BABYLON.DynamicTexture
  diffuseMap: BABYLON.DynamicTexture
  specularMap: BABYLON.DynamicTexture

  constructor(name: string = 'planetTexture', options: any, scene: BABYLON.Scene) {
    this.scene = scene
    // setTimeout(() => {
    //   const worker = new TextureBuilderWorker()
    //   worker.postMessage({hello: 'world'})
    //   worker.addEventListener("message", (event) => { console.log('message receive in main thread:', event)});
    // }, 5000);
  }

  get raw(): BABYLON.StandardMaterial {
    if (!this._raw) {
      this.generateMaterial(this.scene)
    }

    return this._raw
  }

  /**
   * New procedural material generation
   */
  protected generateMaterial(scene): BABYLON.Material {
    this._raw = new BABYLON.StandardMaterial("planet", scene);

    this.generateBaseTextures(256).then(() => {
      this._raw.diffuseTexture = this.diffuseMap
      this._raw.specularTexture = this.specularMap

      this.generateBaseTextures(512).then(() => {
        this._raw.diffuseTexture = this.diffuseMap
        this._raw.specularTexture = this.specularMap

        this.generateBaseTextures().then(() => {
          this._raw.diffuseTexture = this.diffuseMap
          this._raw.specularTexture = this.specularMap
        })
      })
    })

    this._raw.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    this._raw.specularPower = 14
    // material.bumpTexture = this.generateNormalMap(heightMap, normals, uv)
    // material.diffuseTexture = new BABYLON.Texture("textures/planetObjectSpaceNormal.png", scene, true)
    // this._raw.diffuseTexture = this.heightMap
    // material.bumpTexture = new BABYLON.Texture("textures/planetNormal.png", scene)
    // material.diffuseColor = new BABYLON.Color3(0.8, 0.26, 0.4)
    // material.emissiveColor = new BABYLON.Color3(1, 1, 1);

    return this._raw
  }

  async generateBaseTextures(resolution?: number): Promise<BABYLON.DynamicTexture> {
    const TEX_RES = resolution || (HardwareInfo.isMobile() ? 512 : (HardwareInfo.hasGoodVideoCard() ? 2048 : 1024))

    const settings = { layers: 10, strength: 0.8, roughness: 0.6, resistance: 0.70, min: 0.5 }
    const baseRoughness = settings.roughness / 100

    this.heightMap = new BABYLON.DynamicTexture("planetHeightMap", TEX_RES, this.scene, true)
    this.specularMap = new BABYLON.DynamicTexture("planetSpecularMap", TEX_RES, this.scene, true)
    this.diffuseMap = new BABYLON.DynamicTexture("planetDiffuseMap", TEX_RES, this.scene, true)
    const heightMapCtx = this.heightMap.getContext();
    const specularMapCtx = this.specularMap.getContext();
    const diffuseMapCtx = this.diffuseMap.getContext();

    const openSimplex = new OpenSimplexNoise(27);
    const colorGradient = new Image();
    colorGradient.src = `textures/earthgradient.png`;

    const sphereNormalTexture = new Image();
    sphereNormalTexture.src = `textures/planetObjectSpaceNormal.png`;
    return new Promise((resolve) => {
      sphereNormalTexture.onload = async () => {
        console.time('generateBaseTextures')

        heightMapCtx.drawImage(sphereNormalTexture as CanvasImageSource, 0, 0, TEX_RES, TEX_RES)
        const heightMapImage = heightMapCtx.getImageData(0, 0, TEX_RES, TEX_RES)

        specularMapCtx.fillStyle = 'rgb(0,0,0)'
        specularMapCtx.fillRect(0, 0, TEX_RES, TEX_RES)
        const specularMapImage = specularMapCtx.getImageData(0, 0, TEX_RES, TEX_RES)

        diffuseMapCtx.drawImage(colorGradient as CanvasImageSource, 0, 0, 256, 255)
        const diffuseMapImage = diffuseMapCtx.getImageData(0, 0, TEX_RES, TEX_RES)

        const { heightDataResult, specularDataResult, diffuseDataResult } = await TextureBuilder.buildTextures(heightMapImage, specularMapImage, diffuseMapImage)

        console.log(heightDataResult.data[1500])
        heightMapCtx.putImageData(heightMapImage, 0, 0);
        specularMapCtx.putImageData(specularMapImage, 0, 0);
        diffuseMapCtx.putImageData(diffuseMapImage, 0, 0);
        this.heightMap.update();
        this.specularMap.update();
        this.diffuseMap.update();
        console.timeEnd('generateBaseTextures')
        console.log(TEX_RES)
        resolve()
      }
    })
  }

  generateNormalMap(heightMap: BABYLON.DynamicTexture): BABYLON.Texture {
    const TEX_RES = 256

    const texture = new BABYLON.DynamicTexture("texture", TEX_RES, this.scene, false)
    const normalCtx = heightMap.getContext();
    const ctx = texture.getContext();

    // todo

    texture.update();
    return texture
  }
}

export { PlanetMaterial }
