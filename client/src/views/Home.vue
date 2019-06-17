<template>
  <div class="home">
    <Preview v-bind:id="id_film"></Preview>
    <div class="sort">
      <span><font-awesome-icon icon="search" /> Search</span>
    </div>
    <div class="sort">
      <span>Sort by</span>
    </div>
    <div class="filter">
      <span>Filter by</span>
    </div>
    <div class="list">
      
      <div class="infinite-list">
        
        <el-row>
            <el-col :xs="12" :sm="6" :md="6" :lg="4" :xl="4" v-for="film in films" class="infinite-list-item">
              <!-- <div class="miniature" :style="{'background-image': 'url(\'' + film.medium_cover_image + '\')'}"></div> -->
              <img class="miniature" :src="film.medium_cover_image" :id="'film_'+film.id" @click="preview(film.id)">
              <span class="title">{{film.title_english}}</span>
              <br>
              <small class="date">{{film.year}}</small>
              <small class="note"><font-awesome-icon icon="star" /> {{film.rating}}</small>
            </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>


<script>

import Preview from "@/components/Preview.vue";

export default {
  name: "Home",
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/login");
    }
    this.scroll(this.person);
  },
  data () {
      return {
        page: 0,
        id_film: null,
        films: [],
      }
    },
  methods: {
    preview(id){
      this.id_film = id
    },
    load () {
      this.page ++;
      this.axios
        .get('https://ytss.unblocked.is/api/v2/list_movies.json?sort_by=rating&limit=20&page=' + this.page)
        .then(response => (this.films = response.data.data.movies))
        .catch(error => (console.log('Une erreur est survenue.')))
    },
    scroll (person) {
    window.onscroll = () => {
      let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;

      if (bottomOfWindow) {
        this.page ++;
        this.axios
          .get('https://ytss.unblocked.is/api/v2/list_movies.json?sort_by=rating&limit=20&page=' + this.page)
          .then(response => {
            for(var i = 0; i < response.data.data.movies.length; i++)
            {
              this.films.push(response.data.data.movies[i])
            }
          })
        }
    };
  },
  },
  beforeMount() {
    this.load();
  },
  components: {
    Preview
  }
};
</script>