<template>
  <div class="settings">
	  <h1 class="settings-title">Here, you can change your informations.</h1>
	  <div class="settings-profile-pictures">
		  
	  </div>
  </div>
</template>

<script>
export default {
  name: "Search",
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/login");
    }
  }
};
</script>