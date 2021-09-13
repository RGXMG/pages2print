/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/759237309@qq.com
 * Date: 2021/8/29
 * Time: 13:12
 * 生成打印工厂返回
 */
import pageMap from "./pageConfig.js";
import Factory from "./factory";
import createError from "./utils/createError.js";

const defaultOptions = {
  // 页面大小 默认A4大小
  // 传入string代表为纸张类型
  // 传入数组，eg: [宽，高] 代表自定义纸张大小
  page: "A4",
  // 打印的css样式链接，会自动生成<link ref="[printCssSource]" media="print" />
  printCssSource: void 0,
  // 打印的样式 会自动生成 @media print { [printStyle] }
  printStyle: void 0,
};

function handleOptions(opts) {
  const { page } = opts;
  if (typeof page === "string") {
    opts.pageSize = pageMap[page];
    createError(
      opts.pageSize,
      `不存在${page}类型的默认纸张，请通过自定义传入！`
    );
  }
}

/**
 * 创建一个打印程序
 * @param opts {Object<{ page?: string|Array, printCssSource?: string, printStyle?: string }>}
 * @returns {Factory}
 */
function createPrintProgram(opts) {
  // 合并创建参数
  const options = { ...defaultOptions, ...opts };
  handleOptions(options);

  return new Factory(options);
}

export default createPrintProgram;
