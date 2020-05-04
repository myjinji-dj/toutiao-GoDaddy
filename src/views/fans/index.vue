<template>
 <div class="fans-container">
<el-card class="box-card">
  <div slot="header" class="clearfix">
    <el-breadcrumb separator-class="el-icon-arrow-right">
     <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
     <el-breadcrumb-item>粉丝管理</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
 <!-- ----------粉丝列表 / 粉丝图像 ------------------------------------------ -->
  <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <!-- 粉丝列表内容 -->
    <el-tab-pane label="粉丝列表" name="first">
        <!-- 栅格系统 -->
        <el-row :gutter="20">
            <el-col
            class="fans-one"
            :xs="20"
            :sm="12"
            :md="6"
            :lg="4"
            :xl="2"
            v-for="(fans, index) in fansList"
            :key="index"
            >
            <el-avatar
            :src="fans.photo"
            shape="circle"
            ></el-avatar>
            <p>{{ fans.name }}</p>
            <el-button type="primary" plain size="mini">+关注</el-button>
            </el-col>
        </el-row>
        <!-- -------分页----- -->
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalCount"
          :current-page.sync="page"
          :page-size="pageSize"
          @current-change="loadFansList(page)">
        </el-pagination>
    </el-tab-pane>
    <!-- 粉丝图像 echarts ------------------------------------------------>
    <el-tab-pane label="粉丝图像" name="second">
       <div ref="main" style="width: 600px;height:400px;"></div>

    </el-tab-pane>
  </el-tabs>
</el-card>
 </div>
</template>

<script>
import echarts from 'echarts'
import { getFansList } from '@/api/fans'
export default {
  name: 'FansIndex',
  components: {},
  props: {},
  data () {
    return {
      activeName: 'first',
      fansList: [], // 粉丝列表
      page: 1, // 当前页码
      totalCount: 0, // 总条数
      pageSize: 30 // 每页数量
    }
  },
  computed: {},
  watch: {},
  created () {
    this.loadFansList(1)
  },
  // mounted模板渲染完毕后执行
  mounted () {
    // 基于准备好的dom，初始化echarts实例
    // vue中获取dom 元素 ref
    var myChart = echarts.init(this.$refs.main)
    // 指定图表的配置项和数据
    var option = {
      title: {
        text: 'ECharts 入门示例'
      },
      tooltip: {},
      legend: {
        data: ['销量']
      },
      xAxis: {
        data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
      },
      yAxis: {},
      series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
      }]
    }
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option)
  },
  methods: {
    handleClick (tab, event) {
      console.log(tab, event)
    },
    loadFansList (page = 1) {
      getFansList({
        page,
        per_page: this.pageSize
      }).then(res => {
        console.log(res)
        this.fansList = res.data.data.results
        this.totalCount = res.data.data.total_count
      })
    }
  }
}
</script>
<style scoped lang="less">
.fans-one {
    text-align: center;
    margin-bottom: 20px;
}
</style>
