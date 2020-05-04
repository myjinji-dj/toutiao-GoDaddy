<template>
 <div class="comment-container">
<el-card class="box-card">
  <div slot="header" class="clearfix">
  <el-breadcrumb separator-class="el-icon-arrow-right">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>评论管理</el-breadcrumb-item>
  </el-breadcrumb>
  </div>
  <!-- --------表格-----------------
  data 绑定数据列表
  调整表格列 表格列渲染数据字段
   -->
  <el-table
    class="table-list"
    :data="articles"
    stripe
    style="width: 100%">
    <el-table-column
      prop="title"
      label="标题"
    >
    </el-table-column>
    <el-table-column
      prop="total_comment_count"
      label="总评论数"
    >
    </el-table-column>
    <el-table-column
      prop="fans_comment_count"
      label="粉丝评论数">
    </el-table-column>
    <el-table-column
      label="评论状态">
      <!-- 自定义表格列 -->
      <template slot-scope="scope">
        {{ scope.row.comment_status ? '正常' : '关闭' }}
      </template>
    </el-table-column>
    <el-table-column
      prop="address"
      label="操作">
      <template slot-scope="scope">
          <!-- 开关按钮 -->
        <el-switch
        v-model="scope.row.comment_status"
        active-color="#13ce66"
        inactive-color="#ff4949"
        :disabled="scope.row.statusDisabled"
        @change="onStatusChange(scope.row)">
        </el-switch>
      </template>
    </el-table-column>
  </el-table>
  <!-- 完整分页 -->
  <!--current-page当前页面 控制激活页码 初始第1页 -->
  <!--page-sizes 带sssss!! 可选每页页数数量 数组形式存在 -->
  <!-- layout 布局 可调整位置-->
 <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="page"
      :page-sizes="[100, 200, 300, 400]"
      :page-size.sync="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCount">
    </el-pagination>
</el-card>
 </div>
</template>

<script>
import { getArticles, updatedCommentStatus } from '@/api/article'
export default {
  name: 'CommentIndex',
  components: {},
  props: {},
  data () {
    return {
      page: 1, // 当前激活页码
      articles: [], // 文章数据评论列表
      totalCount: 0, // 总数据个数
      pageSize: 10 // 每页数量
    }
  },
  computed: {},
  watch: {},
  created () {
    this.loadArticles()
  },
  mounted () {},
  methods: {
    // 每页显示个数发生改变时
    handleSizeChange () {
      // 重新发请求
      this.loadArticles(1)
    },
    // 页码改变时触发
    handleCurrentChange (page) {
      // 加载指定页码数据
      this.loadArticles(page)
    },
    loadArticles (page = 1) {
      // 分页组件激活的页码 和 请求数据页码保持一致
      // 就是当页数发生改变时 刷新页面
      this.page = page
      getArticles({
        response_type: 'comment',
        page,
        per_page: this.pageSize
      }).then(res => {
        // console.log(res)
        const { results } = res.data.data
        results.forEach(article => {
          article.statusDisabled = false
        })
        this.articles = results
        this.totalCount = res.data.data.total_count
      })
    },
    onStatusChange (article) {
      // 禁用按钮
      article.statusDisabled = true
      // 请求修改评论状态
      updatedCommentStatus(article.id.toString(), article.comment_status).then(res => {
        console.log(res)
        // qi用按钮
        article.statusDisabled = false
        this.$message({
          message: article.comment_status ? '开启文章评论状态' : '关闭文章评论状态'
        })
      })
    }
  }
}
</script>
<style scoped lang="less">
.table-list {
    margin: 20px 0;
}
</style>
