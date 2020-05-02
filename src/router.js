import Vue from 'vue';
import Router from 'vue-router';
import Login from './components/Login';
import Pagination from "@/components/Pagination";
import Carousel from "@/components/Carousel";
import Test from "@/components/Test";
import Home from "@/components/Home";

Vue.use(Router)

const router = new Router({
    routes:[
        {path: '/',redirect: '/login'},
        {path: '/login',component:Login},
        {path: '/pagination',component: Pagination},
        {path: '/carousel',component: Carousel},
        {path: '/test',component: Test},
        {path: '/home',component: Home}
    ]
})

//挂载路由导航守卫
router.beforeEach((to,from,next) => {
    //to:将要访问的路径
    //from:从哪个路径跳转而来
    //next:函数，表示放行
    //next()无参直接放行  next("/login")强制跳转到该路径
    if (to.path==="/login") return next();
    //获取token
    const tokenStr = window.sessionStorage.getItem("token");
    if (!tokenStr) return next("/login");
    next();
})

export default router