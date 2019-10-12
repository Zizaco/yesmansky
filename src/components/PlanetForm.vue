<template>
  <div v-bind:style="`opacity: ${alpha};`" class="column is-half-tablet is-one-quarter-desktop is-one-fifth-fullhd">
    <div class="card">
      <header class="card-header" v-on:click="openned = !openned">
        <a class="card-header-title">
          Procedural generation settings
        </a>
        <a href="#" class="card-header-icon" aria-label="more options">
          <b-icon :icon="openned ? 'chevron-down' : 'chevron-right'"></b-icon>
        </a>
      </header>

      <div class="card-content" v-if="openned">
        <label class="label is-medium has-text-warning">Planet</label>
        <b-field label="Name (seed)" expanded>
          <b-field>
            <b-input v-model="settings.terrainSeed" expanded placeholder="Seed..."></b-input>
            <p class="control">
              <b-button v-on:click="setRandomSeed" class="button is-warning">Random</b-button>
            </p>
          </b-field>
        </b-field>

        <b-field>
          <b-field label="Planet type" expanded>
            <div class="block">
              <b-radio v-model="settings.type"
                name="type"
                native-value="terra">
                Terrestrial
              </b-radio>
              <b-radio v-model="settings.type"
                name="type"
                native-value="gas"
                disabled>
                Gas
              </b-radio>
            </div>
          </b-field>
        </b-field>

        <b-field label="Landmass scale">
          <b-slider v-model="settings.landMassSize" :value="50"></b-slider>
        </b-field>

        <b-field label="Roughness">
          <b-slider v-model="settings.roughness" :min="0" :max="3" :value="2" aria-label="Roughness" :tooltip="false">
            <b-slider-tick :value="0">Low</b-slider-tick>
            <b-slider-tick :value="1">Medium</b-slider-tick>
            <b-slider-tick :value="2">High</b-slider-tick>
            <b-slider-tick :value="3">Very High</b-slider-tick>
          </b-slider>
        </b-field>

        <b-field label="Sea level">
          <b-slider v-model="settings.seaLevel" :value="50"></b-slider>
        </b-field>

        <label class="label is-medium has-text-warning">Atmosphere</label>
        <b-field label="Density">
          <section>
            <b-slider v-model="settings.atmosphereDensity" :min="0" :max="3" :value="2" aria-label="Roughness" :tooltip="false">
              <b-slider-tick :value="0"></b-slider-tick>
              <b-slider-tick :value="1">Thin</b-slider-tick>
              <b-slider-tick :value="2">Medium</b-slider-tick>
              <b-slider-tick :value="3">Dense</b-slider-tick>
            </b-slider>
          </section>
        </b-field>

        <b-field label="Primary composition">
          <b-select v-model="settings.atmosphereColor" placeholder="Choose" expanded>
            <option value="blue">Oxygen & Nitrogen</option>
            <option value="orange">Carbon Dioxide</option>
            <option value="white">Hydrogen</option>
            <option value="green">Methane</option>
            <option value="purple">Argon</option>
          </b-select>
        </b-field>
      </div>
      <footer class="card-footer">
        <a v-on:click="save" class="card-footer-item button is-primary" disabled>Save</a>
        <a v-on:click="setRandomSettings" class="card-footer-item button is-warning">Randomize</a>
        <a v-if="openned" v-on:click="openned = false" class="card-footer-item button is-text">Close</a>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import Vue from 'vue';
import { Planet } from '../Planet/Planet';
import { Game } from '../Game';

export default Vue.extend({
  name: 'PlanetForm',
  props: {
    game: Game,
    planet: Planet
  },
  data: function () {
    return {
      alpha: 0,
      openned: false,
      planetInstance: this.planet,
      settings: {
        terrainSeed: 'GIB GIB',
        type: 'terra',
        landMassSize: 80,
        roughness: 1,
        seaLevel: 25,
        atmosphereDensity: 2,
        atmosphereColor: 'blue'
      }
    }
  },
  created: function () {
    this.rebuildPlanet = _.debounce(this.rebuildPlanet, 2000)
  },
  mounted: function () {
    setTimeout(() => {
      this.fadeIn()
    }, 4000);
  },
  watch: {
    settings: {
      handler (newSettings) {
        this.rebuildPlanet(newSettings)
      },
      deep: true
    }
  },
  methods: {
    save: function () {
      const saveContents = []
      for (const key in this.settings) {
        saveContents.push(this.settings[key])
      }
    },
    setRandomSeed: function () {
      const baseName = ['Planet ', 'Moon ', 'Rogue ', 'Exo ', 'Dwarf ', 'Earth ', 'Hypothetical ', '', '', '']
      const randomBaseName = baseName[Math.floor(Math.random()*baseName.length)]
      const randomNamePart = Math.random().toString(36).substring(6+Math.random()*6);
      this.settings.terrainSeed = `${randomBaseName}${randomNamePart}`
    },
    setRandomSettings: function () {
      const possibleAtmospheres = ['blue', 'orange', 'white', 'green', 'purple']
      this.setRandomSeed()
      this.settings.landMassSize = Math.round(Math.random()*70+10)
      this.settings.roughness = Math.round(Math.random()*4)
      this.settings.seaLevel = Math.round(Math.random()*55)
      this.settings.atmosphereDensity = Math.round(Math.random()*4)
      this.settings.atmosphereColor = possibleAtmospheres[Math.floor(Math.random()*possibleAtmospheres.length)]
    },
    fadeIn: function () {
      const disapear = setInterval(() => {
        this.alpha = Math.min(1, this.alpha+0.04)
        if (this.alpha >= 1) {
          clearInterval(disapear)
        }
      }, 50)
    },
    rebuildPlanet: function (newSettings) {
      console.log('rebuilding planet...')
      this.planetInstance.dispose()
      this.game.planet = this.planetInstance = new Planet('planet', newSettings, this.game.scene)
    }
  }
})
</script>

<style>
</style>
