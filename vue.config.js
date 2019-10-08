module.exports = {
  configureWebpack: {
    devtool: (process.env.NODE_ENV != 'production') ? 'source-map': 'none',
    devServer: {
      host: '0.0.0.0',
      port: 9000,
    },
  }
}
