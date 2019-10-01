import * as BABYLON from '@babylonjs/core/Legacy/legacy'
import { HardwareInfo } from "../Infrastructure/HardwareInfo"
import { TextureBuilder } from './TextureBuilder'
import { ColorGradientFactory } from './ColorGradientFactory'
import { NoiseSettings } from './types'

const normalize = (val, min, max) => ((val - min) / (max - min))

class PlanetMaterial {
  name: string
  seed: number
  _noiseSettings: NoiseSettings
  scene: BABYLON.Scene
  _raw: BABYLON.StandardMaterial
  _rawAtmosphere: BABYLON.StandardMaterial
  _superRaw: BABYLON.Material
  heightMap: BABYLON.DynamicTexture
  diffuseMap: BABYLON.DynamicTexture
  specularMap: BABYLON.DynamicTexture
  bumpMap: BABYLON.DynamicTexture

  constructor(name: string = 'planetTexture', options: any, scene: BABYLON.Scene) {
    this.name = name
    this.scene = scene
    this.seed = Math.random()*128
    this._noiseSettings = [
      // { shift: 0, passes: 10, strength: 0.8, roughness: 0.6, resistance: 0.70, min: 0.2, hard: false }, // base
      // { shift: 18, passes: 15, strength: 0.8, roughness: 0.3, resistance: 0.65, min: 0.2, hard: true }, // erosion
      { "shift": 5, "passes": 14, "strength": 0.65, "roughness": 0.2, "resistance": 0.6, "min": 0.3, "hard": true }
    ]
  }

  get raw(): BABYLON.StandardMaterial {
    if (!this._raw) {
      this.generateMaterial(this.scene)
    }

    return this._raw
  }

  get rawAtmosphere(): BABYLON.StandardMaterial {
    if (!this._rawAtmosphere) {
      this.generateAtmosphere(this.scene)
    }

    return this._rawAtmosphere
  }

  set noiseSettings(value: NoiseSettings) {
    if (this._raw) {
      const oldRawMaterial = this._raw
      setTimeout(() => oldRawMaterial.dispose(true, true), 2000)
      this.bumpMap.dispose()
      this.bumpMap = undefined
    }
    this._noiseSettings = value
    this.generateMaterial(this.scene)
  }

  get noiseSettings(): NoiseSettings {
    return this._noiseSettings
  }

  /**
   * New procedural material generation
   */
  protected generateMaterial(scene): BABYLON.Material {
    this._raw = new BABYLON.StandardMaterial(this.name, scene);

    this.generateBaseTextures(256).then(() => {
      this._raw.diffuseTexture = this.diffuseMap
      this._raw.specularTexture = this.specularMap
      this._raw.bumpTexture = this.bumpMap
      this._raw.bumpTexture.level = 0.2

      this.generateBaseTextures(512).then(() => {
        this._raw.diffuseTexture.dispose()
        this._raw.specularTexture.dispose()
        this._raw.bumpTexture.dispose()

        this._raw.diffuseTexture = this.diffuseMap
        this._raw.specularTexture = this.specularMap
        this._raw.bumpTexture = this.bumpMap
        this._raw.bumpTexture.level = 0.3

        this.generateBaseTextures(HardwareInfo.hasGoodVideoCard() ? 2048 : 1024).then(() => {
          this._raw.diffuseTexture.dispose()
          this._raw.specularTexture.dispose()
          this._raw.bumpTexture.dispose()


          this._raw.diffuseTexture = this.diffuseMap
          this._raw.specularTexture = this.specularMap
          this._raw.bumpTexture = this.bumpMap
          this._raw.bumpTexture.level = 0.45

          // this._superRaw = this.buildShader(this.diffuseMap, this.specularMap, this.bumpMap)
        }).catch((e) => console.error(e))
      })
    })

    this._raw.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    this._raw.specularPower = 14

    return this._raw
  }

