import * as BABYLON from "babylonjs"
import { PlanetMesh } from './PlanetMesh'
import OpenSimplexNoise from 'open-simplex-noise'
import { HardwareInfo } from '../Infrastructure/HardwareInfo'
import { PlanetMaterial } from './PlanetMaterial'

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
  material: PlanetMaterial
  scene: BABYLON.Scene

  constructor(name: string = 'planet', scene) {
    super(name)
    this.scene = scene
    const options = { diameter: 1, diameterX: 1, subdivisions: 90 }

    this.mesh = new PlanetMesh('myPlanet', options as any, scene)
    this.mesh.setParent(this)
    this.material = new PlanetMaterial('myPlanetMat', {}, scene)

    setTimeout(() => {
      this.mesh.material = this.material.raw
    }, 100)

    this.setInspectableProperties()
  }

  set subdivisions(value: number) {
    this.mesh.subdivisions = value
  }

  get subdivisions(): number {
    return this.mesh.subdivisions
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
