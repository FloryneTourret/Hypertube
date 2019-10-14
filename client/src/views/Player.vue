<template>
  <div class="player">
    <el-alert v-if="error" :title="error" type="error" show-icon center></el-alert>
    <h1 class="text-white">
      <span>{{movie.title}}</span>
      ({{movie.year}})
      <small>
        <font-awesome-icon icon="star" />
        {{movie.rating}}
      </small>
    </h1>
    <div
      id="video"
      v-loading="loading_video"
      :element-loading-text="loadingMessage"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    ></div>
    <img :src="movie.backgroundImage" alt="background" />
    <p class="text-white genders">
      <span v-for="gender in movie.genres" :key="gender">{{gender}}&nbsp;</span>
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
      <el-form
        :model="form"
        status-icon
        ref="form"
        @submit="submit('form')"
        onSubmit="return false;"
      >
        <el-form-item prop="content" class="input_comment">
          <el-input
            placeholder="Enter your comment"
            v-model="form.content"
            @keyup.enter.native="submit('form')"
          ></el-input>
          <el-form-item class="button_comment">
            <el-button @click="submit('form')">Post</el-button>
          </el-form-item>
        </el-form-item>
      </el-form>
      <br />
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
      loadingMessage: "",
      loading_video: true,
      form: {
        content: null
      },
      rules: {
        content: [
          {
            required: true,
            message: "You must input something",
            trigger: "blur"
          }
        ]
      },
      error: "",
      movie: {},
      comments: {},
      frTrack: "",
      enTrack: ""
    };
  },
  methods: {
    getComments() {
      this.axios
        .get(
          "https://localhost:5001/api/v1/comments?movieID=" +
            this.$router.currentRoute.query.id,
          {
            headers: {
              access_token: localStorage.getItem("token")
            }
          }
        )
        .then(response => {
          if (!response.data.message) {
            this.comments = response.data.reverse();
          }
          // console.log(this.comments);
        });
    },
    submit(formName) {
      var self = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.error = "";

          this.axios
            .post(
              "https://localhost:5001/api/v1/comments",
              {
                username: this.$session.get("username"),
                movieID: this.$router.currentRoute.query.id,
                content: this.form.content
              },
              {
                headers: {
                  access_token: localStorage.getItem("token")
                }
              }
            )
            .then(function(response) {
              self.form.content = "";
              self.getComments();
            })
            .catch(err => {});
        }
      });
    },
    addSubtitleTrack(lang, srclang, label) {
      var track = document.createElement("track");
      track.src =
        "https://localhost:5001/api/v1/movies/" +
        this.movie.movieID +
        "/subtitles?lang=" +
        lang;
      track.label = label;
      track.srclang = srclang;
      document.getElementsByTagName("video")[0].appendChild(track);
    },
    addVideo() {
      document.getElementById("video").innerHTML =
        `<video width="100%" crossorigin="anonymous" controls>
      <source src="https://localhost:5001/api/v1/movies/` +
        this.$router.currentRoute.query.id +
        `/video" />
    </video>`;
      this.loading_video = false;
    }
  },
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/login");
    } else {
      var intervalID = setInterval(() => {
        this.axios
          .get(
            "https://localhost:5001/api/v1/movies/" +
              this.$router.currentRoute.query.id +
              "/ready",
            {
              headers: {
                access_token: localStorage.getItem("token")
              }
            }
          )
          .then(response => {
            if (response.data == "ready") {
              this.axios
                .get(
                  "https://localhost:5001/api/v1/movies/" +
                    this.movie.movieID +
                    "/subtitles?lang=French",
                  {
                    headers: {
                      access_token: localStorage.getItem("token")
                    }
                  }
                )
                .then(response => {
                  if (
                    response.data.replace(/ .*/, "").substring(0, 6) != "WEBVTT"
                  ) {
                    const h = this.$createElement;

                    this.$notify.info({
                      title: "Info",
                      message: "French subtitles are unavailable.",
                      duration: "7000"
                    });
                  } else {
                    this.addSubtitleTrack("French", "fr", "French");
                  }
                });
              this.axios
                .get(
                  "https://localhost:5001/api/v1/movies/" +
                    this.movie.movieID +
                    "/subtitles?lang=English",
                  {
                    headers: {
                      access_token: localStorage.getItem("token")
                    }
                  }
                )
                .then(response => {
                  if (
                    response.data.replace(/ .*/, "").substring(0, 6) != "WEBVTT"
                  ) {
                    const d = this.$createElement;

                    this.$notify.info({
                      title: "Info",
                      message: "English subtitles are unavailable.",
                      duration: "7000"
                    });
                  } else {
                    this.addSubtitleTrack("English", "en", "English");
                  }
                });
              this.addVideo();
              clearInterval(intervalID);
            } else if (response.data.percentage >= 0) {
              this.loadingMessage =
                "Little gobblins are preparing your movie. Current state : " +
                response.data.percentage +
                "%";
            }
          });
      }, 2000);

      // load movie informations
      this.axios
        .get(
          "https://localhost:5001/api/v1/movies/" +
            this.$router.currentRoute.query.id +
            "?username=" +
            this.$session.get("username"),
          {
            headers: {
              access_token: localStorage.getItem("token")
            }
          }
        )
        .then(response => {
          this.movie = response.data;
        });
      this.getComments();
    }
  }
};
</script>