import Vue from 'vue'
import App from './App.vue'
import { Game } from "./Game";
import * as localforage from 'localforage';
import * as BABYLON from '@babylonjs/core/Legacy/legacy';

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
  Vue.config.productionTip = false
}

new Vue({
  render: h => h(App),
}).$mount('#app')
