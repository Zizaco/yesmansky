import OpenSimplexNoise from 'open-simplex-noise'
const ctx: Worker = self as any;

const normalize = (val, min, max) => ((val - min) / (max - min))

type BuiltTextures = {
  heightData: Uint8ClampedArray,
  specularData: Uint8ClampedArray,
  diffuseData: Uint8ClampedArray,
}

ctx.addEventListener("message", async (event) => {
  const result = await _buildTextures(...(event.data as [Uint8ClampedArray, Uint8ClampedArray, Uint8ClampedArray]))
  ctx.postMessage(result)
});

const _buildTextures = async (heightData: Uint8ClampedArray, specularData: Uint8ClampedArray, diffuseData: Uint8ClampedArray): Promise<BuiltTextures> => {
  const settings = { layers: 10, strength: 0.8, roughness: 0.6, resistance: 0.70, min: 0.5 }
  const baseRoughness = settings.roughness / 100

  const openSimplex = new OpenSimplexNoise(27);

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

    let roughness = baseRoughness
    let strength = settings.strength
    let value = 0
    for (let layer = 0; layer < settings.layers; layer++) {
      value += openSimplex.noise3D(r * roughness, g * roughness, b * roughness) * strength;
      roughness = roughness * 2
      strength = strength * settings.resistance
    }

    value = Math.max(value * 128 + 128, 255 * settings.min)
    value = Math.round(normalize(value, 255 * settings.min, 255) * 255)
    value = Math.min(value, 255)
    if (value <= 1) {
      heightData[a] = heightData[a + 1] = heightData[a + 2] = 20
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
