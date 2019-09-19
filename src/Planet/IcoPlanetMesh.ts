import * as BABYLON from "babylonjs"
import { Vector3 } from "babylonjs"
import OpenSimplexNoise from 'open-simplex-noise';

type PlanetMeshOptions = { subdivisions?: number }

class IcoPlanetMesh extends BABYLON.TransformNode {
  planetMesh: BABYLON.Mesh
  faces: Array<BABYLON.Mesh>
  _scene: BABYLON.Scene
  _subdivisions: number
  _material: BABYLON.Material

  constructor(name: string = 'planet', options: PlanetMeshOptions, scene: BABYLON.Scene) {
    super(name)
    this._scene = scene
    this._subdivisions = Math.min(options.subdivisions || 4, 128)

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
    if (!this.planetMesh) {
      return
    }

    this.planetMesh.dispose()
  }

  protected generateFaces(scene: BABYLON.Scene) {
    this.planetMesh = BABYLON.MeshBuilder.CreateIcoSphere(this.name, { flat: false, subdivisions: this.subdivisions }, scene)
    this.planetMesh.setParent(this)
    // this.smoothNormalsOfSphereMesh(this.planetMesh)
  }

  /**
   * @see https://www.youtube.com/watch?v=QN39W020LqU
   */
  protected uvmapFace(face: BABYLON.Mesh, faceIndex: number) {
    let cubemapTile = { x: 1, y: 2 }
    if (faceIndex < 4) {
      cubemapTile = { x: faceIndex, y: 1}
    } else if (faceIndex === 5) {
      cubemapTile = { x: 1, y: 0 }
    }
    const uvs = face.getVerticesData(BABYLON.VertexBuffer.UVKind)
    const numberOfVertices = uvs.length / 2

    for (let i = 0; i < numberOfVertices; i++) {
      const a = i*2
      uvs[a] = (uvs[a] + cubemapTile.x) / 4
      uvs[a + 1] = (uvs[a + 1] + cubemapTile.y) / 3
    }
    face.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs)
  }

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
      face.rotate(new Vector3(1, 0, 0), -Math.PI / 2)
      face.rotate(new Vector3(0, 0, 1), -(Math.PI / 2) * (faceIndex - 2))
    } else if (faceIndex === 5) {
      face.rotate(new Vector3(1, 0, 0), (Math.PI / 2) * 2)
      face.rotate(new Vector3(0, 1, 0), -(Math.PI / 2))
    } else {
      face.rotate(new Vector3(0, 1, 0), (Math.PI / 2))
    }

    face.translate(new Vector3(0, 1, 0), 0.5)
  }

  protected smoothNormalsOfSphereMesh(mesh: BABYLON.Mesh) {
    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)
    mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, positions)
  }

  protected applyMaterial() {
    this.planetMesh.material = this._material
  }

  protected setInspectableProperties() {
    this.inspectableCustomProperties = [
      {
        label: "Subdivisions",
        propertyName: "subdivisions",
        type: BABYLON.InspectableType.Slider,
        min: 3,
        max: 128,
        step: 1
      }
    ]
  }
}

export { IcoPlanetMesh }
