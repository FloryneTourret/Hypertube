<template>
  <div class="settings">
    <h1 class="settings-title">Here you can change your informations.</h1>
      <div style="margin: 20px;"></div>
      <div>
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
      <h2 class="pp-title">Want a handsome profile picture?</h2>
      <div class="container">
        <div id="img-container">
          <img v-for="item in pictures" :src=item.src @click="changepictures(item.src)">
        </div>
      </div>
    </div>
</template>

<script>

export default {
  name: "Search",
  data() {
      return {
        pictures: null,
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
      },
      changepictures(src) {
        this.axios
          .put("https://localhost:5001/api/v1/users/user/"+this.$session.get('username'), {
            picture: src
          })
          .then(response => {
            this.$session.set('picture', response.data.picture)
            document.location.reload();
          })
      }
    },
  mounted() {
    if (!this.$session.exists()) {
      this.$router.push("/login");
    }
    this.axios
          .get("https://localhost:5001/api/v1/pictures/")
          .then(async(response) =>{
            this.pictures = response.data
          })
  }
};
</script>