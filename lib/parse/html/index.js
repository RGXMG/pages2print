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
