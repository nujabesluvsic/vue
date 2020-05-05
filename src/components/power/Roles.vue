<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
                </el-col>
            </el-row>
            <el-table :data="roleList" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']"
                                v-for="(item1,i1) in scope.row.children" :key="item1.id">
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-row :class="[i2===0?'':'bdtop','vcenter']"
                                        v-for="(item2,i2) in item1.children"
                                        :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">
                                            {{item2.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag v-for="(item3) in item2.children" :key="item3.id"
                                                type="warning" closable @close="removeRightById(scope.row,item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit"
                                   @click="showEditDialog(scope.row.id)">编辑
                        </el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete"
                                   @click="removeRoleById(scope.row.id)">删除
                        </el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting"
                                   @click="showSetRightDialog(scope.row)">分配权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog
                    title="添加角色"
                    :visible.sync="addDialogVisible"
                    width="50%" @close="addDialogClosed">
                <el-divider></el-divider>
                <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="addForm.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="roleDesc">
                        <el-input v-model="addForm.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
                </span>
            </el-dialog>

            <el-dialog
                    title="修改角色"
                    :visible.sync="editDialogVisible"
                    width="50%" @close="editDialogClosed">
                <el-divider></el-divider>
                <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="editForm.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="roleDesc">
                        <el-input v-model="editForm.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editRole">确 定</el-button>
                </span>
            </el-dialog>

            <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%"
            @close="setRightDialogClosed">
                <el-tree :data="this.rightsList" :props="treeProps" ref="treeRef"
                         show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys"></el-tree>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="setRightDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submitRights">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "Roles",
        data() {
            return {
                roleList: [],
                addDialogVisible: false,
                editDialogVisible: false,
                setRightDialogVisible:false,
                addForm: {
                    roleId: '',
                    roleName: '',
                    roleDesc: ''
                },
                editForm: {
                    roleId: '',
                    roleName: '',
                    roleDesc: ''
                },

                rightsList:[],
                treeProps:{
                    children:'children',
                    label:'authName'
                },
                defKeys:[],
                roleId:'',

                addFormRules: {
                    roleName: [{required: true, message: "请输入角色名称", trigger: "blur"}],
                    roleDesc: [{required: true, message: "请输入角色描述", trigger: "blur"}],
                },
                editFormRules: {
                    roleName: [{required: true, message: "请输入角色名称", trigger: "blur"}],
                    roleDesc: [{required: true, message: "请输入角色描述", trigger: "blur"}],
                }
            }
        },
        created() {
            this.getRoleList()
        },
        methods: {
            async getRoleList() {
                const {data: res} = await this.$http.get('roles');
                if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
                this.roleList = res.data
            },
            async removeRightById(role, rid) {
                const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(error => error);
                if (confirmResult !== 'confirm') return this.$message.info('取消了删除')
                const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rid}`);
                if (res.meta.status !== 200) return this.$message.error('删除权限失败')

                //会刷新页面所以不用
                // await this.getRoleList()
                role.children = res.data
            },
            async showEditDialog(id) {
                const {data: res} = await this.$http.get('roles/' + id);
                if (res.meta.status !== 200) return this.$message.error("查询角色信息失败")
                this.editForm = res.data
                this.editDialogVisible = true
            },
            async showSetRightDialog(role) {
                this.roleId=role.id;
                const {data: res} = await this.$http.get('rights/tree');
                if (res.meta.status !== 200) return this.$message.error("查询权限信息失败")
                this.rightsList = res.data
                this.getDefKeys(role,this.defKeys)
                this.setRightDialogVisible = true
            },
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            editDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            addRole() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return
                    const {data: res} = await this.$http.post('roles', this.addForm);
                    if (res.meta.status !== 201) return this.$message.error("添加角色失败")
                    this.$message.success("添加角色成功")
                    this.addDialogVisible = false;
                    await this.getRoleList()
                })
            },
            editRole() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) return
                    //修改使用put方式
                    const {data: res} = await this.$http.put('roles/' + this.editForm.roleId,
                        {roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc});
                    if (res.meta.status !== 200) return this.$message.error('更新角色信息失败')

                    //关闭对话框
                    this.editDialogVisible = false;
                    //刷新数据列表
                    await this.getRoleList()
                    //提示修改成功
                    this.$message.success('更新角色信息成功')
                })
            },
            async removeRoleById(id) {
                const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err);
                if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
                const {data: res} = await this.$http.delete('roles/' + id);
                if (res.meta.status !== 200) return this.$message.error('删除角色失败')
                this.$message.success('删除角色成功')
                await this.getRoleList()
            },
            //递归遍历role对象中的权限节点
            getDefKeys(node,arr){
                //如果当前节点没有children，则node为最后一级权限
                if (!node.children) return arr.push(node.id)
                node.children.forEach(item =>
                this.getDefKeys(item,arr))
            },
            setRightDialogClosed(){
                this.defKeys=[];
            },
            async submitRights(){
                const keys=[
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()]
                const idStr=keys.join(',')
                const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr});
                if (res.meta.status!==200) return this.$message.error('分配权限失败')
                this.$message.success('分配权限成功')
                await this.getRoleList();
                this.setRightDialogVisible=false
            }
        }
    }

</script>

<style lang="less" scoped>
    .el-tag {
        margin: 7px;
    }

    .bdtop {
        border-top: 1px solid #eee;
    }

    .bdbottom {
        border-bottom: 1px solid #eee;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>