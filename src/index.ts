import { Game } from "./Game";
import * as localforage from 'localforage';

declare global {
  interface Window {
    game: Game
    localforage: LocalForage
  }
}

if (process.env.NODE_ENV === 'development') {
  window.localforage = localforage
}

const view = document.getElementById("view") as HTMLCanvasElement;
window.game = new Game(view)
