<template>
  <div id="forgotPassword">
    <el-alert v-if="error" :title="error" type="error" show-icon center></el-alert>
    <el-alert v-if="success" :title="success" type="success" show-icon center></el-alert>
    <el-card id="formContainer" class="box-card">
      <div slot="header" class="clearfix">
        <span class="login">Password forgot</span>
      </div>
      <el-form
        v-if="!this.$router.currentRoute.query.token"
        :model="form"
        label-width="90px"
        status-icon
        :rules="rules"
        ref="form"
      >
        <el-form-item prop="email" label="Email">
          <el-input placeholder="Enter your email" v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item style="text-align: right">
          <el-button @click="sendMailReset('form')">Send reset password email</el-button>
        </el-form-item>
      </el-form>
      <el-form v-else :model="form2" status-icon :rules="rules" ref="form2">
        <el-form-item prop="newPassword" label="New password">
          <el-input
            placeholder="Enter your new password"
			:bind="form2.newPassword"
            v-model="form2.newPassword"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item prop="passwordConfirm" label="Password confimation">
          <el-input
            placeholder="Confirm your new password"
			:bind="form2.passwordConfirm"
            v-model="form2.passwordConfirm"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item style="text-align: right">
          <el-button @click="resetPassword('form2')">Update password</el-button>
        </el-form-item>
      </el-form>
      <div class="mx-auto">
        <p align="center" style="font-size:14px">
          Go back to
          <router-link to="/login">Login</router-link>
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
      success: "",
      form: {
        email: ""
      },
      form2: {
        newPassword: "",
        passwordConfirm: ""
      },
      rules: {
        email: [
          {
            required: true,
            message: "Please input email",
            trigger: "blur"
          }
        ],
        newPassword: [
          {
            required: true,
            message: "Please enter a password",
            trigger: "blur"
          }
        ],
        passwordConfirm: [
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
    sendMailReset(formName) {
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
            .post("https://localhost:5001/auth/resetpassword", {
              email: this.form.email
            })
            .then(response => {
              // console.log(response);
              if (response.status == 200) {
                this.success = "Email sent successfully";
                loading.close();
              }
            })
            .catch(error => {
              // console.log(error);
            });
        } else {
          return false;
        }
      });
    },
    resetPassword(formName) {
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
            .post("https://localhost:5001/auth/resetpassword", {
              token: this.$router.currentRoute.query.token,
              newpassword: this.form2.newPassword,
              passwordconfirm: this.form2.passwordConfirm
            })
            .then(response => {
              // console.log(response);
              if (response.data.message) {
                this.error = response.data.message;
              } else {
                this.$router.push('/login?success=Password%20changed%20successfully');
              }
            })
            .catch(error => {
              // console.log(error);
              this.error = error;
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
    } else if (this.$router.currentRoute.query.success_message) {
      this.success = this.$router.currentRoute.query.success_message;
    }
  }
};
</script>