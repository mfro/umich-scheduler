const path = require('path');
const webpack = require('webpack');

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

module.exports = function (env) {
    const config = {
        entry: path.resolve(__dirname, 'src/index'),

        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'bundle.js',
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: babelLoader,
                },
                {
                    test: /\.ts$/,
                    use: [
                        babelLoader,
                        {
                            loader: 'ts-loader',
                            options: { logLevel: 'warn' }
                        }
                    ],
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        preserveWhitespace: false,
                        loaders: {
                            js: 'babel-loader?' + JSON.stringify(babelLoader.options),
                            less: 'style-loader!css-loader!less-loader?strictMath=on'
                        }
                    }
                },
                {
                    test: /\.csv$/,
                    loader: 'file-loader'
                },
                {
                    test: /\.less$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'less-loader',
                            options: { strictMath: 'on' }
                        }
                    ]
                },
            ]
        },

        resolve: {
            extensions: ['.js', '.ts', '.vue'],

            alias: {
                '@': path.resolve(__dirname, 'src'),
            }
        },

        performance: {
            hints: false
        },

        plugins: []
    };

    if (env == 'prod') {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            comments: false,
        }));

        config.plugins.push(new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }));
    }

    return config;
}