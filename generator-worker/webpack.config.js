'use strict'
const path = require('path')

function resolve(dir) {
    return path.join(__dirname, dir)
}

const includes = [
  resolve('src'),
  resolve('test'),
  resolve('../common'),
];

module.exports = {
    entry: resolve('src/main'),
    output: {
        path: resolve('dist'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.ts'],
        alias: {
          '@': resolve('src')
        }
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: includes,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            presets: [
                                require.resolve('babel-preset-es2015'),
                            ],
                            plugins: [
                                require.resolve('babel-plugin-transform-object-rest-spread'),
                            ],
                        },
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            logLevel: 'warn'
                        }
                    }
                ]
            },
        ],
    },
};
