<template>
 <div class="image-list">
     <!-- ---------单选框 ---------- -->
 <div  class="radio">
 <el-radio-group
 v-model="collect"
 @change="loadImage(1)"
 size="small"
 >
      <el-radio-button
      :label="false"
      >全部</el-radio-button>
      <el-radio-button
      :label="true"
      >收藏</el-radio-button>
    </el-radio-group>
    <el-button
    size="small"
    type="success"
    @click="dialogVisible = true"
    v-if="isShowAdd"
    >上传素材
    </el-button>
 </div>
 <!-- --------素材 -------------->
 <!-- gutter栅格间隔  -->
 <el-row
 class="images"
 :gutter="20">
  <el-col
  class="images-col"
  :lg="4"
  :md="6"
  :sm="12"
  :xs="20"
  v-for="(image, index) in imageList" :key="image.id">
      <el-image
      class="images-me"
      style="height: 200px"
      :src="image.url"
      fit="cover"
      @click.native="select = index"
      >
      </el-image>
       <div
       class="select"
       v-if="isShowSelect && select === index"
       ></div>
       <!-- 收藏/删除图标 -->
       <!--  网络慢时 可添加禁用-->
      <div class="isIcon" v-if="isShowCollect">
        <span class="btn cellect-btn">
          <el-button
          type="warning"
          :icon="image.is_collected ? 'icon el-icon-star-on' :  'icon el-icon-star-off'"
          circle
          size="small"
          @click="oncellect(image)"
          :loading="image.loading"
          ></el-button>
        <!-- <i
        :class="{
        'icon el-icon-star-on': image.is_collected,
        'icon el-icon-star-off': !image.is_collected
        }"
        :style=" image.is_collected ? 'color: red' : 'color: white'"
        @click="oncellect(image)"></i> -->
        </span>
        <span class="btn delete-btn">
          <el-button
          type="danger"
          circle
          icon="icon el-icon-delete"
          size="small"
          @click="ondeleteImage(image)"
          :loading="image.loading"
          >
          </el-button>
        <!-- <i
        class="icon el-icon-delete"
        @click="ondeleteImage(image.id)"></i> -->
        </span>
      </div>
  </el-col>
</el-row>
<!--   分页
@current-change分页发生改变时触发
page-size 每页大小
current-page.sync 当前页码
-->
<el-pagination
  background
  layout="prev, pager, next"
  :total="totalCount"
  @current-change="onCurrentChange"
  :page-size="pageSize"
  :current-page.sync="page"
  >
</el-pagination>

<!-- 弹层 -->
<!-- dialogVisible 显示弹层状态
    append-to-body 弹层插入至 body 元素上
 -->
<el-dialog
  title="上传素材"
  :visible.sync="dialogVisible"
  >
  <!-- upload上传
  组件自己可以请求提交上传 需要自己配置信息更麻烦!!何必呢?????
  请求方法默认POST
  action 完整路径
  headers 请求头
  name 上传的接口字段名
  -->
  <el-upload
  v-if="dialogVisible"
  class="upload-demo"
  drag
  action="http://ttapi.research.itcast.cn/mp/v1_0/user/images"
  :headers="uploadHeaders"
  name="image"
  multiple
  :on-success="onUploadSuccess">
  <i class="el-icon-upload"></i>
  <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
  <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
</el-upload>
</el-dialog>
 </div>
</template>

