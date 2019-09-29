import * as BABYLON from '@babylonjs/core/Legacy/legacy'
import { PlanetMesh } from './PlanetMesh'
import { IcoPlanetMesh } from './IcoPlanetMesh'
import OpenSimplexNoise from 'open-simplex-noise';

/**
 * @see https://www.redblobgames.com/maps/terrain-from-noise/
 * @see https://www.redblobgames.com/maps/mapgen4/
 */
class IcoPlanet {
  seed: string
  mesh: IcoPlanetMesh

  constructor(scene) {
    const options = { diameter: 1, diameterX: 1, subdivisions: 128 }

    // this.mesh = BABYLON.MeshBuilder.CreateSphere("sphere", options, scene);
    this.mesh = new IcoPlanetMesh('myPlanet', options as any, scene)
    // this.mesh.material = this.generateMaterialOld(scene)
    setTimeout(() => {
      this.mesh.material = this.generateMaterial(scene)
    },100)
  }

  /**
   * New procedural material generation
   */
  protected generateMaterial (scene) : BABYLON.Material {
    const textureResolution = 512
    const blueprint = {
      diff: new BABYLON.DynamicTexture("texture", textureResolution, scene, false),
      normal: new BABYLON.DynamicTexture("texture", textureResolution, scene, false),
    }

    const grassDrawContext = blueprint.diff.getContext();
    const imageData = grassDrawContext.createImageData(512, 512);
    const openSimplex = new OpenSimplexNoise(Date.now());
    // for (let x = 0; x < 512; x++) {
    //   for (let y = 0; y < 512; y++) {
    //     const i = (x + y * 512) * 4;
    //     const value = (openSimplex.noise2D(x/10, y/10) + 1) * 128;
    //     imageData.data[i] = 255;
    //     imageData.data[i + 1] = 255-value;
    //     imageData.data[i + 2] = 255-value;
    //     imageData.data[i + 3] = 255;
    //   }
    // }
    const normals = this.mesh.planetMesh.getVerticesData(BABYLON.VertexBuffer.NormalKind)
    const uv = this.mesh.planetMesh.getVerticesData(BABYLON.VertexBuffer.UVKind)

    const pixelWidth = Math.ceil(textureResolution / this.mesh.subdivisions / 5)
    const pixelHeight = Math.ceil(textureResolution / this.mesh.subdivisions / 5)

    const numberOfVertices = normals.length / 3
    grassDrawContext.fillStyle = `rgb(128,128,128)`
    grassDrawContext.fillRect(0,0,512,512)
    // grassDrawContext.filter = `blur(${pixelWidth/2}px)`;
    for (let i = 0; i < numberOfVertices; i++) {
      const [x, y, z] = [normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]]
      const value = (openSimplex.noise3D(x * 8, y * 8, z * 8) + 1) * 128;
      grassDrawContext.fillStyle = `rgb(${value}, ${value}, ${value})`
      // const isHorizontalSide = 512 * uv[i * 2 + 1] < (512 / 3) || 512 * uv[i * 2 + 1] > (512 / 3) * 2
      // const ensureIsHorizontalSide = Math.floor(512 * uv[i * 2]) < Math.floor(512 / 4) || Math.floor(512 * uv[i * 2]) > Math.floor(512 / 4 * 2)
      // const isFirstPixelOfLeftSide = Math.floor(512 * uv[i * 2]) === 128
      // const isFirstPixelOfTopSide = Math.floor(512 * uv[i * 2+1]) === Math.floor(512/3)
      // const isLastPixelOfTopSide = Math.floor(512 * uv[i * 2+1]) === Math.floor(512/3*2)
      // if (isFirstPixelOfTopSide) {
      //   grassDrawContext.fillRect(512 * uv[i * 2], 512 * uv[i * 2 + 1] -16, pixelWidth, pixelHeight+16)
      // }
      // if (isHorizontalSide && isFirstPixelOfLeftSide ) {
      //   grassDrawContext.fillRect(512 * uv[i * 2]-16, 512 * uv[i * 2 + 1], pixelWidth+16, pixelHeight)
      // }
      // if (ensureIsHorizontalSide && isLastPixelOfTopSide) {
      //   grassDrawContext.fillRect(512 * uv[i * 2], 512 * uv[i * 2 + 1], pixelWidth, pixelHeight+16)
      // }
      grassDrawContext.fillRect(512 * uv[i * 2] - pixelWidth / 2, 512 * (1 - uv[i * 2 + 1]) - pixelWidth/2, pixelWidth, pixelHeight)
    }

    // grassDrawContext.putImageData(imageData, 0, 0);
    blueprint.diff.update();
    const material = new BABYLON.StandardMaterial("planet", scene);
    material.diffuseTexture = blueprint.diff
    // material.bumpTexture = new BABYLON.Texture("textures/planetNormal.png", scene)
    // material.diffuseColor = new BABYLON.Color3(0.8, 0.26, 0.4)
    material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    // material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.specularPower = 14

    return material
  }

  protected generateMaterialOld (scene) : BABYLON.Material {
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
    // material.specularTexture = blueprint.specular
    material.diffuseColor = new BABYLON.Color3(0.8, 0.26, 0.4)
    material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    material.specularPower = 14

    return material
  }
}

export { IcoPlanet }
