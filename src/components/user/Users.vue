<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card class="box-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
                </el-col>
            </el-row>

            <el-table :data="userList" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态" prop="mg_state">
                    <template v-slot="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                                   @click="showEditDialog(scope.row.id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                   @click="removeUserById(scope.row.id)"></el-button>
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"
                                       @click="showSetRoleDialog(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    layout="prev, pager, next, total, jumper"
                    :total="total"
                    background
                    :hide-on-single-page="true"
                    prev-text="上一页"
                    next-text="下一页"
                    :pager-count="7">
            </el-pagination>

            <el-dialog
                    title="添加用户"
                    :visible.sync="addDialogVisible"
                    width="50%" @close="addDialogClosed">
                <el-divider></el-divider>
                <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="addForm.username"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="addForm.password" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="addForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="手机" prop="mobile">
                        <el-input v-model="addForm.mobile"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
                </span>
            </el-dialog>

            <el-dialog
                    title="修改用户"
                    :visible.sync="editDialogVisible"
                    width="50%" @close="editDialogClosed">
                <el-divider></el-divider>
                <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                    <el-form-item label="用户名">
                        <el-input v-model="editForm.username" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="editForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="手机号" prop="mobile">
                        <el-input v-model="editForm.mobile"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editUser">确 定</el-button>
                </span>
            </el-dialog>

            <el-dialog
                    title="分配角色"
                    :visible.sync="setRoleDialogVisible"
                    width="50%" @close="setRoleDialogClosed">
                <p>当前的用户:{{userInfo.username}}</p>
                <p>当前的角色:{{userInfo.role_name}}</p>
                <el-select v-model="selectedRoleId" placeholder="请选择">
                    <el-option v-for="item in roleList" :key="item.id"
                               :label="item.roleName" :value="item.id">
                    </el-option>
                </el-select>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="setRole">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "Users",
        data() {
            //自定义验证（正则表达式）
            const checkEmail = (rule, value, callback) => {
                const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
                if (regEmail.test(value)) return callback();
                callback(new Error('请输入合法的邮箱'))
            }
            const checkMobile = (rule, value, callback) => {
                const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
                if (regMobile.test(value)) return callback();
                callback(new Error('请输入合法的手机号'))
            }

            return {
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                userList: [],
                total: 0,

                addDialogVisible: false,
                editDialogVisible: false,
                setRoleDialogVisible:false,

                userInfo:{
                    username:'',
                    role_name:''
                },
                roleList:[],
                selectedRoleId:'',

                //添加用户的表单数据
                addForm: {
                    username: '',
                    password: '',
                    email: '',
                    mobile: ''
                },
                addFormRules: {
                    username: [
                        {required: true, message: "请输入用户名", trigger: "blur"},
                        {min: 5, max: 15, message: "长度在 5 到 15 个字符", trigger: 'blur'}],
                    password: [
                        {required: true, message: "请输入密码", trigger: "blur"},
                        {min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: 'blur'}],
                    email: [
                        {required: true, message: "请输入邮箱", trigger: "blur"},
                        {validator: checkEmail, trigger: "blur"}],
                    mobile: [
                        {required: true, message: "请输入手机号", trigger: "blur"},
                        {validator: checkMobile, trigger: "blur"}
                    ]
                },
                editForm:{
                    username:'',
                    password:'',
                    email:'',
                    mobile:''
                },
                editFormRules:{
                    email:[{required:true, message:'请输入邮箱',trigger: 'blur'},
                        {validator: checkEmail, trigger: 'blur'}],
                    mobile:[{required:true, message:'请输入手机号',trigger:'blur'},
                        {validator: checkMobile, trigger: 'blur'}]
                }
            }
        },
        created() {
            this.getUserList()
        },
        methods: {
            async getUserList() {
                const {data: res} = await this.$http.get('users', {params: this.queryInfo});
                if (res.meta.status !== 200)
                    return this.$message.error("获取用户列表失败")
                this.userList = res.data.users
                this.total = res.data.total
            },
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getUserList()
            },
            async userStateChange(userInfo) {
                const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
                if (res.meta.status !== 200) {
                    userInfo.mg_state = !userInfo.mg_state
                    return this.$message.error("更新用户状态失败")
                }
                this.$message.success("更新用户状态成功")
            },
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            //添加预校验
            addUser() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return
                    const {data: res} = await this.$http.post('users', this.addForm);
                    if (res.meta.status !== 201) return this.$message.error("添加用户失败")
                    this.$message.success("添加用户成功")
                    //隐藏对话框
                    this.addDialogVisible = false;
                    //重新获取用户列表
                    await this.getUserList()
                })
            },
            async showEditDialog(id) {
                const {data:res} = await this.$http.get('users/'+id);
                if (res.meta.status!==200) return this.$message.error("查询用户信息失败")
                this.editForm=res.data
                this.editDialogVisible = true
            },
            async showSetRoleDialog(userInfo){
                this.userInfo=userInfo
                const {data:res} = await this.$http.get('roles');
                if (res.meta.status!==200) return this.$message.error('获取角色列表失败')
                this.roleList=res.data
                this.setRoleDialogVisible=true
            },
            editDialogClosed(){
                this.$refs.editFormRef.resetFields()
            },
            editUser(){
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) return
                    //修改使用put方式
                    const {data:res} = await this.$http.put('users/'+this.editForm.id,
                        {email:this.editForm.email,mobile:this.editForm.mobile});
                    if (res.meta.status!==200) return this.$message.error('更新用户信息失败')

                    //关闭对话框
                    this.editDialogVisible=false;
                    //刷新数据列表
                    await this.getUserList()
                    //提示修改成功
                    this.$message.success('更新用户信息成功')
                })
            },
            async removeUserById(id) {
                const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err);
                if (confirmResult!=='confirm') return this.$message.info('已取消删除')
                const {data:res} = await this.$http.delete('users/'+id);
                if (res.meta.status!==200) return this.$message.error('删除用户失败')
                this.$message.success('删除用户成功')
                await this.getUserList()
            },
            async setRole(){
                if (!this.selectedRoleId) return this.$message.error('请选择要分配的角色')
                const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,
                    {rid: this.selectedRoleId});
                if (res.meta.status!==200) return this.$message.error('更新角色失败')
                this.$message.success('更新角色成功')
                await this.getUserList()
                this.setRoleDialogVisible=false
            },
            setRoleDialogClosed(){
                this.selectedRoleId=''
                this.userInfo={}
            }
        }
    }
</script>

<style lang="less" scoped>
</style>