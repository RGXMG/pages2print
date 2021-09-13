/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/rgxmg@foxmail.com
 * Date: 2021/9/12
 * Time: 15:25
 *
 */
import { createTr } from "../../utils/elements";
import TdOutOfBoundsGuard from "./TdOutOfBoundsGuard";

/**
 * 表格行的越界守卫
 * 1. 控制表格行是否超出当页
 */
export default class TrOutOfBoundsGuard {
  // 页面的像素高度
  pageHeightPixelSize;
  // 打印页面的容器
  printPageContainerElement;
  // 打印页面的表格容器
  printPageTableElement;
  // 上一行BoundingClient的top值
  prevTrElementBoundingClientTop;
  // 单元格越界守卫实例
  tdOutOfBoundsGuardInstance;

  constructor(pageHeightPixelSize, initPrintPageContainerElement) {
    this.pageHeightPixelSize = pageHeightPixelSize;
    this.printPageContainerElement = initPrintPageContainerElement;
    this.tdOutOfBoundsGuardInstance = new TdOutOfBoundsGuard(
      pageHeightPixelSize,
      initPrintPageContainerElement
    );
    this.prevTrElementBoundingClientTop = 0;
  }

  /**
   * 设置表格元素容器
   * @param tableElement
   */
  setTableElementContainer(tableElement) {
    this.printPageTableElement = tableElement;
  }

  /**
   * 跨页处理
   * 1. 进行升级页面pix大小
   * 2. 将下一个表格的margin进行设置
   */
  acrossThePageUpgrade() {
    this.pageHeightPixelSize *= 2;
  }

  /**
   * 验证是否超出边界
   * 1. 元素的底部到顶部的距离 与 页面的高度的关系
   * @param trElement
   * @param trMeta
   */
  validateOutOfBounds(trElement, trMeta) {
    const { top, height } = trElement.getBoundingClientRect();
    // tr距离页面页面顶部的距离 = 距离窗口的高度 + 自身的高度 + 滚动的高度
    const trBottom2Top =
      top + height + this.printPageContainerElement.scrollTop;
    const res = [trBottom2Top > this.pageHeightPixelSize, trBottom2Top];
    console.log(
      trMeta,
      "top:::",
      top,
      "height",
      height,
      this.pageHeightPixelSize,
      top + height > this.pageHeightPixelSize
    );
    return res;
  }

  /**
   * 尝试创建一个tr元素
   * @param trMeta
   * @param $i
   * @param tableMeta
   */
  tryCreateTrElement2Table(trMeta, $i, tableMeta) {
    // 如果该tr超出边界，那么则需要放置到下一页
    // 则下一页的表格需要距离上一个表格一定距离才能达到分页的效果
    // 下一个元素距离上一个元素的外边距
    // 依次为页面的分界线
    let nextTableMarginSize = 0;
    // 重写的tr元数据，如果该tr越界，需要重写
    let rewriteTrMeta = trMeta;
    // 重写tr元素，如果该tr越界，需要重写
    let rewriteTrElement = null;

    // 创建tr元素
    const trElement = this.createTrElement(trMeta);

    // 临时添加
    this.printPageTableElement.appendChild(trElement);

    // 验证是否超出边界
    const [isOutOfBounds, trBottom2Top] = this.validateOutOfBounds(
      trElement,
      trMeta
    );

    // 超过边界
    // 1. 删除trElement
    if (isOutOfBounds) {
      trElement.remove();
      const {
        newTrMeta: t,
        nextTableMarginSize: n,
        newTrElement: r,
      } = this.handleOutOfBounds(trMeta, $i, tableMeta);
      nextTableMarginSize = n;
      rewriteTrMeta = t;
      rewriteTrElement = r;
    }
    // 覆盖上一个
    this.prevTrElementBoundingClientTop = trBottom2Top;

    return {
      isOutOfBounds,
      nextTableMarginSize,
      // 过滤为null的td
      rewriteTrMeta: rewriteTrMeta.filter((t) => t),
      rewriteTrElement,
    };
  }

  /**
   * 超过边界
   * 2. 计算nextTableMarginSize
   * 3. 处理新的trMeta
   * 4. 创建新的tableContainer
   * 5. 插入超出边界的tr元素
   * @param trMeta
   * @param $i
   * @param tableMeta
   * @returns {{nextTableMarginSize: number, newTrMeta}}
   */
  handleOutOfBounds(trMeta, $i, tableMeta) {
    const rewriteTrMeta = this.getRewriteTrMeta(trMeta, $i, tableMeta);
    const nextTableMarginSize =
      this.pageHeightPixelSize - this.prevTrElementBoundingClientTop;

    // 跨页处理
    this.acrossThePageUpgrade(nextTableMarginSize);

    // 创建超出边界的tr元素
    const rewriteTrElement = this.createTrElement(rewriteTrMeta);

    return {
      rewriteTrElement,
      rewriteTrMeta,
      nextTableMarginSize,
    };
  }

  /**
   * 处理超出边界的tr的元数据
   * 1. 跨页处理
   * 2. 单元格的延展操作
   * @param trMeta
   * @param $i 第几行
   * @param tableMeta
   */
  getRewriteTrMeta(trMeta, $i, tableMeta) {
    return trMeta.map((tdMeta, index) => {
      if (tdMeta !== null) return tdMeta;
      // 找到覆盖本单元格的某个上级单元格
      let murderer = null;
      // 行数的深度
      let deepNumber = 1;
      // 找到父级不为null的td
      while ((murderer = tableMeta[$i - deepNumber][index]) === null) {
        deepNumber++;
      }
      // 提取剩余的rowspan数量
      return { ...murderer, rowspan: murderer.rowspan - deepNumber };
    });
  }

  /**
   * 根据trMeta创建td元素
   * 1. 创建
   * 2. 添加
   * 3. 判断是否超出边界
   * @param trMeta
   * @returns {HTMLTableRowElement}
   */
  createTrElement(trMeta) {
    // 创建元素
    const trElement = createTr();
    trMeta.forEach((tdMeta, index, trMeta) => {
      const { isOutOfBounds, rewriteTdMeta, rewriteTdElement } =
        this.tdOutOfBoundsGuardInstance.tryCreateTdElement2Tr(
          tdMeta,
          index,
          trMeta,
          trElement
        );
    });
    return trElement;
  }
}
