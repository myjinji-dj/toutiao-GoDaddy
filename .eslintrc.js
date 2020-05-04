module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  // 自定义代码效验规范
  rules: {
    // process.env.NODE_ENV === 'production'用来判定代码运行的环境
    // process.env.NODE_ENV 两种值
    //                  production  生产环境
    //                  development 开发环境
    // 开发时 npm run serve 启动开发模式
    // 部署到线上 npm run build 构建生产环境运行的代码
    // no-console 代码不允许出现console.xxx
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 'no-unused-vars': 'off' // 关闭这个规则验证
    'no-unused-vars': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
