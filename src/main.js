// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import store from './vuex/store'

import App from './App'
import router from './router'


import Buefy from 'buefy'
import 'buefy/lib/buefy.css'
Vue.use(Buefy);

//console.dir(Buefy);
//Vue.component(Buefy.Dialog.name, Buefy.Dialog);



router.beforeEach((to, from, next) => {
  "use strict";

  //console.log("DELME:----->router.beforeEach");
  if (to.query.jwt) {
    store.dispatch('setJwt', to.query.jwt); //把jwt放到vuex store中进行存储
    localStorage.jwt = to.query.jwt;
  } 
  else if (localStorage.jwt) {
    store.dispatch('setJwt', localStorage.jwt); //或者 localstorage中包含token
  }

  next();
})




Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})
