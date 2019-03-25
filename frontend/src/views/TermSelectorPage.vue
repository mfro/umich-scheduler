<template>
  <v-layout align-center justify-center>
    <v-card>
      <v-card-title>
        <span class="title">Select a Term</span>
      </v-card-title>
      <v-card-text>
        <v-layout>
          <v-list class="pa-0">
            <v-list-tile
              v-for="s in seasons"
              :key="s.id"
              @click="season = s.id"
              class="season lighten-3"
              :class="{ primary: season == s.id }"
            >
              <v-list-tile-content>
                <v-list-tile-title>{{ s.label }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
          <v-layout column>
            <v-text-field type="number" class="year ma-3" v-model="year"/>
            <v-btn :enabled="year && season" @click="submit()">Go</v-btn>
          </v-layout>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script>
export default {
  name: 'term-selector-page',

  data() {
    return {
      year: new Date().getFullYear(),
      season: 'FA',
      seasons: [
        { label: 'Fall', id: 'FA' },
        { label: 'Winter', id: 'WN' },
        { label: 'Spring', id: 'SP' },
        { label: 'Summer', id: 'SS' },
      ],
    };
  },

  methods: {
    submit() {
      this.$router.push(`/${this.season}${this.year}`)
    },
  },
};
</script>

<style scoped lang="scss">
.season {
}

.year {
  max-width: 6em;
}
</style>
