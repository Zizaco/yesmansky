<template>
    <footer id="footer" class="content has-text-centered">
        <span class="tag is-black">
            👨‍💻 by <a v-on:click="goto" target="_blank" href="https://github.com/Zizaco">Zizaco</a>
        </span>
    </footer>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Footer',
  methods: {
    goto: function() {
      (this as any).$ga.event('Goto', 'author', 'https://github.com/Zizaco')
    }
  }
})
</script>

<style>
#footer {
  position: absolute;
  bottom: 0;
}
</style>
