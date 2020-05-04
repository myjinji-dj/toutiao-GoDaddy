<template>
<el-container class="layout-container">
  <el-aside class="aside" width="auto">
      <app-aside class="aside-menu" :is-collapse="isCollapse" />
  </el-aside>
  <el-container>
    <el-header class="header">
      <div class="header-container">
    <div>
         <i
         :class="{
           'el-icon-s-fold': isCollapse,
           'el-icon-s-unfold': !isCollapse
           }"
         @click="isCollapse = !isCollapse"
         ></i>
         <span>江苏传智博客</span>
     </div>
     <el-dropdown>
         <div class="avatar-wrap">
             <img class="avatar" :src="user.photo" alt="">
             <span>{{ user.name }}</span>
             <i
             class="el-icon-arrow-down el-icon--right"
             ></i>
         </div>
       <!-- <span>
         <i class="el-icon-arrow-down el-icon--right"></i>
       </span> -->
       <el-dropdown-menu slot="dropdown">
         <el-dropdown-item>设置</el-dropdown-item>
         <!-- 组件默认不识别原生事件 除非内部做了处理 -->
         <el-dropdown-item @click.native="onLogout">退出</el-dropdown-item>
     </el-dropdown-menu>
</el-dropdown>
 </div>
    </el-header>
    <el-main class="main">
        <!-- 子路由出口 -->
        <router-view />
    </el-main>
  </el-container>
</el-container>

 <!-- <div class="layout-container">
     <div>顶部导航栏</div>
     <div>侧边导航栏</div>
    <router-view />
 </div> -->

</template>

<script>
import AppAside from './components/aside'
import { getUserProfile } from '@/api/user'
import globalBus from '@/utils/global-bus'
export default {
  name: 'LayoutIndex',
  components: {
    AppAside
  },
  props: {},
  data () {
    return {
      user: {
        photo: '',
        name: ''
      },
      isCollapse: true // 侧边菜单栏展开状态
    }
  },
  computed: {},
  watch: {},
  created () {
    this.loadUserProfile()
    // 注册自定义事件
    globalBus.$on('userProfile', (data) => {
      this.user.name = data.name
      this.user.photo = data.photo
      // 不可以 this.user = data 对象赋值会相互影响
    })
  },
  mounted () {},
  methods: {
    loadUserProfile () {
      getUserProfile().then(res => {
        this.user = res.data.data
      })
    },
    onLogout () {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 清除用户登录状态
        window.localStorage.removeItem('user')
        // 跳转到登录页面
        this.$router.push('/login')
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消退出'
        })
      })
    }
  }
}
</script>

<style scoped lang="less">
.layout-container {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
}
.aside {
    background-color: #58bcbc;
    .aside-menu {
       height: 100%
    }
}
.header-container {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
    .avatar-wrap {
    display: flex;
    align-items: center;
    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
    }
}
}

.main {
    background-color: #ccc;
}

</style>
