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
  thresholdHeight = 30;
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
   * @param tdElement
   */
  tryCreateTdElement2Tr(tdMeta, tdElement) {
    // 新的td元数据
    // 越界时创建
    let rebuildTdMeta = { pre: { ...tdMeta }, next: { ...tdMeta } };
    // 获取结果以及当前页剩下多少高度
    const { handleResult, accommodateValue } = this.handleAppendTdElement(tdElement, tdMeta);

    // 应该被分解
    // 1. 分解内部元素
    // 2. 分出前半部分以及后半部分
    // 3. 重写rebuildTdMeta
    if (handleResult === TdOutOfBoundsGuard.handleAppendTdElementResultMap.SHOULD_BE_DECOMPOSE) {
      const { pre, next } = this.decomposeElementChildren(tdElement, accommodateValue);
      // 处理pre
      rebuildTdMeta.pre.childNodes = pre;
      rebuildTdMeta.pre.content = pre.reduce(
        (m, p) => ((m += isTextNode(p) ? p.nodeValue : p.outerHTML), m),
        ''
      );

      // 处理rowspan
      // 1. rowspan = 1: 即分页的下一行跟本行属于同一行，两行消耗个rowspan
      // 2. rowspan > 1: 即分页的下一行跟本行不属于同一行，两行消耗2个rowspan
      if (rebuildTdMeta.pre.rowspan > 1) {
        rebuildTdMeta.pre.rowspan = 1;
        rebuildTdMeta.next.rowspan--;
      } else {
        // 用0代表改为上页组合行 不可写入
        rebuildTdMeta.next.rowspan = 0;
      }

      // 处理next
      rebuildTdMeta.next.content = next.reduce(
        (m, p) => ((m += isTextNode(p) ? p.nodeValue : p.outerHTML), m),
        ''
      );

      // 覆盖
      tdElement = createTd(rebuildTdMeta.pre);
    }

    return {
      rebuildTdMeta,
      handleResult,
      tdMeta,
      tdElement,
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
    const preDisplay = tdElement.style.display;
    tdElement.style.display = 'inherit';
    const { top, height } = tdElement.getBoundingClientRect();
    tdElement.style.display = preDisplay;
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
   * @param parentNode
   * @param accommodateValue
   */
  decomposeElementChildren(parentNode, accommodateValue) {
    // 子元素集合
    const childNodes = parentNode.childNodes || [];
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

      // 内容高度未超过剩余高度
      if (currentNodeSumHeightDiffHeight < 0) {
        // 加上内容高度后满足可接受的高度，即在此产生分页
        if (Math.abs(currentNodeSumHeightDiffHeight) < this.thresholdHeight) {
          hasResult = true;
        } else {
          separateElements.pre.push(node);
          // 保存高度
          heightSum += nodeSumHeight;
        }
        continue;
      }

      // 内容高度超过了剩余高度
      if (isTextNode(node)) {
        const [preNode, nextNode] = this.decomposeTextNode(
          node,
          this.thresholdHeight,
          accommodateValue,
          heightSum,
          nodeSumHeight
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
   * @param node
   * @param precision
   * @param accommodateValue
   * @param heightSum
   * @param initPreHeight
   * @returns {{next: string, pre: *}}
   */
  decomposeTextNode(node, precision, accommodateValue, heightSum, initPreHeight) {
    // 保留之前的text用于还原
    const saveNodeValue = node.nodeValue;
    // 超出高度
    // 深入子元素进行计算高度
    // 1. text节点，采用二分法重新筛选
    let separateTexts = { pre: node.nodeValue, next: '' };
    let preHeight = initPreHeight;

    // 剩余高度 - 内容高度 大于 容忍高度 => 继续分解
    // 内容高度 > 剩余高度 => 继续分解
    let heightBeyond = false;

    // 移动的倍数
    // 向next分1次，则向pre分二分之一
    // 向next分2次，则向pre分4分之一
    // 反之亦然
    let moveToPoints = {
      toNext: 2,
      toPre: 0,
    };
    while (
      (heightBeyond = heightSum + preHeight > accommodateValue) ||
      accommodateValue - (heightSum + preHeight) > precision
    ) {
      // 分解pre
      if (heightBeyond) {
        // 设置倍数
        moveToPoints.toPre += 2;
        // 计算位置
        const index = Math.floor(separateTexts.pre.length / moveToPoints.toNext);
        // 计算左侧文字
        const leftText = separateTexts.pre.substr(0, index);
        // 计算右侧文字
        separateTexts.next = separateTexts.pre.substr(index) + separateTexts.next;
        separateTexts.pre = leftText;
      } else {
        // 设置倍数
        moveToPoints.toNext += 2;
        // 分解next
        // 计算位置
        const index = Math.floor(separateTexts.next.length / moveToPoints.toPre);
        // 计算左侧文字
        separateTexts.pre += separateTexts.next.substr(0, index);
        // 计算右侧文字
        separateTexts.next = separateTexts.next.substr(index);
      }

      // 创建text结点
      node.nodeValue = separateTexts.pre;
      preHeight = this.getTextNodeHeight(node);
    }

    // 分离完成之后，挨个将字数进行填充
    // 满足分页时，最后一行的字数与其他行相等
    let heightChange = false;
    let toNextChar = '';
    let time = 0;
    while (!heightChange) {
      time++;
      console.log('保证行数据:::', time);
      toNextChar = separateTexts.next.substr(0, 1);
      separateTexts.next = separateTexts.next.substr(1);

      // 创建text结点
      node.nodeValue = separateTexts.pre + toNextChar;
      const height = this.getTextNodeHeight(node);
      // 两者不相等
      // 高度变化
      // 还原pre
      if (preHeight !== height) {
        heightChange = true;
        separateTexts.next = toNextChar + separateTexts.next;
      } else {
        // 改变pre值
        separateTexts.pre += toNextChar;
      }
    }

    node.nodeValue = saveNodeValue;
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
