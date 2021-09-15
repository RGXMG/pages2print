/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/759237309@qq.com
 * Date: 2021/8/29
 * Time: 14:47
 *
 */
import getPagePixelSize from '../utils/getPagePixelSize.js';
import TablePrint from './TablePrint';
import PrintWindow from './window/PrintWindow.js';
import createError from '../utils/createError.js';

export default class Factory {
  // 总的配置
  opts;
  // 页面大小 【宽，高】
  pageSize;
  // 打印的css样式链接，会自动生 成<link ref="[printCssSource]" media="print" />
  printCssSource;
  // 打印的样式 会自动生成 @media print { [printStyle] }
  printStyle;
  // 页面的高度大小以px为单位
  pageHeightPixelSize;
  // 页面的px像素
  tablePrintInstance;
  // 要打印的html内容缓存
  printPageWindow;
  // 打印页面的容器元素
  printPageContainerElement;
  // 要打印的元数据缓存
  printMetaCache = [];

  constructor(options) {
    this.opts = options;
    this.parseOpts();
  }

  /**
   * 创建普通的内容
   * 非表格
   * @param content
   */
  createNormalContent(content) {
    this.initPrintWindow();
    this.printMetaCache.push(content);
    this.printPageContainerElement.appendChild(content);
    return this;
  }

  /**
   * 创建表格内容，配置格式如下
   *  [ // 表格配置项，该数组的attributes属性表示该table的html属性
   *      [ // 表格行配置项，该数组的attributes属性表示该行的html属性
   *          { colspan: 0, rowspan: 4, content: "cell 6" }, // 表格td的配置项，如果该td存在一些html属性时，可使用对象表示，内部content表示td的
   *"cell 7", // 表格td的配置项，如果该td只存在content时，可以直接用string表示
   *      ],
   *  ]
   * @param tableOptions
   */
  createTableContent(tableOptions) {
    this.initPrintWindow();
    this.initTablePrint();
    const { tableMetaPool } = this.tablePrintInstance.createContent(tableOptions);
    this.printMetaCache.push(tableMetaPool);
    return this;
  }

  /**
   * 执行打印
   */
  execPrint() {
    this.printPageWindow.print();
  }

  /**
   * 获取打印窗口
   * @returns {*}
   */
  getPrintWindow() {
    return this.printPageWindow.getPrintWindowOpener();
  }

  /**
   * 获取打印元数据数据
   * @returns {[]}
   */
  getPrintMetaCacheArray() {
    return this.printMetaCache;
  }

  /**
   * 解析配置项
   */
  parseOpts() {
    const { pageSize, printCssSource, printStyle } = this.opts;
    createError(
      Array.isArray(pageSize) && pageSize.length === 2,
      'pageSize必须为数组且包含宽高属性'
    );
    createError(
      printCssSource || printStyle,
      'printCssSource和printStyle应该至少包含一个，才能保证正常的打印样式'
    );
    this.pageSize = pageSize;
    this.pageHeightPixelSize = getPagePixelSize(pageSize[1]);
    this.printCssSource = printCssSource;
    this.printStyle = printStyle;
  }

  /**
   * 懒初始化
   * 创建打印实例
   */
  initTablePrint() {
    if (!this.tablePrintInstance) {
      // 创建打印实例
      this.tablePrintInstance = new TablePrint(
        this.pageHeightPixelSize,
        this.printPageContainerElement
      );
    }
  }

  /**
   * 懒初始化
   * 初始化打印页面
   */
  initPrintWindow() {
    if (!this.printPageWindow) {
      // 初始化打印页面
      this.printPageWindow = new PrintWindow(this.pageSize, {
        printStyle: this.printStyle,
        printCssSource: this.printCssSource,
      });
      // 获取打印窗口的容器
      this.printPageContainerElement = this.printPageWindow.getPrintContainer();
    }
  }
}
