<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="doSearch"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            <el-table :data="goodsList" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格（元）" prop="goods_price" width="110px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="140">
                    <template v-slot="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                                   @click="showEditDialog(scope.row.id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                   @click="removeGoodById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    background
                    :page-size="queryInfo.pagesize"
                    layout="prev, pager, next, total, jumper"
                    :pager-count="7"
                    :total="total">
                prev-text="上一页"
                next-text="下一页"
            </el-pagination>


        </el-card>
    </div>
</template>

<script>
    export default {
        name: "List",
        data(){
            return {
                queryInfo: {
                    query:'',
                    pagenum:1,
                    pagesize:10
                },
                goodsList:[],
                total:0
            }
        },
        created(){
            this.getGoodsList()
        },
        methods:{
            async getGoodsList(){
                const {data:res} = await this.$http.get('goods', {params: this.queryInfo});
                if (res.meta.status!==200) return this.$message.error('获取商品列表失败')
                this.$message.success('获取商品列表成功')
                console.log(res.data)
                this.goodsList=res.data.goods
                this.total=res.data.total
            },
            handleCurrentChange(newPage){
                this.queryInfo.pagenum = newPage
                this.getGoodsList()
            },
            doSearch(){
                this.queryInfo.pagenum=1
                this.getGoodsList()
            },
            async removeGoodById(id){
                const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err);
                if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
                const {data: res} = await this.$http.delete('goods/' + id);
                if (res.meta.status !== 200) return this.$message.error('删除商品失败')
                this.$message.success('删除商品成功')
                await this.getGoodsList()
            },
            goAddPage(){
                this.$router.push('/goods/add')
            }
        }
    }
</script>

<style scoped>

</style>