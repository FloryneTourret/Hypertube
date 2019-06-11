<template>
<el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
	<el-row :gutter="10">
		<el-col :sm="4">
			<el-menu-item index="1"><router-link to="/" class="hypertube">Hypertube</router-link></el-menu-item>
		</el-col>
		<el-col :sm="15">
			<el-menu-item index="2"><router-link to="/search"><span class="search"><font-awesome-icon icon="search" /></span> Search</router-link></el-menu-item>
		</el-col>
		<el-col :sm="5">
			<el-submenu index="3">
				<template slot="title">{{this.$session.get('username')}}</template>
				<el-menu-item index="3-1"><router-link to="/Profile">Profile</router-link></el-menu-item>
				<el-menu-item index="3-2" @click="logout()">Déconnexion</el-menu-item>
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
