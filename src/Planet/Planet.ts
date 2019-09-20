import * as BABYLON from "babylonjs"
import { PlanetMesh } from './PlanetMesh'
import OpenSimplexNoise from 'open-simplex-noise'

type VertexNormals = BABYLON.FloatArray
type VertexUV = BABYLON.FloatArray

/**
 * @see https://www.redblobgames.com/maps/terrain-from-noise/
 * @see https://www.redblobgames.com/maps/mapgen4/
 */
class Planet {
  seed: string
  mesh: PlanetMesh
  scene: BABYLON.Scene

  constructor(scene) {
    this.scene = scene
    const options = { diameter: 1, diameterX: 1, subdivisions: 512 }

    // this.mesh = BABYLON.MeshBuilder.CreateSphere("sphere", options, scene);
    this.mesh = new PlanetMesh('myPlanet', options as any, scene)
    // this.mesh.material = this.generateMaterialOld(scene)
    setTimeout(() => {
      this.mesh.material = this.generateMaterial(scene)
      this.mesh.subdivisions = 30
    }, 100)
  }

  /**
   * New procedural material generation
   */
  protected generateMaterial(scene): BABYLON.Material {
    const normals = this.mesh.planetMesh.getVerticesData(BABYLON.VertexBuffer.NormalKind)
    const uv = this.mesh.planetMesh.getVerticesData(BABYLON.VertexBuffer.UVKind)
    const material = new BABYLON.StandardMaterial("planet", scene);

    material.diffuseTexture = this.generateDiffuseTexture(normals, uv)
    material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    // material.bumpTexture = new BABYLON.Texture("textures/planetNormal.png", scene)
    material.diffuseColor = new BABYLON.Color3(0.8, 0.26, 0.4)
    // material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.specularPower = 14

    return material
  }

  generateDiffuseTexture(normals: VertexNormals, uv: VertexUV) {
    const TEX_RES = 2048

    const texture = new BABYLON.DynamicTexture("texture", TEX_RES, this.scene, false)
    const ctx = texture.getContext();

    const openSimplex = new OpenSimplexNoise(Date.now());

    const pixelWidth = Math.ceil(TEX_RES / 4 / this.mesh.subdivisions)
    const pixelHeight = Math.ceil(TEX_RES / 3 / this.mesh.subdivisions)

    const numberOfVertices = normals.length / 3
    ctx.fillStyle = `rgb(128,128,128)`
    ctx.fillRect(0, 0, TEX_RES, TEX_RES)

    for (let i = 0; i < numberOfVertices; i++) {
      const [x, y, z] = [normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]]
      const value = (openSimplex.noise3D(x * 256, y * 256, z * 256) + 1) * 128;
      ctx.fillStyle = `rgb(${value}, ${value}, ${value})`
      ctx.fillRect(TEX_RES * uv[i * 2] - pixelWidth / 2, TEX_RES * (1 - uv[i * 2 + 1]) - pixelHeight / 2, pixelWidth, pixelHeight)
    }

    texture.update();
    return texture
  }
}

export { Planet }
