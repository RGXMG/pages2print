const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const VuePlugin = require('vue-loader/lib/plugin');
const aliasConfig = require('./config/alias');
const generatorAliasEntries = require('./scripts/utils/generatorAliasEntries');

const cssExtReg = /\.css$/;
const lessExtReg = /\.less$/;

/**
 * 扩展生成style的rules配置
 * @param extReg
 * @param preLoader
 * @returns {{oneOf: [{resourceQuery: RegExp, use: *}, {resourceQuery: RegExp, use: *}, {test: RegExp, use: *}, {use: *}], test: *}}
 */
const extraGeneratorStyleRules = (extReg, preLoader) => {
  const getValidUseLoaders = defaultLoaders => (
    preLoader && defaultLoaders.push(preLoader), defaultLoaders
  );
  return {
    test: extReg,
    oneOf: [
      {
        resourceQuery: /module/,
        use: getValidUseLoaders([
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              importLoaders: 2,
              modules: {
                localIdentName: '[name]_[local]_[hash:base64:5]',
              },
            },
          },
        ]),
      },
      {
        resourceQuery: /\?vue/,
        use: getValidUseLoaders([
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              importLoaders: 2,
            },
          },
        ]),
      },
      {
        test: /\.module\.\w+$/,
        use: getValidUseLoaders([
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              importLoaders: 2,
              modules: {
                localIdentName: '[name]_[local]_[hash:base64:5]',
              },
            },
          },
        ]),
      },
      {
        use: getValidUseLoaders([
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              importLoaders: 2,
            },
          },
        ]),
      },
    ],
  };
};

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, './build'),
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.vue', '.jsx'],
    alias: generatorAliasEntries(aliasConfig),
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      extraGeneratorStyleRules(cssExtReg),
      extraGeneratorStyleRules(lessExtReg, {
        loader: 'less-loader',
        options: {
          sourceMap: false,
        },
      }),
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'fonts/[name].[hash:8].[ext]',
                },
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'img/[name].[hash:8].[ext]',
                },
              },
            },
          },
        ],
      },
      {
        test: /.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    overlay: {
      warnings: false,
      errors: true,
    },
  },
  plugins: [
    new VuePlugin(),
    new HtmlWebpackPlugin(),
    // new EslintWebpackPlugin({
    //   extensions: ['.js', '.vue'],
    //   failOnError: false,
    //   emitError: false,
    // }),
  ],
};
