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
      <el-table-column label="创建日期" prop="date" sortable="custom" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createAt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="员工姓名" min-width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="员工昵称" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="员工等级" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.level }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          <el-tag :type="row.isDel | statusFilter">
            {{ row.isDel | statusNameFilter}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.isDel === true" size="mini" @click="handleModifyStatus(row, 'false')">
            撤回
          </el-button>
          <el-button v-if="row.isDel === false" size="mini" type="danger" @click="handleModifyStatus(row, 'true')">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :size.sync="listQuery.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="员工姓名" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="员工昵称" prop="nickname">
          <el-input v-model="temp.nickname" />
        </el-form-item>
        <el-form-item label="员工等级" prop="level">
          <el-select v-model="temp.level" class="filter-item" placeholder="管理员/普通员工">
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
  import WebAccountApi from "@/api/admin/WebAccountApi";
  export default {
    name: 'bbb',
    components: { Pagination },
    directives: { waves },
    filters: {
      statusNameFilter(status) {
        // this.status.toString()
        const statusMap = {
          true: '已删除',
          false: '正常',
        }
        return statusMap[status]
      },
      statusFilter(status) {
        // this.status.toString()
        const statusMap = {
          true: 'warning',
          false: 'success',
        }
        return statusMap[status]
      }
    },
    data() {
      return {
        filterIsDel: 2,
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
          active: 'true'
        },
        statusOptions: [{
          label: '管理员',
          value: '1'
        }, {
          label: '普通员工',
          value: '2'
        }],
        showReviewer: false,
        temp: {
          name: '',
          nickname: '',
          level: '',
          createAt:'',
          isDel: ''
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        filterMap: [{
          label: '正常',
          value: 2
        }, {
          label: '已删除',
          value: 3
        }],
        rules: {
          name: [{ required: true, message: '姓名为必填项', trigger: 'blur' }],
          nickname: [{ required: true, message: '昵称为必填项', trigger: 'blur' }],
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

        if(this.filterIsDel === 3){
          this.listQuery.active = 'true'
          WebAccountApi.findAllByKeywords(this.listQuery).then(data => {
            this.list = data.data
            this.total = data.total;
          })
        }
        else{
          this.listQuery.active = 'false'
          WebAccountApi.findAllByKeywords(this.listQuery).then(data => {
            this.list = data.data
            this.total = data.total;
          })
        }
        this.listLoading = false
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleModifyStatus(row, status) {
        this.listLoading = true
        WebAccountApi.mod(row.id, status).then(() => {
          this.getList()
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
        this.filterIsDel = 1
        this.handleFilter()
      },
      handleCreate() {
        Object.keys(this.temp).forEach(key => (this.temp[key] = ''))
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            WebAccountApi.add(this.temp).then(() => {
              this.list.unshift(this.temp)
              this.getList()
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
            WebAccountApi.update(tempData).then(() => {
              for (const v of this.list) {
                if (v.id === this.temp.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.temp)
                  break
                }
              }
              this.getList()
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

      handleDelete(row) {
        WebAccountApi.delOne(row.id).then(data => {
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
