// <!--210mm×297mm-->
const json = [
  // 45
  ["cell1", "cell 2", "cell 3", "cell 4", "cell 5"],
  [
    { colspan: 0, rowspan: 4, content: "cell 6" },
    "cell 7",
    "cell 8",
    "cell 9",
    "cell 10"
  ],
  [
    null,
    "cell 11",
    { colspan: 0, rowspan: 4, content: "cell 12" },
    "cell 13",
    "cell 14"
  ],
  [null, "cell 15", null, "cell 16", "cell 17"],
  [null, "cell 2cell", null, "cell 19", "cell 20"],
  ["cell 21", "cell 22", null, "cell 23", "cell 24"],
  ["cell 25", "cell 26", "cell 27", "cell 28", "cell 29"],
  ["cell 30", "cell 31", "cell 32", "cell 33", "cell 34"],
  ["cell 35", "cell 36", "cell 37", "cell 38", "cell 39"]
];

function getA4PagePixelHeight() {
  const page = document.createElement("div");
  page.style.height = "297mm";
  page.style.width = "100%";
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);
  iframe.contentDocument.body.appendChild(page);
  const height = iframe.contentDocument.defaultView.getComputedStyle(page)
    .height;
  document.body.removeChild(iframe);
  console.log("A4PagePixelHeight:::", height);
  return height;
}

function createTable() {
  const table = document.createElement("table");
  table.setAttribute("border", "1");
  table.setAttribute("bordercolor", "#a0c6e5");
  return table;
}

function createTr(options) {
  return document.createElement("tr");
}

function createTd(options) {
  const td = document.createElement("td");
  let innerText = options;
  if (options && typeof options === "object") {
    const { content, ...rest } = options;
    innerText = content;
    for (const [k, v] of Object.entries(rest)) {
      td.setAttribute(k, v);
    }
  }
  td.innerText = innerText;
  return td;
}

function createOutOfBoundsGuard() {
  let elementCache = null;
  let pageHeight = null;
  let preTrTop = 0;

  const init = () => {
    pageHeight = getA4PagePixelHeight().replace("px", "");
    elementCache = createTable();
    document.body.appendChild(elementCache);
  };

  const upgrade = () => {
    pageHeight *= 2;
    elementCache.innerHtml = "";
  };

  const getOutOfBounds = (tr, meta) => {
    const { top, height } = tr.getBoundingClientRect();
    const res = [top + height > pageHeight, top + height];
    console.log(
      meta,
      "top:::",
      top,
      "height",
      height,
      pageHeight,
      top + height > pageHeight
    );
    return res;
  };

  const handleOutOfBounds = (trMeta, trMetaIndex, tableMeta) => {
    upgrade();
    return trMeta.map((tdMeta, index) => {
      if (tdMeta !== null) return tdMeta;
      // 找到覆盖本单元格的某个上级单元格
      let murderer = null;
      let deepNumber = 1;
      while ((murderer = tableMeta[trMetaIndex - deepNumber][index]) === null) {
        deepNumber++;
      }
      return { ...murderer, rowspan: murderer.rowspan - deepNumber };
    });
  };

  const clear = () => {
    document.body.removeChild(elementCache);
  };

  const getOutOfBoundsCompareResult = (trMeta, $i, tableMeta) => {
    if (!elementCache) {
      init();
    }
    let newTrMeta = trMeta;
    let strandedHeight = 0;
    const tr = createTr();
    trMeta.forEach(tdMeta => {
      const td = createTd(tdMeta);
      tr.appendChild(td);
    });
    elementCache.appendChild(tr);
    const [isOutOfBounds, top] = getOutOfBounds(tr, trMeta);
    if (isOutOfBounds) {
      strandedHeight = pageHeight - preTrTop;
      newTrMeta = handleOutOfBounds(trMeta, $i, tableMeta);
    }
    preTrTop = top;
    return {
      isOutOfBounds,
      strandedHeight,
      newTrMeta: newTrMeta.filter(t => t)
    };

    // return {
    //   isOutOfBounds: false,
    //   strandedHeight: pageHeight - preTrTop,
    //   newTrMeta: trMeta.filter(t => t)
    // };
  };

  return {
    clear,
    getOutOfBoundsCompareResult
  };
}

function createTableMetaItem() {
  let tableMetaPool = [];
  return [
    function() {
      tableMetaPool.push([]);
      return tableMetaPool[tableMetaPool.length - 1];
    },
    tableMetaPool
  ];
}

function toPrint() {
  const [create, tableMetaPool] = createTableMetaItem();
  const { getOutOfBoundsCompareResult, clear } = createOutOfBoundsGuard();
  let table = create();
  json.forEach((trMeta, index, json) => {
    const {
      isOutOfBounds,
      strandedHeight,
      newTrMeta
    } = getOutOfBoundsCompareResult(trMeta, index, json);
    if (isOutOfBounds) {
      table = create();
      table.strandedHeight = strandedHeight;
    }
    table.push(newTrMeta);
  });
  console.log(tableMetaPool);

  clear();
  for (const tableMeta of tableMetaPool) {
    const table = createTable();
    table.style.marginTop = (tableMeta.strandedHeight || "0") + "px";
    for (const trMeta of tableMeta) {
      const tr = createTr();
      for (const tdMeta of trMeta) {
        tr.appendChild(createTd(tdMeta));
      }
      table.appendChild(tr);
    }
    document.body.appendChild(table);
  }
  window.print();
}
