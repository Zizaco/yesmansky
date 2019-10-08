<template>
  <div id="app">
    <canvas id="view" width="500" height="500" v-bind:style="{ filter: `blur(${canvasBlur}px)` }"></canvas>
    <div id="ui" class="container is-fluid">
      <Hello msg="Welcome to Your Vue.js + TypeScript + BabylonJS App"/>
      <Footer></Footer>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Hello from './components/Hello.vue';
import Footer from './components/Footer.vue';
import { Game } from './Game'

export default Vue.extend({
  name: 'app',
  components: {
    Hello,
    Footer
  },
  data: function () {
    return {
      canvasBlur: 10
    }
  },
  mounted: function () {
    const view = document.getElementById("view") as HTMLCanvasElement
    view.width = window.innerWidth
    view.height = window.innerHeight
    window.game = new Game(view)
    setTimeout(() => {
      this.unblur()
    }, 4000);
  },
  methods: {
    unblur: function () {
      const unblur = setInterval(() => {
        this.canvasBlur = Math.max(0, this.canvasBlur-0.5)
        if (this.canvasBlur <= 0) {
          clearInterval(unblur)
        }
      }, 100)
    }
  }
});
</script>

<style lang="scss">
// Setup bulma
@import '~bulma/sass/utilities/_all.sass';

// Set your colors
$primary: #229280;
$primary-invert: findColorInvert($primary);
$twitter: #4099FF;
$twitter-invert: findColorInvert($twitter);

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
$colors: (
  "white": ($white, $black),
  "black": ($black, $white),
  "light": ($light, $light-invert),
  "dark": ($dark, $dark-invert),
  "primary": ($primary, $primary-invert),
  "info": ($info, $info-invert),
  "success": ($success, $success-invert),
  "warning": ($warning, $warning-invert),
  "danger": ($danger, $danger-invert),
  "twitter": ($twitter, $twitter-invert)
);

// Links
$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

// Import bulma
@import '~bulma/bulma';

body{
  overflow: hidden;
  height: 100%;
}

#view {
  touch-action: none;
  width: 100%;
  height: 100%;
}

#app {
  position: absolute;
  height: 100%;
  overflow: hidden;
}

#ui {
  pointer-events: none;
  position: absolute;
  top: 0px;
  width: 100%;
  height: 100%;
  margin: 0;
  & > * {
    pointer-events: all;
  }
}
</style>