  protected generateAtmosphere(scene): BABYLON.Material {
    this._rawAtmosphere = new BABYLON.StandardMaterial(`${this.name}Atmosphere`, scene);
    this._rawAtmosphere.reflectionTexture = new BABYLON.Texture("textures/atmosphere.png", scene);
    this._rawAtmosphere.diffuseTexture = new BABYLON.Texture("textures/planetClouds1.jpg", scene);
    this._rawAtmosphere.reflectionTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
    this._rawAtmosphere.alpha = 0.5
    this._rawAtmosphere.alphaMode = BABYLON.Engine.ALPHA_ADD
    this._rawAtmosphere.specularPower = 2.5
    this._rawAtmosphere.zOffset = -5
    this._rawAtmosphere.specularColor = new BABYLON.Color3(0.1, 0.3, 0.5)

    return this._rawAtmosphere
  }

  async generateBaseTextures(resolution: number) {
    const settings = { layers: 10, strength: 0.8, roughness: 0.6, resistance: 0.70, min: 0.5 }
    const oldHeightMap = this.heightMap

    this.heightMap = new BABYLON.DynamicTexture("planetHeightMap", resolution, this.scene, true)
    this.specularMap = new BABYLON.DynamicTexture("planetSpecularMap", resolution, this.scene, true)
    this.diffuseMap = new BABYLON.DynamicTexture("planetDiffuseMap", resolution, this.scene, true)

    const heightMapCtx = this.heightMap.getContext();
    const specularMapCtx = this.specularMap.getContext();
    const diffuseMapCtx = this.diffuseMap.getContext();

    const colorGradient = ColorGradientFactory.generateGradient(this.seed)

    const sphereNormalTexture = new Image();
    sphereNormalTexture.src = `textures/planetObjectSpaceNormal.png`;
    await new Promise((resolve) => {
      sphereNormalTexture.onload = () => resolve()
    })

    console.time('generateBaseTextures')

    heightMapCtx.drawImage(sphereNormalTexture as CanvasImageSource, 0, 0, resolution, resolution)
    const heightMapImage = heightMapCtx.getImageData(0, 0, resolution, resolution)

    specularMapCtx.fillStyle = 'rgb(0,0,0)'
    specularMapCtx.fillRect(0, 0, resolution, resolution)
    const specularMapImage = specularMapCtx.getImageData(0, 0, resolution, resolution)

    const gradient = diffuseMapCtx.createLinearGradient(0,0,255,0)
    for (const color of colorGradient) {
      gradient.addColorStop(color.a / 255, `rgb(${color.r},${color.g},${color.b})`)
    }
    diffuseMapCtx.fillStyle = gradient;
    diffuseMapCtx.fillRect(0, 0, 256, 5);
    const diffuseMapImage = diffuseMapCtx.getImageData(0, 0, resolution, resolution)

    const { heightDataResult, specularDataResult, diffuseDataResult } = await TextureBuilder.buildTextures(this._noiseSettings, heightMapImage, specularMapImage, diffuseMapImage)

    heightMapCtx.putImageData(heightMapImage, 0, 0);
    specularMapCtx.putImageData(specularMapImage, 0, 0);
    diffuseMapCtx.putImageData(diffuseMapImage, 0, 0);
    this.heightMap.update();
    this.specularMap.update();
    this.diffuseMap.update();
    this.bumpMap = this.generateNormalMap(heightMapImage, resolution)

    if (oldHeightMap) {
      setTimeout(() => oldHeightMap.dispose(), 2000)
    }

    console.timeEnd('generateBaseTextures')
    console.log(resolution)
  }

