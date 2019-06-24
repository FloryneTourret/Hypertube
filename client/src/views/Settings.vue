<template>
  <div class="settings">
    <h1 class="settings-title" v-if="this.$session.get('lang') == 'fr'">Vous pouvez changer vos informations ici.</h1>
    <h1 class="settings-title" v-else>Here you can change your informations.</h1>
    <div v-if="this.$session.get('authProvider') == 'local'">
      <p v-if="this.$session.get('lang') == 'fr'" class="text-white settings-email">Email actuel : {{user_email}}</p>
      <p v-else class="text-white settings-email">Actual email is : {{user_email}}</p>
    </div>
      <div style="margin: 20px;"></div>
      <div class="settings-language">
        <img v-if="this.$session.get('lang') == 'fr'" class="lang grey" @click="setlanguage('en')" value="en" src="http://localhost:8080/img/englishflag.png" alt="english">
        <img v-else class="lang" @click="setlanguage('en')" value="en" src="http://localhost:8080/img/englishflag.png" alt="english">
        <img v-if="this.$session.get('lang') != 'fr'" class="lang grey" @click="setlanguage('fr')" value="fr" src="http://localhost:8080/img/frenchflag.png" alt="french">
        <img v-else class="lang" @click="setlanguage('fr')" value="fr" src="http://localhost:8080/img/frenchflag.png" alt="french">
      </div>
      <div>
        <el-form :model="settingsForm" status-icon :rules="rules" :label-position="labelPosition" ref="settingsForm">
          <el-form-item v-if="this.$session.get('lang') == 'fr'" label="Nouveau login" prop="name">
            <el-input class="input-clean" placeholder="NicolasSarkozy" v-model="settingsForm.name"></el-input>
          </el-form-item>
          <el-form-item v-else label="New login" prop="name">
            <el-input class="input-clean" placeholder="BarackObama" v-model="settingsForm.name"></el-input>
          </el-form-item>

          <div v-if="this.$session.get('authProvider') == 'local'">
            <el-form-item v-if="this.$session.get('lang') == 'fr'" label="Nouvel email" prop="email">
              <el-input class="input-clean" placeholder="nicolas.sarkozy@elysee.fr" v-model="settingsForm.email"></el-input>
            </el-form-item>
            <el-form-item v-else label="New email" prop="email">
              <el-input class="input-clean" placeholder="barack.obama@whitehouse.us" v-model="settingsForm.email"></el-input>
            </el-form-item>
          

          <el-form-item v-if="this.$session.get('lang') == 'fr'" label="Nouveau mot de passe" prop="password">
            <el-input class="input-clean" placeholder="Entrez votre nouveau mot de passe" v-model="settingsForm.password" show-password autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item v-else  label="New password" prop="password">
            <el-input class="input-clean" placeholder="Type here your new password" v-model="settingsForm.password" show-password autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item v-if="this.$session.get('lang') == 'fr'" label="Répétition du nouveau mot de passe" prop="passwordrepeat">
            <el-input class="input-clean" placeholder="Type here your new password" v-model="settingsForm.passwordrepeat" show-password autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item v-else label="New password repeat" prop="passwordrepeat">
            <el-input class="input-clean" placeholder="Type here your new password again" v-model="settingsForm.passwordrepeat" show-password autocomplete="off"></el-input>
          </el-form-item>
          </div>

          <el-form-item>
            <el-button v-if="this.$session.get('lang') == 'fr'" type="ourprimary" @click="submitForm('settingsForm')">Modifier</el-button>
            <el-button v-else type="ourprimary" @click="submitForm('settingsForm')">Modify</el-button>
            <el-button type="ourdefault" @click="resetForm('settingsForm')">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <h2 class="pp-title" v-if="this.$session.get('lang') == 'fr'">Vous voulez une super photo de profil ?</h2>
      <h2 class="pp-title" v-else>Want a handsome profile picture?</h2>
      <div class="container">
        <div id="img-container">
          <img v-for="item in pictures" :key="item.src" :src=item.src @click="changepictures(item.src)">
        </div>
      </div>
    </div>
</template>

<script>

export default {
  name: "Search",
  data() {
      return {
        user_email: null,
        pictures: null,
        labelPosition: 'top',
        settingsForm: {
          name: '',
          email: '',
          password: '',
          passwordrepeat: ''
        },
        rules: {
          name: [
            { min: 3, message: 'Length shou', trigger: ["blur", "change"] }
          ],
          email: [
            {message: "Please input email address",  trigger: "blur" },
            {type: "email", message: "Please input correct email address", trigger: ["blur", "change"] }
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
    setlanguage(lang) {
        this.axios
          .put("https://localhost:5001/api/v1/users/user/"+this.$session.get('username'), {
            lang: lang
          })
          .then(response => {
            this.$session.set('lang', response.data.lang)
            document.location.reload();
          })
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if ((this.settingsForm.password == this.settingsForm.passwordrepeat) || (this.settingsForm.password == '' && this.settingsForm.passwordrepeat == ''))
            this.axios
              .put("https://localhost:5001/api/v1/users/user/"+this.$session.get('username'), {
                username: this.settingsForm.name,
                email: this.settingsForm.email,
                password: this.settingsForm.password
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
    this.axios
      .get('https://localhost:5001/api/v1/users/' + this.$session.get('username'))
      .then(response => {
        if (response.data !== null) {
          this.user_email = response.data.email
        }
      })
      console.log(this.$session.get('authProvider'))
  }
};
</script>