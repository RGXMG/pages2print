/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/759237309@qq.com
 * Date: 2021/8/29
 * Time: 13:12
 * 关于元素的创建
 */

function createTable({ head, body, foot, attributes }) {
  const table = document.createElement('table');
  Object.keys(attributes || {}).forEach(k => {
    table.setAttribute(k, attributes[k]);
  });
  table.setAttribute('border', '1');
  table.setAttribute('bordercolor', '#a0c6e5');

  // 创建表头
  if (head && typeof head === 'object') {
    const thead = document.createElement('thead');
    Object.keys(head.attributes || {}).forEach(k => {
      thead.setAttribute(k, attributes[k]);
    });
    table.append(thead);
  }

  // 创建表身
  if (body && typeof body === 'object') {
    const tbody = document.createElement('tbody');
    Object.keys(body.attributes || {}).forEach(k => {
      tbody.setAttribute(k, attributes[k]);
    });
    table.append(tbody);
  }

  // 创建表尾
  if (foot && typeof foot === 'object') {
    const tfoot = document.createElement('tfoot');
    Object.keys(foot.attributes || {}).forEach(k => {
      tfoot.setAttribute(k, attributes[k]);
    });
    table.append(tfoot);
  }
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
      (typeof v === 'string' || typeof v === 'number') && td.setAttribute(k, v);
    }
    options.$el = td;
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
