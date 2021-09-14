/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/rgxmg@foxmail.com
 * Date: 2021/9/10
 * Time: 23:21
 * 打印窗口
 */

import { createLink, createStyle } from '../../utils/elements.js';

/**
 * 打印窗口
 */
export default class PrintWindow {
  // 窗口操作手柄
  windowOpener;

  // printStyle: 打印样式
  // printCssSource: 打印样式表
  options;

  /**
   * @param pageSize
   * @param options<{ printStyle: String, pageHeightPixelSize }>
   */
  constructor(pageSize, options) {
    this.options = options;
    this.createNewPrintWindow();
    this.initialPrintStyle(pageSize);
  }

  print() {
    this.windowOpener.print();
  }

  close() {
    this.windowOpener.close();
  }

  getPrintWindowOpener() {
    return this.windowOpener;
  }

  /**
   * 获取打印容器
   * @returns {HTMLElement}
   */
  getPrintContainer() {
    return this.windowOpener.document.body;
  }

  /**
   * 初始化打印样式
   * @param pageSize
   */
  initialPrintStyle(pageSize) {
    const [w, h] = pageSize;
    const { printStyle, printCssSource } = this.options;
    const document = this.windowOpener.document;

    // 清空页面样式
    document.documentElement.style.cssText =
      document.body.style.cssText = `padding: 0px;margin:0px`;

    // 限制页面的宽高
    document.body.style.width = `${w}mm`;
    document.body.style.height = `${h}mm`;

    if (printStyle) {
      const printStyleEle = createStyle();
      printStyleEle.innerHTML = `@media print { ${printStyle} }`;
      document.head.append(printStyleEle);

      const styleEle = createStyle();
      styleEle.innerHTML = printStyle;
      document.head.append(styleEle);
    }
    if (printCssSource) {
      const printLink = createLink();
      printLink.setAttribute('media', 'print');
      printLink.setAttribute('ref', printCssSource);
      document.head.append(printLink);

      const link = createLink();
      link.setAttribute('ref', printCssSource);
      document.head.append(link);
    }
  }

  /**
   * 创建一个新的打印窗口
   * @returns {Window}
   */
  createNewPrintWindow() {
    this.windowOpener = window.open(
      'about:blank',
      '__new__print__window__',
      'height=1,width=1,top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no,close=no'
    );
  }
}