  generateNormalMap(heightMapImage: ImageData, resolution: number): BABYLON.DynamicTexture {
    const TEX_RES = resolution
    let oldBumpMap: BABYLON.DynamicTexture

    if (this.bumpMap) {
      oldBumpMap = this.bumpMap
    }
    this.bumpMap = new BABYLON.DynamicTexture("planetBumpMap", resolution, this.scene, true)

    const bumpCtx = this.bumpMap.getContext()
    bumpCtx.fillStyle = 'rgb(128,128,255)'
    bumpCtx.fillRect(0, 0, TEX_RES, TEX_RES)
    if (oldBumpMap) {
      bumpCtx.drawImage((oldBumpMap.getContext().canvas as any), 0, 0, TEX_RES, TEX_RES)
    }
    const bumpImageData = bumpCtx.getImageData(0, 0, TEX_RES, TEX_RES)

    const convolute = (pixels: ImageData, output: ImageData, weights: number[], opaque: number, channel: string[] = ['r','g', 'b']) => {
      var side = Math.round(Math.sqrt(weights.length));
      var halfSide = Math.floor(side / 2);
      var src = pixels.data;
      var sw = pixels.width;
      var sh = pixels.height;
      // pad output by the convolution matrix
      var w = sw;
      var h = sh;
      var dst = output.data;
      // go through the destination image pixels
      var alphaFac = opaque ? 1 : 0;
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var sy = y;
          var sx = x;
          var dstOff = (y * w + x) * 4;
          // calculate the weighed sum of the source image pixels that
          // fall under the convolution matrix
          var r = 0, g = 0, b = 0, a = 0;
          for (var cy = 0; cy < side; cy++) {
            for (var cx = 0; cx < side; cx++) {
              var scy = sy + cy - halfSide;
              var scx = sx + cx - halfSide;
              if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                var srcOff = (scy * sw + scx) * 4;
                var wt = weights[cy * side + cx];
                r += src[srcOff] * wt;
                g += src[srcOff + 1] * wt;
                b += src[srcOff + 2] * wt;
                a += src[srcOff + 3] * wt;
              }
            }
          }
          channel.includes('r') ? dst[dstOff] += r / 3 : null
          channel.includes('g') ? dst[dstOff + 1] += g / 3 : null
          channel.includes('b') ? dst[dstOff + 2] += b / 3 : null
          dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
      }
      return output;
    }

    const xNormalImage = convolute(
      heightMapImage,
      bumpImageData,
      [-1, 0, 1,
      -2, 0, 2,
      -1, 0, 1],
      1,
      ['r']
    )

    const yNormalImage = convolute(
      heightMapImage,
      bumpImageData,
      [1, 2, 1,
        0, 0, 0,
        -1, -2, -1],
      1,
      ['g']
    )

    bumpCtx.putImageData(yNormalImage, 0, 0)

    this.bumpMap.update();
    return this.bumpMap
  }

  buildShader(diffuseTexture: BABYLON.Texture, specularTexture: BABYLON.Texture, bumpTexture: BABYLON.Texture, emissiveTexture?: BABYLON.Texture){
    var nodeMaterial = new BABYLON.NodeMaterial('planetMaterial', this.scene);

    var position = new BABYLON.InputBlock("position");
    position.setAsAttribute("position");

    var worldPos = new BABYLON.TransformBlock("worldPos");
    worldPos.complementZ = 0;
    worldPos.complementW = 1;
    position.output.connectTo(worldPos.vector);

    var world = new BABYLON.InputBlock("world");
    world.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

    var Worldnormal = new BABYLON.TransformBlock("World normal");
    Worldnormal.complementZ = 0;
    Worldnormal.complementW = 1;

    var normal = new BABYLON.InputBlock("normal");
    normal.setAsAttribute("normal");
    normal.output.connectTo(Worldnormal.vector);
    world.output.connectTo(Worldnormal.transform);

    var Multiply = new BABYLON.MultiplyBlock("Multiply");

    var bumpMap = new BABYLON.TextureBlock("bumpMap");
    bumpMap.texture = bumpTexture
    bumpMap.texture.wrapU = 1;
    bumpMap.texture.wrapV = 1;
    bumpMap.texture.uAng = 0;
    bumpMap.texture.vAng = 0;
    bumpMap.texture.wAng = 0;
    bumpMap.texture.uOffset = 0;
    bumpMap.texture.vOffset = 0;
    bumpMap.texture.uScale = 1;
    bumpMap.texture.vScale = 1;
    bumpMap.texture.gammaSpace = true;

    var uv = new BABYLON.InputBlock("uv");
    uv.setAsAttribute("uv");

    var specularMap = new BABYLON.TextureBlock("specularMap");
    specularMap.texture = specularTexture
    specularMap.texture.wrapU = 1;
    specularMap.texture.wrapV = 1;
    specularMap.texture.uAng = 0;
    specularMap.texture.vAng = 0;
    specularMap.texture.wAng = 0;
    specularMap.texture.uOffset = 0;
    specularMap.texture.vOffset = 0;
    specularMap.texture.uScale = 1;
    specularMap.texture.vScale = 1;
    specularMap.texture.gammaSpace = true;
    uv.output.connectTo(specularMap.uv);

    var Multiply1 = new BABYLON.MultiplyBlock("Multiply");
    specularMap.rgb.connectTo(Multiply1.left);

    var Multiply2 = new BABYLON.MultiplyBlock("Multiply");

    var diffuseMap = new BABYLON.TextureBlock("diffuseMap");
    diffuseMap.texture = diffuseTexture
    diffuseMap.texture.wrapU = 1;
    diffuseMap.texture.wrapV = 1;
    diffuseMap.texture.uAng = 0;
    diffuseMap.texture.vAng = 0;
    diffuseMap.texture.wAng = 0;
    diffuseMap.texture.uOffset = 0;
    diffuseMap.texture.vOffset = 0;
    diffuseMap.texture.uScale = 1;
    diffuseMap.texture.vScale = 1;
    diffuseMap.texture.gammaSpace = true;
    uv.output.connectTo(diffuseMap.uv);

    var Multiply3 = new BABYLON.MultiplyBlock("Multiply");

    var Lights = new BABYLON.LightBlock("Lights");
    worldPos.output.connectTo(Lights.worldPosition);
    Multiply.output.connectTo(Lights.worldNormal, true);

    var cameraPosition = new BABYLON.InputBlock("cameraPosition");
    cameraPosition.setAsSystemValue(BABYLON.NodeMaterialSystemValues.CameraPosition);

    var Viewdirection = new BABYLON.ViewDirectionBlock("View direction");
    worldPos.output.connectTo(Viewdirection.worldPosition);
    cameraPosition.output.connectTo(Viewdirection.cameraPosition);

    var Distance = new BABYLON.DistanceBlock("Distance");

    var Multiply4 = new BABYLON.MultiplyBlock("Multiply");

    var VectorSplitter = new BABYLON.VectorSplitterBlock("VectorSplitter");
    worldPos.output.connectTo(VectorSplitter.xyzw);
    VectorSplitter.xyzOut.connectTo(Multiply4.left);

    var atmosphere = new BABYLON.InputBlock("atmosphere");
    atmosphere.value = new BABYLON.Color3(0.6392156862745098, 0.6392156862745098, 0.6392156862745098);
    atmosphere.isConstant = false;
    atmosphere.visibleInInspector = false;
    atmosphere.output.connectTo(Multiply4.right);
    Multiply4.output.connectTo(Distance.left);
    Viewdirection.output.connectTo(Distance.right);

    var Gradient = new BABYLON.GradientBlock("Gradient");
    Gradient.colorSteps.pop()
    Gradient.colorSteps.pop()
    Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(1, new BABYLON.Color3(0.11764705882352941, 0.11764705882352941, 0.11764705882352941)));
    Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.4, new BABYLON.Color3(0.3843137254901961, 0.3843137254901961, 0.3843137254901961)));
    Distance.output.connectTo(Gradient.gradient);

    var Divide = new BABYLON.DivideBlock("Divide");

    var Add = new BABYLON.AddBlock("Add");
    Multiply1.output.connectTo(Add.left);
    Multiply3.output.connectTo(Add.right, true);
    Add.output.connectTo(Divide.left);
    Gradient.output.connectTo(Divide.right);

    var Multiply5 = new BABYLON.MultiplyBlock("Multiply");
    Divide.output.connectTo(Multiply5.left);

    var Gradient1 = new BABYLON.GradientBlock("Gradient");
    Gradient1.colorSteps.pop()
    Gradient1.colorSteps.pop()
    Gradient1.colorSteps.push(new BABYLON.GradientBlockColorStep(1, new BABYLON.Color3(0.49411764705882355, 0.49411764705882355, 0.49411764705882355)));
    Gradient1.colorSteps.push(new BABYLON.GradientBlockColorStep(0.28, new BABYLON.Color3(0.1568627450980392, 0.1568627450980392, 0.1568627450980392)));
    Distance.output.connectTo(Gradient1.gradient);
    Gradient1.output.connectTo(Multiply5.right);

    var Max = new BABYLON.MaxBlock("Max");
    Multiply5.output.connectTo(Max.left);

    var Multiply6 = new BABYLON.MultiplyBlock("Multiply");

    var emissiveMap = new BABYLON.TextureBlock("emissiveMap");
    emissiveMap.texture = emissiveTexture
    if (emissiveMap.texture) {
      emissiveMap.texture.wrapU = 1;
      emissiveMap.texture.wrapV = 1;
      emissiveMap.texture.uAng = 0;
      emissiveMap.texture.vAng = 0;
      emissiveMap.texture.wAng = 0;
      emissiveMap.texture.uOffset = 0;
      emissiveMap.texture.vOffset = 0;
      emissiveMap.texture.uScale = 1;
      emissiveMap.texture.vScale = 1;
      emissiveMap.texture.gammaSpace = true;
    }
    uv.output.connectTo(emissiveMap.uv);
    emissiveMap.rgb.connectTo(Multiply6.left);

    var Color = new BABYLON.InputBlock("Color3");
    Color.value = new BABYLON.Color3(0.39215686274509803, 0.39215686274509803, 0.39215686274509803);
    Color.isConstant = false;
    Color.visibleInInspector = false;
    Color.output.connectTo(Multiply6.right);
    Multiply6.output.connectTo(Max.right);

    var fragmentOutput = new BABYLON.FragmentOutputBlock("fragmentOutput");
    Max.output.connectTo(fragmentOutput.rgb);

    var alpha = new BABYLON.InputBlock("alpha");
    alpha.value = 1;
    alpha.min = 0;
    alpha.max = 1;
    alpha.matrixMode = 0;
    alpha.output.connectTo(fragmentOutput.a);
    cameraPosition.output.connectTo(Lights.cameraPosition);

    var specularPower = new BABYLON.InputBlock("specularPower");
    specularPower.value = 30;
    specularPower.min = 0;
    specularPower.max = 100;
    specularPower.matrixMode = 0;
    specularPower.output.connectTo(Lights.glossPower);
    Lights.diffuseOutput.connectTo(Multiply3.left);
    diffuseMap.rgb.connectTo(Multiply3.right);
    diffuseMap.rgb.connectTo(Multiply2.left);
    Lights.specularOutput.connectTo(Multiply2.right);
    Multiply2.output.connectTo(Multiply1.right);
    uv.output.connectTo(bumpMap.uv);
    bumpMap.rgba.connectTo(Multiply.left);
    Worldnormal.output.connectTo(Multiply.right);
    world.output.connectTo(worldPos.transform);

    var worldPosviewProjectionTransform = new BABYLON.TransformBlock("worldPos * viewProjectionTransform");
    worldPosviewProjectionTransform.complementZ = 0;
    worldPosviewProjectionTransform.complementW = 1;
    worldPos.output.connectTo(worldPosviewProjectionTransform.vector);

    var viewProjection = new BABYLON.InputBlock("viewProjection");
    viewProjection.setAsSystemValue(BABYLON.NodeMaterialSystemValues.ViewProjection);
    viewProjection.output.connectTo(worldPosviewProjectionTransform.transform);

    var vertexOutput = new BABYLON.VertexOutputBlock("vertexOutput");
    worldPosviewProjectionTransform.output.connectTo(vertexOutput.vector);
    nodeMaterial.addOutputNode(vertexOutput);
    nodeMaterial.addOutputNode(fragmentOutput);
    nodeMaterial.build();

    return nodeMaterial
  }
}

export { PlanetMaterial }
