import * as BABYLON from '@babylonjs/core/Legacy/legacy'
import { PlanetMesh } from './PlanetMesh'
import { PlanetMaterialManager } from './PlanetMaterialManager'
import { PlanetOptions } from './types'

/**
 * Extends TransformNode to make it like a native babylon mesh
 * that can be transformed (scaled, moved, rotated) with the
 * same API.
 *
 * Generates a procedural planet based on options upon instantiation.
 *
 * @see https://www.redblobgames.com/maps/terrain-from-noise/
 * @see https://www.redblobgames.com/maps/mapgen4/
 */
class Planet extends BABYLON.TransformNode {
  mesh: PlanetMesh
  materialManager: PlanetMaterialManager
  scene: BABYLON.Scene
  options: PlanetOptions

  constructor(name: string = 'planet', options: any, scene: BABYLON.Scene) {
    super(name)
    this.scene = scene
    this.options = {
      terrainSeed: 'GIB GIB', // 'Foo' was also a good initial value
      type: 'terra',
      landMassSize: 80,
      roughness: 2,
      seaLevel: 25,
      atmosphereDensity: 2,
      atmosphereColor: 'blue',
      meshOptions: { diameter: 1, diameterX: 1, subdivisions: 25 },
      ...options
    }

    this.mesh = new PlanetMesh(name, this.options.meshOptions as any, scene)
    this.mesh.setParent(this)

    this.materialManager = new PlanetMaterialManager('myPlanetMat', this.options, scene)
    this.mesh.material = this.materialManager.raw
    this.mesh.atmosphereMaterial = this.materialManager.rawAtmosphere

    this.setInspectableProperties()
    this.setDisposeProcess()
  }

  set subdivisions(value: number) {
    this.mesh.subdivisions = value
  }

  get subdivisions(): number {
    return this.mesh.subdivisions
  }

  set noiseSettings(value: string) {
    this.materialManager.noiseSettings = JSON.parse(value)
    setTimeout(() => {
      this.mesh.material = this.materialManager.raw
    }, 100)
  }

  get noiseSettings(): string {
    return JSON.stringify(this.materialManager.noiseSettings)
  }

  /**
   * @see https://doc.babylonjs.com/how_to/debug_layer#inspector
   */
  protected setInspectableProperties() {
    this.inspectableCustomProperties = [
      {
        label: "Subdivisions",
        propertyName: "subdivisions",
        type: BABYLON.InspectableType.Slider,
        min: 3,
        max: 256,
        step: 1
      },
      {
        label: "Noise Settings",
        propertyName: "noiseSettings",
        type: BABYLON.InspectableType.String
      }
    ]
  }

  protected setDisposeProcess() {
    this.onDisposeObservable.add(() => {
      this.materialManager.dispose()
    })
  }
}

export { Planet }
