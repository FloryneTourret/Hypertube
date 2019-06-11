import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/Login";
import Register from "./views/Register";
import Search from "./views/Search";
import ForgotPasswords from "./views/ForgotPassword";

Vue.use(Router);

export default new Router({
	mode: "history",
	base: process.env.BASE_URL,
	routes: [{
			path: "/",
			name: "home",
			component: Home
		},
		{
			path: "/search",
			name: "search",
			component: Search
		},
		{
			path: "/login",
			name: "login",
			component: Login
		},
		{
			path: "/register",
			name: "register",
			component: Register
		}
		,
		{
			path: "/forgotPassword",
			name: "forgotPassword",
			component: ForgotPasswords
		}
	]
});