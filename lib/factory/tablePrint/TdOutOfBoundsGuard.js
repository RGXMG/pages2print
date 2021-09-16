/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/rgxmg@foxmail.com
 * Date: 2021/9/12
 * Time: 15:25
 *
 */
import { isTextNode, createTd } from '../../utils/elements.js';

/**
 * 表格单元的越界守卫
 * 1. 判断一个表格单元的高度是否超出当前页面
 */
export default class TdOutOfBoundsGuard {
  // 页面的像素高度
  pageHeightPixelSize;
  // 打印页面的容器
  printPageContainerElement;
  // 能接受的高度阈值
  thresholdHeight;
  // 处理接入td元素后的结构映射
  static handleAppendTdElementResultMap = {
    // 正常，即加上不会越界
    NORMAL: 'NORMAL',
    // 需要被分解，即越界且当前剩余超过了阈值
    SHOULD_BE_DECOMPOSE: 'SHOULD_BE_DECOMPOSE',
    // 下一页，即越界了且当前剩余没有超过阈值
    NEXT_PAGE: 'NEXT_PAGE',
  };

  constructor(pageHeightPixelSize, initPrintPageContainerElement) {
    this.pageHeightPixelSize = pageHeightPixelSize;
    this.printPageContainerElement = initPrintPageContainerElement;
  }

  setPageHeightPixelSize(pageHeightPixelSize) {
    this.pageHeightPixelSize = pageHeightPixelSize;
  }

  /**
   * 尝试创建td单元格到行中去
   * @param tdMeta
   * @param index
   * @param trElement
   */
  tryCreateTdElement2Tr(tdMeta, index, trElement) {
    const tdElement = createTd(tdMeta);
    // 越界时重写
    let rewriteTdElement = tdElement;
    let rewriteTdMeta = tdMeta;
    // 新的td元数据
    // 越界时创建
    let rebuildTdMeta = { pre: { ...tdMeta }, next: { ...tdMeta } };
    trElement.append(tdElement);
    const { handleResult, accommodateValue } = this.handleAppendTdElement(tdElement, tdMeta);

    // 应该被分解
    // 1. 分解内部元素
    // 2. 分出前半部分以及后半部分
    // 3. 重写rebuildTdMeta
    if (handleResult === TdOutOfBoundsGuard.handleAppendTdElementResultMap.SHOULD_BE_DECOMPOSE) {
      const { pre, next } = this.decomposeElementChildren(tdElement, accommodateValue);
      // 分解完毕，移除
      tdElement.remove();
      // 处理pre
      rebuildTdMeta.pre.childNodes = pre;
      rebuildTdMeta.pre.content = pre.reduce((m, p) => ((m += p.outerHTML), m), '');
      rebuildTdMeta.rowspan = rebuildTdMeta.rowspan ? rebuildTdMeta.rowspan - 1 : 1;

      // 处理next
      rebuildTdMeta.next.childNodes = next;
      rebuildTdMeta.next.rowspan = 1;
      rebuildTdMeta.next.content = pre.reduce((m, p) => ((m += p.outerHTML), m), '');

      // 处理rewriteTdElement
      rewriteTdElement = createTd({ ...tdMeta, content: '' });
      rebuildTdMeta.pre.forEach(p => rewriteTdElement.append(p));
      rewriteTdMeta = rebuildTdMeta.pre;
      trElement.append(rewriteTdElement);
    }
    return {
      handleResult,
      rewriteTdMeta,
      rewriteTdElement,
      rebuildTdMeta,
      accommodateValue,
    };
  }

  /**
   * 是否应该进行分解
   * 1. pageHeightPixelSize - top = 能够容纳的高度
   * 1. 能够容纳的高度在可接受的高度内，不分，反之分；
   * 3. td的高度超过pageHeightPixelSize，分，反之不分
   * @param tdElement
   * @param tdMeta
   */
  handleAppendTdElement(tdElement, tdMeta) {
    const { top, height } = tdElement.getBoundingClientRect();
    const reallyTop = this.printPageContainerElement.scrollTop + top;
    // 处理结构
    // normal 正常，即加上不会越界
    // shouldBeDecompose 需要被分解，即越界且当前剩余超过了阈值
    // nextPage 下一页，即越界了且当前剩余没有超过阈值
    let handleResult = TdOutOfBoundsGuard.handleAppendTdElementResultMap.NORMAL;

    // 当前页还剩下多少可容纳的高度
    const accommodateValue = this.pageHeightPixelSize - reallyTop;

    // 加上该td后是否超出了边界
    const isOutOfBounds = reallyTop + height > this.pageHeightPixelSize;

    // 需要被分解
    if (isOutOfBounds) {
      // 超出了边界并且剩余高度超出了阈值
      handleResult =
        accommodateValue > this.thresholdHeight
          ? TdOutOfBoundsGuard.handleAppendTdElementResultMap.SHOULD_BE_DECOMPOSE
          : TdOutOfBoundsGuard.handleAppendTdElementResultMap.NEXT_PAGE;
    }
    console.log(
      tdMeta,
      '页面高度：',
      this.pageHeightPixelSize,
      '剩余高度：',
      accommodateValue,
      '自身高度：',
      height,
      '加上后剩余高度',
      this.pageHeightPixelSize - reallyTop - height,
      '是否超出边界：',
      isOutOfBounds,
      '处理结果：',
      handleResult
    );
    return {
      // 处理结果
      handleResult,
      // 能容纳多少
      accommodateValue,
    };
  }

