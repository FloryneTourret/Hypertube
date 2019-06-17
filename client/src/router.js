import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/Login";
import Register from "./views/Register";
import Search from "./views/Search";
import ForgotPassword from "./views/ForgotPassword";
import Profile from "./views/Profile";
import Login42 from "./components/Login42";
import Register42 from "./components/Register42";

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
			path: "/login/callback",
			name: "login/42",
			component: Login42
		},
		{
			path: "/register",
			name: "register",
			component: Register
		},
		{
			path: "/register/callback",
			name: "register/42",
			component: Register42
		},
		{
			path: "/forgotPassword",
			name: "forgotPassword",
			component: ForgotPassword
		},
		{
			path: "/profile/:username",
			name: "profile",
			component: Profile
		}
	]
});