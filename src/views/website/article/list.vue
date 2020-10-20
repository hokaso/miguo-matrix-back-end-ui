<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keywords" placeholder="请输入搜索内容" style="width: 200px;padding-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <router-link style="margin-left: 10px;" :to="'/web_management/article/create'" class="link-type">
        <el-button class="filter-item" type="primary" icon="el-icon-edit">
          新增
        </el-button>
      </router-link>
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
          <span>{{ row.updateAt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.status==='reviewed' || row.status==='reviewing'">{{ row.title }}</span>
          <router-link v-else :to="'/web_management/article/edit/'+row.id" class="link-type">
            <span>{{ row.title }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人" width="100px" align="center">
        <template slot-scope="{row}">
          <span style="color:orange;">{{ row.reviewer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="阅读量" align="center">
        <template slot-scope="{row}">
          <span>{{ row.readings }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | statusNameFilter}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <router-link style="margin-right: 10px;" v-if="row.status!=='reviewed' && row.status!=='reviewing'" :to="'/web_management/article/edit/'+row.id">
            <el-button type="primary" size="mini">
              编辑
            </el-button>
          </router-link>
          <el-button v-if="row.status!=='reviewed' && row.status!=='reviewing' && row.status!=='reject'" size="mini" type="success" @click="handleModifyStatus(row,'reviewing')">
            提审
          </el-button>
          <el-button v-if="row.status!=='draft' && row.status!=='reviewed' && row.status!=='reject'" size="mini" @click="handleModifyStatus(row,'draft')">
            撤回
          </el-button>
          <el-button v-if="row.status!=='reviewed' && row.status!=='reviewing' && row.status!=='reject'" size="mini" type="danger" @click="confirmDelete(row)">
            删除
          </el-button>
          <el-tag v-if="row.status==='reviewed'">
            已通过审核，当前权限无法进行其他操作
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :size.sync="listQuery.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="文章作者" prop="author">
          <el-input v-model="temp.author" />
        </el-form-item>
        <el-form-item label="文章正文" prop="article">
          <el-input v-model="temp.article" />
        </el-form-item>
        <el-form-item label="文章状态" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="保存草稿/提交审核">
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
  import WebArticleApi from "@/api/website/WebArticleApi";
  export default {
    name: 'List',
    components: { Pagination },
    directives: { waves },
    filters: {
      statusNameFilter(status) {
        const statusMap = {
          reviewing: '审核中',
          draft: '草稿',
          reviewed: '已审核',
          reject: '被驳回'
        }
        return statusMap[status]
      },
      statusFilter(status) {
        const statusMap = {
          reviewed: 'success',
          draft: 'info',
          reviewing: 'warning',
          reject: 'danger'
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
          value: 'reviewing'
        }, {
          label: '存为草稿',
          value: 'draft'
        }],
        showReviewer: false,
        temp: {
          author: "",
          article: ``,
          title: '',
          status: '',
          updateAt: '',
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        rules: {
          status: [{ required: true, message: '状态为必填项', trigger: 'change' }],
          title: [{ required: true, message: '标题为必填项', trigger: 'blur' }]
        },
        downloadLoading: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // 刷新界面
      getList() {
        this.listLoading = true
        WebArticleApi.findAllByKeywords(this.listQuery).then(data => {
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
        row.status = status
        this.temp = Object.assign({}, row) // copy obj
        WebArticleApi.update(this.temp)
        this.listLoading = false
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      },
      sortChange(data) {
        const { prop, order } = data
        console.log(order)
        console.log(prop)
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
        console.log(this.listQuery.direction)
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
            WebArticleApi.add(this.temp).then(data => {
              console.log(data)
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
            WebArticleApi.update(tempData).then(() => {
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
      confirmDelete(row) {
        // this.delVisible = true
        if(confirm('确定要删除吗')===true){
          this.handleDelete(row)
        }
      },
      handleDelete(row) {
        WebArticleApi.delOne(row.id).then(data => {
          console.log(data)
          this.getList()
        })
        this.$notify({
          title: 'Success',
          message: '成功删除',
          type: 'success',
          duration: 2000
        })
      }
    }
  }
</script>
