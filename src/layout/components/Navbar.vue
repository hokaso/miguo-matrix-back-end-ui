<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img src="../../assets/staff_icon.png" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              回到主页
            </el-dropdown-item>
          </router-link>
          <a target="_blank" href="http://migotimes.com/#/home">
            <el-dropdown-item>前往官网</el-dropdown-item>
          </a>
          <el-dropdown-item>
            <span style="display:block;" @click="handleEdit">修改信息</span>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">注销</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog title="修改个人信息" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="temp.nickname" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateData">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Breadcrumb from '@/components/Breadcrumb'
  import Hamburger from '@/components/Hamburger'
  import LoginApi from '@/api/website/LoginApi'

  export default {
    components: {
      Breadcrumb,
      Hamburger
    },
    computed: {
      ...mapGetters([
        'sidebar',
      ])
    },
    data() {
      return {
        temp: {
          id: "",
          name: "",
          nickname: "",
          password: "",
          level: undefined
        },
        dialogFormVisible: false,
        rules: {
          name: [{ required: true, message: '姓名为必填项', trigger: 'blur' }],
          nickname: [{ required: true, message: '昵称为必填项', trigger: 'blur' }],
          password: [{ required: true, message: '密码为必填项', trigger: 'blur' }],
        },
      }
    },
    methods: {
      handleEdit(){
        LoginApi.getSelfInfo().then(data => {
          this.temp.id = data.id
          this.temp.name = data.name
          this.temp.nickname = data.nickname
          this.temp.password = data.password
          this.temp.level = data.level
        })
        this.dialogFormVisible = true
      },
      updateData(){
        LoginApi.setSelfInfo(this.temp).then(data => {
          console.log(data)
        })
        this.dialogFormVisible = false
        this.$notify({
          title: 'success',
          message: '创建成功',
          type: 'success',
          duration: 2000
        })
      },
      toggleSideBar() {
        this.$store.dispatch('app/toggleSideBar')
      },
      async logout() {
        await LoginApi.logout().then(data => {
          sessionStorage.setItem('user',null)
          this.$store.dispatch('user/userLogout')
          this.$store.dispatch('permission/clearRoutes')
        }).catch(err => {
          // debugger
          console.log(err)
        })
        this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);

    .hamburger-container {
      line-height: 46px;
      height: 100%;
      float: left;
      cursor: pointer;
      transition: background .3s;
      -webkit-tap-highlight-color:transparent;

      &:hover {
        background: rgba(0, 0, 0, .025)
      }
    }

    .breadcrumb-container {
      float: left;
    }

    .right-menu {
      float: right;
      height: 100%;
      line-height: 50px;

      &:focus {
        outline: none;
      }

      .right-menu-item {
        display: inline-block;
        padding: 0 8px;
        height: 100%;
        font-size: 18px;
        color: #5a5e66;
        vertical-align: text-bottom;

        &.hover-effect {
          cursor: pointer;
          transition: background .3s;

          &:hover {
            background: rgba(0, 0, 0, .025)
          }
        }
      }

      .avatar-container {
        margin-right: 30px;

        .avatar-wrapper {
          margin-top: 5px;
          position: relative;

          .user-avatar {
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }

          .el-icon-caret-bottom {
            cursor: pointer;
            position: absolute;
            right: -20px;
            top: 25px;
            font-size: 12px;
          }
        }
      }
    }
  }
</style>
