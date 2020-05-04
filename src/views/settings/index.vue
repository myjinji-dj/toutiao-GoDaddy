<template>
 <div class="settings-contarner">
<el-card class="box-card">
    <!-- 面包屑--- -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>个人设置</el-breadcrumb-item>
</el-breadcrumb>
    <el-row>
      <el-col :span="15">
          <!-- 表单------------- -->
        <el-form
        class="form-body"
        ref="form"
        :model="user"
        label-width="80px"
        :rules="settingRules"
        >
        <el-form-item label="编号">
            {{ user.id }}
        </el-form-item>
        <el-form-item label="手机">
            {{ user.mobile }}
        </el-form-item>
        <el-form-item label="媒体名称" prop="name">
            <el-input v-model="user.name"></el-input>
        </el-form-item>
        <el-form-item label="媒体介绍" prop="intro">
            <el-input type="textarea" v-model="user.intro"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
            <el-input v-model="user.email"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="onUpload()" :loading="updateProfileLoading">保存</el-button>
        </el-form-item>
        </el-form>
      </el-col>
    <el-col :offset="2" :span="4">
        <!-- lable for 和 id 对应 -->
        <label for="file">
          <el-avatar
            shape="square"
            :size="150"
            fit="cover"
            :src="user.photo"
         ></el-avatar>
            <p>点击修改头像</p>
        </label>
        <!-- <p @click="$ref.file.click()">点击修改头像</p> -->
        <input
        type="file"
        id="file"
        ref="file"
        hidden
        @change="onFileChange"
        >
    </el-col>
    </el-row>
</el-card>

<!-- opened Dialog 打开动画结束时的回调 -->
<!--  -->
<el-dialog
  title="修改头像"
  :visible.sync="dialogVisible"
  append-to-body
  @opened="onDialogOpened"
  @closed="onDialogClosed"
  >
 <div class="previewImage-wrap">
    <img
    class="previewImage"
    :src="previewImage"
    ref="preview-image"
    >
 </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button
    type="primary"
    @click="onUpdatePhoto"
    :loading="updatePhotoLoading"
    >确 定</el-button>
  </span>
</el-dialog>
 </div>
</template>

<script>
import {
  getUserProfile,
  updatePhoto,
  putchUserProfile
} from '@/api/user'
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'
import globalBus from '@/utils/global-bus'
export default {
  name: 'SettingsIndex',
  components: {},
  props: {},
  data () {
    return {
      user: {
        email: '',
        id: null,
        intro: '',
        mobile: '',
        photo: ''
      },
      dialogVisible: false, // 图片剪裁预览的显示状态
      previewImage: '', // 预览图片
      cropper: null, // 裁切器实例
      updatePhotoLoading: false, // 确定按钮的loding
      updateProfileLoading: false, // 保存按钮loading
      // 验证表单
      settingRules: {
        name: [
          { required: true, message: '请输入媒体名称', trigger: 'blur' },
          { min: 1, max: 7, message: '长度在 1 到 7 个字符', trigger: 'blur' }
        ],
        intro: [
          { required: true, message: '请输入媒体介绍', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入email', trigger: 'change' },
          { pattern: /^\w+@\w+(\.\w+)+$/, message: '请输入正确email', trigger: 'change' }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created () {
    this.loadUser()
  },
  mounted () {},
  methods: {
    onUpload (user) {
      // 表单验证
      // this.$REfs[user].validate((vaild) => {
      //   if (vaild) {
      //     alert('修改成功')
      //   } else {
      //     alert('修改失败')
      //     return false
      //   }
      // })
      // 开启loading
      this.updateProfileLoading = true
      const { name, intro, email } = this.user
      putchUserProfile({
        name,
        intro,
        email
      }).then(res => {
        // 提示
        this.$message({
          type: 'success',
          message: '保存成功'
        })
        // 关闭loading
        this.updateProfileLoading = false
        // 发送数据给 layout顶部导航栏
        globalBus.$emit('userProfile', this.user)
      })
    },

    loadUser () {
      getUserProfile().then(res => {
        // console.log(res)
        this.user = res.data.data
      })
    },
    onFileChange () {
      // 图片预览
      const file = this.$refs.file
      const blobData = window.URL.createObjectURL(file.files[0])
      this.previewImage = blobData
      // 显示弹出层预览选择图片
      this.dialogVisible = true
      // 解决相同文件不触发
      this.$refs.file.value = ''
    },
    // 对话框打开动画结束后进行初始化
    onDialogOpened () {
      // 图片裁剪器需要基于! img! 可见状态! 才可完成初始化
      // 获取图片DOM节点
      const image = this.$refs['preview-image']

      // 第一次初始化后 剪裁预览图片改变剪裁器不会改变 需要更新剪裁器
      // 剪裁器.replace方法  或  销毁剪裁器重新初始化

      // 初始化裁切器
      // 剪裁器.replace方法
      if (this.cropper) {
        this.cropper.replace(this.previewImage)
        return
      }
      this.cropper = new Cropper(image, {
        // aspectRatio 初始化比例
        aspectRatio: 1,
        // crop移动剪裁器触发的方法
        // viewMode 裁剪器移动范围 默认0无限制 1不超过画布大小
        viewMode: 1,
        // dragMode裁剪器拖动模式 默认crop创建新的裁剪框 move移动画布 none固定
        dragMode: 'none',
        // backgound 布尔值 控制马赛克填充 默认显示true
        // background: true,
        // cropBoxResizable 是否允许拖动剪裁框大小
        cropBoxResizable: false
      })
    },
    // 关闭弹出层 结束动画时
    onDialogClosed () {
      // 对话框关闭 销毁裁剪器 (和.replace选一个)
      // this.cropper.destroy()
    },
    // 更换头像点击确定时
    onUpdatePhoto () {
      // 开启loading
      this.updatePhotoLoading = true
      // 获取裁切的图片对象 getCroppedCanvas([options])
      this.cropper.getCroppedCanvas().toBlob((file) => {
        // console.log(file) //文件对象
        // 创建FormDate空对象
        const fd = new FormData()
        // 追加 fd.append('字段名', 文件对象)
        fd.append('photo', file)

        // 修改用户头像  data中传入formdata对象 fd
        updatePhoto(fd).then(res => {
          // console.log(res)
          // 修改成功关闭弹层
          this.dialogVisible = false
          // 重新渲染页面
          // this.user.photo = res.data.data.photo  需要请求 更新慢
          // ??????????????????????????????????????????????????????
          this.user.photo = window.URL.createObjectURL(file)

          // 关闭loading
          this.updatePhotoLoading = false

          // 提示成功
          this.$message({
            type: 'success',
            message: '更新成功'
          })

          // 发送头像数据给 layout
          globalBus.$emit('userProfile', this.user)
        })
      })
    }
  }
}

</script>
<style scoped lang="less">
.form-body {
  margin: 20px 0;
}
.previewImage-wrap {
  .previewImage {
    display: block;
    max-width: 100%;
    height: 200px;
  }
}
</style>
