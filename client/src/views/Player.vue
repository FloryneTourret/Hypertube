<template>
  <div class="player">
    <h1 class="text-white">
      <span>{{movie.title}}</span>
      ({{movie.year}})
      <small>
        <font-awesome-icon icon="star" />
        {{movie.rating}}
      </small>
    </h1>
    <video width="100%" crossorigin="anonymous" controls>
      <source :src="src" />
      <track label="English" kind="subtitles" :src="enTrack" srclang="en" />
      <track label="French" kind="subtitles" :src="frTrack" srclang="fr" />
    </video>
    <img :src="movie.backgroundImage" alt="background" />
    <p class="text-white genders">
      <span v-for="gender in movie.genres" :key="gender">{{gender}}</span>
    </p>
    <p class="text-white time">{{movie.runtime}}</p>
    <p class="text-white resume">{{movie.description}}</p>
    <p class="text-white casting">
      <span class="genres" v-if="this.$session.get('lang') == 'fr'">Réalisateur :</span>
      <span class="genres" v-else>Director :</span>
      {{movie.director}}
      <br />
      <span class="genres" v-if="this.$session.get('lang') == 'fr'">Scénariste :</span>
      <span class="genres" v-else>Writer :</span>
      {{movie.writer}}
      <br />
      <span class="genres" v-if="this.$session.get('lang') == 'fr'">Acteurs :</span>
      <span class="genres" v-else>Actors :</span>
      {{movie.actors}}
    </p>
    <p class="text-white note"></p>

    <div id="comments">
      <h2 class="text-white">Comments</h2>
      <el-form :model="form" status-icon ref="form">
        <el-form-item prop="content" class="input_comment">
          <el-input
            placeholder="Enter your comment"
            v-model="form.content"
            @keyup.enter.native="submit()"
          ></el-input>
        </el-form-item>
        <el-form-item class="button_comment">
          <el-button @click="submit()">Post</el-button>
        </el-form-item>
      </el-form>
      <div v-for="comment in comments" :key="comment._id" class="text-white">
        <img :src="comment.user.picture" class="img_comment" />
        <a :href="'/Profile/'+comment.user.username">
          <span class="username_comment">{{comment.user.username}}</span>
        </a>
        <small
          class="date_comment"
        >{{ new Date(comment.creation_date).getTime() | moment("from", "now") }}</small>
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
        this.$router.currentRoute.query.id,
      frTrack: "",
      enTrack: ""
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
          console.log(this.comments);
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
            self.form.content = "";
            self.getComments();
          });
      }
    }
  },
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/login");
    } else {
      // Search subtitle track
      this.axios
        .get(
          "https://localhost:5001/api/v1/movies/" +
            this.$router.currentRoute.query.id +
            "/" +
            this.$session.get("username")
        )
        .then(response => {
          this.movie = response.data;
          this.frTrack =
            "https://localhost:5001/api/v1/movies/" +
            this.movie.movieID +
            "/subtitles?lang=French";
          this.enTrack =
            "https://localhost:5001/api/v1/movies/" +
            this.movie.movieID +
            "/subtitles?lang=English";
          console.log(this.movie);
        });
      this.getComments();
    }
  }
};
</script>