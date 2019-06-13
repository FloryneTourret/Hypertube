<template>
 	<el-row v-if="id != null" class="preview" :id="'preview_'+film.id">
		<el-col :span="10">
		<img class="miniature" :src="film.background_image">
		<h2 class="title">{{film.title_english}} {{id}}</h2>
		<p class="genres">Type : <span v-for="genre in film.genres">{{genre}} </span></p>
		</el-col>

		<el-col :span="12">
		<p class="summary">{{film.description_full}}</p>
		<i class="seen">Déjà vu ?</i>
		<br>
		<button><font-awesome-icon icon="heart" /> J'aime</button>
		<button><font-awesome-icon icon="play" /> Regarder</button>
		</el-col>
    </el-row>
</template>
<script>
export default {
	props: ['id'],
	data() {
      return {
        film: ''
      }
	},
	methods: {
    load () {
		this.axios
			.get('https://yts.lt/api/v2/movie_details.json?movie_id=' + Number(this.id))
			.then(response => (this.film = response.data.data.movie))
    },
  },
  beforeUpdate(){
	  if(this.id != null)
	  {
		// this.film= '';
		this.load();
	  }
  }
	
};
</script>