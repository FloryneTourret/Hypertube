<template>
  <div class="profile">
  </div>
</template>

<script>
export default {
  name: "ForgotPassword",
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/");
    }
  }
};
</script>