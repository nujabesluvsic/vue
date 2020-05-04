<template>
    <el-pagination
            background
            :hide-on-single-page="true"
            :page-size="20"
            :pager-count="8"
            :prev-text="str"
            layout="prev, pager, next, total, jumper"
            :total="1000">
    </el-pagination>
</template>

<script>
    export default {
        name:"pagination",
        data(){
            return {
                str:"上一页"
            }
        }
    }
</script>

<style scoped>

</style>