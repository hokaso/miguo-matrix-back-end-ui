<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keywords" placeholder="请输入搜索内容" style="width: 200px;padding-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-select v-model="filterIsDel" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in filterMap" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="发布日期" prop="date" sortable="custom" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createAt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频标题" min-width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.videoTitle }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创作团队" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.videoAuthor }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频链接" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.videoUrl }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频简介" max-width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.videoProfile }}</span>
        </template>
      </el-table-column>

      <el-table-column label="分发" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.videoStatus==='reviewed'" size="mini" type="success" @click="handleModifyStatus(row,'processing')">
            分发
          </el-button>
          <el-tag v-if="row.videoStatus!=='reviewed' && row.videoStatus!=='processing' && row.videoStatus!=='complete'">
            请先通过审核
          </el-tag>
          <el-tag v-if="row.videoStatus==='complete'" :type="row.videoStatus | statusFilter">
            已分发
          </el-tag>
          <el-tag v-if="row.videoStatus==='processing'" :type="row.videoStatus | statusFilter">
            分发中
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="状态" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          <el-tag :type="row.videoStatus | statusFilter">
            {{ row.videoStatus | statusNameFilter}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-show="row.videoStatus==='reviewing'" type="primary" size="mini" @click="handleUpdate(row)">
            审阅
          </el-button>
          <el-button v-show="row.videoStatus==='reviewed'" size="mini" type="success" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button v-show="row.videoStatus==='reject'" size="mini" @click="handleModifyStatus(row,'reviewing')">
            待定
          </el-button>
          <el-button v-show="row.videoStatus==='reviewed'" size="mini" type="danger" @click="handleModifyStatus(row,'reject')">
            驳回
          </el-button>
          <el-tag v-show="row.videoStatus==='processing'" :type="row.videoStatus | statusFilter">
            分发中
          </el-tag>
          <el-tag v-show="row.videoStatus==='complete'" :type="row.videoStatus | statusFilter">
            已分发
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :size.sync="listQuery.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="审核人" prop="videoReviewer">
          <el-input v-model="temp.videoReviewer" />
        </el-form-item>
        <el-form-item label="视频标题" prop="videoTitle">
          <el-input v-model="temp.videoTitle" />
        </el-form-item>
        <el-form-item label="创作团队" prop="videoAuthor">
          <el-input v-model="temp.videoAuthor" />
        </el-form-item>
        <el-form-item label="视频简介" prop="videoProfile">
          <el-input v-model="temp.videoProfile" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="视频封面" prop="videoPic">
          <el-button v-show="!temp.videoPic" type="primary" size="mini" @click="imageCropperShow()">
            上传图片
          </el-button>
          <el-button v-show="temp.videoPic" type="primary" size="mini" @click="imageCropperShow()">
            更新图片
          </el-button>
          <el-button v-show="temp.videoPic" type="primary" size="mini" @click="picShow(temp.videoPic)">
            预览
          </el-button>
        </el-form-item>

        <el-form-item label="上传视频" prop="videoPath">
          <el-upload
            :action="this.$store.state.settings.uploadUrl"
            :show-file-list="false"
            list-type="picture-card"
            :on-success="answerVideoSuccess"
            :before-upload="beforeUpload"
            :on-progress="uploadVideoProcess"
            :on-remove="handleRemove"
            :on-error="handleError"
            accept="video/mp4,video/flv,video/avi,video/wmv"
            style="margin-top: 5%;">
            <video v-if="answerVideoUrl && videoFlag === false" controls="controls" :src="answerVideoUrl" class="avatar"></video>
            <i v-if="!answerVideoUrl && videoFlag === false" class="el-icon-plus avatar-uploader-icon"></i>
            <el-progress v-if="videoFlag === true" type="circle" :percentage="percent" style="margin-top: 10px"></el-progress>
          </el-upload>
        </el-form-item>

        <el-form-item label="视频分区" prop="videoClass">
          <el-select v-model="temp.videoClass" class="filter-item" placeholder="类目一览" value="">
            <el-option v-for="item in videoClassOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="视频标签" prop="videoTag">
          <el-tag
            :key="tag"
            v-for="tag in temp.videoTag"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)">
            {{tag}}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          >
          </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 新标签</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel()">
          取消
        </el-button>
        <el-button v-if="temp.videoStatus!=='reviewed'" type="primary" @click="dialogStatus==='create'?createData():updateData('reviewed')">
          过审
        </el-button>
        <el-button v-if="dialogStatus!=='create' && temp.videoStatus!=='reviewed'" type="danger" @click="updateData('reject')">
          驳回
        </el-button>
        <el-button v-if="temp.videoStatus==='reviewed'" type="primary" @click="updateData('reviewed')">
          保存
        </el-button>
      </div>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
      <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDelete(row)" >确 定</el-button>
      </span>
    </el-dialog>
    <my-upload
      method="POST"
      field="file"
      v-model="cropperShow"
      :width=1200
      :height=750
      :url="this.$store.state.settings.uploadUrl"
      lang-type='zh'
      img-format='jpg'
      img-bgc='#FFF'
      :no-circle=true
      @crop-upload-success="cropUploadSuccess">
    </my-upload>
    <el-dialog title="图片预览" :visible.sync="picVisible" width="600px" center>
      <div style="text-align: center">
        <img :src="answerPicImageUrl" alt="" class="title-pic">
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="picVisible = false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import waves from '@/directive/waves' // waves directive
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import MediaVideoApi from "@/api/media/MediaVideoApi";
  import WebVerifyApi from "@/api/admin/WebVerifyApi";
  import 'babel-polyfill'; // es6 shim
  import myUpload from 'vue-image-crop-upload';

  export default {
    name: 'VerifyMediaVideo',
    components: { Pagination, myUpload },
    directives: { waves },
    filters: {
      statusNameFilter(status) {
        const statusMap = {
          reviewing: '审核中',
          draft: '草稿',
          reviewed: '已审核',
          reject: '驳回',
          processing: '分发中',
          complete: '分发完毕'
        }
        return statusMap[status]
      },
      statusFilter(status) {
        const statusMap = {
          reviewing: 'warning',
          reviewed: 'success',
          draft: 'info',
          reject: 'danger',
          processing: 'warning',
        }
        return statusMap[status]
      }
    },
    data() {
      return {
        videoFlag: false,
        percent: 0,
        inputVisible: false,
        inputValue: '',
        cropperShow: false,
        picVisible: false,
        filterIsDel: 1,
        delVisible: false,
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          size: 20,
          keywords: "",
          direction: 'DESC',
          active: ''
        },
        // 已过审的不允许删除和存为草稿和提交审核
        statusOptions: [{
          label: '提交审核',
          value: 'reviewing'
        }, {
          label: '存为草稿',
          value: 'draft'
        }],
        videoClassOptions: [{
          label: '日常',
          value: '21'
        }, {
          label: '搞笑',
          value: '138'
        }, {
          label: '美食',
          value: '76'
        }, {
          label: '科普',
          value: '124'
        }, {
          label: '技术',
          value: '122'
        }, {
          label: '动物',
          value: '75'
        }, {
          label: '运动',
          value: '163'
        },
        ],
        showReviewer: false,
        temp: {
          videoAuthor: '',
          videoProfile: '',
          videoTitle: '',
          videoStatus: '',
          videoUrl: '',
          videoReviewer: '',
          videoPic: '',
          videoClass: '',
          videoTag: [],
          videoPath: '',
          updateAt:'',
          createAt:'',
          IsDel: ''
        },
        videoTagTemp: undefined,
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        filterMap: [
          { label: '全部', value: 1 },
          { label: '未分发', value: 'false' },
          { label: '已分发', value: 'true'}
        ],
        rules: {
          videoTitle: [{ required: true, message: '标题为必填项', trigger: 'blur' }],
          videoReviewer: [{ required: true, message: '审核人为必填项', trigger: 'blur' }],
          videoProfile: [{ required: true, message: '简介为必填项', trigger: 'blur' }],
          videoClass: [{ required: true, message: '分类为必填项', trigger: 'change' }],
          videoPic: [{ required: true, message: '封面图为必填项', trigger: 'change' }],
          videoPath: [{ required: true, message: '视频必须上传', trigger: 'change' }],
        },
        downloadLoading: false,
        answerPicImageUrl: '',
        answerVideoUrl: ''
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // 刷新界面
      getList() {
        this.listLoading = true
        if(this.filterIsDel === 1){
          WebVerifyApi.findAllMediaVideo(this.listQuery).then(data => {
            this.list = data.data
            this.total = data.total;
            Object.keys(this.list).forEach(key => (this.list[key].videoTag =  JSON.parse(this.list[key].videoTag)))
          })
        }
        else{
          this.listQuery.active = this.filterIsDel
          WebVerifyApi.findClassMediaVideo(this.listQuery).then(data => {
            this.list = data.data
            this.total = data.total;
            Object.keys(this.list).forEach(key => (this.list[key].videoTag =  JSON.parse(this.list[key].videoTag)))
          })
        }
        this.listLoading = false
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },

      sortChange(data) {
        const { prop, order } = data
        if (prop === 'date') {
          this.sortByID(order)
        }
      },
      sortByID(order) {
        if (order === 'ascending') {
          this.listQuery.direction = 'ASC'
        } else {
          this.listQuery.direction = 'DESC'
        }
        this.filterIsDel = 1
        this.handleFilter()
      },
      handleCreate() {
        this.answerPicImageUrl = ''
        this.answerVideoUrl = ''
        Object.keys(this.temp).forEach(key => (this.temp[key] = ''))
        this.temp.videoTag = []
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.temp.videoStatus = 'reviewed'
            this.videoTagTemp = this.temp.videoTag
            this.dialogFormVisible = false
            this.temp.videoTag = JSON.stringify(this.temp.videoTag)
            const tempData = Object.assign({}, this.temp)
            this.temp.videoTag = this.videoTagTemp
              MediaVideoApi.add(tempData).then(() => {
              this.list.unshift(this.temp)
              this.getList()
              this.$notify({
                title: 'success',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        if(this.temp.videoPic){
          this.answerPicImageUrl = this.$store.state.settings.callbackUrl + this.temp.videoPic
        }
        if(this.temp.videoPath){
          this.answerVideoUrl = this.$store.state.settings.callbackUrl + this.temp.videoPath
        }
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleModifyStatus(row, status) {
        this.listLoading = true
        row.videoStatus = status
        this.temp = Object.assign({}, row) // copy obj
        this.videoTagTemp = this.temp.videoTag
        this.temp.videoTag = JSON.stringify(this.temp.videoTag)
        const tempData = Object.assign({}, this.temp)
        this.temp.videoTag = this.videoTagTemp
        if(this.temp.videoStatus === 'processing'){
          WebVerifyApi.mediaVideoDistribution(tempData).then(() => {})
        }
        else{
          MediaVideoApi.update(tempData).then(() => {})
        }
        this.listLoading = false
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      },
      updateData(status) {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.temp.videoStatus = status
            this.videoTagTemp = this.temp.videoTag
            this.dialogFormVisible = false
            this.temp.videoTag = JSON.stringify(this.temp.videoTag)
            const tempData = Object.assign({}, this.temp)
            this.temp.videoTag = this.videoTagTemp
            MediaVideoApi.update(tempData).then(() => {
              this.getList()
              this.$notify({
                title: 'success',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleCancel(){
        this.dialogFormVisible = false
        this.answerPicImageUrl = ''
        this.answerVideoUrl = ''
      },
      confirmDelete(row) {
        // this.delVisible = true
        if(confirm('确定要删除吗')===true){
          this.handleDelete(row)
        }
      },
      handleDelete(row) {
        MediaVideoApi.delOne(row.id).then(data => {
          this.getList()
        })
        this.$notify({
          title: 'Success',
          message: '成功删除',
          type: 'success',
          duration: 2000
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      },
      answerPicImageSuccess (res, file) {
        this.temp.videoPic = res.data
        this.answerPicImageUrl = URL.createObjectURL(file.raw)
      },
      beforeUpload (file) {
        // 只允许上传2GB以内大小的图片
        const isLt2G = file.size / 1024 / 1024 / 1024 < 2;
        if (!isLt2G) {
          this.$message.error('上传视频大小不能超过2GB!');
        }
        return isLt2G;
      },
      handleClose(tag) {
        this.temp.videoTag.splice(this.temp.videoTag.indexOf(tag), 1);
      },
      showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      handleInputConfirm() {
        let inputValue = this.inputValue;
        if (inputValue) {
          console.log(inputValue)
          this.temp.videoTag.push(inputValue);
        }
        this.inputVisible = false;
        this.inputValue = '';
      },
      picShow(pic) {
        this.picVisible = !this.picVisible
        this.answerPicImageUrl = this.$store.state.settings.callbackUrl + pic
      },
      // 显示图片上传模块
      imageCropperShow() {
        this.cropperShow = !this.cropperShow
      },
      // 图片上传成功后执行
      cropUploadSuccess(jsonData, field){
        this.temp.videoPic = jsonData.data
        this.$notify({
          title: 'success',
          message: '图片上传成功',
          type: 'success',
          duration: 2000
        })
      },
      uploadVideoProcess(event, file, fileList){
        this.videoFlag = true;
        this.percent = Math.floor(event.percent)
      },
      handleRemove(file, fileList) {
        this.temp.videoPath = '';
      },
      answerVideoSuccess(res, file){
        this.temp.videoPath = res.data
        this.answerVideoUrl = URL.createObjectURL(file.raw)
        this.videoFlag = false;
      },
      handleError(err, file, fileList) {
        // 上传失败异常处理
        const error = JSON.parse(JSON.stringify(err));
        console.log(err)
        console.log(error)
        this.$message.error(error.status.toString());
        this.videoFlag = false;
        this.percent = 0;
      },
    }
  }
</script>
<style>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
  .title-pic{
    width: 90%;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 178px;
    height: 178px;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    line-height: 140px;
  }

  .avatar {
    height: 144px;
  }

  .image-preview {
    width: 178px;
    height: 178px;
    position: relative;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    float: left;
  }

  .image-preview .image-preview-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .image-preview .image-preview-wrapper img {
    width: 100%;
    height: 100%;
  }

  .image-preview .image-preview-action {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    cursor: default;
    text-align: center;
    color: #fff;
    opacity: 0;
    font-size: 20px;
    background-color: rgba(0, 0, 0, .5);
    transition: opacity .3s;
    cursor: pointer;
    text-align: center;
    line-height: 200px;
  }
  .image-preview .image-preview-action .el-icon-delete {
    font-size: 32px;
  }
  .image-preview:hover .image-preview-action {
    opacity: 1;
  }
  .el-upload--picture-card{
    display: block;
    width: 258px;
    height: 146px;
    overflow: hidden;
  }

</style>
