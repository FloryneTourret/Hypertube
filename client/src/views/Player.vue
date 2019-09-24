<template>
  <div>
    <h1 class="text-white">{{movie.title}} ({{movie.year}})</h1>
    <video width="100%" controls>
      <source :src="src" type="video/mp4" />
    </video>
    <p class="text-white">
      Resume:
      <br />
      {{movie.description}}
    </p>
    <div id="comments">
      <h2 class="text-white">Comments</h2>
      <el-form :model="form" label-width="90px" status-icon :rules="rules" ref="form">
        <el-form-item prop="username" label="Username">
          <el-input placeholder="Enter your username" v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item style="text-align: right">
          <el-button @click="submit('form')">Log In</el-button>
        </el-form-item>
      </el-form>
      <p v-for="comment in comments" :key="comment" class="text-white">{{comment.content}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Player",
  data() {
    return {
      form: {
        content: ""
      },
      movie: {},
      comments: {},
      src:
        "https://localhost:5001/api/v1/movies/stream?id=" +
        this.$router.currentRoute.query.id +
        "&username=" +
        this.$session.get("username")
    };
  },
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/login");
    } else {
      this.axios
        .get(
          "https://localhost:5001/api/v1/movies/" +
            this.$router.currentRoute.query.id
        )
        .then(response => {
          this.movie = response.data;
        });
      this.axios
        .get(
          "https://localhost:5001/api/v1/comments?movieID=" +
            this.$router.currentRoute.query.id
        )
        .then(response => {
          this.comments = response.data;
        });
    }
  }
};
</script>