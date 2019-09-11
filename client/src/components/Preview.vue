<template>
  <el-row
    v-if="id != null"
    class="preview"
    :id="'preview'"
    v-loading="loading"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 1)"
  >
    <!-- <button @click="close()" class="close"><font-awesome-icon icon="times" /></button> -->
    <el-col :span="10">
      <img class="miniature" :src="film.backgroundImage" />
      <h2 class="title">{{film.title}}</h2>
      <p class="genres" v-if="this.$session.get('lang') == 'fr'">
        Genre :
        <span v-for="genre in film.genres" v-bind:key="genre">{{genre}}</span>
      </p>
      <p class="genres" v-else>
        Gender :
        <span v-for="genre in film.genres" v-bind:key="genre">{{genre}} </span>
      </p>
    </el-col>

    <el-col :span="12">
      <p class="summary">{{film.description}}</p>
      <br />
      <!-- <button><font-awesome-icon icon="heart" /> J'aime</button> -->
      <button v-if="this.$session.get('lang') == 'fr'" @click="playMovie()">
        <font-awesome-icon icon="play" /> Regarder
      </button>
      <button v-else @click="playMovie()">
        <font-awesome-icon icon="play" /> Play
      </button>
    </el-col>
  </el-row>
</template>
<script>
export default {
  props: ["id", "top"],
  data() {
    return {
      film: "",
      oldtop: null,
      loading: true
    };
  },
  methods: {
    load() {
      this.loading = true;
      this.newtop = this.top;
      if (this.oldtop != null)
        if (this.oldtop < this.newtop) this.newtop -= 470;
      this.axios
        .get("https://localhost:5001/api/v1/yts/preview/" + Number(this.id))
        .then(response => {
          (this.film = response.data),
            (document.getElementById("preview").style.top = this.newtop + "px");
          document
            .getElementById("film_" + this.id)
            .scrollIntoView({ behavior: "smooth" });
          this.loading = false;
        });
      this.oldtop = this.newtop;
    },
    close() {
      this.id = null;
    },
    playMovie() {
      this.$router.push("/video?id=" + this.film.movieID);
    }
  },
  watch: {
    id: function() {
      if (this.id != null) {
        this.load();
      }
    }
  }
};
</script>