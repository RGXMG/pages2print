<template>
  <div class="container">
    <h1>Welcome to JsLibrary, Please Create your fire</h1>
    <el-button type="primary" @click="onClick">增加__tag</el-button>
    <br />
  </div>
</template>

<script>
import createPrintProgram from '../lib/index';
import { createContainerMeta } from '../lib/utils/containerMeta';
export default {
  name: 'app',
  data() {
    return {
      list: [1, 2, 3],
      listString: '',
    };
  },
  methods: {
    onClick() {
      const json = [
        ['cell 35', 'cell 36', 'cell 37', 'cell 38', 'cell 39'],
        ['cell 35', 'cell 36', 'cell 37', 'cell 38', 'cell 39'],
        ['cell 35', { rowspan: 4, content: 'cell 35 copy' }, 'cell 37', 'cell 38', 'cell 39'],
        // 45
        ['cell1', createContainerMeta(), 'cell 3', 'cell 4', { rowspan: 4, content: 'content' }],
        [
          {
            rowspan: 2,
            content:
              'cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6',
          },
          createContainerMeta(),
          'cell 8',
          'cell 9',
          createContainerMeta(),
        ],
        [
          createContainerMeta(),
          createContainerMeta(),
          { rowspan: 4, content: 'cell 12' },
          'cell 13',
          createContainerMeta(),
        ],
        ['cell 11', 'cell 15', createContainerMeta(), 'cell 16', createContainerMeta()],
        ['cell 11', 'cell 2cell', createContainerMeta(), 'cell 19', 'cell 20'],
        ['cell 21', 'cell 22', createContainerMeta(), 'cell 23', 'cell 24'],
        ['cell 25', 'cell 26', 'cell 27', 'cell 28', 'cell 29'],
        ['cell 30', 'cell 31', 'cell 32', 'cell 33', 'cell 34'],
        ['cell 35', 'cell 36', 'cell 37', 'cell 38', 'cell 39'],
      ];
      // const json = [
      //   [
      //     {
      //       content:
      //         '第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行第一行',
      //       rowspan: 4,
      //     },
      //     '1',
      //     '2',
      //     '3',
      //     '4',
      //   ],
      //   [
      //     null,
      //     '5',
      //     {
      //       content:
      //         '第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二行第二',
      //       rowspan: 3,
      //     },
      //     '7',
      //     '8',
      //   ],
      //   [null, '9', null, '11', '12'],
      //   [null, '13', null, '15', '16'],
      //   [
      //     {
      //       content: '第五行',
      //       rowspan: 4,
      //     },
      //     '1',
      //     '2',
      //     '3',
      //     '4',
      //   ],
      //   [
      //     null,
      //     '5',
      //     {
      //       content: '第六行',
      //       rowspan: 3,
      //     },
      //     '7',
      //     '8',
      //   ],
      //   [null, '9', null, '11', '12'],
      //   [null, '13', null, '15', '16'],
      // ];
      const printInstance = createPrintProgram({
        page: 'A4',
        printStyle: `
    @page {
      margin: 0mm;
    }
    table {
          font-size: 2mm;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        tr,
        td {
          word-break: break-all;
          border: solid 1mm #333;
        }
        td {
          width: 20%;
        }
    `,
      });
      const div = document.createElement('div');
      div.style.backgroundColor = 'red';
      div.style.height = '260mm';
      printInstance.createNormalContent(div).createTableContent({
        body: {
          content: json,
        },
      });
      printInstance.execPrint();
    },
  },
};
</script>

<style lang="less" scoped>
.container {
  text-align: center;
  color: white;
  overflow: auto;
}
table,
th,
td {
  padding: 5px;
  border: 1px solid black;
}
table {
  border-collapse: collapse;
  border-spacing: 0px;
}
</style>
