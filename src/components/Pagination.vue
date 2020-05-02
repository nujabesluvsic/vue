<template>
    <el-pagination
            background
            :hide-on-single-page="true"
            :page-size="20"
            :pager-count="8"
            :prev-text="上一页"
            layout="prev, pager, next, total, jumper"
            :total="1000">
    </el-pagination>
</template>

<script>
    export default {
        name:"pagination",
    }
</script>

<style scoped>

</style>