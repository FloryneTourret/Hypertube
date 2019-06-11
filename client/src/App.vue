<template>
  <div id="app">
    <div id="nav">
      <Navbar v-if="this.$session.exists()"></Navbar>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
@import "../public/sass/master.sass";
@import "../public/sass/responsive.sass";
</style>

<script>
import Navbar from "@/components/Navbar.vue";

export default {
  data() {
    return {
      Login: 0,
    };
  },
  methods: {
    forceRerenderNavbar() {
      this.Login += 1;  
    }
  },
  name: "app",
  components: {
    Navbar
  }
};
</script>
