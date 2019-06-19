<template>
  <div class="home">
    <Preview v-bind:id="id_film" v-bind:top="top"></Preview>
    <el-row :gutter="10">
       <el-col :md="6">
          <div class="block sort">
            <el-cascader
              class="input-clean"
              placeholder="Sort by"
              :options="sort"
              :props="props"
              v-model="valuesortby"
              @change="search"
              clearable></el-cascader>
          </div>
        </el-col>

        <el-col :md="6">
          <div class="filter">
            <el-input class="input-clean" placeholder="Minimum rating" prefix-icon="el-icon-search" v-model="min_rate" type="number" v-on:input="search()">
            </el-input>
            <el-input class="input-clean" placeholder="Maximum rating" prefix-icon="el-icon-search"  v-model="max_rate" type="number" v-on:input="search()">
            </el-input>
            <el-input class="input-clean" placeholder="Minimum production year" prefix-icon="el-icon-search" v-model="min_year" type="number" v-on:input="search()">
            </el-input>
            <el-input class="input-clean" placeholder="Maximun production year" prefix-icon="el-icon-search" v-model="max_year" type="number" v-on:input="search()">
            </el-input>
          </div>
        </el-col> 

        <el-col :md="6">
          <div class="block genders">
            <el-cascader
              class="input-clean"
              placeholder="Choose gender"
              :options="genders"
              :props="props"
              v-model="valuegender"
              @change="search"
              clearable></el-cascader>
          </div>
        </el-col> 
        
        <el-col :md="6">
          <div class="demo-input-suffix search">
            <el-input
              class="input-clean"
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
            value: 'title&order_by=asc',
            label: 'A-Z'
          },
          {
            value: 'titleorder_by=desc',
            label: 'Z-A'
          },
          {
            value: 'year&order_by=asc',
            label: 'Production year -'
          },
          {
            value: 'year&order_by=desc',
            label: 'Production year +'
          },
          {
            value: 'rating&order_by=asc',
            label: 'Rating -'
          },
          ,
          {
            value: 'rating&order_by=desc',
            label: 'Rating +'
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
        valuesortby: '',
        valuegender: '',
        pagesearch: 0,
        min_rate: null,
        max_rate: null,
        min_year: null,
        max_year: null,
        request: 'limit=20&page=' + this.page,
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
        .get('https://localhost:5001/api/v1/films/sort_by=rating&limit=20/page=' + this.page + '/' + this.min_rate + '/' + this.max_rate + '/' + this.min_year + '/' + this.max_year)
        .then(response => (this.films = response.data))
        .catch(error => (console.log('Une erreur est survenue.')))
    },
    search () {
      this.page = 1
      this.id_film = null
      this.request = 'limit=20';
      if(this.valuesortby[0] == undefined)
        this.request += '&sort_by=rating'
      else{
        this.request += '&sort_by=' + this.valuesortby[0]
      }
      if(this.valuegender[0] != undefined)
        this.request += '&genre=' + this.valuegender[0]
      if(this.searchcontent != '')
        this.request += '&query_term=' + this.searchcontent

      if(this.min_rate == '')
        this.min_rate = null
      if(this.max_rate == '')
        this.max_rate = null
      if(this.min_year == '')
        this.min_year = null
      if(this.max_year == '')
        this.max_year = null
      console.log(this.request  + '/' + this.min_rate + '/' + this.max_rate + '/' + this.min_year + '/' + this.max_year)
      this.axios
        .get('https://localhost:5001/api/v1/films/' + this.request + '/page=' + this.page + '/' + this.min_rate + '/' + this.max_rate + '/' + this.min_year + '/' + this.max_year)
        .then(response => (this.films = response.data))
        .catch(error => (console.log('Une erreur est survenue.')))      
    },
    scroll (person) {
    window.onscroll = () => {
      let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;

      if (bottomOfWindow) {
        
          this.page ++;
          this.request = 'limit=20&page=' + this.page;
          if(this.valuesortby[0] == undefined)
            this.request += '&sort_by=rating'
          else{
            this.request += '&sort_by=' + this.valuesortby[0]
          }
          if(this.valuegender[0] != undefined)
            this.request += '&genre=' + this.valuegender[0]
          if(this.searchcontent != '')
            this.request += '&query_term=' + this.searchcontent
    
            this.axios
              .get('https://localhost:5001/api/v1/films/' + this.request + '/page=' + this.page + '/' + this.min_rate + '/' + this.max_rate + '/' + this.min_year + '/' + this.max_year)
              .then(response => {
              for(var i = 0; i < response.data.length; i++)
              {
                this.films.push(response.data[i])
              }
            })
              .catch(error => (console.log('Une erreur est survenue.'))) 
      }
    };
  },
  },
  components: {
    Preview
  }
};
</script>
