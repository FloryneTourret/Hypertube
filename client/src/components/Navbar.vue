<template>
<el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
	<el-row :gutter="10">
		<el-col :xs="8" :sm="6" :md="4" :lg="3" :xl="1">
			<el-menu-item index="1"><router-link to="/" class="hypertube">Hypertube</router-link></el-menu-item>
		</el-col>
		<el-col :xs="8" :sm="12" :md="16" :lg="18" :xl="22">
			<el-menu-item index="2"><router-link to="/search"><span class="search"><font-awesome-icon icon="search" /></span> Search</router-link></el-menu-item>
		</el-col>
		<el-col :xs="8" :sm="6" :md="4" :lg="3" :xl="1">
			<el-submenu index="3" v-if="this.$session.exists()">
				<template slot="title">{{this.$session.get('username')}}</template>
				<el-menu-item index="3-1"><router-link to="/Profile">Profile</router-link></el-menu-item>
				<el-menu-item index="3-2" @click="logout()">Déconnexion</el-menu-item>
			</el-submenu>
			<el-submenu index="3" v-else>
				<template slot="title">Account</template>
				<el-menu-item index="3-1"><router-link to="/register">Register</router-link></el-menu-item>
				<el-menu-item index="3-2"><router-link to="/login">Log In</router-link></el-menu-item>
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
      // console.log(key, keyPath);
    },
    logout() {
			// localStorage.removeItem("id");
      this.$session.destroy();
      this.$router.push("/login");
    }
	}
};
</script>
