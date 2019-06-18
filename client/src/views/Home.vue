<template>
  <div class="home">
    <Preview v-bind:id="id_film" v-bind:top="top"></Preview>
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
            <el-col :xs="12" :sm="6" :md="6" :lg="4" :xl="4" v-for="film in films" class="infinite-list-item div_film" :id="'div_film_'+film.id">
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
        top: null,
        films: [],
      }
    },
  methods: {
    offset(el) {
        var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
    },
    preview(id){
      var link = document.getElementById('div_film_'+id);
      var offset = this.offset(link);
      var top = offset.top;
      var bottom_div = top + link.clientHeight;

      this.top = bottom_div;

      var divs = document.getElementsByClassName('div_film');
      var i;

      for (i = 0; i < divs.length; i++) {
        link = divs[i];
        offset = this.offset(link);
        top = offset.top;
        bottom_div = top + link.clientHeight;
        if(bottom_div == this.top)
          divs[i].style.marginBottom = '500px';
        else
          divs[i].style.marginBottom = '3vh';
      }
      this.id_film = id;
    },
    load () {
      this.page ++;
      this.axios
        .get('https://localhost:5001/api/v1/films/sort_by=rating&limit=20&page=' + this.page)
        .then(response => (this.films = response.data.data.movies))
        .catch(error => (console.log('Une erreur est survenue.')))
    },
    scroll (person) {
    window.onscroll = () => {
      let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;

      if (bottomOfWindow) {
        this.page ++;
        this.axios
          .get('https://localhost:5001/api/v1/films/sort_by=rating&limit=20&page=' + this.page)
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