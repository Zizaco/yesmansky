<template>
  <section id='hero' v-if="alpha > 0" v-bind:style="`opacity: ${alpha};`" class="hero is-medium is-dark is-bold">
    <div class="hero-body">
      <div class="container has-text-centered">
        <h1 class="title">
          "Yes Man's Sky"
        </h1>
        <h2 class="subtitle">
          Procedural planet generation tech demo
        </h2>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Hello',
  data: function () {
    return {
      alpha: 1,
    }
  },
  mounted: function () {
    setTimeout(() => {
      this.fadeOut()
    }, 4000);
  },
  methods: {
    fadeOut: function () {
      const disapear = setInterval(() => {
        this.alpha = Math.max(0, this.alpha-0.02)
        if (this.alpha <= 0) {
          this.$ga.event('Intro', 'finished')
          clearInterval(disapear)
        }
      }, 50)
    }
  }
});
</script>

<style lang="scss" scoped>
#hero {
  position: absolute;
  width: 100%
}

.hero.is-dark.is-bold {
  margin-top: 15%;
  background-color: rgba(0,0,0,0.7);
  background-image: none;
  pointer-events: none !important; // transparent
}
</style>
