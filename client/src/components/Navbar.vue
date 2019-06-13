<template>
<el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
	<el-row :gutter="10">
		<el-col :sm="19">
			<el-menu-item index="1"><router-link to="/" class="hypertube">Hypertube</router-link></el-menu-item>
		</el-col>
		<el-col :sm="5">
			<el-submenu index="3">
				<template slot="title">{{this.$session.get('username')}}</template>
				<el-menu-item index="3-1"><router-link :to="'/Profile/'+this.$session.get('username')">Profile</router-link></el-menu-item>
				<el-menu-item index="3-2">Changer de profile</el-menu-item>
				<el-menu-item index="3-3" @click="logout()">Déconnexion</el-menu-item>
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
