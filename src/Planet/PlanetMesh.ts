import * as BABYLON from "babylonjs"
import { Vector3 } from "babylonjs"

type PlanetMeshOptions = { subdivisions?: number }

class PlanetMesh extends BABYLON.TransformNode {
  faces: Array<BABYLON.Mesh>
  _scene: BABYLON.Scene
  _subdivisions: number
  _material: BABYLON.Material

  constructor(name: string = 'planet', options: PlanetMeshOptions, scene: BABYLON.Scene) {
    super(name)
    this._scene = scene
    this._subdivisions = options.subdivisions || 10

    this.buildMeshes()
    this.setInspectableProperties()

    scene.addTransformNode(this)
  }

  set material(value: BABYLON.Material) {
    this._material = value
    this.applyMaterial()
  }

  set subdivisions(value: number) {
    this._subdivisions = value
    this.buildMeshes()
  }

  get subdivisions(): number {
    return this._subdivisions
  }

  protected buildMeshes() {
    this.deleteFaces()
    this.generateFaces(this._scene)
    this.applyMaterial()
  }

  protected deleteFaces() {
    if (!this.faces) {
      return
    }

    for (let i = 0; i < 6; i++) {
      this.faces[i].dispose()
    }
  }

  protected generateFaces(scene: BABYLON.Scene) {
    this.faces = []

    for (let i = 0; i < 6; i++) {
      this.faces[i] = BABYLON.MeshBuilder.CreateGround(
        `${this.name}Face${i}`,
        { width: 1, height: 1, subdivisions: this.subdivisions, updatable: true },
        scene
      );
      this.spherizeFace(this.faces[i])
      this.translateFace(this.faces[i], i)
      this.faces[i].setParent(this)
    }
  }

  /**
   * @see https://www.youtube.com/watch?v=QN39W020LqU
   */
  protected spherizeFace(face: BABYLON.Mesh) {
    face.updateMeshPositions((positions) => {
      var numberOfVertices = positions.length / 3
      for (var i = 0; i < numberOfVertices; i++) {
        const a = i * 3
        const vec = new Vector3(positions[a], 0.5, positions[a + 2])
        vec.normalize()
        positions[a] = vec.x
        positions[a + 1] = vec.y - 0.5
        positions[a + 2] = vec.z
      }
    }, true)
  }

  protected translateFace(face: BABYLON.Mesh, faceIndex: number) {
    if (faceIndex < 4) {
      face.rotate(new Vector3(1, 0, 0), Math.PI / 2)
      face.rotate(new Vector3(0, 0, 1), (Math.PI / 2) * (faceIndex - 2))
    }
    if (faceIndex == 5) {
      face.rotate(new Vector3(1, 0, 0), (Math.PI / 2) * 2)
    }
    face.translate(new Vector3(0, 1, 0), 0.5)
  }

  protected applyMaterial() {
    if (this._material) {
      for (let i = 0; i < 6; i++) {
        this.faces[i].material = this._material
      }
    }
  }

  protected setInspectableProperties() {
    this.inspectableCustomProperties = [
      {
        label: "Subdivisions",
        propertyName: "subdivisions",
        type: BABYLON.InspectableType.Slider,
        min: 3,
        max: 60,
        step: 1
      }
    ]
  }
}

export { PlanetMesh }
