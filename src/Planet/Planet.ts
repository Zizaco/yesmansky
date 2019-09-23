import * as BABYLON from "babylonjs"
import { PlanetMesh } from './PlanetMesh'
import OpenSimplexNoise from 'open-simplex-noise'
import { convolute } from "../Filters/convolute"

type VertexNormals = BABYLON.FloatArray
type VertexUV = BABYLON.FloatArray
const normalize = (val, min, max) => ((val - min) / (max - min))

/**
 * @see https://www.redblobgames.com/maps/terrain-from-noise/
 * @see https://www.redblobgames.com/maps/mapgen4/
 */
class Planet extends BABYLON.TransformNode {
  seed: string
  mesh: PlanetMesh
  scene: BABYLON.Scene

  constructor(name: string = 'planet', scene) {
    super(name)
    this.scene = scene
    const options = { diameter: 1, diameterX: 1, subdivisions: 90 }

    this.mesh = new PlanetMesh('myPlanet', options as any, scene)
    this.mesh.setParent(this)

    setTimeout(() => {
      this.mesh.material = this.generateMaterial(scene)
    }, 100)

    this.setInspectableProperties()
  }

  set subdivisions(value: number) {
    this.mesh.subdivisions = value
  }

  get subdivisions(): number {
    return this.mesh.subdivisions
  }

  /**
   * New procedural material generation
   */
  protected generateMaterial(scene): BABYLON.Material {
    const normals = this.mesh.planetMesh.getVerticesData(BABYLON.VertexBuffer.NormalKind)
    const uv = this.mesh.planetMesh.getVerticesData(BABYLON.VertexBuffer.UVKind)
    const material = new BABYLON.StandardMaterial("planet", scene);

    // const heightMap = this.generateHeightMap(normals, uv)
    // material.bumpTexture = this.generateNormalMap(heightMap, normals, uv)
    material.diffuseTexture = new BABYLON.Texture("textures/planetObjectSpaceNormal.png", scene, true)
    // material.diffuseTexture = heightMap
    material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    // material.bumpTexture = new BABYLON.Texture("textures/planetNormal.png", scene)
    // material.diffuseColor = new BABYLON.Color3(0.8, 0.26, 0.4)
    // material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.specularPower = 14

    return material
  }

  generateNormalMap(heightMap: BABYLON.DynamicTexture, normals: VertexNormals, uv: VertexUV): BABYLON.Texture {
    const TEX_RES = 256

    const texture = new BABYLON.DynamicTexture("texture", TEX_RES, this.scene, false)
    const normalCtx = heightMap.getContext();
    const ctx = texture.getContext();

    // todo

    texture.update();
    return texture
  }

  generateHeightMap(normals: VertexNormals, uv: VertexUV): BABYLON.DynamicTexture {
    const TEX_RES = 256
    const settings = {layers: 12, strenght: 1, roughness: 0.6, resistance: 0.70, min: 0.5}

    const texture = new BABYLON.DynamicTexture("texture", TEX_RES, this.scene, false)
    const ctx = texture.getContext();

    const openSimplex = new OpenSimplexNoise(Date.now());

    const pixelWidth = Math.ceil(TEX_RES / 4 / this.mesh.subdivisions)
    const pixelHeight = Math.ceil(TEX_RES / 3 / this.mesh.subdivisions)

    const numberOfVertices = normals.length / 3
    // const numberOfVertices = Math.min(normals.length / 3, 2500)
    ctx.fillStyle = `rgb(110,110,110)`
    ctx.fillRect(0, 0, TEX_RES, TEX_RES)

    for (let i = 0; i < numberOfVertices; i++) {
      let roughness = settings.roughness
      let strength = settings.strenght
      let value = 0
      const [x, y, z] = [normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]]
      for (let layer = 0; layer < settings.layers; layer++) {
        value += openSimplex.noise3D(x * roughness, y * roughness, z * roughness) * strength;
        roughness = roughness * 2
        strength = strength * settings.resistance
      }
      value = Math.max(value * 128 + 128, 255 * settings.min)
      value = normalize(value, 255 * settings.min, 255) * 255
      ctx.fillStyle = `rgb(${value}, ${value}, ${value})`
      ctx.fillRect(TEX_RES * uv[i * 2] - pixelWidth / 2, TEX_RES * (1 - uv[i * 2 + 1]) - pixelHeight / 2, pixelWidth, pixelHeight)
    }

    texture.update();
    return texture
  }

  protected setInspectableProperties() {
    this.inspectableCustomProperties = [
      {
        label: "Subdivisions",
        propertyName: "subdivisions",
        type: BABYLON.InspectableType.Slider,
        min: 3,
        max: 256,
        step: 1
      }
    ]
  }
}

export { Planet }
