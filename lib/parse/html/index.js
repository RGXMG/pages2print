/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/rgxmg@foxmail.com
 * Date: 2021/9/21
 * Time: 20:50
 *
 */
function parseHTML() {}

function isTrNode(node) {
  return node.nodeName === 'TR';
}
function isTdNode(node) {
  return node.nodeName === 'TD';
}

function createTd(options) {
  const td = document.createElement('td');
  let innerText = options;
  if (options && typeof options === 'object') {
    const { content, ...rest } = options;
    innerText = content;
    for (const [k, v] of Object.entries(rest)) {
      td.setAttribute(k, v);
    }
  }
  td.innerText = innerText;
  return td;
}

class Wrench {
  constructor(element) {
    this.element = element;
    // 纵向修复零件池
    this.longitudinalRepairPartPool = [];
  }

  createPart() {
    const part = document.createElement('td');
    part.style.display = 'none';
    return part;
  }

  /**
   * 在之前插入
   * @param {*} part 
   */
  insertAfter(part, insertPart) {
    if (typeof part.after === "function") {
      return part.after(insertPart);
    } 
    if (part.parent.lastChild === part) {
      return part.parent.appendChild(insertPart);
    }
    part.parent.insertBefore(insertPart, part.nextElementSibling);
  }

  /**
   * 已破损
   * @param {*} part
   */
  isBroken(part) {
    return part.getAttribute('rowspan') > 1 || part.getAttribute('colspan') > 1;
  }

  /**
   * 横向修复
   * @param {*} part
   */
  toLateralRepair(part) {
    const colspan = part.colspan || 1;
    while (colspan --) {
      const newPart = this.createPart();
      insertAfter(part, newPart);
      part = newPart;
    }
  }

  /**
   * 记录纵向修复所需要的零件
   * @param {*} part 
   * @param {*} tdIndex 
   */
  toRecordLongitudinalRepairPart(part, tdIndex) {
    const rowspan = part.rowspan || 1;
    this.longitudinalRepairPartPool[tdIndex] = this.longitudinalRepairPartPool[tdIndex] || [];
    while (rowspan --) {
      this.longitudinalRepairPartPool[tdIndex].push(this.createPart());
    }
  }

  /**
   * 纵向修复
   * @param {*} part
   */
  toLongitudinalRepair(part, tdIndex, elementChildren) {
    if (!this.longitudinalRepairPartPool[tdIndex] || !this.longitudinalRepairPartPool[tdIndex].length) return;
    // TODO 
  }

  /**
   * 剪除枝叶
   * @param {*} part 
   */
  toCutoffLeaf(part) {

  }

  /**
   * 使用扳手
   */
  useWrench() {
    // 循环tr
    const elementChildren = this.element.children;
    for (let trIndex = 0; trIndex < elementChildren.length; trIndex++) {
      // 循环td
      const trChildren = elementChildren[trIndex].children;
      for (let tdIndex = 0; tdIndex < trChildren.length; tdIndex++) {
        const tdEle = trChildren[tdIndex];
        if (isBroken(tdEle)) {
          // 修复
          this.toLateralRepair(tdEle);
          this.toRecordLongitudinalRepairPart(tdEle, tdIndex);
          this.toLongitudinalRepair(tdEle, tdIndex, trChildren);
        }
      }
    }
  }
}

function useWrench(element) {}

function parseTable(tabELe) {
  const theadEle = tabELe.querySelector('thead');
  const colgroupEle = tabELe.querySelector('colgroup');
  const tbodyEle = tabELe.querySelector('tbody');
  const tfootEle = tabELe.querySelector('tfoot');

  const tbodyEleChildren = tbodyEle.children;
  const { saveInsertTransaction, executeInsertTransaction } = createInsertTransaction();
  for (let i = 0; i < tbodyEleChildren.length; i++) {
    const trEle = tbodyEle.children[i];
    if (!isTrNode(trEle)) continue;

    const trEleChildren = trEle.children;
    for (let j = 0; j < trEleChildren.length; j++) {
      const tdEle = trEleChildren[j];
      if (!isTdNode(tdEle)) continue;

      // 标记是否为最后一个td element
      const isLastTdEle = j === trEleChildren.length - 1;

      // 处理rowspan
      let rowspan = tdEle.getAttribute('rowspan');
      // 执行插入事务
      executeInsertTransaction(i, j);
      // 插入到下一行
      insertToNextTrEle(rowspan, isLastTdEle, j, trEle);
      // 保存插入事务
      saveInsertTransaction(trEle, rowspan, i, j);

      let colspan = tdEle.getAttribute('colspan');
      let nextTdEle = tdEle.nextElementSibling;
      while (--colspan) {
        const newTdEle = createTd({ style: 'display: none' });
        nextTdEle
          ? (trEle.insertBefore(newTdEle, nextTdEle), (nextTdEle = newTdEle))
          : trEle.appendChild(newTdEle);
      }
    }
  }
}

function createNewTdEle() {
  return createTd({ style: 'display: none' });
}

function insertToNextTrEle(rowspan, isLastTdEle, index, nextTrEle) {
  if (!rowspan || Number.isNaN(Number(rowspan)) || rowspan <= 0 || rowspan === 1) return;
  if (!nextTrEle) return;
  const newTdEle = createNewTdEle();
  isLastTdEle
    ? nextTrEle.appendChild(newTdEle)
    : nextTrEle.insertBefore(newTdEle, nextTrEle.children[index]);
}

function createInsertTransaction() {
  // 待插入的事件池
  // 按照行数
  const transactionPendingInsertPool = {};
  const saveInsertTransaction = (trEle, rowspan, trIndex, tdIndex, isLastTdEle) => {
    rowspan = rowspan - 1;
    if (!rowspan || rowspan < 1) return;
    transactionPendingInsertPool[trIndex] = transactionPendingInsertPool[trIndex] || {};
    transactionPendingInsertPool[trIndex][tdIndex] = () => {
      let nextTrEle = trEle.nextElementSibling;
      while (rowspan-- && nextTrEle) {
        nextTrEle = nextTrEle.nextElementSibling;
      }
      nextTrEle && insertToNextTrEle(rowspan, isLastTdEle, tdIndex, nextTrEle);
    };
  };
  const executeInsertTransaction = (i, j) => {
    const trTransactionObject = transactionPendingInsertPool[i - 1];
    for (let i = 0; i < j; i++) {
      const tdExecute = trTransactionObject[i];
      tdExecute && tdExecute();
    }
  };
  return {
    saveInsertTransaction,
    executeInsertTransaction,
  };
}
