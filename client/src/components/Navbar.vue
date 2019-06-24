<template>
<el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
	<el-row :gutter="10">
		<el-col :sm="19">
			<el-menu-item index="1"><router-link to="/" class="hypertube">Hypertube</router-link></el-menu-item>
		</el-col>
		<el-col :sm="5">
			<el-submenu index="3">
				<template slot="title"><img class="picture-profile" :src="'http://localhost:8080/'+this.$session.get('picture')" alt="">{{this.$session.get('username')}}</template>
				<a :href="'/Profile/'+this.$session.get('username')"><el-menu-item index="3-1">
					<span v-if="this.$session.get('lang') == 'fr'">Mon profil</span>
					<span v-else >My profile</span>
				</el-menu-item></a>
				<!-- <el-menu-item index="3-2">Change profile</el-menu-item> -->
				<el-menu-item index="3-3" @click="logout()">
					<span v-if="this.$session.get('lang') == 'fr'">Déconnexion</span>
					<span v-else>Logout</span>
				</el-menu-item>
			</el-submenu>
		</el-col>
	</el-row>
</el-menu>
</template>
<script>
export default {
  data() {
    return {
      activeIndex: "1",
      activeIndex3: "1"
    };
  },
  methods: {
    handleSelect(key, keyPath) {
    },
    logout() {
      this.$session.destroy();
      this.$router.push("/login");
    }
	}
};
</script>
