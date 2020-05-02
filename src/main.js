import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router';
import './assets/css/global.css';
import axios from 'axios';

axios.defaults.baseURL='http://timemeetyou.com:8889/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.use(ElementUI);

new Vue({
  el:"#app",
  router,
  render: h => h(App),
}).$mount('#app')
