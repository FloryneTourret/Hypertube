<template>
 	<el-row v-if="id != null" class="preview" :id="'preview'">
		<el-col :span="10">
		<img class="miniature" :src="film.background_image">
		<h2 class="title">{{film.title_english}}</h2>
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