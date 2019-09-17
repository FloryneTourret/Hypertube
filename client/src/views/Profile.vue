<template>
  <div v-if="exist == true" class="profile">
    <div v-if="this.$route.params.username == this.$session.get('username')">
      <h1
        v-if="this.$session.get('lang') == 'fr'"
        class="profile-title"
      >Voici votre profil, {{this.$session.get('username')}}.</h1>
      <h1 v-else class="profile-title">This is your profile, {{this.$session.get('username')}}.</h1>
    </div>
    <div v-else>
      <img :src="'http://localhost:8080/'+user_picture" id="other_user_picture" />
      <h1
        v-if="this.$session.get('lang') == 'fr'"
        class="profile-title"
      >Profil de {{this.$route.params.username}}.</h1>
      <h1 v-else class="profile-title">{{this.$route.params.username}}'s profile.</h1>
    </div>
    <div v-if="this.$route.params.username == this.$session.get('username')">
      <router-link to="/Settings">
        <p
          v-if="this.$session.get('lang') == 'fr'"
          class="profile-informations"
        >Changer vos informations</p>
        <p v-else class="profile-informations">Change your informations.</p>
      </router-link>
    </div>
    <div class="profile-library">
      <h2
        v-if="this.$route.params.username == this.$session.get('username')"
        class="profile-library-title"
      >
        <span v-if="this.$session.get('lang') == 'fr'">Ma librairie</span>
        <span v-else>My library</span>
      </h2>
      <h2 v-else class="profile-library-title">
        <span v-if="this.$session.get('lang') == 'fr'">Librairie de {{this.$route.params.username}}</span>
        <span v-else>{{this.$route.params.username}}'s Library</span>
      </h2>
      <div class="profile-library-list">
        <el-carousel :interval="0" type="card" height="350px" v-if="this.movies.length > 0">
          <el-carousel-item v-for="movie in this.movies">
            <img :src="movie.backgroundImage" :alt="movie.title" @click="play(movie.movieID)" />
          </el-carousel-item>
        </el-carousel>
        <div v-else>
          <p
            v-if="this.$session.get('lang') == 'fr'"
            class="text-white"
          >On dirait que cette librairie est vide.</p>
          <p v-else class="text-white">Looks like the library is empty.</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="profile">
    <page404></page404>
  </div>
</template>

<script>
import page404 from "@/components/404.vue";

export default {
  name: "Profile",
  data() {
    return {
      exist: true,
      user_picture: "",
      username: "",
      movies: [],
      nbmovies: 0,
      nbslides: 0
    };
  },
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/");
    } else {
      this.axios
        .get(
          "https://localhost:5001/api/v1/users/" + this.$route.params.username
        )
        .then(response => {
          if (response.data == null) this.exist = false;
          else {
            this.exist = true;
            this.user_picture = response.data.picture;
            this.username = response.data.username;
            this.getMovies();
          }
        });
    }
  },
  methods: {
    getMovies() {
      this.axios
        .get("https://localhost:5001/api/v1/users/" + this.username + "/movies")
        .then(response => {
          this.movies = response.data;
          console.log(this.movies);
          this.nbmovies = response.data.length;
          this.nbslides = Math.ceil(this.nbmovies / 5);
        });
    },
    play(id) {
      this.$router.push("/video?id=" + id);
    }
  },
  components: {
    page404
  }
};
</script>