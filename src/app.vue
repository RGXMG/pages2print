<template>
  <div class="container">
    <h1>Welcome to JsLibrary, Please Create your fire</h1>
    <el-button type="primary" @click="onClick">增加__tag</el-button>
    <br />
  </div>
</template>

<script>
import createPrintProgram from '../lib/index';
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
        // 45
        ['cell1', 'cell 2', 'cell 3', 'cell 4', 'cell 5'],
        [
          {
            rowspan: 1,
            content:
              'cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6cell 6',
          },
          'cell 7',
          'cell 8',
          'cell 9',
          'cell 10',
        ],
        ['cell 11', 'cell 11', { rowspan: 4, content: 'cell 12' }, 'cell 13', 'cell 14'],
        ['cell 11', 'cell 15', null, 'cell 16', 'cell 17'],
        ['cell 11', 'cell 2cell', null, 'cell 19', 'cell 20'],
        ['cell 21', 'cell 22', null, 'cell 23', 'cell 24'],
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
          width: 50mm;
        }
    `,
      });
      const div = document.createElement('div');
      div.style.backgroundColor = 'red';
      div.style.height = '270mm';
      printInstance.createNormalContent(div).createTableContent({
        body: {
          content: json,
        },
      });
      console.log(printInstance);
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
