<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-alert
                    title="添加商品信息"
                    type="info"
                    center
                    show-icon
                    :closable="false">
            </el-alert>
            <el-steps :space="200" :active="active-0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
                <el-tabs v-model="active" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item type="number" label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item type="number" label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item type="number" label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                    v-model="addForm.goods_cat"
                                    :options="cateList"
                                    :props="{ expandTrigger: 'hover',
                                      value:'cat_id',
                                      label:'cat_name',
                                      children:'children'}"
                                    @change="handleChange"
                                    clearable></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                                :action="uploadUrl"
                                :on-preview="handlePreview"
                                :on-remove="handleRemove"
                                list-type="picture"
                                drag
                                :headers="headerObj"
                                :on-success="handleSuccess">
                            <i class="el-icon-upload"></i>
                            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce">
                        </quill-editor>
                        <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <el-dialog
                title="图片预览"
                :visible.sync="previewVisible"
                width="50%">
            <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Add",
        data() {
            return {
                previewVisible:false,
                active: '0',
                uploadUrl: 'http://timemeetyou.com:8889/api/private/v1/upload',
                previewPath:'',
                //图片上传组件的headers请求头对象
                headerObj: {
                    Authorization: window.sessionStorage.getItem('token')
                },
                cateList: [],
                manyTableData: [],
                onlyTableData: [],
                addForm: {
                    goods_name: '',
                    goods_price: 0,
                    goods_weight: 0,
                    goods_number: 0,
                    goods_cat: [],
                    pics: [],
                    goods_introduce:'',
                    attrs:[]
                },
                addFormRules: {
                    goods_name: [{required: true, message: '请输入商品名称', trigger: 'blur'}],
                    goods_price: [{required: true, message: '请输入商品价格', trigger: 'blur'}],
                    goods_weight: [{required: true, message: '请输入商品重量', trigger: 'blur'}],
                    goods_number: [{required: true, message: '请输入商品数量', trigger: 'blur'}],
                    goods_cat: [{required: true, message: '请选择商品分类', trigger: 'blur'}]
                }
            }
        },
        created() {
            this.getCateList()
        },
        methods: {

            async getCateList() {
                const {data: res} = await this.$http.get('categories');
                if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
                this.cateList = res.data
                console.log(this.cateList)
            },
            handleChange() {
                console.log(this.addForm.goods_cat)

            },
            beforeTabLeave(activeName, oldActiveName) {
                console.log('离开' + oldActiveName)
                console.log('进入' + activeName)
                if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                    this.$message.error('请选择商品分类')
                    return false
                }
            },
            async tabClicked() {
                console.log(this.active)
                if (this.active === '1') {
                    const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,
                        {params: {sel: 'many'}});
                    if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
                    console.log(res.data)
                    res.data.forEach(item => {
                        item.attr_vals =
                            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
                    })
                    this.manyTableData = res.data
                } else if (this.active === '2') {
                    const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,
                        {params: {sel: 'only'}});
                    if (res.meta.status !== 200) return this.$message.error('获取静态属性失败')
                    this.onlyTableData = res.data
                }
            },
            handlePreview(file) {
                console.log(file)
                this.previewPath=file.response.data.url
                this.previewVisible=true
            },
            handleRemove(file) {
                //获取将要删除的图片的临时路径
                const filePath=file.response.data.tmp_path
                //从pics数组中找到这个图片对应的索引值
                const i = this.addForm.pics.findIndex(x =>
                    x.pic === filePath
                );
                //调用数组的splice()方法把图片信息对象从pics数组中移除
                this.addForm.pics.splice(i,1)
                console.log(this.addForm)
            },
            handleSuccess(response) {
                console.log(response)
                //拼接得到一个图片信息对象
                const picInfo = {pic: response.data.tmp_path}
                this.addForm.pics.push(picInfo)
                console.log(this.addForm)
            },
            add(){
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return this.$message.error('请填写必要的表单项')
                    //通过Json进行深拷贝
                    const form=JSON.parse(JSON.stringify(this.addForm));

                    form.goods_cat=form.goods_cat.join(',')

                    this.manyTableData.forEach(item => {
                        const newInfo={attr_id: item.attr_id,
                            attr_value: item.attr_vals.join(' ')}//参数数组拼接成字符串作为一个整体
                        this.addForm.attrs.push(newInfo)
                    })

                    this.onlyTableData.forEach(item => {
                        const newInfo={attr_id: item.attr_id,attr_value: item.attr_vals}
                        this.addForm.attrs.push(newInfo)
                    })
                    form.attrs=this.addForm.attrs
                    console.log(form)

                    const {data:res} = await this.$http.post('goods', form);
                    if (res.meta.status!==201) return this.$message.error('添加商品失败')
                    this.$message.success('添加商品成功')
                    await this.$router.push('/goods')
                })
            }
        },
        computed: {
            cateId() {
                if (this.addForm.goods_cat.length === 3)
                    return this.addForm.goods_cat[2]
                return null
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-checkbox {
        margin: 0 5px 0 0 !important;
    }
    .previewImg{
        width: 100%;
    }
    .addBtn{
        margin-top: 15px;
    }
</style>