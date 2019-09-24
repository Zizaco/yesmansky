import * as BABYLON from "babylonjs"
import OpenSimplexNoise from 'open-simplex-noise'
import { HardwareInfo } from "../Infrastructure/HardwareInfo"

const normalize = (val, min, max) => ((val - min) / (max - min))

class PlanetMaterial {
  scene: BABYLON.Scene
  _raw: BABYLON.StandardMaterial
  heightMap: BABYLON.DynamicTexture

  constructor(name: string = 'planetTexture', options: any, scene: BABYLON.Scene) {
    this.scene = scene
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

    const heightMap = this.generateHeightMap()
    // material.bumpTexture = this.generateNormalMap(heightMap, normals, uv)
    // material.diffuseTexture = new BABYLON.Texture("textures/planetObjectSpaceNormal.png", scene, true)
    this._raw.diffuseTexture = heightMap
    this._raw.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    // material.bumpTexture = new BABYLON.Texture("textures/planetNormal.png", scene)
    // material.diffuseColor = new BABYLON.Color3(0.8, 0.26, 0.4)
    // material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    this._raw.specularPower = 14

    return this._raw
  }

  generateHeightMap(): BABYLON.DynamicTexture {
    const TEX_RES = HardwareInfo.isMobile() ? 512 : (HardwareInfo.hasGoodVideoCard() ? 2048 : 1024)
    // const settings = { layers: 12, strength: 1, roughness: 0.6, resistance: 0.70, min: 0.5 }
    const settings = { layers: 10, strength: 0.8, roughness: 0.6, resistance: 0.70, min: 0.5 }
    const baseRoughness = settings.roughness / 100

    const texture = new BABYLON.DynamicTexture("planetHeightMap", TEX_RES, this.scene, true)
    const ctx = texture.getContext();

    const openSimplex = new OpenSimplexNoise(27);
    const sphereNormalTexture = new Image();
    sphereNormalTexture.src = 'textures/planetObjectSpaceNormal.png';
    sphereNormalTexture.onload = function () {
      console.time('generateHeightMap')
      ctx.drawImage(this as CanvasImageSource, 0, 0, TEX_RES, TEX_RES)
      const sphereNormalImage = ctx.getImageData(0, 0, TEX_RES, TEX_RES)
      const sphereNormals = sphereNormalImage.data
      const numberOfPixels = sphereNormals.length / 4

      for (let i = 0; i < numberOfPixels; i++) {
        const a = i * 4
        let [r, g, b] = [
          sphereNormals[a],
          sphereNormals[a + 1],
          sphereNormals[a + 2]
        ]
        if (r + g + b === 0) {
          continue
        }

        if (TEX_RES >= 1000) {
          const minibump = Math.random() * 1.5
          r += minibump
          g += minibump
        }

        let roughness = baseRoughness
        let strength = settings.strength
        let value = 0
        for (let layer = 0; layer < settings.layers; layer++) {
          value += openSimplex.noise3D(r * roughness, g * roughness, b * roughness) * strength;
          roughness = roughness * 2
          strength = strength * settings.resistance
        }

        value = Math.max(value * 128 + 128, 255 * settings.min)
        value = normalize(value, 255 * settings.min, 255) * 255
        if (value <= 1) {
          sphereNormals[a] = sphereNormals[a + 1] = sphereNormals[a + 2] = 40
        } else {
          sphereNormals[a] = sphereNormals[a + 1] = sphereNormals[a + 2] = value
        }
      }

      ctx.putImageData(sphereNormalImage, 0, 0);
      texture.update();
      console.timeEnd('generateHeightMap')
    }

    return texture
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
