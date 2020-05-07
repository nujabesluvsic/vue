import Vue from 'vue';
import Router from 'vue-router';
import Login from './components/Login';
import Welcome from "@/components/Welcome";
import Home from "@/components/Home";
import Users from "@/components/user/Users";
import Roles from "@/components/power/Roles";
import Rights from "@/components/power/Rights";
import Cate from "@/components/goods/Cate";

Vue.use(Router)

const router = new Router({
    routes: [
        {path: '/', redirect: '/login'},
        {path: '/login', component: Login},
        {
            path: '/home', component: Home,
            redirect: '/welcome',
            children: [{path: '/welcome', component: Welcome},
                {path: '/users', component: Users},
                {path: '/roles',component: Roles},
                {path: '/rights',component: Rights},
                {path: '/categories',component: Cate}
            ]
        }
    ]
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
    //to:将要访问的路径
    //from:从哪个路径跳转而来
    //next:函数，表示放行
    //next()无参直接放行  next("/login")强制跳转到该路径
    if (to.path === "/login") return next();
    //获取token
    const tokenStr = window.sessionStorage.getItem("token");
    if (!tokenStr) return next("/login");
    next();
})

export default router