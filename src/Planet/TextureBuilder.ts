const backgroundWorker = require('worker-loader!./TextureBuilder.worker')
import { NoiseSettings } from './types'

type BuiltTextures = {
  heightDataResult: ImageData,
  specularDataResult: ImageData,
  diffuseDataResult: ImageData,
}

/**
 * Wraps web-worker to build procedural textures
 * without freezing the page while the heavy computing
 * takes place.
 * @see https://developer.mozilla.org/pt-PT/docs/Web/API/Web_Workers_API
 */
class TextureBuilder {
  static buildTextures(seed: number, noiseSettings: NoiseSettings, heightMapImage: ImageData, specularMapImage: ImageData, diffuseMapImage: ImageData): Promise<BuiltTextures> {
    const worker = new backgroundWorker()

    return new Promise((resolve) => {
      worker.addEventListener("message", (event) => {
        heightMapImage.data.set(event.data.heightData)
        specularMapImage.data.set(event.data.specularData)
        diffuseMapImage.data.set(event.data.diffuseData)

        resolve({
          heightDataResult: heightMapImage,
          specularDataResult: specularMapImage,
          diffuseDataResult: diffuseMapImage
        })
        worker.terminate()
      });
      worker.postMessage([seed, noiseSettings, heightMapImage.data, specularMapImage.data, diffuseMapImage.data])
    })
  }
}

export { TextureBuilder, BuiltTextures }
