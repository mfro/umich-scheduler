'use strict'
const utils = require('./utils')
const config = require('../config')
const isProduction = process.env.NODE_ENV === 'production'

const babelLoader = {
    loader: 'babel-loader',
    options: {
        presets: [
            require.resolve('babel-preset-es2015'),
        ],
        plugins: [
            require.resolve('babel-plugin-transform-object-rest-spread'),
        ],
    },
};

module.exports = {
  preserveWhitespace: false,
  loaders: Object.assign({}, utils.cssLoaders({
    sourceMap: isProduction
      ? config.build.productionSourceMap
      : config.dev.cssSourceMap,
    extract: isProduction
  }), {
    'js': 'babel-loader?' + JSON.stringify(babelLoader.options),
  }),
  transformToRequire: {
    video: 'src',
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
