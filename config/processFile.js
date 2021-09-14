/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/759237309@qq.com
 * Date: 2020/12/27
 * Time: 19:59
 *
 */
const resolve = path => require('path').join(__dirname, path);
const packageJson = require('../package.json');

const footer = '/* ©rgxmg 2020, follow me on Email! rickgrimes9229@gmail.com/rgxmg92@163.com */';
module.exports = [
  {
    name: `${packageJson.name}.umd.js`,
    useEnv: 'development',
    input: {
      input: resolve('../lib/index.js'),
    },
    output: {
      footer,
      sourcemap: true,
      name: packageJson.name,
      file: resolve(`../dist/${packageJson.name}.umd.js`),
      format: 'umd',
    },
  },
  {
    name: `${packageJson.name}.esm.js`,
    useEnv: 'development',
    input: {
      input: resolve('../lib/index.js'),
    },
    output: {
      footer,
      sourcemap: true,
      file: resolve(`../dist/${packageJson.name}.esm.js`),
      format: 'esm',
    },
  },
  {
    name: `${packageJson.name}.umd.min.js`,
    useEnv: 'production',
    input: {
      input: resolve('../lib/index.js'),
    },
    output: {
      file: resolve(`../dist/${packageJson.name}.umd.min.js`),
      name: packageJson.name,
      format: 'umd',
    },
  },
];
