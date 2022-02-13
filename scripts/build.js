/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/759237309@qq.com
 * Date: 2020/12/27
 * Time: 18:56
 * 打包配置，需要请自行扩展
 */
const chalk = require('chalk');
const rollupPluginJson = require('@rollup/plugin-json');
const rollupPluginNodeResolve = require('rollup-plugin-node-resolve');
const rollupPluginCommonjs = require('@rollup/plugin-commonjs');
const rollupPluginTerser = require('rollup-plugin-terser');
const rollupPluginVue = require('rollup-plugin-vue');
const rollupPluginAlias = require('@rollup/plugin-alias');
const babel = require('@rollup/plugin-babel').default;

const { loading } = require('./utils/log');
const externalConfig = require('../config/external');
const processConfig = require('../config/processFile');
const aliasConfig = require('../config/alias');
const generatorAliasEntries = require('./utils/generatorAliasEntries');

const rollup = require('rollup').rollup;

// 默认pluginsArray配置
const commonNormalPlugins = [
  rollupPluginCommonjs(),
  rollupPluginNodeResolve(),
  rollupPluginVue(),
  babel({ babelHelpers: 'runtime', exclude: 'node_modules/**' }),
  rollupPluginJson(),
  rollupPluginAlias({
    entries: generatorAliasEntries(aliasConfig),
  }),
];

/**
 * 生成每个item
 * 1. 返回包含处理过程中的必备参数配置
 * @param itemConfig
 */
function generatorProcessItem(itemConfig) {
  const { useEnv, input, output, ...rest } = itemConfig;
  let config = {
    input: {
      ...input,
      plugins: commonNormalPlugins,
    },
    output,
    ...rest,
  };
  if (useEnv === 'production') {
    config.input.plugins.push(rollupPluginTerser.terser());
  }
  return config;
}

/**
 * 合并扩展项到处理配置中
 * @param preConfig
 * @param external
 * @returns {*}
 */
function mergeExternalToPreProcessConfig(preConfig, external) {
  let mergeObject = {
    external: [],
    globals: {},
  };
  for (const esName of Object.keys(external)) {
    mergeObject.external.push(esName);
    mergeObject.globals[esName] = external[esName].globalKey;
  }
  preConfig.forEach(i => {
    Object.assign(i.input, {
      external: mergeObject.external,
    });
    Object.assign(i.output, {
      globals: mergeObject.globals,
    });
  });
}

async function build() {
  mergeExternalToPreProcessConfig(processConfig, externalConfig);
  for (const c of processConfig) {
    const spinner = loading(`Start packing 【${c.name}】`);
    const { input, output } = generatorProcessItem(c);
    const bundle = await rollup(input);
    // generate code and a sourcemap
    await bundle.generate(output);
    // or write the bundle to disk
    await bundle.write(output);
    spinner.succeed(`done.${c.name}`);
  }
}

build().then(() => {
  console.log(chalk.green('packing done, you can publish'));
});