  /**
   * 分解td元素的子元素
   * 1. 克隆父节点
   * 2. 根据accommodateValue值计算不超过精度的元素
   * @param parentElement
   * @param accommodateValue
   */
  decomposeElementChildren(parentElement, accommodateValue) {
    // 子元素集合
    const childNodes = parentElement.childNodes || [];
    // 精度控制
    const precision = 50;
    let heightSum = 0;
    // 分开的元素
    let separateElements = { pre: [], next: [] };
    let hasResult = false;

    for (const node of childNodes) {
      if (hasResult) {
        separateElements.next.push(node);
        continue;
      }
      // 计算节点高度
      const nodeSumHeight = isTextNode(node)
        ? this.getTextNodeHeight(node)
        : this.getNormalNodeHeight(node);

      // 当前节点计算后的sum高度
      const currentNodeSumHeight = heightSum + nodeSumHeight;

      // 当前节点计算后的sum高度的高度差
      const currentNodeSumHeightDiffHeight = currentNodeSumHeight - accommodateValue;

      // 高度差小于precision
      if (currentNodeSumHeightDiffHeight < 0) {
        Math.abs(currentNodeSumHeightDiffHeight) < precision && (hasResult = true);
        separateElements.pre.push(node);
        heightSum += nodeSumHeight;
        continue;
      }

      if (isTextNode(node)) {
        const [preNode, nextNode] = this.decomposeTextNode(
          parentElement.cloneNode(),
          node,
          precision,
          accommodateValue,
          heightSum
        );
        separateElements.pre.push(preNode);
        separateElements.next.push(nextNode);
        continue;
      }

      // 循环参数
      const { pre, next } = this.decomposeElementChildren(node, accommodateValue);
      // 放入之前的
      const nodeCopyOfPre = node.cloneNode();
      pre.forEach(p => nodeCopyOfPre.appendChild(p));
      separateElements.pre.push(nodeCopyOfPre);

      // 放入之后的
      const nodeCopyOfNext = node.cloneNode();
      next.forEach(p => nodeCopyOfNext.appendChild(p));
      separateElements.next.push(nodeCopyOfNext);
    }

    return separateElements;
  }

  /**
   * 分离text
   * @param parentElement
   * @param node
   * @param precision
   * @param accommodateValue
   * @param heightSum
   * @returns {{next: string, pre: *}}
   */
  decomposeTextNode(parentElement, node, precision, accommodateValue, heightSum) {
    // 超出高度
    // 深入子元素进行计算高度
    // 1. text节点，采用二分法重新筛选
    let separateTexts = { pre: node.nodeValue, next: '' };
    let preHeight = 0;
    // 高度不在精度内，则继续分;
    while (heightSum + preHeight - accommodateValue > precision) {
      // 计算位置
      const index = Math.floor(separateTexts.pre.length / 2);
      // 计算左侧文字
      const text = separateTexts.pre.substr(0, index);
      // 计算右侧文字
      separateTexts.next = separateTexts.pre.substr(index);
      separateTexts.pre = text;
      // 创建text结点
      const textNode = document.createTextNode();
      // 父元素进行插入
      parentElement.append(textNode);
      preHeight = this.getTextNodeHeight(textNode);
      textNode.remove();
    }

    // 分装完毕，创建pre以及next结点
    return [
      document.createTextNode(separateTexts.pre),
      document.createTextNode(separateTexts.next),
    ];
  }

  /**
   * 获取text节点的高度
   * @param node
   * @returns {number|*}
   */
  getTextNodeHeight(node) {
    if (!node || !isTextNode(node)) {
      return node;
    }
    const range = document.createRange();
    range.selectNodeContents(node);
    const { height } = range.getBoundingClientRect();
    return height;
  }

  /**
   * 获取普通的结点高度
   * @param node
   * @returns {string|*}
   */
  getNormalNodeHeight(node) {
    if (isTextNode(node)) return node;
    const { marginTop, marginBottom } = document.defaultView.getComputedStyle(node);
    return node.offsetHeight + marginTop.replace('px', '') + marginBottom.replace('px', '');
  }
}
