<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keywords" placeholder="请输入搜索内容" style="width: 200px;padding-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <router-link style="margin-left: 10px;" :to="'/admin_management/verify/article/create'" class="link-type">
        <el-button class="filter-item" type="primary" icon="el-icon-edit">
          新增
        </el-button>
      </router-link>
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
      <el-table-column label="标题" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.author }}</span>
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

      <el-table-column label="上架/下架" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.isDel===true" size="mini" type="success" @click="handleModifyIsDel(row, false)">
            上架
          </el-button>
          <el-button v-if="row.isDel===false" size="mini" @click="handleModifyIsDel(row, true)">
            下架
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <router-link style="margin-right: 10px;" v-if="row.status==='reviewing'" :to="'/admin_management/verify/article/edit/'+row.id">
            <el-button type="primary" size="mini">
              审阅
            </el-button>
          </router-link>
          <router-link style="margin-right: 10px;" v-if="row.status==='reviewed'" :to="'/admin_management/verify/article/edit/'+row.id">
            <el-button type="primary" size="mini">
              修改
            </el-button>
          </router-link>
          <el-button v-if="row.status==='reject'" size="mini" type="success" @click="handleModifyStatus(row,'reviewing')">
            待定
          </el-button>
          <el-button v-if="row.status==='reviewed'" size="mini" @click="handleModifyStatus(row,'reject')">
            驳回
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :size.sync="listQuery.size" @pagination="getList" />

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
  import WebVerifyApi from "@/api/admin/WebVerifyApi";
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
          reject: '驳回'
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
        filterIsDel: 1,
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
        showReviewer: false,
        temp: {
          readings: '',
          author: "",
          article: ``,
          title: '',
          status: '',
          createAt: '',
          isDel:''
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        filterMap: [
          { label: '全部', value: 1 },
          { label: '未下架', value: 'false' },
          { label: '已下架', value: 'true'}
        ],
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
        if(this.filterIsDel === 1){
          WebVerifyApi.findAllArticle(this.listQuery).then(data => {
            this.list = data.data
            this.total = data.total;
          })
        }
        else{
          this.listQuery.active = this.filterIsDel
          WebVerifyApi.findClassArticle(this.listQuery).then(data => {
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
        row.status = status
        this.temp = Object.assign({}, row) // copy obj
        WebArticleApi.update(this.temp)
        this.listLoading = false
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      },
      handleModifyIsDel(row, active) {
        this.listLoading = true
        row.isDel = active
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
    }
  }
</script>
