import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueSession from 'vue-session'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import { library } from '@fortawesome/fontawesome-svg-core'
//Ici ajouter les icons dont on a besoin
import { faSearch, faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { dom } from '@fortawesome/fontawesome-svg-core'

import Axios from 'axios';

//Ici ajouter les icons chargés au dessus
library.add(faSearch, faStar)

Vue.use(ElementUI);
Vue.use(VueSession);
Vue.config.productionTip = false;

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false

dom.watch()

Vue.prototype.axios = Axios;

var vm = new Vue({
	router,
	store,
	render: h => h(App)
}).$mount("#app");