<template></template>
<script>
export default {
  name: "Github",
  mounted() {
    let code = this.$router.currentRoute.query.code;
    let state = this.$router.currentRoute.query.state;
    if (code) {
      this.axios
        .post("https://localhost:5001/auth/github/token", {
          code: code,
          state: this.$router.currentRoute.query.state
        })
        .then(response => {
          if (state && state == "register") {
            this.axios
              .post("https://localhost:5001/auth/github/register", {
                access_token: response.data.access_token
              })
              .then(response => {
                if (
                  response.data.message &&
                  response.data.message.code == 11000
                ) {
                  this.$router.push(
                    "/" +
                      this.$router.currentRoute.query.state +
                      "?error_message=Your%20Github%20login%20or%20email%20is%20already%20used%20on%20Hypertube.%20You%20probably%20have%20an%20other%20Oauth%20account"
                  );
                } else {
                  this.$router.push("/login");
                }
              })
              .catch(err => {});
          } else if (state && state == "login") {
            this.axios
              .post("https://localhost:5001/auth/github/login", {
                access_token: response.data.access_token
              })
              .then(response => {
                if (response.data.message) {
                  this.$router.push(
                    "/login?error_message=" + response.data.message
                  );
                } else {
                  this.$session.start();
                  this.$session.set("id", response.data._id);
                  this.$session.set("username", response.data.username);
                  this.$session.set("picture", response.data.picture);
                  this.$session.set("lang", response.data.lang);
                  this.$session.set("email", response.data.email);
                  this.$session.set("firstName", response.data.firstName);
                  this.$session.set("lastName", response.data.lastName);
                  this.$session.set("authProvider", response.data.authProvider);
                  this.$router.push("/");
                }
              })
              .catch(err => {
                this.$router.push("/login?error_message=" + err);
              });
          } else {
            this.$router.push(
              "/login?error_message=Someone%20tried%20some%20nasty%20things%20with%20the%20url%20right%20%3F"
            );
          }
        })
        .catch(error => {
          this.$router.push(
            "/" +
              this.$router.currentRoute.query.state +
              "?error_message=" +
              err
          );
        });
    } else {
      this.$router.push(
        "/" +
          this.$router.currentRoute.query.state +
          "?error_message=Github%20failed%20to%20load%20your%20data"
      );
    }
  }
};
</script>
