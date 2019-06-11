<template>
  <div class="search">
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