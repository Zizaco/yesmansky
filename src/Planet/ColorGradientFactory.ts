import OpenSimplexNoise from 'open-simplex-noise'
import colorPallets from './color-pallets.json'

type rgba = { r: number, g: number, b: number, a: number }
type colorGradient = {
  pallete: Array<rgba>
  gradient: Array<rgba>
}

class ColorGradientFactory {
  static generateGradient(seed): Array<rgba> {
    const openSimplex = new OpenSimplexNoise(seed);
    return this.generatePallete(openSimplex)
  }

  protected static generatePallete (noise: OpenSimplexNoise): Array<rgba> {
    const chosenPallet = colorPallets.length / 2 + Math.round(noise.noise3D(23, 23, 23) * colorPallets.length * 0.5)
    const result = []
    for (const color of colorPallets[chosenPallet]) {
      result.push({
        r: color[0],
        g: color[1],
        b: color[2],
        a: Math.round(Math.random() * 255)
      })
    }

    return result.sort((a, b) => a.a - b.a)
  }
}

export { ColorGradientFactory, colorGradient }
