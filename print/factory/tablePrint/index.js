/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/rgxmg@foxmail.com
 * Date: 2021/9/12
 * Time: 15:24
 *
 */

import TrOutOfBoundsGuard from "./TrOutOfBoundsGuard";
import { createTable } from "../../utils/elements";

/**
 * 表格打印类
 */
export default class TablePrint {
  // 页面的像素高度
  pageHeightPixelSize;
  // 打印页面的容器元素
  printPageContainerElement;
  // 表格容器
  // 用来插入表格行
  printPageTableElement;
  // 行越界守卫实例
  trOutOfBoundsGuardInstance;

  constructor(pageHeightPixelSize, initPrintPageContainerElement) {
    this.pageHeightPixelSize = pageHeightPixelSize;
    this.printPageContainerElement = initPrintPageContainerElement;
    // 初始化行越界守卫
    this.trOutOfBoundsGuardInstance = new TrOutOfBoundsGuard(
      pageHeightPixelSize,
      initPrintPageContainerElement
    );
  }

  /**
   * 设置初始化的page内容
   * @param content
   */
  setInitPrintPageContainerElement(content) {
    this.initPageContent = content;
    this.printPageContainerElement = content;
    return this;
  }

  /**
   * 创建页面容器
   */
  createNewPageTableElement(tableOptions) {
    this.printPageTableElement = createTable(tableOptions.attributes || {});
    this.printPageContainerElement.append(this.printPageTableElement);
    this.trOutOfBoundsGuardInstance.setTableElementContainer(
      this.printPageTableElement
    );
  }

  /**
   * 创建表格元数据池
   * 1. 提供一个创建表格item到池中
   * 2. 提供边格池持久化
   * @param tableOptions {Array}
   * @returns {((function(): *)|[])[]}
   */
  createTableMetaPool(tableOptions) {
    let tableMetaPool = [];
    const attributes = tableOptions.attributes || [];
    return [
      function (strandedHeight) {
        const tableMeta = [];
        if (strandedHeight) {
          tableMeta.attributes = {
            style: attributes.style + `;margin-top: ${strandedHeight}px`,
          };
        }
        tableMetaPool.push(tableMeta);
        return tableMeta;
      },
      tableMetaPool,
    ];
  }

  /**
   * 创建表格内容，配置格式如下
   *
   * [ // 表格配置项，该数组的attributes属性表示该table的html属性
   *   [ // 表格行配置项，该数组的attributes属性表示该行的html属性
   *     { colspan: 0, rowspan: 4, content: "cell 6" }, // 表格td的配置项，如果该td存在一些html属性时，可使用对象表示，内部content表示td的innerHtml
   *     "cell 7", // 表格td的配置项，如果该td只存在content时，可以直接用string表示
   *   ],
   * ]
   * @param tableOptions
   */
  createContent(tableOptions) {
    const tableMeta = [...tableOptions];
    // 创建新的table容器
    this.createNewPageTableElement(tableOptions);
    // 创建新的table元数据池
    const [create, tableMetaPool] = this.createTableMetaPool(tableOptions);
    let table = create();
    for (let i = 0; i < tableMeta.length; i++) {
      const trMeta = tableMeta[i];
      const {
        isOutOfBounds,
        strandedHeight,
        rewriteTrMeta,
        rewriteTrElement,
        newTrMeta,
      } = this.trOutOfBoundsGuardInstance.tryCreateTrElement2Table(
        trMeta,
        i,
        tableMeta
      );

      // 行超出边界
      // 1. 创建新的table元素容器
      // 2. 创建新的table元数据容器
      // 3. 为新创建的table元素容器添加超出边界的行
      if (isOutOfBounds) {
        // 创建新的table容器
        this.createNewPageTableElement(tableMeta);
        // 创建新的table元数据
        table = create(strandedHeight);
        // 为新创建的table元素容器添加超出边界的行
        this.printPageTableElement.append(rewriteTrElement);
      }

      // 存在新生成的meta
      if (newTrMeta) {
        tableMeta.splice(i + 1, 0, newTrMeta);
      }

      table.push(rewriteTrMeta);
    }
    return {
      printPageContainerElement: this.printPageContainerElement,
      tableMetaPool,
    };
  }
}
