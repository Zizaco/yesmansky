module.exports = {
  publicPath: (process.env.NODE_ENV === 'production') ? '' : '/', // gh-pages support https://cli.vuejs.org/config/#publicpath
  configureWebpack: {
    devtool: (process.env.NODE_ENV != 'production') ? 'source-map': 'none',
    devServer: {
      host: '0.0.0.0',
      port: 9000,
    },
  }
}
