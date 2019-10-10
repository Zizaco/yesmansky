type PlanetOptions = {
  terrainSeed: string,
  type: 'terra',
  landMassSize: number,
  roughness: number,
  seaLevel: number,
  atmosphereDensity: number,
  atmosphereColor: "blue" | "orange" | "white" | "green" | "purple",
  meshOptions: { diameter: number, diameterX: number, subdivisions: number }
}

type NoiseSettings = Array<{
  shift: number,
  passes: number,
  strength: number,
  roughness: number,
  resistance: number
  min: number,
  hard: boolean
}>

export { NoiseSettings, PlanetOptions }
