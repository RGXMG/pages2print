const ora = require('ora');
const chalk = require('chalk');
/**
 * 导出一个可控制的loading
 * @param text {string}
 * @returns { * }
 */
function loading(text) {
  let spinner = ora({
    text: chalk.yellow(text),
    spinner: {
      interval: 120,
      frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
    },
  });
  spinner.start();
  return spinner;
}
module.exports = {
  loading,
};
