<template>
  <div>
    <h1 class="text-white">Video : </h1>
      <video width="100%" controls>
        <source :src="src" type="video/mp4">
      </video>
  </div>
</template>

<script>

export default {
  name: "Player",
  data() {
    return {
      src: "https://localhost:5001/api/v1/movies/stream?hash=" + this.$router.currentRoute.query.hash
    }
  },
  mounted() {
    console.log("mounted");
  }
};
</script>