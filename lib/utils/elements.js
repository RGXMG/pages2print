/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/759237309@qq.com
 * Date: 2021/8/29
 * Time: 13:12
 * 关于元素的创建
 */

function createTable(attributes = {}) {
  const table = document.createElement('table');
  Object.keys(attributes).forEach(k => {
    table.setAttribute(k, attributes[k]);
  });
  table.setAttribute('border', '1');
  table.setAttribute('bordercolor', '#a0c6e5');
  return table;
}

function createTr(attributes = {}) {
  const tr = document.createElement('tr');
  Object.keys(attributes).forEach(k => {
    tr.setAttribute(k, attributes[k]);
  });
  return tr;
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

/**
 * 创建打印link标签
 * @returns {HTMLLinkElement}
 */
function createLink() {
  return document.createElement('link');
}

/**
 * 创建打印样式
 * @returns {HTMLLinkElement}
 */
function createStyle() {
  return document.createElement('style');
}

/**
 * 判断是否为text节点
 * @param node
 * @returns {boolean}
 */
function isTextNode(node) {
  return node && node.nodeName === '#text';
}

export { createTable, isTextNode, createTr, createTd, createLink, createStyle };
