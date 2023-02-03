// const {
//   defineConfig
// } = require('@vue/cli-service')
let path = require('path')
function resolve(dir){
  return path.join(__dirname,dir)
}
module.exports = ({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src'),
      },
    },
  },
  devServer: {
    hot: true,
    port: 8080,
    // open: true,
    // overlay: {
    //   warnings: false,
    //   errors: true
    // },

    // port: 8080, // 端口
    // https: false, // 启用https
    proxy: {
      '/apiDev': {
        // 目标 API 地址
        target: "http://localhost:3050", //真实的api地址
        // 如果要代理 websockets
        // 将主机标头的原点更改为目标URL
        changeOrigin: true,
        pathRewrite: {
          '^/apiDev': '',
        },
      },
    }
  },
})