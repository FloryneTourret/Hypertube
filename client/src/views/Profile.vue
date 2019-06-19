<template>
  <div v-if="exist == true" class="profile">
    <div v-if="this.$route.params.username == this.$session.get('username')">
      <h1 class="profile-title">This is your profile, {{this.$session.get('username')}}.</h1>
    </div>
    <div v-else>
      <h1 class="profile-title">{{this.$route.params.username}}'s profile.</h1>
    </div>
    <div v-if="this.$route.params.username == this.$session.get('username')">
      <router-link to="/Settings"><p class="profile-informations">Change your informations.</p></router-link>
    </div>
    <div class="profile-library">
      <h2 v-if="this.$route.params.username == this.$session.get('username')" class="profile-library-title">My library</h2>
      <h2 v-else class="profile-library-title">{{this.$route.params.username}}'s Library</h2>
      <div class="profile-library-list">
          <el-carousel :interval="0" arrow="always">
            <el-carousel-item v-for="item in 4" :key="item">
              <div class="list-container">
                <img src="https://media.senscritique.com/media/000017044685/source_big/Dunkerque.jpg" alt="">
                <img src="http://img.over-blog-kiwi.com/1/88/59/62/20170424/ob_13afcb_harry-potter-et-la-chambre-des-secrets.jpg" alt="">
                <img src="https://www.mauvais-genres.com/21977/au-revoir-la-haut-affiche-de-film-pli%C3%A9e-40x60-cm-2017-albert-dupontel-c%C3%A9sars.jpg" alt="">
                <img src="http://fr.web.img3.acsta.net/pictures/16/10/14/15/10/425022.jpg" alt="">
                <img src="https://spacegate.cnes.fr/sites/default/files/drupal/201702/image/gp_passengers-affiche.jpg" alt="">
              </div>
            </el-carousel-item>
          </el-carousel>
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
      exist: false
    };
  },
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/");
    }
      this.axios
        .get('https://localhost:5001/api/v1/users/' + this.$route.params.username)
        .then(response => {
          if (response.data == null)
            this.exist = false;
          else
            this.exist = true;
        })
    },
    components: {
     page404
  }
};
</script>