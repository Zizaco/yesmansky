import * as BABYLON from "babylonjs"
import { PlanetMesh } from './PlanetMesh'

/**
 * @see https://www.redblobgames.com/maps/terrain-from-noise/
 * @see https://www.redblobgames.com/maps/mapgen4/
 */
class Planet {
  seed: string
  mesh: PlanetMesh

  constructor(scene) {
    const options = { diameter: 1, diameterX: 1, subdivisions: 20 }

    // this.mesh = BABYLON.MeshBuilder.CreateSphere("sphere", options, scene);
    this.mesh = new PlanetMesh('myPlanet', options as any, scene)
    this.mesh.material = this.generateMaterial(scene)
  }

  protected generateMaterial (scene) : BABYLON.Material {
    const textureResolution = 512
    const blueprint = {
      diff: new BABYLON.DynamicTexture("dynamic grass", textureResolution, scene, true),
      normal: new BABYLON.Texture("textures/planetNormal.png", scene),
      specular: new BABYLON.Texture("textures/planetSpecular.png", scene),
      planet: new BABYLON.Texture("textures/planet.png", scene, true)
    }

    // Dynamically draws the grass
    blueprint.diff.wrapU = 1
    blueprint.diff.wrapV = 1
    blueprint.diff.anisotropicFilteringLevel = 12
    var grassDrawContext = blueprint.diff.getContext();
    var img = new Image();
    img.src = 'textures/grass.png';
    img.onload = function () {
      var randomSaturation = Math.random() * 60 + 10
      var randomHue = Math.random() * 360
      var randomAlpha = Math.random()

      // Add image to dynamic texture
      grassDrawContext.drawImage(this as CanvasImageSource, 0, 0);

      // Saturation
      grassDrawContext.globalCompositeOperation = "saturation";
      grassDrawContext.fillStyle = "hsla(180," + randomSaturation + "%, 50%, " + randomAlpha + ")";  // hue doesn't matter here
      grassDrawContext.fillRect(0, 0, 512, 512);

      // Paint it with hue
      grassDrawContext.globalCompositeOperation = "hue";
      grassDrawContext.fillStyle = "hsla(" + randomHue + ",1%, 50%, " + randomAlpha + ")";  // sat must be > 0, otherwise won't matter
      grassDrawContext.fillRect(0, 0, 512, 512);

      // Reset comp mode and update texture
      grassDrawContext.globalCompositeOperation = "source-over";
      blueprint.diff.update();
    }

    const material = new BABYLON.StandardMaterial("planet", scene);
    // material.diffuseTexture = blueprint.planet
    material.bumpTexture = blueprint.normal
    material.specularTexture = blueprint.specular
    material.diffuseColor = new BABYLON.Color3(0.8, 0.26, 0.4)
    material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    material.specularPower = 14

    return material
  }
}

export { Planet }
