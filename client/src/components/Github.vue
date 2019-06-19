<template></template>
<script>
export default {
  name: "Github",
  mounted() {
    let code = this.$router.currentRoute.query.code;
    if (code) {
		this.axios
		.post('https://github.com/login/oauth/access_token', {
			client_id: '801c25f9bef7da39dd86',
			client_secret: 'a7ad2d92028a78f4e90c36546d19e8131b983ec8',
			code: code,
			state: this.$router.currentRoute.query.state
		})
		.then(response => {
			console.log(response);
		})
		.catch(error => {
			console.log(err);
		})
    } else {
      this.$router.push(
        "/" + this.$router.currentRoute.query.state + "?error_message=fail"
      );
    }
  }
};
</script>
