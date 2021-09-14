import createPrintProgram from './print';

/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/rgxmg@foxmail.com
 * Date: 2021/9/10
 * Time: 23:44
 *
 */
const json = [
  // 45
  ['cell1', 'cell 2', 'cell 3', 'cell 4', 'cell 5'],
  [{ colspan: 0, rowspan: 4, content: 'cell 6' }, 'cell 7', 'cell 8', 'cell 9', 'cell 10'],
  [null, 'cell 11', { colspan: 0, rowspan: 4, content: 'cell 12' }, 'cell 13', 'cell 14'],
  [null, 'cell 15', null, 'cell 16', 'cell 17'],
  [null, 'cell 2cell', null, 'cell 19', 'cell 20'],
  ['cell 21', 'cell 22', null, 'cell 23', 'cell 24'],
  ['cell 25', 'cell 26', 'cell 27', 'cell 28', 'cell 29'],
  ['cell 30', 'cell 31', 'cell 32', 'cell 33', 'cell 34'],
  ['cell 35', 'cell 36', 'cell 37', 'cell 38', 'cell 39'],
];

window.printFactoru = function () {
  const printInstance = createPrintProgram({
    page: 'A4',
    printStyle: `
    @page {
      margin: 0
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
  printInstance.createNormalContent(div).createTableContent(json);
  console.log(printInstance);
};
