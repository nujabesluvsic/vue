<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="box-card">
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <el-table :data="cateList"
                      style="width: 100%;margin-bottom: 20px;"
                      row-key="cat_id"
                      border
                      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="分类名称" prop="cat_name"></el-table-column>
                <el-table-column label="是否有效" prop="cat_deleted">
                    <template v-slot="scope">
                        <i class="el-icon-success" v-if="scope.row.cat_deleted===false"
                           style="color: lightgreen"></i>
                        <i class="el-icon-err" v-else
                           style="color: red"></i>
                    </template>
                </el-table-column>
                <el-table-column label="排序" prop="cat_level">
                    <template v-slot="scope">
                        <el-tag size="mini"
                                v-if="scope.row.cat_level===0">一级
                        </el-tag>
                        <el-tag size="mini" type="success"
                                v-else-if="scope.row.cat_level===1">二级
                        </el-tag>
                        <el-tag size="mini" type="warning"
                                v-else>三级
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                                   @click="showEditDialog(scope.row.id)">编辑
                        </el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                   @click="removeUserById(scope.row.id)">删除
                        </el-button>
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

        <el-dialog
                title="添加分类"
                :visible.sync="addDialogVisible"
                width="50%" @close="addCateDialogClosed">
            <el-divider></el-divider>
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <el-cascader
                            v-model="selectedKeys"
                            :options="parentCateList"
                            :props="{ expandTrigger: 'hover',
                                      value:'cat_id',
                                      label:'cat_name',
                                      children:'children',
                                      checkStrictly:true}"
                            @change="parentCateChange"
                            clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Cate",
        data() {
            return {
                queryInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                cateList: [],
                total: 0,

                addDialogVisible: false,

                addCateFormRules: {
                    cat_name: [{required:true,message:'请输入分类名称',trigger:'blur'}],
                },
                addCateForm: {
                    cat_pid:0,
                    cat_name: '',
                    //默认添加一级分类
                    cat_level:0
                },
                parentCateList:[],
                selectedKeys:[],
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            async getCateList() {
                const {data: res} = await this.$http.get('categories', {params: this.queryInfo});
                if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
                console.log(res.data)
                this.cateList = res.data.result
                this.total = res.data.total
            },
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getCateList()
            },
            addCateDialogClosed() {
                this.$refs.addCateFormRef.resetFields()
                this.selectedKeys=[]
                this.addCateForm.cat_level=0
                this.addCateForm.cat_pid=0
            },
            showAddCateDialog() {
                //加载级联选择器内容
                this.getParentCateList()
                this.addDialogVisible = true
            },
            addCate() {
                this.$refs.addCateFormRef.validate(async valid => {
                    if (!valid) return
                    const {data:res} = await this.$http.post('categories',this.addCateForm);
                    if (res.meta.status!==201) return this.$message.error('添加分类失败')
                    this.$message.success('添加分类成功')
                    await this.getCateList()
                    this.addDialogVisible = false
                })
            },
            async getParentCateList(){
                const {data:res} = await this.$http.get('categories', {params: {type: 2}});
                console.log(res.data)
                if (res.meta.status!==200) return this.$message.error('获取父级分类数据失败')
                this.parentCateList=res.data
            },
            parentCateChange(){
                console.log(this.selectedKeys)
                if (this.selectedKeys.length>0) {
                    this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                    this.addCateForm.cat_level = this.selectedKeys.length
                }else{
                    this.addCateForm.cat_pid=0
                    this.addCateForm.cat_level=0
                }
            }
        }
    }
</script>

<style lang="less" scoped>

</style>