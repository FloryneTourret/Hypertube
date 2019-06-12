<template>
  <div class="home">
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

      <!-- <div class="infinite-list2" v-infinite-scroll="load"> -->
      <div class="infinite-list2">
        <el-row>
            <el-col :xs="12" :sm="6" :md="6" :lg="4" :xl="4" v-for="film in films" class="infinite-list-item">
              <div class="miniature" :style="{'background-image': 'url(\'' + film.medium_cover_image + '\')'}"></div>
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
export default {
  name: "Home",
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/login");
    }
    this.axios
      .get('https://yts.lt/api/v2/list_movies.json?sort_by=rating&limit=20&page=' + this.page)
      .then(response => (this.films = response.data.data.movies))
  },
  data () {
      return {
        page: 1,
        films: '',
      }
    },
    methods: {
      // load () {
      //   this.page ++;
      //    this.axios
      //   .get('https://yts.lt/api/v2/list_movies.json?sort_by=rating&limit=20&page=' + this.page)
      //   .then(response => (this.films = response.data.data.movies))
      // }
    }
};
</script>