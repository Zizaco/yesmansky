const normalize = (val, min, max) => ((val - min) / (max - min))
import { Vector3 } from "babylonjs"

class PlanetTextureFactory {
  res: number
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement, res: number) {
    canvas.width = res
    canvas.height = res
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false
    this.ctx.fillStyle = `rgb(0,0,0)`;
    this.ctx.fillRect(0, 0, res, res);

    this.res = res
    this.canvas = canvas

    for (let i = 0; i < 6; i++) {
      this.drawSide(i)
    }
  }

  drawSide(side: number) {
    const width = this.res / 4
    const height = this.res / 3
    let cubemapTile = { x: 1, y: 2 }
    if (side === 5) {
      cubemapTile = { x: 1, y: 0 }
    } else if (side < 4) {
      cubemapTile = { x: side, y: 1 }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const vec = new Vector3(normalize(x, 0, width), 0.5, normalize(y, 0, height))
        vec.normalize()
        // this.ctx.fillStyle = `rgb(${normalize(x, 0, width) * 255},${255 - normalize(y, 0, height) * 255},255)`;
        this.ctx.fillStyle = `rgb(${vec.x * 255},${255 - vec.z * 255},${vec.y * 255})`;
        // this.ctx.fillStyle = `rgb(${vec.x * 255},${255 - vec.z * 255},255)`;
        this.ctx.fillRect((this.res * cubemapTile.x / 4) + x, (this.res * cubemapTile.y / 3) + y, 1, 1);
      }
    }

    // this.ctx.fillStyle = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
    // this.ctx.fillRect(this.res * cubemapTile.x / 4, this.res * cubemapTile.y / 3, this.res / 4, this.res / 3);
  }

  drawNoiseInSide(side: number) {

  }
}

export { PlanetTextureFactory}
