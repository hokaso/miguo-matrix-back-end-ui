<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keywords" placeholder="请输入搜索内容" style="width: 200px;padding-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleNewRows">
        新增
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="confirmDeleteRows" :disabled="this.multipleSelection.length === 0">
        批量删除
      </el-button>
    </div>
    <el-table-editabled v-model="tableData" :columns="['recordNickname', 'recordOpenid', 'groupId', 'recordDate']" ref="editTable">
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="tableData"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        @sort-change="sortChange"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50px" align="center">
        </el-table-column>
        <el-table-column label="发布日期" prop="date" sortable="custom" width="200px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.updateAt }}</span>
          </template>
        </el-table-column>
        <el-table-column label="投票用户名" min-width="80px" align="center">
          <template slot-scope="{row}">
            <el-table-editabled-cell :row="row" prop="recordNickname">
              <template slot-scope="{ rowStates, validateOwn }">
                <span v-show="!rowStates.editing">{{row.recordNickname}}</span>
                <el-input v-show="rowStates.editing" v-model="row.recordNickname" clearable @input="validateOwn">
                </el-input>
              </template>
            </el-table-editabled-cell>
          </template>
        </el-table-column>
        <el-table-column label="投票用户openid" min-width="200px" align="center">
          <template slot-scope="{row}">
            <el-table-editabled-cell :row="row" prop="recordOpenid">
              <template slot-scope="{ rowStates, validateOwn }">
                <span v-show="!rowStates.editing">{{row.recordOpenid}}</span>
                <el-input v-show="rowStates.editing" v-model="row.recordOpenid" clearable @input="validateOwn">
                </el-input>
              </template>
            </el-table-editabled-cell>
          </template>
        </el-table-column>
        <el-table-column label="投票时间" min-width="200px" align="center">
          <template slot-scope="{row}">
            <el-table-editabled-cell :row="row" prop="recordDate">
              <template slot-scope="{ rowStates, validateOwn }">
                <span v-show="!rowStates.editing">{{row.recordDate | format }}</span>
                <el-date-picker
                  v-show="rowStates.editing"
                  v-model="row.recordDate"
                  type="datetime"
                  value-format="timestamp"
                  @input="validateOwn"
                  placeholder="选择日期时间">
                </el-date-picker>
              </template>
            </el-table-editabled-cell>
          </template>
        </el-table-column>
        <el-table-column label="投票对象" min-width="100px" align="center">
          <template slot-scope="{row}">
            <el-table-editabled-cell :row="row" prop="groupId">
              <template slot-scope="{ rowStates, validateOwn }">
                <el-select
                  v-show="rowStates.editing"
                  v-model="row.groupId"
                  class="filter-item"
                  filterable
                  remote
                  reserve-keyword
                  clearable
                  placeholder="请选择对应活动"
                  :remote-method="remoteMethod"
                  :loading="loading"
                  @change="validateOwn">
                  <el-option
                    v-for="item in options"
                    :key="item.id"
                    :label="item.groupName"
                    :value="item.id">
                  </el-option>
                </el-select>
                <span v-show="!rowStates.editing">{{row.groupName}}</span>
              </template>
            </el-table-editabled-cell>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-table-editabled-cell :row="row">
              <template slot-scope="{ rowStates }">
                <el-button v-if="!rowStates.editing" type="primary" size="mini" @click="editRow(row)">
                  编辑
                </el-button>
                <el-button v-if="!rowStates.editing" size="mini" type="danger" @click="delOne(row)">
                  删除
                </el-button>
                <el-button v-if="rowStates.editing && row.isDel" size="mini" type="success" @click="createRow(row)">
                  保存
                </el-button>
                <el-button v-if="rowStates.editing && row.isDel" size="mini" @click="createCancelRow(row)">
                  取消
                </el-button>
                <el-button v-if="rowStates.editing && !row.isDel" size="mini" type="success" @click="updateRow(row)">
                  更新
                </el-button>
                <el-button v-if="rowStates.editing && !row.isDel" size="mini" @click="updateCancelRow(row)">
                  撤销
                </el-button>
              </template>
            </el-table-editabled-cell>
          </template>
        </el-table-column>
      </el-table>
    </el-table-editabled>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :size.sync="listQuery.size" @pagination="getList" />
  </div>
</template>

