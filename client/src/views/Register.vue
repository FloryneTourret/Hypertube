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
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.error = "";
          this.axios
            .post("https://localhost:5001/api/v1/users/", {
              email: this.form.email,
              username: this.form.username,
              password: this.form.pass
            })
            .then(response => {
              console.log(response);
              if (response.data.error == "user exists") {
                this.error = "Username or email already taken.";
                this.$refs[formName].email_error("There's an error");
                this.$refs[formName].resetField("email");
              }
            })
            .catch(error => {
              console.log(error);
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
