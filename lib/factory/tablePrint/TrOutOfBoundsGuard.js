/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/rgxmg@foxmail.com
 * Date: 2021/9/12
 * Time: 15:25
 *
 */
import { createTr } from '../../utils/elements.js';
import TdOutOfBoundsGuard from './TdOutOfBoundsGuard.js';

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
  // 待提交的新的tr元数据
  waitCommitNewTrMeta = [];
  // 创建待提交的tr元数据后渲染的次数
  numberOfRenderCreatedWaitCommit = 0;
  // 渲染次数限制，当达到这个次数后，必须强制分页
  limitOfRenderTime = 0;

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
   * 获取待提交的新tr元数据
   * 1. 即获取因为前面分页导致的新创建的tr行
   * 2. 需要根据位置进行合并
   * @param rewriteTrMeta {Array}
   */
  getWaitCommitNewTrMeta(rewriteTrMeta) {
    let newTrMeta = [...rewriteTrMeta];
    const times = this.numberOfRenderCreatedWaitCommit;
    this.waitCommitNewTrMeta.forEach((tdMeta, $index) => {
      const { rowspan } = tdMeta;
      newTrMeta[$index] = { ...newTrMeta[$index], rowspan: rowspan - times };
    });
    // 重置
    this.waitCommitNewTrMeta = [];
    this.numberOfRenderCreatedWaitCommit = 0;
    this.limitOfRenderTime = 0;
    return newTrMeta;
  }

  /**
   * 尝试创建一个tr元素
   * @param trMeta
   * @param $i
   * @param tableMeta
   */
  tryCreateTrElement2Table(trMeta, $i, tableMeta) {
    this.numberOfRenderCreatedWaitCommit++;
    // 创建tr元素
    let { trBeDecomposed, trIsNextPage, rewrittenTrElement, rewrittenTrMeta, pageResidueHeight } =
      this.createTrElement(trMeta);

    // 该行越界
    if (trIsNextPage) {
      // 跨页处理
      this.acrossThePageUpgrade();
      rewrittenTrMeta = this.getRewriteTrMeta(rewrittenTrMeta, $i, tableMeta);
    }

    return {
      trBeDecomposed,
      trIsNextPage: trIsNextPage || this.limitOfRenderTime === this.numberOfRenderCreatedWaitCommit,
      rewrittenTrElement,
      nextTableMarginSize: pageResidueHeight,
      // 过滤为null的td
      rewrittenTrMeta: rewrittenTrMeta,
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
      return { ...murderer, content: '', rowspan: murderer.rowspan - deepNumber };
    });
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
    this.tdOutOfBoundsGuardInstance.setPageHeightPixelSize(this.pageHeightPixelSize);
  }

  /**
   * 根据trMeta创建td元素
   * 1. 创建
   * 2. 添加
   * 3. 判断是否超出边界
   * @param trMeta
   * @returns {Object<{isRewritten: boolean, trElement: HTMLElement}>}
   */
  createTrElement(trMeta) {
    // 创建元素
    const trElement = createTr();
    // 临时添加
    this.printPageTableElement.appendChild(trElement);

    // 重写使用的tr元素
    const rewrittenTrElement = createTr();
    let trBeDecomposed = false;
    let trIsNextPage = false;

    // 本页剩余的高度
    // 如果该tr超出边界，那么则需要放置到下一页
    // 则下一页的表格需要距离上一个表格一定距离才能达到分页的效果
    // 下一个元素距离上一个元素的外边距
    // 依次为页面的分界线
    let pageResidueHeight = 0;

    // 重写过的tr元数据
    let rewrittenTrMeta = [...trMeta];

    for (let index = 0; index < rewrittenTrMeta.length; index++) {
      const tdMeta = rewrittenTrMeta[index];
      // 没有值不处理
      if (!tdMeta) continue;

      const { handleResult, accommodateValue, rewriteTdMeta, rewriteTdElement, rebuildTdMeta } =
        this.tdOutOfBoundsGuardInstance.tryCreateTdElement2Tr(tdMeta, index, trElement);

      pageResidueHeight = accommodateValue;
      // 应该被放到下一行
      if (handleResult === TdOutOfBoundsGuard.handleAppendTdElementResultMap.NEXT_PAGE) {
        trIsNextPage = true;
        trElement.remove();
        break;
      }

      // 被分解过
      if (
        trBeDecomposed ||
        handleResult === TdOutOfBoundsGuard.handleAppendTdElementResultMap.SHOULD_BE_DECOMPOSE
      ) {
        // 强制限制渲染次数
        if (!this.limitOfRenderTime && rewriteTdMeta.rowspan > 1) {
          this.limitOfRenderTime = rewriteTdMeta.rowspan - 1;
        }
        trBeDecomposed = true;
        rewrittenTrMeta[index] = rewriteTdMeta;
        rewrittenTrElement.append(rewriteTdElement);
        this.waitCommitNewTrMeta[index] = rebuildTdMeta.next;
      }
    }

    if (trBeDecomposed) {
      trElement.remove();
      this.printPageTableElement.appendChild(rewrittenTrElement);
    }

    return {
      pageResidueHeight,
      trBeDecomposed,
      trIsNextPage,
      rewrittenTrElement: trBeDecomposed ? trElement : rewrittenTrElement,
      rewrittenTrMeta,
    };
  }
}
