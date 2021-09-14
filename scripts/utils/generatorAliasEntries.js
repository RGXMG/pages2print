/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/759237309@qq.com
 * Date: 2020/12/30
 * Time: 22:10
 *
 */

const path = require('path');
/**
 * 生成依赖entries
 * @param config
 * @returns {*}
 */
module.exports = function generatorAliasEntries(config) {
  const resolve = p => path.join(__dirname, '../../config', p);
  return Object.keys(config).reduce((m, k) => ((m[k] = resolve(config[k])), m), {});
};