<script>
import { getImage, collectImage, deleteImage } from '@/api/image'
export default {
  name: 'ImageList',
  components: {},
  props: {
    // 上传素材
    isShowAdd: {
      type: Boolean, // 类型
      default: true // 默认值
    },
    // 收藏 删除
    isShowCollect: {
      type: Boolean,
      default: true
    },
    // 对勾
    isShowSelect: {
      type: Boolean,
      default: false
    }
  },
  data () {
    // 配置token
    const user = JSON.parse(window.localStorage.getItem('user'))
    return {
      collect: false, // 收藏
      imageList: [], // 素材列表
      dialogVisible: false, // 弹层显示
      uploadHeaders: {
        Authorization: `Bearer ${user.token}`
      },
      totalCount: 0, // 总页数
      pageSize: 10, // 每页显示条目个数
      page: 1, // 当前页面
      select: null // 选中的(索引)
    }
  },
  computed: {},
  watch: {},
  created () {
    // 页面初始化默认第1页
    this.loadImage(1)
  },
  mounted () {},
  methods: {
    // 获取素材 并渲染到页面------------------------------------------
    loadImage (page) {
      // 重新设置当前页码
      this.page = page
      getImage({
        page,
        per_page: this.pageSize,
        collect: this.collect
      }).then(res => {
        console.log(res)
        // 获取数据成功 渲染到页面
        // this.imageList = res.data.data.results
        // this.totalCount = res.data.data.total_count
        // 对象解构
        // const { results, total_count: totalCount } = res.data.data
        // this.imageList = results
        // this.totalCount = totalCount

        //  添加loading 重新设置获取
        const results = res.data.data.results
        results.forEach(image => { // 遍历循环results
          // 给遍历的每项数据添加收藏的loading
          image.loading = false
        })
        // 添加过loading状态的result 赋值给imageList
        this.imageList = results
        this.totalCount = res.data.data.total_count
      })
    },
    // 当全部和收藏按钮发生改变时-页面中可直接@click="loadImage(1)"
    // onChangeImage () {
    //   this.loadImage(1)
    // },
    // 添加素材 上传成功----------------------------------
    onUploadSuccess () {
      // 关闭弹层
      this.dialogVisible = false
      // 更新素材列表
      this.loadImage(this.page)
      // 弹出上传成功
      this.$message('上传成功')
    },
    // 页数发生改变时获取当前页------------------------------
    onCurrentChange (page) {
      // 重新渲染被点击页面 ???????????????????
      this.loadImage(page, this.collect)
    },
    // 收藏素材------------------------------------------------
    oncellect (image) {
      // 点击收藏或取消收藏时开启 loading状态
      image.loading = true

      // 已收藏取消收藏  |  没收藏添加到收藏
      collectImage(image.id, !image.is_collected).then(res => {
        image.is_collected = !image.is_collected
        this.loadImage(Image.is_collected)

        // 请求完成 关闭loading状态
        image.loading = false
        // console.log(res)
        // if (collect) { // 收藏
        //   // 重新渲染页面
        //   this.collect = false // ?????????????????????
        //   this.loadImage(false)
        //   this.$message({
        //     type: 'success',
        //     message: 'OK 收藏成功'
        //   })
        // } else {
        //   // 收藏页面取消时, 跳转到全部页面, 按钮的type转为全部
        //   this.collect = false
        //   this.loadImage()
        //   this.$message({
        //     type: 'danger',
        //     message: '取消收藏了再见'
        //   })
        // }
      })
    },
    // 删除素材---------------------------------------------------
    ondeleteImage (image) {
      image.loading = true
      console.log('delete')
      deleteImage(image.id).then(res => {
        console.log(res)
        // 删除成功
        this.loadImage(this.page)
        this.$message('删除素材成功')
        image.loading = false
      })
    }
  }
}
</script>
<style scoped lang="less">
.images {
  margin: 20px 0;
  .images-col {
    position: relative;
    .isIcon {
      height: 40px;
      text-align: center;
      position: absolute;
      bottom: 4px;
      left: 10px;
      right: 10px;
      background: rgba(0,0,0,.4);
      .btn {
        display: inline-block;
        height: 40px;
        width: 40px;
        line-height: 40px;
        .icon {
          color: #fff;
        }
        .sc{
          color: red;
        }
      }
      }
}
}
.radio {
    display: flex;
    justify-content: space-between;
}
.select {
  background: url(./selected.png) no-repeat;
  background-size: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-content: center;
}
</style>
