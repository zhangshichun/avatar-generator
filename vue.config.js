module.exports = {
  devServer: {
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      // change xxx-api/login => mock/login
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      ['juejin']: {
        target: 'https://juejin.cn',
        changeOrigin: true,
        pathRewrite: {
          [`^/juejin`]: ''
        },
        logLevel: 'debug'
      }
    }
  },
}