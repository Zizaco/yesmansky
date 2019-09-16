import * as BABYLON from "babylonjs";
import * as localforage from 'localforage';

class Game {
  engine: BABYLON.Engine
  scene: BABYLON.Scene

  constructor(el: HTMLCanvasElement) {
    this.engine = new BABYLON.Engine(el, true);
    this.scene = new BABYLON.Scene(this.engine);

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 3.2,
      2,
      BABYLON.Vector3.Zero(),
      this.scene);

    camera.attachControl(el);

    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      this.scene);

    const mesh = BABYLON.MeshBuilder.CreateGround("mesh", {}, this.scene);

    this.scene.debugLayer.show({ overlay: true });
    this.engine.runRenderLoop(() => this.render());
  }

  render() {
    this.scene.render();
  }
}

export { Game }
