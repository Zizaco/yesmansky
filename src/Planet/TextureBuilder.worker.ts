/**
 * web-worker that generates textures
 * @see https://developer.mozilla.org/pt-PT/docs/Web/API/Web_Workers_API
 * @see https://github.com/webpack-contrib/worker-loader
 */

import OpenSimplexNoise from 'open-simplex-noise'
import { NoiseSettings } from './types'
const ctx: Worker = self as any;

const normalize = (val, min, max) => ((val - min) / (max - min))

type BuiltTextures = {
  heightData: Uint8ClampedArray,
  specularData: Uint8ClampedArray,
  diffuseData: Uint8ClampedArray,
}

ctx.addEventListener("message", async (event) => {
  const result = await _buildTextures(...(event.data as [number, NoiseSettings, Uint8ClampedArray, Uint8ClampedArray, Uint8ClampedArray]))
  ctx.postMessage(result)
});

/**
 * Builds procedural texture based in given params and imageData
 */
const _buildTextures = async (
  seed: number,
  noiseSettings: NoiseSettings,
  heightData: Uint8ClampedArray,
  specularData: Uint8ClampedArray,
  diffuseData: Uint8ClampedArray
): Promise<BuiltTextures> => {
  const settings = noiseSettings

  const openSimplex = new OpenSimplexNoise(seed);

  const numberOfPixels = heightData.length / 4
  const colorGradientValues = diffuseData.slice(0, 256 * 4)

  const HD_RES = numberOfPixels > 1000*1000

  for (let i = 0; i < numberOfPixels; i++) {
    const a = i * 4
    let [r, g, b] = [
      heightData[a],
      heightData[a + 1],
      heightData[a + 2]
    ]
    if (r + g + b === 0) {
      continue
    }

    if (HD_RES) {
      const minibump = Math.random() * 1.5
      r += minibump
      g += minibump
    }

    let value = 0
    for (let j = 0; j < settings.length; j++) {
      const layerSettings = settings[j];

      let roughness = layerSettings.roughness / 100
      let strength = layerSettings.strength
      for (let pass = 0; pass < layerSettings.passes; pass++) {
        let noiseValue: number
        if (layerSettings.hard) {
          noiseValue = 1 - 4*Math.abs(openSimplex.noise3D(layerSettings.shift + r * roughness, g * roughness, b * roughness));
          noiseValue *= (noiseValue * noiseValue) * strength
        } else {
          noiseValue = openSimplex.noise3D(layerSettings.shift + r * roughness, g * roughness, b * roughness) * strength;
        }
        value += noiseValue
        roughness = roughness * 2
        strength = strength * layerSettings.resistance
      }
    }

    value = Math.max(value * 128 + 128, 255 * settings[0].min)
    value = Math.round(normalize(value, 255 * settings[0].min, 255) * 255)
    value = Math.min(value, 255)
    if (value <= 1) {
      heightData[a] = heightData[a + 1] = heightData[a + 2] = 0
      specularData[a] = specularData[a + 1] = specularData[a + 2] = 100
    } else {
      heightData[a] = heightData[a + 1] = heightData[a + 2] = value
    }
    diffuseData[a] = colorGradientValues[value * 4]
    diffuseData[a + 1] = colorGradientValues[value * 4 + 1]
    diffuseData[a + 2] = colorGradientValues[value * 4 + 2]
    diffuseData[a + 3] = 255
  }

  return {
    heightData,
    specularData,
    diffuseData
  }
}

export default {} as typeof Worker & { new(): Worker };
