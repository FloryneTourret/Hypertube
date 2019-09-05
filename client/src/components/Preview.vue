<template>
 	<el-row v-if="id != null" class="preview" :id="'preview'">
		<!-- <button @click="close()" class="close"><font-awesome-icon icon="times" /></button> -->
		<el-col :span="10">
		<img class="miniature" :src="film.background_image">
		<h2 class="title">{{film.title_english}}</h2>
		<p class="genres" v-if="this.$session.get('lang') == 'fr'">Genre : <span v-for="genre in film.genres" v-bind:key="genre" >{{genre}} </span></p>
		<p class="genres" v-else>Gender : <span v-for="genre in film.genres" v-bind:key="genre" >{{genre}} </span></p>
		</el-col>

		<el-col :span="12">
		<p class="summary">{{film.description_full}}</p>
		<br>
		<!-- <button><font-awesome-icon icon="heart" /> J'aime</button> -->
		<button v-if="this.$session.get('lang') == 'fr'" @click="addmovie()"><font-awesome-icon icon="play" /> Regarder</button>
		<button v-else @click="addmovie()" ><font-awesome-icon icon="play"/> Play</button>
		</el-col>
    </el-row>
</template>
<script>
export default {
	props: ['id', 'top'],
	data() {
      return {
        film: '',
        oldtop: null,
      }
	},
	methods: {
    load () {
		this.newtop = this.top
		if(this.oldtop != null)
			if(this.oldtop < this.newtop)
				this.newtop -= 470
		this.axios
			.get('https://localhost:5001/api/v1/films/preview/' + Number(this.id))
			.then(response => {
				this.film = response.data.data.movie,
				document.getElementById('preview').style.top = this.newtop+'px';
      			document.getElementById('film_'+this.id).scrollIntoView({behavior: 'smooth'});
				this.oldtop = this.newtop;
			})
	},
	close () {
		this.id = null
	},
	addmovie(){
		this.axios
			this.axios
            .post("https://localhost:5001/api/v1/movies", {
				title : this.film.title_english,
				userID : this.$session.get('id'),
				movieID : this.film.id,
				backgroundImage : this.film.medium_cover_image
            })
            .then(response => {
            })
            .catch(error => {
              this.error = "No google account registered with this email.";
			});
			this.$router.push('/video?id=' + this.film.id);
	}
  },
  watch: {
	  id: function (){
		if(this.id != null)
		{
			this.load();
		}
	  }
	  
  }
	
};
</script>