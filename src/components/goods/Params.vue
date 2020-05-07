<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-alert
                    title="注意：只允许为第三级分类设置相关参数！"
                    type="warning" :closable="false" show-icon>
            </el-alert>
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader
                            v-model="selectedKeys"
                            :options="cateList"
                            :props="{ expandTrigger: 'hover',
                                      value:'cat_id',
                                      label:'cat_name',
                                      children:'children'}"
                            @change="handleChange"
                            clearable></el-cascader>
                </el-col>
            </el-row>
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                               @click="addDialogVisible=true">添加参数</el-button>
                    <el-table :data="manyTableData" border stripe>
                        <el-table-column type="expand">
                            <template v-slot="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                                @close="handleClose(i,scope.row)">
                                    {{item}}
                                </el-tag>
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small"
                                           @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit"
                                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete"
                                           @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                               @click="addDialogVisible=true">添加属性</el-button>
                    <el-table :data="onlyTableData" border stripe>
                        <el-table-column type="expand">
                            <template v-slot="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                                        @close="handleClose(i,scope.row)">
                                    {{item}}
                                </el-tag>
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small"
                                           @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit"
                                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete"
                                           @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <el-dialog :title="'添加'+titleText"
                   :visible.sync="addDialogVisible"
                   width="50%" @close="addDialogClosed">
            <el-divider></el-divider>
            <el-form :model="addForm" :rules="dynamicRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible=false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog :title="'修改'+titleText"
                   :visible.sync="editDialogVisible"
                   width="50%" @close="editDialogClosed">
            <el-divider></el-divider>
            <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible=false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Params",
        data(){
            return{
                cateList:[],
                selectedKeys:[],
                activeName:'many',
                manyTableData:[],
                onlyTableData:[],

                addDialogVisible:false,
                editDialogVisible:false,

                addForm:{
                    attr_name:'',
                    attr_sel:''
                },
                editForm:{
                    attr_name:'',
                    attr_sel:''
                },
                formRules:{},
                manyRules:{
                    attr_name:[{required:true,message:`请输入参数名称`,trigger:'blur'}]
                },
                onlyRules:{
                    attr_name:[{required:true,message:`请输入属性名称`,trigger:'blur'}]
                }
            }
        },
        created(){
            this.getCateList()
        },
        methods:{
            async getCateList(){
                const {data: res} = await this.$http.get('categories');
                if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
                this.cateList = res.data
                this.total = res.data.total
            },
            handleChange(){
                this.getParamsData()
            },
            async getParamsData(){
                //防止清空商品分类之后，表格数据残留，引起错误
                if (this.selectedKeys.length!==3){
                    this.selectedKeys=[]
                    this.manyTableData=[]
                    this.onlyTableData=[]
                    return
                }

                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,
                    {params: {sel: this.activeName}});
                if (res.meta.status!==200) return this.$message.error('获取参数列表失败')

                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                    //每一行数据的tag显示状态和内容
                    item.inputVisible=false
                    item.inputValue=''
                })
                console.log(res.data)

                if (this.activeName==='many'){
                    this.manyTableData=res.data
                }else {
                    this.onlyTableData=res.data
                }
            },
            handleTabClick(){
                this.getParamsData()
            },
            addParams(){
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return
                    const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,
                        {attr_name: this.addForm.attr_name, attr_sel: this.activeName});
                    if (res.meta.status!==201) return this.$message.error('添加数据失败')
                    this.$message.success('添加数据成功')
                    this.addDialogVisible=false
                    await this.getParamsData()
                })
            },
            editParams(){
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) return
                    const {data:res} =
                        await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                        {attr_name: this.editForm.attr_name, attr_sel: this.activeName});
                    if (res.meta.status!==200) return this.$message.error('修改数据失败')
                    this.$message.success('修改数据成功')
                    this.editDialogVisible=false
                    await this.getParamsData()
                })
            },
            addDialogClosed(){
                this.$nextTick(() =>{
                    this.$refs.addFormRef.resetFields()
                })
            },
            editDialogClosed(){
                this.$refs.editFormRef.resetFields()
            },
            async showEditDialog(attr_id){
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
                    {params: {attr_sel: this.activeName}});
                if (res.meta.status!==200) return this.$message.error('获取数据失败')
                this.editForm=res.data
                this.editDialogVisible=true
            },
            async removeParams(attr_id){
                const confirmResult = await this.$alert('此操作将永久删除该参数，是否继续？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err);
                if (confirmResult!=='confirm') return this.$message.info('已取消删除')
                const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`);
                if (res.meta.status!==200) return this.$message.error('删除参数失败')
                this.$message.success('删除参数成功')
                await this.getParamsData()
            },
            async handleInputConfirm(row) {
                if (row.inputValue.trim().length === 0) {
                    row.inputValue = ''
                    row.inputVisible = false
                    return
                }
                //把文本框内容添加到前端本地数据中，然后重置文本框内容
                row.attr_vals.push(row.inputValue.trim())
                row.inputValue=''
                row.inputVisible=false
                await this.saveAttrVals(row)
            },
            showInput(row){
                row.inputVisible=true
                //文本框自动获得焦点
                //$nextTick，当页面上的元素被重新渲染之后，才会指定回调函数中的代码
                this.$nextTick(() => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            handleClose(i,row){
                row.attr_vals.splice(i,1)
                this.saveAttrVals(row)
            },
            async saveAttrVals(row){
                //向后端发送请求
                const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
                    {
                        attr_name:row.attr_name,
                        attr_sel:row.attr_sel,
                        attr_vals:row.attr_vals.join(',')
                    });

                if (res.meta.status!==200) return this.$message.error('修改参数项失败')
                this.$message.success('修改参数项成功')
            }
        },
        computed:{
            isBtnDisabled(){
                return this.selectedKeys.length === 0
            },
            cateId(){
                if (this.selectedKeys.length===3){
                    return this.selectedKeys[2]
                }else {
                    return null
                }
            },
            titleText(){
                if (this.activeName==='many'){
                    return '动态参数'
                }else {
                    return '静态属性'
                }
            },
            dynamicRules(){
                if (this.activeName==='many'){
                    return this.manyRules
                }else {
                    return this.onlyRules
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    .cat_opt{
        margin: 15px 0;
    }
    .el-tag{
        margin: 10px;
    }
    .input-new-tag{
        width: 120px;
    }
</style>