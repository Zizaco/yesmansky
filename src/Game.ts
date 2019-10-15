import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import * as localforage from 'localforage';
import { Planet } from './Planet/Planet';
import { HardwareInfo } from './Infrastructure/HardwareInfo';

/**
 * Handles the whole Babylon engine instance and it's
 * main scenes and objects
 */
class Game {
  engine: BABYLON.Engine
  scene: BABYLON.Scene
  camera: BABYLON.ArcRotateCamera
  light: BABYLON.Light
  planet: Planet

  constructor(el: HTMLCanvasElement) {
    const engineOptions = {
      antialias: false
    }
    window.game = this
    this.engine = new BABYLON.Engine(el, undefined, engineOptions, false);
    this.scene = new BABYLON.Scene(this.engine);
    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 3.2,
      4.5,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    this.camera.lowerRadiusLimit = 2.1

    this.camera.attachControl(el, true);
    this.camera.wheelPrecision = 90
    this.camera.pinchPrecision = 100

    this.light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0.5, 1, 0),
      this.scene);

    this.planet = new Planet('planet', {}, this.scene)

    this.setGraphicalSettings()
    this.prepareGraphicalPipeline()

    if (process.env.NODE_ENV != 'production') {
      this.scene.debugLayer.show({ embedMode: true, overlay: true });
    }

    this.engine.runRenderLoop(() => this.render());
  }

  render() {
    if (this.planet) {
      this.planet.rotateAround(BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 1, 0), 0.0001)
      this.planet.mesh.atmosphereMesh.rotateAround(BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 1, 0), 0.0003)
    }
    this.scene.render();
  }

  setGraphicalSettings() {
    if (!HardwareInfo.hasGoodVideoCard()) {
      // this.engine.setHardwareScalingLevel(1.25)
    }
    this.engine.renderEvenInBackground = false
  }

  prepareGraphicalPipeline(): BABYLON.DefaultRenderingPipeline {
    const pipeline = new BABYLON.DefaultRenderingPipeline(
      "default", // The name of the pipeline
      true, // Do you want HDR textures ?
      this.scene, // The scene instance
      [this.camera] // The list of cameras to be attached to
    )

    pipeline.imageProcessingEnabled = true
    pipeline.imageProcessing.contrast = 1.2
    pipeline.fxaaEnabled = false
    pipeline.bloomEnabled = true
    pipeline.sharpenEnabled = true
    pipeline.grainEnabled = true
    pipeline.grain.intensity = 5
    pipeline.grain.animated = true
    pipeline.sharpen.colorAmount = 1
    if (HardwareInfo.hasGoodVideoCard()) {
      pipeline.samples = 4
      pipeline.sharpen.edgeAmount = 0.4
    } else {
      pipeline.sharpen.edgeAmount = 0.2
    }

    return pipeline
  }
}

export { Game }
