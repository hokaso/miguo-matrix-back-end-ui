<template>
  <div class="dashboard-container">
    <el-row :gutter="60">
      <el-col :span="6">
        <div class="grid-content bg-purple">
          <div class="data-name">
            文章统计
          </div>
          <div class="text-content">
            {{count.articleWebCount}}
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="grid-content bg-purple">
          <div class="data-name">
            视频统计
          </div>
          <div class="text-content">
            {{count.videoWebCount}}
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="grid-content bg-purple">
          <div class="data-name">
            轮播图统计
          </div>
          <div class="text-content">
            {{count.swiperWebCount}}
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="grid-content bg-purple">
          <div class="data-name">
            网站浏览量
          </div>
          <div class="text-content">
            {{count.viewWebCount}}
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="60">
      <el-col :span="6">
        <div class="grid-content bg-purple">
          <div class="data-name">
            活动统计
          </div>
          <div class="text-content">
            {{count.activityMiniCount}}
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="grid-content bg-purple">
          <div class="data-name">
            赞助商统计
          </div>
          <div class="text-content">
            {{count.videoWebCount}}
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="grid-content bg-purple">
          <div class="data-name">
            员工统计
          </div>
          <div class="text-content">
            {{count.staffWebCount}}
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="grid-content bg-purple">
          <div class="data-name">
            小程序使用量
          </div>
          <div class="text-content">
            {{count.userMiniCount}}
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import LoginApi from '@/api/website/LoginApi'

  export default {
    data () {
      return {
        listLoading: true,
        count:{
          viewWebCount: null,
          articleWebCount: null,
          swiperWebCount: null,
          userMiniCount: null,
          videoWebCount: null,
          merchantMiniCount: null,
          staffWebCount: null,
          activityMiniCount: null,
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        LoginApi.getCount().then(data => {
          this.count = data;
          console.log(data)
        })
        this.listLoading = false
      },
    },
    name: 'Dashboard',
    computed: {
    }
  }
</script>

<style>
  .el-row {
    margin-bottom: 30px;
  }
  .dashboard-container{
    margin: 40px 60px 30px 60px;
  }
  .bg-purple {
    background: rgba(0,161,214,.03);
    vertical-align: middle;
    padding: 40px 0 0 0;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 150px;
  }
  .data-name{
    font-size: 18px;
    line-height: 18px;
    color: #757575;
    text-align: center;
  }
  .section-item{
    vertical-align: middle;
    padding: 16px 18%;
  }
  .text-content{
    position: relative;
    margin-top: 12px;
    /*margin-bottom: 16px;*/
    line-height: 32px;
    font-size: 28px;
    color: #00a1d6;
    font-weight: 600;
    text-align: center;
  }
</style>
