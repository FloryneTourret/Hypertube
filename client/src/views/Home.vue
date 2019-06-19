<template>
  <div class="home">
    <Preview v-bind:id="id_film" v-bind:top="top"></Preview>
    <el-row :gutter="10">
       <el-col :md="6">
          <div class="block sort">
            <el-cascader
              placeholder="Sort by"
              :options="sort"
              :props="props"
              @change="sortby"
              clearable></el-cascader>
          </div>
        </el-col>

        <el-col :md="6">
          <div class="filter">
            <button>Minimum rating</button>
            <button>Minimum production year</button>
            <button>Minimum production year</button>
          </div>
        </el-col> 

        <el-col :md="6">
          <div class="block genders">
            <el-cascader
              placeholder="Choose gender"
              :options="genders"
              :props="props"
              @change="gender"
              clearable></el-cascader>
          </div>
        </el-col> 
        
        <el-col :md="6">
          <div class="demo-input-suffix search">
            <el-input
              placeholder="Search"
              prefix-icon="el-icon-search"
              v-model="searchcontent" 
              v-on:input="search()">
            </el-input>
          </div>
        </el-col>
    </el-row>
    
    
    <div class="list">
      
      <div class="infinite-list">
        
        <el-row :gutter="10">
            <el-col :xs="12" :sm="6" :md="6" :lg="4" :xl="4" v-for="film in films" v-bind:key="film.id" class="infinite-list-item div_film" :id="'div_film_'+film.id">
              <img class="miniature" :src="film.medium_cover_image" :id="'film_'+film.id" @click="preview(film.id)">
              <span class="title">{{film.title_english}}</span>
              <br>
              <small class="date">{{film.year}}</small>
              <small class="note"><font-awesome-icon icon="star" /> {{film.rating}}</small>
              <hr class="seen" v-for="movie in movies" v-bind:key="movie.title" v-if="movie.movieID == film.id">
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
    this.load();
    this.getMovies();
  },
  data () {
      return {
        props: { multiple: false },
        sort: [
          {
            value: 'title_asc',
            label: 'A-Z'
          },
          {
            value: 'title_desc',
            label: 'Z-A'
          },
          {
            value: 'year',
            label: 'Production year'
          },
          {
            value: 'rating',
            label: 'Rating'
          },
        ],
        genders: [
          {
            value: 'Comedy',
            label: 'Comedy'
          },
          {
            value: 'Sci-fi',
            label: 'Sci-fi'
          },
          {
            value: 'Horror',
            label: 'Horror'
          },
          {
            value: 'Romance',
            label: 'Romance'
          },
          {
            value: 'Action',
            label: 'Action'
          },
          {
            value: 'Thriller',
            label: 'Thriller'
          },
          {
            value: 'Drama',
            label: 'Drama'
          },
          {
            value: 'Mystery',
            label: 'Mystery'
          },
          {
            value: 'Crime',
            label: 'Crime'
          },
          {
            value: 'Animation',
            label: 'Animation'
          },
          {
            value: 'Adventure',
            label: 'Adventure'
          },
          {
            value: 'Fantasy',
            label: 'Fantasy'
          },

        ],
        page: 0,
        id_film: null,
        top: null,
        films: [],
        searchcontent: '',
        pagesearch: 0,
        movies: [],
      }
    },
  methods: {
    getMovies () {
      this.axios
        .get('https://localhost:5001/api/v1/users/' + this.$session.get('username') + '/movies')
        .then(response => {
          for(var i = 0; i < response.data.length; i++)
          {
            this.movies.push(response.data[i])
          }
        })
    },
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
      var bottom = bottom_div;

      var divs = document.getElementsByClassName('div_film');
      var i;

      for (i = 0; i < divs.length; i++) {
        link = divs[i];
        offset = this.offset(link);
        top = offset.top;
        bottom_div = top + link.clientHeight;
        if(bottom_div == bottom)
          divs[i].style.marginBottom = '500px';
        else
          divs[i].style.marginBottom = '30px';
      }

      link = document.getElementById('div_film_'+id);
      offset = this.offset(link);
      top = offset.top;
      bottom_div = top + link.clientHeight;
      this.top = bottom_div;
      this.id_film = id;
      document.getElementById('film_'+id).scrollIntoView({behavior: 'smooth'});
    },
    load () {
      this.page ++;
      this.axios
        .get('https://localhost:5001/api/v1/films/sort_by=rating&limit=20&page=' + this.page)
        .then(response => (this.films = response.data.data.movies))
        .catch(error => (console.log('Une erreur est survenue.')))
    },
    search () {
      if(this.searchcontent != '')
      {
        this.id_film = null
        this.pagesearch = 1
        this.axios
          .get('https://localhost:5001/api/v1/films/search/query_term=' + this.searchcontent + '&sort_by=title&order_by=asc&limit=20&page=' + this.pagesearch)
          .then(response => (this.films = response.data.data.movies))
          .catch(error => (console.log('Une erreur est survenue.')))
      }
      else{
        this.id_film = null
        this.page = 1
        this.axios
          .get('https://localhost:5001/api/v1/films/sort_by=rating&limit=20&page=' + this.page)
          .then(response => (this.films = response.data.data.movies))
          .catch(error => (console.log('Une erreur est survenue.')))
      }
      
    },
    gender(value){
      console.log(value[0])
    },
    sortby(value){
      console.log(value[0])
    },
    scroll (person) {
    window.onscroll = () => {
      let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;

      if (bottomOfWindow) {
        if(this.input == '')
        {
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
        else{
          this.pagesearch++
          this.axios
            .get('https://localhost:5001/api/v1/films/search/query_term=' + this.input + '&sort_by=title&order_by=asc&limit=20&page=' + this.pagesearch)
            .then(response => {
              for(var i = 0; i < response.data.data.movies.length; i++)
              {
                this.films.push(response.data.data.movies[i])
              }
            })
        }
      }
    };
  },
  },
  components: {
    Preview
  }
};
</script>
