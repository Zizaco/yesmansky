import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import * as localforage from 'localforage';
import { Planet } from './Planet/Planet';
import { HardwareInfo } from './Infrastructure/HardwareInfo';

class Game {
  engine: BABYLON.Engine
  scene: BABYLON.Scene

  constructor(el: HTMLCanvasElement) {
    const engineOptions = {
      antialias: false
    }
    window.game = this
    this.engine = new BABYLON.Engine(el, undefined, engineOptions, false);
    this.scene = new BABYLON.Scene(this.engine);

    this.setGraphicalSettings()

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 3.2,
      2,
      BABYLON.Vector3.Zero(),
      this.scene
    );

    camera.attachControl(el);
    camera.wheelPrecision = 30
    camera.pinchPrecision = 100

    // const light = new BABYLON.DirectionalLight(
    //   "light",
    //   new BABYLON.Vector3(0.5, -0.6, 0),
    //   this.scene);
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      this.scene);

    (window as any).planet = new Planet('planet', this.scene)
    // const mesh = BABYLON.MeshBuilder.CreateGround("mesh", {}, this.scene);

    // Rendering pipeline
    var pipeline = new BABYLON.DefaultRenderingPipeline(
      "default", // The name of the pipeline
      true, // Do you want HDR textures ?
      this.scene, // The scene instance
      [camera] // The list of cameras to be attached to
    );
    // pipeline.chromaticAberrationEnabled = true;
    // pipeline.chromaticAberration.aberrationAmount = 35;
    // pipeline.chromaticAberration.radialIntensity = 1;
    // pipeline.chromaticAberration.centerPosition.y = 0.35;

    pipeline.fxaaEnabled = true
    pipeline.sharpenEnabled = true
    pipeline.grainEnabled = true
    pipeline.grain.intensity = 5
    pipeline.grain.animated = true
    pipeline.sharpen.colorAmount = 1
    if (HardwareInfo.hasGoodVideoCard()) {
      pipeline.sharpen.edgeAmount = 1.4
    } else {
      pipeline.sharpen.edgeAmount = 0.8
    }

    this.scene.debugLayer.show({ embedMode: true, overlay: true });
    this.engine.runRenderLoop(() => this.render());
  }

  render() {
    (window as any).planet.rotateAround(BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 1, 0), 0.0005)
    this.scene.render();
  }

  setGraphicalSettings() {
    if (!HardwareInfo.hasGoodVideoCard()) {
      this.engine.setHardwareScalingLevel(1.3)
    }
    this.engine.renderEvenInBackground = false
  }
}

export { Game }
