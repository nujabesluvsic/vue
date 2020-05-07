<template>
    <el-container class="home-container">
        <el-header height="120px">
            <div>
                <img src="../assets/img/red_hat.png" alt="">
                <span>后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <el-aside :width="isCollapsed ? '64px' : '200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!--侧边菜单-->
                <el-menu active-text-color="orange" unique-opened
                         :collapse="isCollapsed" :collapse-transition="false" router>
                    <!--一级菜单-->
                    <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
                        <!--一级菜单模板区域-->
                        <template slot="title">
                            <i :class="iconObj[item.id]"></i>
                            <!--文本-->
                            <span>{{item.authName}}</span>
                        </template>
                        <!--二级菜单-->
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <!--文本-->
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        name: "Home",
        data(){
            return {
                menuList:[],
                iconObj:{
                    '125':'el-icon-user',
                    '103':'el-icon-s-check',
                    '101':'el-icon-goods',
                    '102':'el-icon-s-order',
                    '145':'el-icon-data-line'
                },
                isCollapsed:false
            }
        },
        created(){
            this.getMenuList();
        },
        methods: {
            logout() {
                window.sessionStorage.clear();
                this.$router.push("/login");
            },
            async getMenuList(){
                const {data:res} = await this.$http.get("menus");
                if (res.meta.status!==200) return this.$message.error(res.meta.msg);
                this.menuList=res.data;
            },
            toggleCollapse(){
                this.isCollapsed=!this.isCollapsed;
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-header{
        background-color: lightskyblue;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 20px;
        > div{
            display: flex;
            align-items: center;
            span{
                margin-left: 15px;
            }
        }
    }
    .el-aside{
        background-color: aquamarine;
        .el-menu{
            background-color: lightgray;
            border-right: none;
        }
    }
    .el-main{
        background-color: lemonchiffon;
    }
    .home-container{
        height: 100%;
    }
    .iconfont{
        margin-right: 10px;
    }
    .toggle-button{
        background-color: pink;
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: .2em;
        cursor: pointer;
    }
</style>