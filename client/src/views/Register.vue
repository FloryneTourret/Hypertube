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
        <button><span class="bold">42</span> Register with 42</button>
        <br>
        <button><font-awesome-icon :icon="['fab', 'facebook-f']" /> Register with Facebook</button>
        <button><font-awesome-icon :icon="['fab', 'twitter']" /> Register with Twitter</button>
      </div>
    </el-card>
  </div>
</template>

<script>
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
    }
  },
  mounted() {
    if (this.$session.exists()) {
      this.$router.push("/");
    }
  }
};
</script>
