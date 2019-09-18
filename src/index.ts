import { Game } from "./Game";
import * as localforage from 'localforage';
import * as BABYLON from "babylonjs";

declare global {
  interface Window {
    game: Game
    localforage: LocalForage
    BABYLON: any
  }
}

if (process.env.NODE_ENV === 'development') {
  window.localforage = localforage
  window.BABYLON = BABYLON
}

const view = document.getElementById("view") as HTMLCanvasElement;
view.width = window.innerWidth
view.height = window.innerHeight
window.game = new Game(view)
