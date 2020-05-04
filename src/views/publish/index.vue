<template>
 <div class="publish-container">
   <el-card class="box-card">
  <div slot="header" class="clearfix">
    <!-- 面包屑路径导航 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
     <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
     <el-breadcrumb-item>{{ $route.query.id ? "修改文章" :  "发布文章" }}</el-breadcrumb-item>
     </el-breadcrumb>
     <!-- /面包屑 -->
  </div>
    <el-form ref="publish-form" :rules="publishRules" :model="article" label-width="60px">
  <el-form-item label="标题" prop="title">
    <el-input v-model="article.title"></el-input>
  </el-form-item>
  <el-form-item label="内容" prop="content">
    <el-tiptap
      v-model="article.content"
      :extensions="extensions"
      placeholder="请输入文章内容"
      height="400"
    />
  </el-form-item>
  <el-form-item label="封面">
    <el-radio-group v-model="article.cover.type">
      <el-radio :label="1">单图</el-radio>
      <el-radio :label="3">三图</el-radio>
      <el-radio :label="0">无图</el-radio>
      <el-radio :label="-1">自动</el-radio>
    </el-radio-group>
    <!-- ----------封面---------------------- -->
    <!--遍历组件 判断选中状态 type>0显示组件  -->
    <template v-if="article.cover.type > 0">
      <cover-upload
      v-for="(cover, index) in article.cover.type"
      :key="cover"
      v-model="article.cover.images[index]"
      />

      <!-- <cover-upload
      v-for="(cover, index) in article.cover.type"
      :key="cover"
      @cover-image="onshowImage(index, $event)"
      :upload-image="article.cover.images[index]"
      /> -->
    </template>
  </el-form-item>
  <el-form-item label="频道" prop="channel_id">
    <el-select v-model="article.channel_id" placeholder="请选择">
      <el-option
       v-for="(channel, index) in channels" :key="index"
       :label="channel.name" :value="channel.id"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onPublish(false)">发表</el-button>
    <el-button @click="onPublish(true)">存入草稿</el-button>
  </el-form-item>
</el-form>
</el-card>
 </div>
</template>

<script>
import CoverUpload from './comment/cover-upload'
import {
  getArticleChannels,
  publishArticle,
  getArticle,
  updatedArticle
} from '@/api/article'
// 引入素材图片
import { uploadImage } from '@/api/image'
// 局部引入
import {
  ElementTiptap,
  // 需要的 extensions
  Doc,
  Text,
  Paragraph,
  Heading,
  Bold,
  Underline,
  Italic,
  Strike,
  ListItem,
  BulletList,
  OrderedList,
  Preview,
  Image,
  TodoItem,
  TodoList, // 待办 要和TodoItem一起使用
  TextColor,
  Blockquote, // 引用
  TextAlign, // 文本对齐方式
  Fullscreen
} from 'element-tiptap'
// import element-tiptap 样式
import 'element-tiptap/lib/index.css'
export default {
  name: 'PublishIndex',
  components: {
    'el-tiptap': ElementTiptap,
    CoverUpload
  },
  props: {},
  data () {
    return {
      channels: [], // 频道列表
      article: {
        title: '', // 文章标题
        content: '', // 文章内容
        // 封面
        cover: {
          type: 1,
          images: []
        },
        channel_id: null // 频道id
      },
      // 编辑器的 extensions
      // 它们将会按照你声明的顺序被添加到菜单栏和气泡菜单中
      extensions: [
        new Doc(), // 文档
        new Text(), // 文字
        new Paragraph(), // 段落 必须↑
        new Heading({ level: 5 }), // 标题 level:5 5级标题
        new Bold({ bubble: true }), // 在气泡菜单中渲染菜单按钮
        new Underline(), // 下划线
        new Italic(), // 斜体
        new TextColor(), // 文字颜色
        new Image({
          // 默认是base64格式图片
          uploadRequest (file) {
            // 创建 FormDate空对象
            const fd = new FormData()
            // 追加image文件
            fd.append('image', file)
            // return返回一个 Promise<url>
            return uploadImage(fd).then(res => {
              // return的url
              return res.data.data.url
            })
          }
        }),
        new TextAlign(), // 文本对齐方式
        new Strike(), // 删除线
        new ListItem(), // 列表 不会显示
        new BulletList(), // 无序列表
        new OrderedList(), // 有序列表
        new TodoItem(),
        new TodoList(),
        new Blockquote(), // 引用
        new Fullscreen(), // 全屏
        new Preview() // 预览
      ],
      // 表单验证
      publishRules: {
        // 标题
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' },
          { min: 5, max: 30, message: '长度在 5 到 30 个字符', trigger: 'blur' }
        ],
        // 内容
        content: [
          { required: true, message: '请输入文章内容', trigger: 'blur' },
          {
            validate: (rule, value, callback) => {
              if (value === '<p></p>') {
                callback(new Error('请输入文章内容'))
              } else {
                callback()
              }
            }
          }
        ],
        // 频道
        channel_id: [
          { required: true, message: '请选择频道', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created () {
    this.loadChannels()
    // 因为路由和修改用的是一个组件,判断是否路径传入id 传入id就请求展示文章内容
    if (this.$route.query.id) {
    // 请求展示修改内容
      this.loadArticle()
    }
  },
  mounted () {},
  methods: {
    // 获取频道
    loadChannels () {
      getArticleChannels().then(res => {
        this.channels = res.data.data.channels
      })
    },
    // 点击发表
    onPublish (draft = false) {
      // 验证表单
      this.$refs['publish-form'].validate(valid => {
        // 验证失败
        // console.log(valid) false/true
        if (!valid) {
          return
        }
        // 验证成功 调接口提交数据
        const articleId = this.$route.query.id
        if (articleId) {
          // 判断是否传入的有id 有id 修改
          updatedArticle(articleId, this.article, draft).then(res => {
            console.log(res)
            this.$message({
              type: 'success',
              message: '修改成功!'
            })
            // 跳转到文章页面
            this.$router.push('/article')
          })
        } else {
          // 否则 发布文章
          publishArticle(this.article, draft).then(res => {
          // console.log(res)
            this.$message({
              type: 'success',
              message: '发布成功!'
            })
            // 跳转到文章页面
            this.$router.push('/article')
          })
        }
      })
    },
    // 加载指定文章内容
    loadArticle () {
    //  获取指定文章渲染到页面
    // 求求了 this.$route可访问地址栏参数
      getArticle(this.$route.query.id).then(res => {
        // console.log(res)
        // console.log(this.$route) // 路由实例
        // console.log(this.$route.query) // {id: "1253999219967000576"}
        // console.log(this.$route.query.id) // 1253999219967000576
        this.article = res.data.data
      })
    },
    onshowImage (index, url) {
      // console.log(url)
      this.article.cover.images[index] = url
    }
  }
}
</script>
<style scoped lang="less">
</style>
