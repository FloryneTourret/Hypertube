<template>
  <div id="registerPage">
    <el-alert v-if="error" v-bind:title="error" type="error" show-icon center></el-alert>
    <el-card id="formContainer" class="box-card">
      <div slot="header" class="clearfix">
        <span>Register</span>
      </div>
      <el-form :model="form" label-width="90px" status-icon :rules="rules" ref="form">
        <el-form-item prop="email" v-bind:error="form.email_error" label="Email">
          <el-input v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item prop="firstName" label="Firstname">
          <el-input v-model="form.firstName"></el-input>
        </el-form-item>
        <el-form-item prop="lastName" label="Lastname">
          <el-input v-model="form.lastName"></el-input>
        </el-form-item>
        <el-form-item prop="username" label="Username">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="pass">
          <el-input type="password" v-model="form.pass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Confirm" prop="checkPass">
          <el-input type="password" v-model="form.checkPass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item style="text-align:right">
          <el-button type="primary" @click="submit('form')">Register</el-button>
        </el-form-item>
      </el-form>
      <div class="mx-auto">
        <p align="center" style="font-size:14px">
          Already have an account?
          <router-link to="/login">Login</router-link>
        </p>
      </div>

      <div class="oauth">
        <button @click="googleRegister()"><font-awesome-icon :icon="['fab', 'google']" /> Register with Google</button>
        <button @click="ft_register()"><span class="bold">42</span> Register with 42</button>
        <br>
        <button @click="facebookAuth()"><font-awesome-icon :icon="['fab', 'facebook-f']" /> Register with Facebook</button>
        <button @click="githubRegister()"><font-awesome-icon :icon="['fab', 'github']" /> Register with Github</button>
      </div>
    </el-card>
  </div>
</template>

<script>
window.fbAsyncInit = function() {
  FB.init({
    appId      : '1093270320858184',
    cookie     : true,
    xfbml      : true,
    version    : 'v3.3'
  });
    
  FB.AppEvents.logPageView();   
    
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

export default {
  data() {
    var validatePass = (rule, value, callback) => {
      var strongRegex = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
      );

      if (value === "") {
        callback(new Error("Please input the password"));
      } else if (strongRegex.test(value) == false) {
        callback(new Error("Password is not strong enough"));
      } else {
        this.$refs.form.validateField("checkPass");
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("Please input the password again"));
      } else if (value !== this.form.pass) {
        callback(new Error("Two inputs don't match!"));
      } else {
        callback();
      }
    };
    return {
      error: "",
      form: {
        pass: "",
        checkPass: "",
        email: "",
        username: "",
        email_error: "",
        username_error: ""
      },
      rules: {
        username: [
          {
            required: true,
            message: "Please input username",
            trigger: "blur"
          },
          {
            message: "Please input correct username",
            trigger: ["blur", "change"]
          }
        ],
        firstName: [
          {
            required: true,
            message: "Please input firstname",
            trigger: "blur"
          },
          {
            message: "Please input correct firstname",
            trigger: ["blur", "change"]
          }
        ],
        lastName: [
          {
            required: true,
            message: "Please input lastname",
            trigger: "blur"
          },
          {
            message: "Please input correct lastname",
            trigger: ["blur", "change"]
          }
        ],
        pass: [{ validator: validatePass, trigger: "blur" }],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
        email: [
          {
            required: true,
            message: "Please input email address",
            trigger: "blur"
          },
          {
            type: "email",
            message: "Please input correct email address",
            trigger: ["blur", "change"]
          }
        ]
      }
    };
  },
  methods: {
	  ft_register() {
      	location.href = "https://api.intra.42.fr/oauth/authorize?client_id=b4158c6ecce617a8593f7d514272c247d61c24d1ddf5ca586e18aecce5f6caa4&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Flogin%2Fcallback&response_type=code&scope=public&state=register";
	  },
	  googleRegister() {
		this.$gAuth.signIn()
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
		  .post('https://localhost:5001/auth/google/register', {user: infos})
		  .then(response => {
			  if(!response.data.message)
                  this.$router.push("/login");
                else{
                  if(response.data.message.code == 11000)
                    this.error = "Your Google email is already associated to an account.";
                  else
                    this.error = "An error as occurred.";
                }
            })
            .catch(error => {
              this.error = "No google account registered.";
            })
            .then(() => {
              loading.close();
            });
		})
		.catch(error  => {
		  //on fail do something
		})
	  },
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
          FB.api(
            '/me?fields=last_name,first_name',
            (response) => {
              console.log(response);
              if (response && !response.message) {
                this.axios
                .post('https://localhost:5001/auth/facebook/register', {facebookID: response.id, firstName: response.first_name, lastName: response.last_name})
                .then(response => {
                  if (response.status == 200 && !response.error)
                  {
                    this.$router.push("/login");
                  }
                  else {
                    this.error = response.message;
                  }
                })
                .catch(error => {
                  this.error = error;
                })
                .then(() => {
                  loading.close();
                })
              }
            }
          )
        }
      })
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
            .post("https://localhost:5001/api/v1/users/", {
              email: this.form.email,
              username: this.form.username,
              firstName: this.form.firstName,
              lastName: this.form.lastName,
              password: this.form.pass
            })
            .then(response => {
              if (response.data.error == "user exists") {
                this.error = "Username or email already taken.";
                this.$refs[formName].email_error("There's an error");
                this.$refs[formName].resetField("email");
              }
              else
              {
                if(!response.data.message)
                  this.$router.push("/login");
                else{
                  if(response.data.message.code == 11000)
                    this.error = "Email or username already taken.";
                  else
                    this.error = "An error as occurred.";
                }
              }
            })
            .catch(error => {
              console.log(error);
            })
            .then(() => {
              loading.close();
            });
        } else {
          return false;
        }
      });
    },
    githubRegister() {
      location.href = "https://github.com/login/oauth/authorize?scope=user:email&client_id=801c25f9bef7da39dd86&redirect_uri=http:\/\/localhost:8080\/github\/callback&state=register";
    }
  },
  mounted() {
    if (this.$session.exists()) {
      this.$router.push("/");
    }

    if (this.$router.currentRoute.query.error_message) {
      this.error = this.$router.currentRoute.query.error_message;
    }
  }
};
</script>
