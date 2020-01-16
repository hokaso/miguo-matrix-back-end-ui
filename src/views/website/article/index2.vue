<template>
  <div class="demo">
    <tinymce-editor
      :id="editorId"
      ref="editor"
      v-model="message"
      :disabled="isEditorDisabled"
      @input="handleInput"
      @onClick="handleClick"
      @handleImgUpload="imgUpload"
    />
    <div class="demo-btn">
      <el-button type="primary" @click="clearClick">清空内容</el-button>
      <el-button @click="disableClick">{{ !isEditorDisabled ? '禁用' : '启用' }}</el-button>
    </div>
  </div>
</template>

<script>
    import TinymceEditor from '@/components/TinymceEditor'

    export default {
        components: { TinymceEditor },
        data() {
            return {
                message: '我经常被生活锤得心灰意冷，可我从来都没放弃过。',
                editorId: 'editor-demo',
                isEditorDisabled: false
            }
        },
        methods: {
            // 输入事件
            handleInput(value) {
                console.log(value)
            },
            // 点击事件
            handleClick(e, editor) {
                console.log(e, editor)
            },
            // 上传图片
            imgUpload(blobInfo, success, failure) {
                const imgBase64 = `data:${blobInfo.blob().type};base64,${blobInfo.base64()}`
                success(imgBase64)
            },
            // 清空事件
            clearClick() {
                this.$refs.editor.clear()
            },
            // 禁用事件
            disableClick() {
                this.isEditorDisabled = !this.isEditorDisabled
            }
        }
    }
</script>

<style lang="scss" scoped>
  .demo {
    margin: 30px;
    &-btn {
      text-align: center;
      margin: 10px;
    }
  }
</style>
