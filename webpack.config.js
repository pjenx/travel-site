const currentTask = process.env.npm_lifecycle_event;
const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fse = require('fs-extra');
const postCSSPlugins = [
    require('postcss-import'),
    require('postcss-mixins'),
    require('postcss-simple-vars'),
    require('postcss-nested'),
    require('postcss-hexrgba'),
    require('autoprefixer')
];

class RunAfterCompile {
    apply(compiler) {
        compiler.hooks.done.tap('Copy Images', function() {
            fse.copySync('./app/assets/images', './docs/assets/images');
        })
    }
}

let config = {};

if (currentTask === 'dev') {
    config = {
        entry: './app/assets/scripts/App.js',
        // creates an array of "plugins" for each .html file found
        plugins: fse.readdirSync('./app').filter(function(file) {
            return file.endsWith('.html');
        }).map(function(page) {
            return new HtmlWebpackPlugin({
                filename: page,
                template: `./app/${page}`
            });
        }),
        output: {
            filename: 'bundled.js',
            path: path.resolve(__dirname, 'app')
        },
        devServer: {
            before: function(app, server) {
                server._watch('./app/**/*.html')
            },
            contentBase: path.join(__dirname, 'app'),
            hot: true,
            port: 3000,
            host: '0.0.0.0'
        },
        mode: 'development',
        devtool: 'eval-source-map',
        module: {
            rules: [
                {
                    test: /\.(png|jpg)$/i,
                    use: [
                        'url-loader'
                    ]
                },
                {
                    test: /\.css$/i,
                    use: [
                        'style-loader', 
                        'css-loader', 
                        {
                            loader: "postcss-loader", 
                            options: {
                                postcssOptions: {plugins: postCSSPlugins}
                            }
                        }
                    ]
                }
            ]
        }
    };
} 
else if (currentTask === 'build') {
    postCSSPlugins.push(require('cssnano'));
    config = {
        entry: './app/assets/scripts/App.js',
        // an array of plugins
        plugins: [
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({ 
                filename: 'styles.[chunkhash].css' 
            }),
            new RunAfterCompile()
        // then add a plugin to the array for each html file found
        ].concat(fse.readdirSync('./app').filter(function(file) {
            return file.endsWith('.html');
        }).map(function(page) {
            return new HtmlWebpackPlugin({
                filename: page,
                template: `./app/${page}`
            });
        })),
        module: {
            rules: [
                {
                    test: /\.(png|jpg)$/i,
                    use: [
                        'url-loader'
                    ]
                },
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader, 
                        'css-loader', 
                        {
                            loader: "postcss-loader", 
                            options: {
                                postcssOptions: {plugins: postCSSPlugins}
                            }
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }
            ]
        },
        output: {
            filename: '[name].[chunkhash].js',
            chunkFilename: '[name].[chunkhash].js',
            path: path.resolve(__dirname, 'docs')
        },
        mode: 'production',
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendors",
                        enforce: true,
                        chunks: "all"
                    }
                }
            }
        }
        // plugins: [
        //     new CleanWebpackPlugin(),
        //     new MiniCssExtractPlugin({ filename: 'styles.[chunkhash].css' })
        // ]
    };
}



module.exports = config;