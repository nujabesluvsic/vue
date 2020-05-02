<template>
    <el-carousel
            style="width: 1000px;text-align: center;margin: 0 auto;"
            height="750px"
            indicator-position="outside">
        <el-carousel-item v-for="item in imgBox" :key="item.id">
            <el-image style="height: 700px;width: 1000px;margin: 0 auto"
                      :src="item.url" alt="" fit="contain"></el-image>
        </el-carousel-item>
    </el-carousel>
</template>

<script>
    // require imgUrl from "./assets/img/01.jpg"
    export default {
        name:'carousel',
        data(){
            return {
                imgBox:[
                    {id:1,url:require("../assets/img/01.jpg")},
                    {id:2,url:require("../assets/img/02.jpg")},
                    {id:3,url:require("../assets/img/03.jpg")}]
            }
        }
    }
</script>

<style>

</style>