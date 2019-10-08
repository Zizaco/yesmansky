<template>
  <div id="app">
    <canvas id="view" width="500" height="500"></canvas>
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript + BabylonJS App"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import { Game } from './Game'

export default Vue.extend({
  name: 'app',
  components: {
    HelloWorld
  },
  mounted: function () {
    const view = document.getElementById("view") as HTMLCanvasElement;
    view.width = window.innerWidth
    view.height = window.innerHeight
    window.game = new Game(view)
  }
});
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

body{
  background-color: #272723;
  color: #CCCCCC;
  margin: 0;
  padding: 0;
  // overflow: hidden;
  height: 100%;
}

#view {
  touch-action: none;
  width: 100%;
  height: 100%;
}
</style>
