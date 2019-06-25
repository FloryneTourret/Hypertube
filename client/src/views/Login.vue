<template>
  <div id="loginPage">
    <el-alert v-if="error" :title="error" type="error" show-icon center></el-alert>
	<el-alert v-if="success" :title="success" type="success" show-icon center></el-alert>
    <el-card id="formContainer" class="box-card">
      <div slot="header" class="clearfix">
        <span class="login">Login</span>
      </div>
      <el-form :model="form" label-width="90px" status-icon :rules="rules" ref="form">
        <el-form-item prop="username" label="Username">
          <el-input placeholder="Enter your username" v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="Password">
          <el-input
            placeholder="Enter your password"
            @keyup.enter.native="submit('form')"
            type="password"
            v-model="form.password"
          ></el-input>
        </el-form-item>
        <el-form-item style="text-align: right">
          <el-button @click="submit('form')">Log In</el-button>
        </el-form-item>
      </el-form>
      <div class="mx-auto">
        <p align="center" style="font-size:14px">
          Create an account?
          <router-link to="/register">Register</router-link>
        </p>
        <p align="center" style="font-size:14px">
          Forgot
          <router-link to="/forgotPassword">password ?</router-link>
        </p>
        <div class="oauth">
          <button @click="googleAuth()">
            <font-awesome-icon :icon="['fab', 'google']"/> Connect with Google
          </button>
          <button @click="ft_auth()">
            <span class="bold">42</span> Connect with 42
          </button>
          <br>
          <button @click="facebookAuth()">
            <font-awesome-icon :icon="['fab', 'facebook-f']"/> Connect with Facebook
          </button>
          <button @click="githubLogin()">
            <font-awesome-icon :icon="['fab', 'github']"/> Connect with Github
          </button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
window.fbAsyncInit = function() {
  FB.init({
    appId: "1093270320858184",
    cookie: true,
    xfbml: true,
    version: "v3.3"
  });

  FB.AppEvents.logPageView();
};

(function(d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");

export default {
  name: "Login",
  data() {
    return {
	  error: "",
	  success: "",
      form: {
        username: "",
        password: ""
      },
      rules: {
        username: [
          {
            required: true,
            message: "Please input username",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "Please enter a password",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    facebookAuth() {
      this.error = "";
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 1)"
      });
      FB.login(response => {
        if (response.status == "connected") {
          try {
            FB.api("/me?fields=email,name", response => {
              if (response && !response.message) {
                this.axios
                  .get("https://localhost:5001/auth/facebook/login", {
                    params: {
                      id: response.id,
                      provider: "facebook"
                    }
                  })
                  .then(response => {
                    if (response.status == 200 && !response.data.message) {
                      console.log(response.data);
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
                    } else {
                      this.error = response.data.message;
                    }
                  })
                  .catch(error => {
                    this.error = error;
                  })
                  .then(() => {
                    loading.close();
                  });
              }
            });
          } catch (err) {
            console.log(err);
          }
        }
      });
    },
    ft_auth() {
      location.href =
        "https://api.intra.42.fr/oauth/authorize?client_id=b4158c6ecce617a8593f7d514272c247d61c24d1ddf5ca586e18aecce5f6caa4&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Flogin%2Fcallback&response_type=code&scope=public&state=login";
    },
    googleAuth() {
      this.error = "";
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 1)"
      });
      this.$gAuth
        .signIn()
        .then(GoogleUser => {
          this.error = "";
          const loading = this.$loading({
            lock: true,
            text: "Loading",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 1)"
          });

          var infos = GoogleUser.getBasicProfile();

          this.axios
            .post("https://localhost:5001/auth/google/login", {
              email: infos.U3
            })
            .then(response => {
              if (response.status === 200) {
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
              } else if (response.status === 404) {
                this.error = "No Google account found with this email.";
              }
            })
            .catch(error => {
              this.error = "No google account registered with this email.";
            })
            .then(() => {
              loading.close();
            });
        })
        .catch(error => {
          //on fail do something
        });
    },
        githubLogin() {
      location.href = "https://github.com/login/oauth/authorize?scope=user:email&client_id=801c25f9bef7da39dd86&redirect_uri=http:\/\/localhost:8080\/github\/callback&state=login";
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.error = "";
          const loading = this.$loading({
            lock: true,
            text: "Loading",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 1)"
          });
          this.axios
            .post("https://localhost:5001/api/v1/users/login", {
              username: this.form.username,
              password: this.form.password
            })
            .then(response => {
              if (response.status === 200) {
                console.log(response);
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
            .catch(error => {
              this.form.password = "";
              this.$refs[formName].clearValidate("password");
              this.error = "Wrong credentials.";
            })
            .then(() => {
              loading.close();
            });
        } else {
          return false;
        }
      });
    }
  },
  mounted() {
    if (this.$session.exists()) {
      this.$router.push("/");
    }

    if (this.$router.currentRoute.query.error_message) {
      this.error = this.$router.currentRoute.query.error_message;
    } else if (this.$router.currentRoute.query.success) {
		this.success = this.$router.currentRoute.query.success;
	}
  }
};
</script>