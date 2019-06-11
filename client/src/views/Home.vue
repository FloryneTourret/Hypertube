<template>
  <div class="home">
  </div>
</template>


<script>
export default {
  name: "Home",
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/login");
    }
  }
};
</script>