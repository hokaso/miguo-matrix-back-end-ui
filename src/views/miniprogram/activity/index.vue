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
          <!--          <span>{{ row.updateAt | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>-->
          <span>{{ row.updateAt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频标题" min-width="120px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.videoStatus==='已审核' || row.videoStatus==='审核中'">{{ row.videoTitle }}</span>
          <span v-else class="link-type" @click="handleUpdate(row)">{{ row.videoTitle }}</span>
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
      <el-table-column label="审核人" width="100px" align="center">
        <template slot-scope="{row}">
          <span style="color:orange;">{{ row.video_reviewer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          <el-tag :type="row.videoStatus | statusFilter">
            {{ row.videoStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.videoStatus!=='已审核' && row.videoStatus!=='审核中'" type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.videoStatus!=='已审核' && row.videoStatus!=='审核中'" size="mini" type="success" @click="handleModifyStatus(row,'审核中')">
            提审
          </el-button>
          <el-button v-if="row.videoStatus!=='草稿' && row.videoStatus!=='已审核'" size="mini" @click="handleModifyStatus(row,'草稿')">
            撤回
          </el-button>
          <el-button v-if="row.videoStatus!=='已审核' && row.videoStatus!=='审核中'" size="mini" type="danger" @click="confirmDelete(row)">
            删除
          </el-button>
          <el-tag v-if="row.videoStatus==='已审核'">
            已通过审核，当前权限无法进行其他操作
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :size.sync="listQuery.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="视频标题" prop="videoTitle">
          <el-input v-model="temp.videoTitle" />
        </el-form-item>
        <el-form-item label="创作团队" prop="author">
          <el-input v-model="temp.videoAuthor" />
        </el-form-item>
        <el-form-item label="视频简介" prop="profile">
          <el-input v-model="temp.videoProfile" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="视频链接" prop="url">
          <el-input v-model="temp.videoUrl" />
        </el-form-item>
        <!--        <el-form-item label="视频封面" prop="pic">-->
        <!--          <el-input v-model="temp.videoPic" />-->
        <!--        </el-form-item>-->

        <el-form-item label="视频封面">
          <el-upload
            :action="this.$store.state.settings.uploadUrl"
            :show-file-list="false"
            :on-success="answerPicImageSuccess"
            :before-upload="beforeUpload"
            drag
            prop="pic"
            accept="image/png,image/gif,image/jpg,image/jpeg"
            class="upload-demo" style="margin-top: 5%">
            <img v-if="answerPicImageUrl" :src="answerPicImageUrl">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </el-form-item>

        <el-form-item label="视频状态" prop="videoStatus">
          <el-select v-model="temp.videoStatus" class="filter-item" placeholder="保存草稿/提交审核">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
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
  </div>
</template>

<script>
    import waves from '@/directive/waves' // waves directive
    import Pagination from '@/components/Pagination' // secondary package based on el-pagination
    import WebVideoApi from "@/api/WebVideoApi";
    export default {
        name: 'bbb',
        components: { Pagination },
        directives: { waves },
        filters: {
            statusFilter(status) {
                const statusMap = {
                    published: 'success',
                    draft: 'info',
                    deleted: 'danger'
                }
                return statusMap[status]
            }
        },
        data() {
            return {
                delVisible: false,
                tableKey: 0,
                list: null,
                total: 0,
                listLoading: true,
                listQuery: {
                    page: 1,
                    size: 20,
                    keywords: "",
                    direction: 'DESC'
                },
                // 已过审的不允许删除和存为草稿和提交审核
                statusOptions: [{
                    label: '提交审核',
                    value: '审核中'
                }, {
                    label: '存为草稿',
                    value: '草稿'
                }],
                showReviewer: false,
                temp: {
                    videoAuthor: "",
                    videoProfile: '',
                    videoTitle: '',
                    videoStatus: '',
                    videoUrl: '',
                    videoPic: ''
                },
                dialogFormVisible: false,
                dialogStatus: '',
                textMap: {
                    update: '编辑',
                    create: '创建'
                },
                rules: {
                    videoTitle: [{ required: true, message: '标题为必填项', trigger: 'blur' }],
                    videoStatus: [{ required: true, message: '状态为必填项', trigger: 'change' }],
                },
                downloadLoading: false,
                answerPicImageUrl: ''
            }
        },
        created() {
            this.getList()
        },
        methods: {
            // 刷新界面
            getList() {
                this.listLoading = true
                WebVideoApi.findAllByKeywords(this.listQuery).then(data => {
                    this.list = data.data
                    this.total = data.total;
                })
                this.listLoading = false
            },
            handleFilter() {
                this.listQuery.page = 1
                this.getList()
            },
            handleModifyStatus(row, status) {
                this.listLoading = true
                row.videoStatus = status
                this.temp = Object.assign({}, row) // copy obj
                WebVideoApi.update(this.temp).then(() => {
                    for (const v of this.list) {
                        if (v.id === this.temp.id) {
                            const index = this.list.indexOf(v)
                            this.list.splice(index, 1, this.temp)
                            break
                        }
                    }
                })
                this.listLoading = false
                this.$message({
                    message: '操作成功',
                    type: 'success'
                })
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
                // console.log(this.listQuery.direction)
                this.handleFilter()
            },
            resetTemp() {
                this.temp = {
                    id: undefined,
                    title: '',
                    status: '',
                    type: ''
                }
            },
            handleCreate() {
                this.resetTemp()
                this.dialogStatus = 'create'
                this.dialogFormVisible = true
                this.$nextTick(() => {
                    this.$refs['dataForm'].clearValidate()
                })
            },
            createData() {
                this.$refs['dataForm'].validate((valid) => {
                    if (valid) {
                        WebVideoApi.add(this.temp).then(() => {
                            this.list.unshift(this.temp)
                            this.dialogFormVisible = false
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
                this.answerPicImageUrl = this.$store.state.settings.callbackUrl + this.temp.videoPic
                this.dialogStatus = 'update'
                this.dialogFormVisible = true
                this.$nextTick(() => {
                    this.$refs['dataForm'].clearValidate()
                })
            },
            updateData() {
                this.$refs['dataForm'].validate((valid) => {
                    if (valid) {
                        const tempData = Object.assign({}, this.temp)
                        WebVideoApi.update(tempData).then(() => {
                            for (const v of this.list) {
                                if (v.id === this.temp.id) {
                                    const index = this.list.indexOf(v)
                                    this.list.splice(index, 1, this.temp)
                                    break
                                }
                            }
                            this.dialogFormVisible = false
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

            confirmDelete(row) {
                // this.delVisible = true
                if(confirm('确定要删除吗')===true){
                    this.handleDelete(row)
                }
            },
            handleDelete(row) {
                WebVideoApi.delOne(row.id).then(data => {
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
                // 只允许上传8M以内大小的图片
                const isLt8M = file.size / 1024 / 1024 < 8;
                if (!isLt8M) {
                    this.$message.error('上传头像图片大小不能超过8MB!');
                }
                return isLt8M;
            },
        }
    }
</script>
