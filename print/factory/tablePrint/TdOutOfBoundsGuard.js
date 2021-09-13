/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/rgxmg@foxmail.com
 * Date: 2021/9/12
 * Time: 15:25
 *
 */
import { isTextNode } from "../../utils/elements";

/**
 * 表格单元的越界守卫
 * 1. 判断一个表格单元的高度是否超出当前页面
 */
export default class TdOutOfBoundsGuard {
  // 页面的像素高度
  pageHeightPixelSize;
  // 打印页面的容器
  printPageContainerElement;

  constructor(pageHeightPixelSize, initPrintPageContainerElement) {
    this.pageHeightPixelSize = pageHeightPixelSize;
    this.printPageContainerElement = initPrintPageContainerElement;
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
    const { isOutOfBounds, accommodateValue } = this.validateOutOfBounds();

    // 超出界限
    // 1. 分解内部元素
    // 2. 分出前半部分以及后半部分
    // 3. 重写rebuildTdMeta
    if (isOutOfBounds) {
      tdElement.remove();
      const { pre, next } = this.decomposeElementChildren(
        tdElement,
        accommodateValue
      );
      rebuildTdMeta.pre.childNodes = pre;
      rebuildTdMeta.pre.content = pre.reduce(
        (m, p) => ((m += p.outerHTML), m),
        ""
      );
      rebuildTdMeta.next.childNodes = next;
      rebuildTdMeta.next.content = pre.reduce(
        (m, p) => ((m += p.outerHTML), m),
        ""
      );
      rewriteTdElement = createTd({ ...tdMeta, content: "" });
      rebuildTdMeta.pre.forEach((p) => rewriteTdElement.append(p));
      rewriteTdMeta = rebuildTdMeta.pre;
    }
    return {
      isOutOfBounds,
      rewriteTdMeta,
      rewriteTdElement,
      rebuildTdMeta,
    };
  }

  /**
   * 验证是否超出边界
   * 1. 元素的底部到顶部的距离 与 页面的高度的关系
   * @param tdElement
   * @param tdMeta
   */
  validateOutOfBounds(tdElement, tdMeta) {
    const { top, height } = tdElement.getBoundingClientRect();
    // tr距离页面页面顶部的距离 = 距离窗口的高度 + 自身的高度 + 滚动的高度
    const tdBottom2Top =
      top + height + this.printPageContainerElement.scrollTop;
    const isOutOfBounds = tdBottom2Top > this.pageHeightPixelSize;
    console.log(
      tdMeta,
      "top:::",
      top,
      "height",
      height,
      this.pageHeightPixelSize,
      top + height > this.pageHeightPixelSize
    );
    return {
      // 是否超出边界
      isOutOfBounds,
      // 元素的高度
      height,
      // 能容纳多少
      accommodateValue: this.pageHeightPixelSize - top,
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
      const currentNodeSumHeightDiffHeight =
        currentNodeSumHeight - accommodateValue;

      // 高度差小于precision
      if (currentNodeSumHeightDiffHeight < 0) {
        Math.abs(currentNodeSumHeightDiffHeight) < precision &&
          (hasResult = true);
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
      const { pre, next } = this.decomposeElementChildren(
        node,
        accommodateValue
      );
      // 放入之前的
      const nodeCopyOfPre = node.cloneNode();
      pre.forEach((p) => nodeCopyOfPre.appendChild(p));
      separateElements.pre.push(nodeCopyOfPre);

      // 放入之后的
      const nodeCopyOfNext = node.cloneNode();
      next.forEach((p) => nodeCopyOfNext.appendChild(p));
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
  decomposeTextNode(
    parentElement,
    node,
    precision,
    accommodateValue,
    heightSum
  ) {
    // 超出高度
    // 深入子元素进行计算高度
    // 1. text节点，采用二分法重新筛选
    let separateTexts = { pre: node.nodeValue, next: "" };
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
    const { marginTop, marginBottom } =
      document.defaultView.getComputedStyle(node);
    return (
      node.offsetHeight +
      marginTop.replace("px", "") +
      marginBottom.replace("px", "")
    );
  }
}
