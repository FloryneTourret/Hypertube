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
          <el-input placeholder="Enter your new password" v-model="form2.newPassword"></el-input>
        </el-form-item>
        <el-form-item prop="passwordConfirm" label="Password confimation">
          <el-input placeholder="Confirm your new password" v-model="form2.passwordConfirm"></el-input>
        </el-form-item>
        <el-form-item style="text-align: right">
          <el-button @click="resetPassword('form2')">Send reset password email</el-button>
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
      console.log("coucou");
    },
    resetPassword(formName) {
      console.log("coucou aussi");
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.error = "";
          const loading = this.$loading({
            lock: true,
            text: "Loading",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 1)"
          });
          console.log("c valide");
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
      console.log(this.error);
    }
  }
};
</script>