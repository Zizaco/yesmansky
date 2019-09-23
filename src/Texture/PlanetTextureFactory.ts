const normalize = (val, min, max) => ((val - min) / (max - min))
import { Vector3, Matrix, Quaternion, DeepImmutableObject } from "babylonjs"

class PlanetTextureFactory {
  res: number
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement, res: number) {
    canvas.width = res
    canvas.height = res
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false
    this.ctx.fillStyle = `rgb(20,20,50)`;
    this.ctx.fillRect(0, 0, res, res);

    this.res = res
    this.canvas = canvas

    console.time()
    for (let i = 0; i < 6; i++) {
      this.drawThing2(i)
    }
    console.timeEnd()
  }

  drawThing2(side: number) {
    const distanceBetween = function (x1, y1, x2, y2) {
      const deltaX = x2 - x1
      const deltaY = y2 - y1
      return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    const angleBetween = function (x1, y1, x2, y2) {
      const deltaX = x2 - x1
      const deltaY = y2 - y1
      return Math.atan2(deltaY, deltaX);
    }
    const radiansToDegrees = function (radians) {
      // Put in range of [0,2PI)
      if (radians < 0) radians += Math.PI * 2;
      // convert to degrees
      return radians * 180 / Math.PI;
    }

    const width = Math.round(this.res / 4)
    const height = Math.round(this.res / 3)
    const center = {x: width/2, y: height/2}

    let cubemapTile = { x: 1, y: 2 }
    if (side === 5) {
      cubemapTile = { x: 1, y: 0 }
    } else if (side < 4) {
      cubemapTile = { x: side, y: 1 }
    }

    const maxDist = distanceBetween(0, 0 * width / height, center.x, center.y * width / height)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distance = distanceBetween(x, y*width/height, center.x, center.y*width/height)
        const angle = radiansToDegrees(angleBetween(x, y * width / height, center.x, center.y * width / height))
        const perpendicular = Math.sqrt(1-Math.pow(normalize(distance, 0, maxDist*1.5),2))
        const normalizedAngle = normalize(angle, 0, 180) * Math.PI
        let paintRed = Math.cos(normalizedAngle) * (1-perpendicular) + 0.5
        let paintGreen = Math.cos(normalizedAngle + Math.PI / 2) * (1-perpendicular) + 0.5

        if (side < 4) {
          paintRed = paintRed + Math.PI/16*-(side-1)
        }

        // this.ctx.fillStyle = `rgb(${255 * paintRed}, ${255 * paintGreen}, ${255 * perpendicular})`
        this.ctx.fillStyle = `rgb(${255 * paintRed}, ${255 * paintRed}, ${255 * paintRed})`
        this.ctx.fillRect(Math.round(this.res * cubemapTile.x / 4) + x, Math.round(this.res * cubemapTile.y / 3) + y, 1, 1);
      }
    }
  }

  drawThing(side: number) {
    const width = Math.round(this.res / 4)
    const height = Math.round(this.res / 3)
    let cubemapTile = { x: 1, y: 2 }
    if (side === 5) {
      cubemapTile = { x: 1, y: 0 }
    } else if (side < 4) {
      cubemapTile = { x: side, y: 1 }
    }

    if (side != 1) {
      // return
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let vec = new Vector3(normalize(x, 0, width), normalize(y, 0, height), 0.5)

        let vec2 = new Vector3(
          // Math.sqrt(1 - Math.pow(2 * vec.x - 1, 2)),
          // Math.sqrt(1 - Math.pow(2 * vec.y - 1, 2))
          Math.sqrt(1 - Math.pow(2 * vec.x - 1, 2))-0.5,
          Math.sqrt(1 - Math.pow(2 * vec.y - 1, 2))-0.5
        )
        let color = normalize(vec2.x*vec2.y, 0, 1)

        // RED Channel
        this.ctx.fillStyle = `rgb(${color * 255}, ${color * 255}, ${color * 255})`
        // GREEN Channel
        // this.ctx.fillStyle = `rgb(${vec2.y * 255}, ${vec2.y * 255}, ${vec2.y * 255})`
        // ALL
        // this.ctx.fillStyle = `rgb(${vec2.x * 255}, ${vec2.y * 255}, ${vec2.z * 255})`
        this.ctx.fillRect(Math.round(this.res * cubemapTile.x / 4) + x, Math.round(this.res * cubemapTile.y / 3) + y, 1, 1);
      }
    }
  }

  drawSide(side: number) {
    const width = Math.round(this.res / 4)
    const height = Math.round(this.res / 3)
    let cubemapTile = { x: 1, y: 2 }
    if (side === 5) {
      cubemapTile = { x: 1, y: 0 }
    } else if (side < 4) {
      cubemapTile = { x: side, y: 1 }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let vec = new Vector3(normalize(x, 0, width), 0.5, normalize(y, 0, height))

        if (side < 4) {
          vec.x = (Math.sin(vec.x + side -Math.PI/2) + 1) / 2
          vec.z = (Math.sin((vec.z+1)-Math.PI/2) + 1) / 2
        } else {
          vec.x = (Math.sin(vec.x+1 -Math.PI/2) + 1) / 2;
          if (side == 5) {
            vec.z = (Math.sin(vec.z-Math.PI/2) + 1) / 2
          } else {
            vec.z = (Math.sin((vec.z+2)-Math.PI/2) + 1) / 2
          }
        }
        // vec.normalize()

        // this.ctx.fillStyle = `rgb(${vec.x * 255},${255 - vec.z * 255},${vec.y * 255})`;
        this.ctx.fillStyle = `rgb(${vec.x * 255}, 0, 0)`


        this.ctx.fillRect(Math.round(this.res * cubemapTile.x / 4) + x, Math.round(this.res * cubemapTile.y / 3) + y, 1, 1);
      }
    }
  }

  drawNormalOf(side: number) {
    const width = Math.round(this.res / 4)
    const height = Math.round(this.res / 3)
    let cubemapTile = { x: 1, y: 2 }
    if (side === 5) {
      cubemapTile = { x: 1, y: 0 }
    } else if (side < 4) {
      cubemapTile = { x: side, y: 1 }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const vec = new Vector3(normalize(x, 0, width), 1, normalize(y, 0, height))
        vec.normalize()

        this.ctx.fillStyle = `rgb(${vec.x * 255},${vec.z * 255},${vec.y * 255})`;
        this.ctx.fillRect(Math.round(this.res * cubemapTile.x / 4) + x, Math.round(this.res * cubemapTile.y / 3) + y, 1, 1);
      }
    }
  }

  drawNormalOf2(side: number) {
    const width = Math.round(this.res / 4)
    const height = Math.round(this.res / 3)
    let cubemapTile = { x: 1, y: 2 }
    if (side === 5) {
      cubemapTile = { x: 1, y: 0 }
    } else if (side < 4) {
      cubemapTile = { x: side, y: 1 }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let vec = new Vector3(
          normalize(x + (width * cubemapTile.x), 0, width*4),
          0.5,
          normalize(y + (height * cubemapTile.y), 0, height*3)
        )
        vec.x = Math.cos(vec.x * Math.PI * 2 + Math.PI / 4)/2+0.5
        if (side !== 3) {
          vec.z = Math.cos((vec.z * Math.PI * 3 + (Math.PI / 2)) / 2)/2+0.5
        } else {
          vec.z = Math.cos((vec.z * Math.PI * 3 + (Math.PI / 2)*5) / 2) / 2 + 0.5
        }
        if (side < 4) {
        } else if (side === 5) {
          vec = new Vector3(vec.x, vec.y, vec.z)
        } else {
          // vec = new Vector3(vec.x, vec.y, vec.z)
        }
        // vec.normalize()

        // vec.x = Math.abs(vec.x)


        this.ctx.fillStyle = `rgb(${vec.x * 255},0,0)`;
        // if (vec.z > 0.9999 || y == 0) {
        //   this.ctx.fillStyle = `rgb(255,${vec.z * 255},0)`;
        // }
        // this.ctx.fillStyle = `rgb(${vec.x * 255},${255 - vec.z * 255},${vec.y * 255})`;
        this.ctx.fillRect(Math.round(this.res * cubemapTile.x / 4) + x, Math.round(this.res * cubemapTile.y / 3) + y, 1, 1);
      }
    }
  }

  drawNoiseInSide(side: number) {

  }
}

export { PlanetTextureFactory}