<script>
    import waves from '@/directive/waves' // waves directive
    import Pagination from '@/components/Pagination' // secondary package based on el-pagination
    import MpRecordApi from "@/api/miniprogram/MpRecordApi";
    import MpGroupApi from "@/api/miniprogram/MpGroupApi";
    import 'babel-polyfill'; // es6 shim
    import { formatDate } from '@/utils/timeformat.js';
    export default {
        name: 'MpRecord',
        components: { Pagination },
        directives: { waves },
        filters: {
            format: (value) =>  formatDate('yyyy-MM-dd hh:mm:ss',new Date(value)),
            statusFilter(status) {
                const statusMap = {
                    true: 'success',
                    false: 'danger',
                }
                return statusMap[status]
            },
            statusNameFilter(status) {
                const statusMap = {
                    true: '活跃',
                    false: '已停用',
                }
                return statusMap[status]
            },
        },
        computed: {
            editTable () {
                return this.$refs.editTable
            }
        },
        data() {
            return {
                loading: false,
                multipleSelection: [],
                isUpdate: true,
                tableKey: 0,
                tableData: [],
                options: [],
                total: 0,
                listLoading: true,
                listQuery: {
                    page: 1,
                    size: 20,
                    keywords: "",
                    direction: 'DESC'
                },
                // 改变活动状态
                statusOptions: [{
                    label: '启用',
                    value: true
                }, {
                    label: '停用',
                    value: false
                }],
                temp: {
                    recordNickname: "",
                    updateAt: '',
                    recordOpenid: '',
                    recordDate: '',
                    isDel: '',
                    groupId: '',
                    groupName: ''
                },
                rules: {
                    videoTitle: [{ required: true, message: '标题为必填项', trigger: 'blur' }],
                    videoStatus: [{ required: true, message: '状态为必填项', trigger: 'change' }],
                },
            }
        },
        created() {
            this.getList()
        },
        methods: {
            // 选择活动时，用于根据关键字查找活动
            remoteMethod (query) {
                if (query === '') {
                    this.options = []
                    return
                }
                this.loading = true
                MpGroupApi.findAllByKeywordsFromInput(query).then(data => {
                    this.loading = false
                    this.options = data
                })
            },
            // 刷新界面
            getList() {
                this.listLoading = true
                MpRecordApi.findAllByKeywords(this.listQuery).then(data => {
                    this.tableData = data.data
                    this.total = data.total;
                })
                this.listLoading = false
            },
            // 创建选中行的数组
            handleSelectionChange (row) {
                this.multipleSelection = row
            },
            // 每次变动排序后的刷新
            handleFilter() {
                this.listQuery.page = 1
                this.getList()
            },
            // 触发排序
            sortChange(data) {
                const { prop, order } = data
                if (prop === 'date') {
                    this.sortByID(order)
                }
            },
            // 回传排序顺序
            sortByID(order) {
                if (order === 'ascending') {
                    this.listQuery.direction = 'ASC'
                } else {
                    this.listQuery.direction = 'DESC'
                }
                this.handleFilter()
            },
            // 点击新增之后的事件
            handleNewRows () {
                this.isUpdate = false
                Object.keys(this.temp).forEach(key => (this.temp[key] = ''))
                const newRow = this.temp
                this.editTable.newRows([newRow])
                newRow.isDel = true
            },
            // 点击新增、再点击保存之后的事件，用于返回新增数据，需调用add方法
            createRow (row) {
                this.$refs.editTable.validateRows([row], valid => {
                    // valid 为布尔值，代表表格正在编辑的所有字段是否验证通过
                    if (valid) {
                        const tempData = Object.assign({}, row)
                        MpRecordApi.add(tempData).then(() => {
                            // this.tableData.unshift(tempData)
                            this.$notify({
                                title: 'success',
                                message: '创建成功',
                                type: 'success',
                                duration: 2000
                            })
                            this.getList()
                        })
                    }
                })

            },
            // 点击编辑之后的状态，使某行数据可编辑
            editRow (row) {
                if(row.groupId !== ""){
                    MpGroupApi.findOne(row.groupId).then(data => {
                        this.options = []
                        this.options.push(data)
                    })
                }
                this.editTable.editRows([row])
            },
            // 点击更新之后，将数据上传到后端，并且更新前端数据
            updateRow (row) {
                this.editTable.validateRows([row],valid => {
                    if (valid) {
                        const tempData = Object.assign({}, row)
                        MpRecordApi.update(tempData).then(() => {
                            this.$notify({
                                title: 'success',
                                message: '更新成功',
                                type: 'success',
                                duration: 2000
                            })
                            this.getList()
                        })
                    }
                })
            },
            // 点击撤销之后，还原目标行状态
            updateCancelRow (row) {
                this.editTable.cancelRows([row])
            },
            // 点击取消后，删除对应空行
            createCancelRow (row) {
                this.editTable.delRows([row])
            },
            // 删除二次确认
            confirmDeleteRows () {
                if(confirm('确定要删除吗')===true){
                    this.deleteGroup()
                }
            },
            // 删除选中数据
            deleteGroup () {
                MpRecordApi.del(this.multipleSelection).then(data => {
                    console.log(data)
                    this.getList()
                })
            },
            // 删除某行数据（无需确认）
            delOne (row) {
                console.log(row)
                this.multipleSelection.push(row)
                MpRecordApi.del(this.multipleSelection).then(data => {
                    console.log(data)
                    this.getList()
                })
            }
        }
    }
</script>
