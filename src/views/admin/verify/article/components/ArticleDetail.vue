<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">

      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm(1)">
          过审
        </el-button>
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm(3)">
          待定
        </el-button>
        <el-button v-loading="loading" type="warning" @click="submitForm(2)">
          驳回
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <material-input v-model="postForm.title">
                标题
              </material-input>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="作者:" class="postInfo-container-item">
                    <el-input v-model="postForm.author" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="审阅人:" class="postInfo-container-item">
                    <el-input v-model="postForm.reviewer" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          <Editor
            :id="postForm.id"
            ref="editor"
            v-model="postForm.article"
            :init="editorInit"
            :disabled="isEditorDisabled"
            @input="handleInput"
            @onClick="handleClick"
            :height="400"
          />
          <div class="ext-btn" style="margin-top: 30px; float: right">
            <el-button type="danger" @click="clearClick">清空内容</el-button>
            <el-button @click="disableClick">{{ !isEditorDisabled ? '禁用' : '启用' }}</el-button>
          </div>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
  import axios from 'axios'
  // 引入组件
  import tinymce from 'tinymce/tinymce'
  import Editor from '@tinymce/tinymce-vue'
  // 引入富文本编辑器主题的js和css
  import 'tinymce/themes/silver/theme.min.js'
  import 'tinymce/skins/ui/oxide/skin.min.css'
  // 扩展插件
  import 'tinymce/plugins/image'
  import 'tinymce/plugins/link'
  import 'tinymce/plugins/code'
  import 'tinymce/plugins/table'
  import 'tinymce/plugins/lists'
  import 'tinymce/plugins/paste'
  // 字数统计插件
  import 'tinymce/plugins/wordcount'
  import MaterialInput from '@/components/MaterialInput'
  import Sticky from '@/components/Sticky' // 粘性header组件
  import WebArticleApi from "@/api/website/WebArticleApi";
  const defaultForm = {
    id: undefined,
    status: '',
    title: '', // 文章题目
    article: '', // 文章内容
    author: '', // 文章作者
    reviewer: '' // 文章审核人
  }
  export default {
    components: { Editor,MaterialInput,Sticky },
    props: {
      isEdit: {
        type: Boolean,
        default: false
      },
      plugins: {
        type: [String, Array],
        default: 'link lists image code table wordcount paste'
      },
      toolbar: {
        type: [String, Array],
        default: 'bold italic underline strikethrough | fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent blockquote | undo redo | link unlink image code | removeformat'
      },
      menubar: {
        type: String,
        default: 'file edit insert view format table'
      },
      height: {
        type: [Number, String],
        required: false,
        default: 360
      },
      width: {
        type: [Number, String],
        required: false,
        default: 'auto'
      },
    },
    accept: {
      default: 'image/jpeg, image/png, image/jpg, image/gif',
      type: String
    },
    data() {
      const validateRequire = (rule, value, callback) => {
        if (value === '') {
          this.$message({
            message: rule.field + '为必传项',
            type: 'error'
          })
          callback(new Error(rule.field + '为必传项'))
        } else {
          callback()
        }
      }
      return {
        _isEdit: true,
        type: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
        status: '',
        postForm: Object.assign({}, defaultForm),
        loading: false,
        isEditorDisabled: false,
        rules: {
          title: [{ validator: validateRequire }],
          content: [{ validator: validateRequire }],
        },
        tempRoute: {},
        editorInit: {
          paste_data_images: true,
          language_url: './static/tinymce/langs/zh_CN.js',
          language: 'zh_CN',
          skin_url: './static/tinymce/skins/ui/oxide',
          height: 300,
          plugins: this.plugins,
          toolbar: this.toolbar,
          statusbar: true, // 底部的状态栏
          menubar: true, // 最上方的菜单
          branding: false, // 水印“Powered by TinyMCE”
          images_upload_handler: (blobInfo, success, failure) => {
            // const img = 'data:image/png;base64,' + blobInfo.base64()
            // success(img)
            // this.$emit('imgUpload', blobInfo, success, failure)
            if(blobInfo.size / 1024 / 1024 < 8){
              failure('文件体积过大')
            }
            else if(!this.type.includes(blobInfo.blob().type)) {
              failure('文件格式无效')
              console.log('文件格式无效')
            }
            else{
              console.log('上传')
              let formData = new FormData()
              formData.append("file",blobInfo.blob())
              axios.post(this.$store.state.settings.uploadUrl,formData)
                .then((res) => {
                  console.log(res)
                  if (res.code === 200) {
                    console.log(this.$store.state.settings.callbackUrl+res.data)
                    success(this.$store.state.settings.callbackUrl+res.data)
                  } else {
                    failure('上传失败!')
                  }

                })
            }
          }
        },
      }
    },
    created() {
      this._isEdit = this.isEdit
      if (this.isEdit) {
        const id = this.$route.params && this.$route.params.id
        this.fetchData(id)
      }
      // Why need to make a copy of this.$route here?
      // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
      // https://github.com/PanJiaChen/vue-element-admin/issues/1221
      this.tempRoute = Object.assign({}, this.$route)
    },
    mounted() {
      tinymce.init({
      })
    },
    methods: {
      fetchData(id) {
        WebArticleApi.findOne(id).then(data => {
          this.postForm = data
          this.setPageTitle()
        }).catch(err => {
          console.log(err)
        })
      },
      setPageTitle() {
        const title = '编辑文章'
        document.title = `${title} : ${this.postForm.id}`
      },
      submitForm(value) {

        this.$refs.postForm.validate((valid) => {
          if (valid) {
            this.loading = true
            console.log(this.isEdit)
            if(this._isEdit){
              WebArticleApi.update(this.postForm)
            }
            else{
              WebArticleApi.add(this.postForm).then(data => {
                console.log(data)
                this.postForm.id = data
                this.setPageTitle()
              }).catch(err => {
                console.log(err)
              })
              this._isEdit = true
            }
            if(value === 1){
              this.$notify({
                title: '成功',
                message: '发布文章成功',
                type: 'success',
                duration: 2000
              })
              this.postForm.status = 'reviewed'
              this.loading = false
              if(this.isEdit){
                this.$router.push({path:'../list'})
              }
              else{
                this.$router.push({path:'./list'})
              }
            }
            else if(value === 3) {
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
              this.postForm.status = 'reviewing'
              this.loading = false
              if(this.isEdit){
                this.$router.push({path:'../list'})
              }
              else{
                this.$router.push({path:'./list'})
              }
            }
            else {
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
              this.postForm.status = 'reject'
              this.loading = false
              if(this.isEdit){
                this.$router.push({path:'../list'})
              }
              else{
                this.$router.push({path:'./list'})
              }
            }
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },

      // 输入事件
      handleInput(value) {
        // console.log(value)
      },
      // 点击事件
      handleClick(e, editor) {
        // console.log(e, editor)
      },
      // 清空事件
      clearClick() {
        this.postForm.article = ''
      },
      // 禁用事件
      disableClick() {
        this.isEditorDisabled = !this.isEditorDisabled
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";

  .createPost-container {
    position: relative;

    .createPost-main-container {
      padding: 40px 45px 20px 50px;

      .postInfo-container {
        position: relative;
        @include clearfix;
        margin-bottom: 10px;

        .postInfo-container-item {
          float: left;
        }
      }
    }

    .word-counter {
      width: 40px;
      position: absolute;
      right: 10px;
      top: 0px;
    }
  }

  .article-textarea /deep/ {
    textarea {
      padding-right: 40px;
      resize: none;
      border: none;
      border-radius: 0px;
      border-bottom: 1px solid #bfcbd9;
    }
  }
</style>
