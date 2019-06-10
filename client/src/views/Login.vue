<template>
  <div id="loginPage">
    <el-alert
      v-if="error"
      title="Authentication failed. Wrong credentials."
      type="error"
      show-icon
      center
    ></el-alert>
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
          <router-link to="/forgot_password">username/password ?</router-link>
        </p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      error: "",
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
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.error = "";
          const loading = this.$loading({
            lock: true,
            text: "Loading",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)"
          });
          this.axios
            .post("https://localhost:5001/api/v1/users/login", {
              username: this.form.username,
              password: this.form.password
            })
            .then(response => {
              localStorage.setItem("id", response.data.id);
              this.$router.push("/");
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
    if (localStorage.id) {
      this.$router.push("/");
    }
  }
};
</script>