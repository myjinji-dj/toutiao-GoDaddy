<template>
 <div class="cover-upload">
     <!-- 容器 -->
     <div class="cover-wrap" @click="showCover">
        <!-- img -->
        <img
        class="cover-image"
        ref="cover-image"
        :src="value">
     </div>
     <el-dialog
        title="选择封面"
        :visible.sync="dialogVisible"
        append-to-body
        >
          <el-tabs v-model="activeName" type="card" >
            <el-tab-pane label="素材库" name="first">
              <!-- 素材库内容 -->
              <image-list
              :is-show-add="false"
              :is-show-collect="false"
              ref="image-list"
              is-show-select
              />
            </el-tab-pane>
            <el-tab-pane label="上传图片" name="second">
                <input type="file" ref="file" @change="onFileChange">
                <img
                width="200"
                ref="preview-image">
            </el-tab-pane>
          </el-tabs>
        <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onCoverConfirm">确 定</el-button>
        </span>
    </el-dialog>
 </div>
</template>

<script>
import ImageList from '@/views/image/component/image-list'
import { uploadImage } from '@/api/image'
// import imageList from '../../image/component/image-list.vue'
export default {
  name: 'CoverIndex',
  components: {
    ImageList
  },
  props: ['value'],
  // props: ['upload-image'],
  data () {
    return {
      dialogVisible: false,
      activeName: 'second' // 默认导航为 second上传图片
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  methods: {
    showCover () {
      this.dialogVisible = true
    },
    // 文件域发生改变时
    onFileChange () {
      // console.log(1111)
      //   console.log(this.$refs.file) // input文件
      //   console.log(this.$refs.file.files) // FileList{0: File, length: 1}文件对象
      //   console.log(this.$refs.file.files[0])  // 文件file
      // 获取文件对象
      const file = this.$refs.file.files[0]
      // 图片预览
      const blob = window.URL.createObjectURL(file)
      // console.log(blob)
      this.$refs['preview-image'].src = blob
    },
    // 当点击确定时
    onCoverConfirm  () {
      // 判断选中文件是否为空 和 activeName导航按钮 是否为 second
      if (this.activeName === 'second') {
        // file 文件对象
        const file = this.$refs.file.files[0]
        if (!file) {
          this.$message('请选择文件')
          return
        }
        // 判断完有文件 上传文件
        // 获取文件对象
        const fd = new FormData()
        fd.append('image', file)
        // 请求接口
        uploadImage(fd).then(res => {
          // 上传成功 关闭弹层 展示上传图片
          this.dialogVisible = false
          // 展示上传图片
          this.$refs['cover-image'].src = res.data.data.url

          // 把图片地址传给父组件
          this.$emit('input', res.data.data.url)
        })
      } else if (this.activeName === 'first') {
        // 如果选中的 是素材库 获取选中的索引
        // 通过ref 获取组件实例  (父组件直接访问子组件数据)
        const ImageList = this.$refs['image-list']
        // 得到选择图片的索引
        const select = ImageList.select
        // 判断
        if (select === null) {
          this.$message = '请选择文件'
          return
        }
        // 否则 关闭弹窗
        this.dialogVisible = false
        // 修改父组件 绑定url到封面
        this.$emit('input', ImageList.imageList[select].url)
      }
    }
  }
}
</script>
<style scoped lang="less">
.cover-upload {
    display: flex;
.cover-wrap {
    width: 200px;
    height: 200px;
    border: 1px dashed #ccc;
    .cover-image {
      width: 100%;
      height: 200px;
    }
}
}

</style>
