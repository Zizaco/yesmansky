import Vue from 'vue'
import App from './App.vue'
import Buefy from 'buefy'
import VueAnalytics from 'vue-analytics'
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

Vue.use(VueAnalytics, {
  id: 'UA-150019942-1'
})

Vue.use(Buefy)

new Vue({
  render: h => h(App),
}).$mount('#app')
