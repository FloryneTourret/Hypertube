<template>

</template>
<script>
export default {
  name: "api42",
  mounted() {
    if (this.$router.currentRoute.query.code) {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 1)"
      });
      let response_code = this.$router.currentRoute.query.code;
      this.axios
        .post("https://api.intra.42.fr/oauth/token", {
          grant_type: "authorization_code",
          client_id:
            "b4158c6ecce617a8593f7d514272c247d61c24d1ddf5ca586e18aecce5f6caa4",
          client_secret:
            "7ac8cc9c2f1416ded99b861bdc92be244d1bb8ae6c26c41b94efde86a439790a",
          code: response_code,
          redirect_uri: "http://localhost:8080/login/callback",
          state: "lfouilla"
        })
        .then(response => {
          var token = response.data.access_token;

          this.axios
            .get("https://api.intra.42.fr/v2/me?access_token=" + token)
            .then(response => {
              this.axios
                .post("https://localhost:5001/auth/42/login", {
                  data: response.data
                })
                .then(response => {
                  if (response.status === 200) {
                    this.$session.start();
                    this.$session.set("id", response.data._id);
                    this.$session.set("username", response.data.username);
                    this.$session.set("email", response.data.email);
                    this.$session.set("firstName", response.data.firstName);
                    this.$session.set("lastName", response.data.lastName);
                    this.$router.push("/");
                  } else {
                    this.$router.push("/login");
                  }
                })
                .catch(error => {
                  console.log(error);
                })
                .then(() => {
                  loading.close();
                });
            });
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      this.$router.push("/login");
    }
  }
};
</script>
