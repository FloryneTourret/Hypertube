<template>
  <div class="settings">
    <h1 class="settings-title">Here you can change your informations.</h1>
      <div style="margin: 20px;"></div>
      <el-form :model="settingsForm" status-icon :rules="rules" :label-position="labelPosition" ref="settingsForm">
        <el-form-item label="New login" prop="name">
          <el-input class="input-clean" placeholder="Nicolas Sarkozy" v-model="settingsForm.name"></el-input>
        </el-form-item>
        <el-form-item label="New password" prop="password">
          <el-input class="input-clean" placeholder="Type here your new password" v-model="settingsForm.password" show-password autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="New password repeat" prop="passwordrepeat">
          <el-input class="input-clean" placeholder="Type here your new password" v-model="settingsForm.passwordrepeat" show-password autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ourprimary" @click="submitForm('settingsForm')">Modify</el-button>
          <el-button type="ourdefault" @click="resetForm('settingsForm')">Reset</el-button>
        </el-form-item>
      </el-form>
	  </div>
</template>

<script>

export default {
  name: "Search",
  data() {
      return {
        labelPosition: 'top',
        settingsForm: {
          name: '',
          password: '',
          passwordrepeat: ''
        },
        rules: {
          name: [
            { min: 3, max: 12, message: 'Length should be 3 to 12', trigger: ["blur", "change"] }
          ],
          password: [
            { min: 12, max: 18, message: 'Length should be 12 to 18', trigger: ['blur', 'change'] }
          ],
          passwordrepeat: [
            { min: 12, max: 18, message: 'Length should be 12 to 18', trigger: ['blur', 'change'] }
          ]
        }
      };
    },
  methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.axios
              .put("https://localhost:5001/api/v1/users/user/"+this.$session.get('username'), {
                username: this.settingsForm.name
              })
              .then(async(response) =>{
                await this.$session.set('username', response.data.username)
                document.location.reload();
              })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      }
    },
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/login");
    }
  }
};
</script>