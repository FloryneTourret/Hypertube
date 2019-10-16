import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/Login";
import Register from "./views/Register";
import ForgotPassword from "./views/ForgotPassword";
import Profile from "./views/Profile";
import Settings from "./views/Settings";
import Player from "./views/Player";
import Login42 from "./auth/Login42";
import Github from "./auth/Github";
import NotFound from "./views/404"

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
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
      path: "/github/callback",
      name: "github",
      component: Github
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
	  },
	  {
		  path: "/profile/*/*",
		  name: "profile/404",
		  component: NotFound
	},
    {
      path: "/settings",
      name: "settings",
      component: Settings
    },
    {
      path: "/video",
      name: "player",
      component: Player
	  },
	{
		path: '/404',
		component: NotFound
	}, {
		path: '*',
		redirect: '/404'
	},
  ]
});
