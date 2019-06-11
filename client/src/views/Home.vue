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
      <!-- <ul class="infinite-list" v-infinite-scroll="load"> -->
      <ul class="infinite-list">
        <li v-for="i in films" class="infinite-list-item">

          <div class="miniature" :style="{'background-image': 'url(\'' + i.couverture + '\')'}"></div>
          <span class="title">{{i.title}}</span>
          <br>
          <small class="date">{{i.date}}</small>
          <small class="note"><font-awesome-icon icon="star" /> {{i.note}}</small>

        </li>
      </ul>
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
  },
  data () {
      return {
        films: [
          {title: "Le labyrinthe",
          date: "2014",
          note: "8.5",
          couverture: "http://fr.web.img3.acsta.net/pictures/14/09/18/14/58/418353.jpg"}, 
          {title: "Le labyrinthe",
          date: "2014",
          note: "8.5",
          couverture: "http://fr.web.img3.acsta.net/pictures/14/09/18/14/58/418353.jpg"}, 
          {title: "Le labyrinthe",
          date: "2014",
          note: "8.5",
          couverture: "http://fr.web.img3.acsta.net/pictures/14/09/18/14/58/418353.jpg"}, 
          {title: "Le labyrinthe",
          date: "2014",
          note: "8.5",
          couverture: "http://fr.web.img3.acsta.net/pictures/14/09/18/14/58/418353.jpg"}, 
          {title: "Le labyrinthe",
          date: "2014",
          note: "8.5",
          couverture: "http://fr.web.img3.acsta.net/pictures/14/09/18/14/58/418353.jpg"}, 
        ]
      }
    },
    methods: {
      // load () {
      //   this.count += 2
      // }
    }
};
</script>