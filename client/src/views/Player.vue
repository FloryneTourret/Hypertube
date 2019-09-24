<template>
  <div class="player">
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
      <el-form :model="form" status-icon ref="form">
        <el-form-item prop="content">
          <el-input placeholder="Enter your comment" v-model="form.content" @keyup.enter.native="submit()"></el-input>
        </el-form-item>
        <el-form-item style="text-align: right">
          <el-button @click="submit()">Post</el-button>
        </el-form-item>
      </el-form>
      <div
        v-for="comment in comments"
        :key="comment._id"
        class="text-white"
      >
        <img :src="comment.user.picture" class="img_comment">
        <span class="username_comment">{{comment.user.username}}</span>
        <small class="date_comment">{{ new Date(comment.creation_date).getTime() | moment("from", "now") }}</small>
        <p class="content_comment">{{comment.content}}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Player",
  data() {
    return {
      form: {
        content: null
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
  methods: {
    getComments() {
      this.axios
        .get(
          "https://localhost:5001/api/v1/comments?movieID=" +
            this.$router.currentRoute.query.id
        )
        .then(response => {
          this.comments = response.data.reverse();
          console.log(this.comments)
        });
    },
    submit() {
      var self = this;
      if (this.form.content.length > 0) {
        this.axios
          .post("https://localhost:5001/api/v1/comments", {
            username: this.$session.get("username"),
            movieID: this.$router.currentRoute.query.id,
            content: this.form.content
          })
          .then(function(response) {
            console.log(response);
            self.form.content = '';
            self.getComments();
          });
      }
    }
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
      this.getComments();
    }
  }
};
</script>