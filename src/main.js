import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router';
import './assets/css/global.css';
import axios from 'axios';
import VueQuillEditor from "vue-quill-editor";
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';

axios.defaults.baseURL='http://timemeetyou.com:8889/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization=window.sessionStorage.getItem('token');
  return config;
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.use(ElementUI);
Vue.use(VueQuillEditor);

Vue.filter('dateFormat',function (originVal) {
  const date = new Date(originVal);
  const y=date.getFullYear()
  const m=(date.getMonth()+1+'').padStart(2,'0')//不足两位数用0填充
  const d=(date.getDate()+'').padStart(2,'0')
  const hh=(date.getHours()+'').padStart(2,'0')
  const mm=(date.getMinutes()+'').padStart(2,'0')
  const ss=(date.getSeconds()+'').padStart(2,'0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  el:"#app",
  router,
  render: h => h(App),
}).$mount('#app')