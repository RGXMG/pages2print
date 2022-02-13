/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/rgxmg@foxmail.com
 * Date: 2021/9/12
 * Time: 15:25
 *
 */
import { createTr, createTd } from '../../utils/elements.js';
import TdOutOfBoundsGuard from './TdOutOfBoundsGuard.js';
import createError from '../../utils/createError';
import { isContainerMeta } from '../../utils/containerMeta.js';

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
  waitCommitNewTrsData = {
    // 组合行元数据
    combinationTrMeta: [],
    // 非组合行，新的tr元数据集合
    newTrsMeta: [],
  };

  constructor(pageHeightPixelSize, initPrintPageContainerElement) {
    this.pageHeightPixelSize = pageHeightPixelSize;
    this.printPageContainerElement = initPrintPageContainerElement;
    this.tdOutOfBoundsGuardInstance = new TdOutOfBoundsGuard(
      pageHeightPixelSize,
      initPrintPageContainerElement
    );
    this.prevTrElementBoundingClientTop = 0;
  }

  createValidNextPageTrMetaList(trMeta) {
    const toRepair = (list, length, extraProperties) => {
      for (let j = length; j--; ) {
        list[j] = list[j] || '';
      }
      Object.assign(list, extraProperties);
    };
    const { length, tablePart, attributes } = trMeta;
    const extraProperties = { tablePart, attributes };
    const { combinationTrMeta, newTrsMeta } = this.waitCommitNewTrsData;
    if (combinationTrMeta.length) toRepair(combinationTrMeta, length, extraProperties);
    if (newTrsMeta.length) toRepair(newTrsMeta, length, extraProperties);
    return this.waitCommitNewTrsData;
  }

  /**
   * 尝试创建一个tr元素
   * @param trMeta
   * @param $i
   * @param tableMeta
   */
  tryCreateTrElement2Table(trMeta, $i, tableMeta) {
    this.waitCommitNewTrsData = {
      // 组合行元数据
      combinationTrMeta: [],
      // 非组合行，新的tr元数据集合
      newTrsMeta: [],
    };
    // 创建tr元素
    let {
      needCreateNewPage,
      rewrittenTrElement,
      rewrittenTrMeta,
      pageResidueHeight,
    } = this.createTrElement(trMeta);

    // 该行越界
    if (needCreateNewPage) {
      // 跨页处理
      this.acrossThePageUpgrade();
      // rewrittenTrMeta = this.getRewriteTrMeta(rewrittenTrMeta, $i, tableMeta);
    }

    return {
      rewrittenTrElement,
      nextTableMarginSize: pageResidueHeight,
      // 过滤为null的td
      rewrittenTrMeta,
      // 下一页的tr元数据集合
      nextPageTrMetaObject: this.createValidNextPageTrMetaList(trMeta),
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
    const newTrMeta = this.copyTrMeta(trMeta);
    for (let index = 0; index < newTrMeta.length; index++) {
      if (newTrMeta[index] !== null) continue;
      // 找到覆盖本单元格的某个上级单元格
      let murderer = null;
      // 行数的深度
      let deepNumber = 1;
      while (!murderer) {
        const trMeta = tableMeta[$i - deepNumber];
        if (trMeta) {
          if (trMeta[index] && typeof trMeta[index] === 'object') {
            murderer = trMeta[index];
          } else deepNumber++;
        }
      }
      // 提取剩余的rowspan数量
      console.log('分页处理：：：', murderer, trMeta);
      newTrMeta[index] = {
        ...murderer,
        content:
          murderer.appendMethod ===
            TdOutOfBoundsGuard.handleAppendTdElementResultMap.SHOULD_BE_DECOMPOSE && murderer.next
            ? murderer.next.content
            : '',
        rowspan: murderer.rowspan - deepNumber,
      };
      murderer.$el.setAttribute('rowspan', deepNumber);
    }
    console.log('分页处理后：：：', newTrMeta);
    return newTrMeta;
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
    // 重写过的tr元数据
    let rewrittenTrMeta = this.copyTrMeta(trMeta);

    // 创建元素
    const trElement = createTr();
    // 临时添加
    this.printPageTableElement[trMeta.tablePart].appendChild(trElement);
    // 添加元素
    rewrittenTrMeta.forEach(t => {
      console.log(t, isContainerMeta(t));
      !isContainerMeta(t) && trElement.append(createTd(t));
    });
    // 元素集合
    const tdElements = trElement.childNodes;

    let needCreateNewPage = false;

    // 本页剩余的高度
    // 如果该tr超出边界，那么则需要放置到下一页
    // 则下一页的表格需要距离上一个表格一定距离才能达到分页的效果
    // 下一个元素距离上一个元素的外边距
    // 依次为页面的分界线
    let pageResidueHeight = 0;

    // td元素的索引位置
    // 主要是为了排除空td
    let tdEleIndex = 0;
    for (let index = 0; index < rewrittenTrMeta.length; index++) {
      let tdMeta = rewrittenTrMeta[index];
      if (isContainerMeta(tdMeta)) continue;
      tdMeta = this.convertRawTdMeta(tdMeta);
      const tdElement = tdElements[tdEleIndex++];

      const {
        rebuildTdMeta,
        handleResult,
        accommodateValue,
        tdElement: rewriteTdElement,
      } = this.tdOutOfBoundsGuardInstance.tryCreateTdElement2Tr(tdMeta, tdElement);

      pageResidueHeight = accommodateValue;
      // 应该被放到下一行
      if (handleResult === TdOutOfBoundsGuard.handleAppendTdElementResultMap.NEXT_PAGE) {
        trElement.remove();
        this.waitCommitNewTrsData.newTrsMeta = trMeta;
        needCreateNewPage = true;
        break;
      }

      // 被分解过
      if (handleResult === TdOutOfBoundsGuard.handleAppendTdElementResultMap.SHOULD_BE_DECOMPOSE) {
        needCreateNewPage = true;

        // 新旧元素进行替换
        // 保证后续的比较在正常的区间内
        trElement.replaceChild(rewriteTdElement, tdElement);

        // 根据rebuildTdMeta数据重写当前td元数据 以及 新增下一行的元数据
        rewrittenTrMeta[index] = rebuildTdMeta.pre;

        // 组合行设置
        if (rebuildTdMeta.next.rowspan === 0) {
          rebuildTdMeta.next.rowspan = 1;
          this.waitCommitNewTrsData.combinationTrMeta[index] = rebuildTdMeta.next;
        } else {
          this.waitCommitNewTrsData.newTrsMeta[index] = rebuildTdMeta.next;
        }
      }
    }

    return {
      pageResidueHeight,
      needCreateNewPage,
      rewrittenTrElement: trElement,
      rewrittenTrMeta,
    };
  }

  whenLimitRenderTime() {
    return this.maxRenderTime && this.maxRenderTime <= this.renderTime;
  }

  convertRawTdMeta(tdMeta) {
    if (typeof tdMeta === 'object') {
      const isError = createError(!Array.isArray(tdMeta), 'td的元数据必须为字符串或者对象字面量');
      return isError ? { content: '' } : tdMeta;
    }
    return { content: tdMeta };
  }

  copyTrMeta(trMeta) {
    let newTrMeta = [...trMeta];
    newTrMeta.tablePart = trMeta.tablePart;
    return newTrMeta;
  }
}
