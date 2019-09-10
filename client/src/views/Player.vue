<template>
  <div>
    <h1 class="text-white">{{movie.title}} ({{movie.year}})</h1>
    <video width="100%" controls>
      <source :src="src" type="video/mp4" />
    </video>
	<p class="text-white">Resume: <br />{{movie.description}}</p>
  </div>
</template>

<script>

export default {
  name: "Player",
  data() {
    return {
		movie: {},
      src: "https://localhost:5001/api/v1/movies/stream?id=" + this.$router.currentRoute.query.id
    }
  },
  mounted() {
	  this.axios.get('https://localhost:5001/api/v1/movies/' + this.$router.currentRoute.query.id).then(response => {
		  this.movie = response.data;
	  })
  }
};
</script>