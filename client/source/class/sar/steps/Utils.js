/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.Utils", {
  type: "static",

  statics: {
    trainingDataTable: function() {
      const tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([
        "no.",
        "antenna",
        "freq. (MHz)",
        "Pin (dBm)",
        "mod.",
        "PAPR (db)",
        "BW (MHz)",
        "d (mm)",
        "θ (°)",
        "x (mm)",
        "y (mm)",
        "SAR 10g (W/Kg)",
        "U 10g (dB)",
      ]);
      const custom = {
        tableColumnModel: function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };
      const table = new qx.ui.table.Table(tableModel, custom).set({
        selectable: true,
        statusBarVisible: false,
        showCellFocusIndicator: false,
        forceLineHeight: false
      });
      table.setColumnWidth(0, 10);
      return table;
    },

    populateTrainingDataTable: function(table, data) {
      const tableModel = table.getTableModel();
      if ("headings" in data) {
        // tableModel.setColumns(data["headings"]);
      }
      if ("rows" in data) {
        tableModel.setData(data["rows"]);
      }
    },

    testDataTable: function() {
      const tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([
        "no.",
        "antenna",
        "freq. (MHz)",
        "Pin (dBm)",
        "mod.",
        "PAPR (db)",
        "BW (MHz)",
        "d (mm)",
        "θ (°)",
        "x (mm)",
        "y (mm)",
        "SAR 10g (W/Kg)",
        "U 10g (dB)",
      ]);
      const custom = {
        tableColumnModel: function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };
      const table = new qx.ui.table.Table(tableModel, custom).set({
        selectable: true,
        statusBarVisible: false,
        showCellFocusIndicator: false,
        forceLineHeight: false
      });
      table.setColumnWidth(0, 10);
      return table;
    },

    populateTestDataTable: function(table, data) {
      const tableModel = table.getTableModel();
      if ("headings" in data) {
        // tableModel.setColumns(data["headings"]);
      }
      if ("rows" in data) {
        tableModel.setData(data["rows"]);
      }
    },

    downloadCSV: function (data, fileName) {
      const blob = new Blob([data], {
        type: "text/csv"
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", fileName);
      a.click();
    },

    downloadJson: function (data, fileName) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
      const a = document.createElement("a");
      a.setAttribute("href", dataStr);
      a.setAttribute("download", fileName);
      a.click();
    },

    postFile: function(file, path, successCbk, failureCbk, context) {
      const fileName = file.name;
      console.log("submitFile", fileName);
      
      const formData = new FormData();
      formData.append("file", file);

      const req = new XMLHttpRequest();
      req.upload.addEventListener("progress", ep => {
        // updateProgress
        if (ep.lengthComputable) {
          const percentComplete = ep.loaded / ep.total * 100;
          console.log("percentComplete", percentComplete);
        } else {
          console.log("Unable to compute progress information since the total size is unknown");
        }
      }, false);
      req.addEventListener("load", e => {
        // transferComplete
        if (req.status == 200) {
          console.log("transferComplete");
          if (successCbk) {
            const resp = JSON.parse(req.responseText);
            successCbk.call(context, resp);
          }
        } else if (req.status == 400) {
          console.error("transferFailed");
          if (failureCbk) {
            failureCbk.call();
          }
        }
      });
      req.addEventListener("error", e => console.error(e));
      req.addEventListener("abort", e => console.error(e));
      req.open("POST", path, true);
      req.send(formData);
    },

    modelEditor: function() {
      const form = new qx.ui.form.Form();

      form.addGroupHeader("Model information")

      const systemName = new qx.ui.form.TextField().set({
        value: "cSAR3D"
      });
      form.add(systemName, "System name", null, "systemName");

      const phantomType = new qx.ui.form.TextField().set({
        value: "Flat HSL"
      });
      form.add(phantomType, "Phantom type", null, "phantomType");

      const hardwareVersion = new qx.ui.form.TextField().set({
        value: "SD C00 F01 AC"
      });
      form.add(hardwareVersion, "Hardware version", null, "hardwareVersion");

      const softwareVersion = new qx.ui.form.TextField().set({
        value: "V5.2.0"
      });
      form.add(softwareVersion, "Software version", null, "softwareVersion");

      const formRenderer = new qx.ui.form.renderer.Single(form);
      return formRenderer;
    },

    modelViewer: function(data) {
      const modelViewerGrid = new qx.ui.layout.Grid(10, 10);
      const modelViewerLayout = new qx.ui.container.Composite(modelViewerGrid).set({
        allowGrowX: false
      });
      [{
        id: "systemName",
        label: "System name"
      }, {
        id: "phantomType",
        label: "Phantom type"
      }, {
        id: "hardwareVersion",
        label: "Hardware version"
      }, {
        id: "softwareVersion",
        label: "Software version"
      }, {
        id: "acceptanceCriteria",
        label: "Acceptance criteria"
      }, {
        id: "normalizedRMSError",
        label: "Norm. RMS Error 10.2%<25%"
      }].forEach((entry, idx) => {
        const titleLabel = new qx.ui.basic.Label(entry.label + ":");
        modelViewerLayout.add(titleLabel, {
          row: idx,
          column: 0
        });
        if (data && entry.id in data && data[entry.id]) {
          const valueLabel = new qx.ui.basic.Label(data[entry.id]);
          modelViewerLayout.add(valueLabel, {
            row: idx,
            column: 1
          });
        }
      });
      return modelViewerLayout;
    },

    addMeasurementAreaToForm: function(form) {
      form.addGroupHeader("Measurement area (mm)");
      const xMin = new qx.ui.form.Spinner().set({
        minimum: 80,
        maximum: 1000,
        value: 120
      });
      form.add(xMin, "x", null, "measAreaX");
      const yMin = new qx.ui.form.Spinner().set({
        minimum: 160,
        maximum: 1000,
        value: 240
      });
      form.add(yMin, "y", null, "measAreaY");
      return [
        xMin,
        yMin
      ]
    },

    createTabPage: function(title, widget) {
      const layout = new qx.ui.layout.Canvas();
      const tabPage = new qx.ui.tabview.Page(title).set({
        layout
      });
      tabPage.add(widget, {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      });
      return tabPage;
    },

    createImageViewer: function(source) {
      const image = new qx.ui.basic.Image().set({
        maxWidth: 600,
        scale: true,
        alignX: "center"
      });
      if (source) {
        image.setSource(source);
      }
      return image;
    },

    csvToJson: function(csvString) {
      // https://www.geeksforgeeks.org/how-to-convert-csv-to-json-file-having-comma-separated-values-in-node-js/

      // const array = csv.toString().split("\r");
      const array = csvString.split("\r");
  
      // All the rows of the CSV will be
      // converted to JSON objects which
      // will be added to result in an array
      let result = [];
      
      // The array[0] contains all the
      // header columns so we store them
      // in headers array
      // let headers = array[0].split(", ")
      let headers = array[0].split(",");
      
      // Since headers are separated, we
      // need to traverse remaining n-1 rows.
      for (let i = 1; i < array.length - 1; i++) {
        let obj = {}

        // Create an empty object to later add
        // values of the current row to it
        // Declare string str as current array
        // value to change the delimiter and
        // store the generated string in a new
        // string s
        let str = array[i]
        let s = ''

        // By Default, we get the comma separated
        // values of a cell in quotes " " so we
        // use flag to keep track of quotes and
        // split the string accordingly
        // If we encounter opening quote (")
        // then we keep commas as it is otherwise
        // we replace them with pipe |
        // We keep adding the characters we
        // traverse to a String s
        let flag = 0
        for (let ch of str) {
            if (ch === '"' && flag === 0) {
                flag = 1
            }
            else if (ch === '"' && flag == 1) flag = 0
            if (ch === ', ' && flag === 0) ch = '|'
            if (ch !== '"') s += ch
        }

        // Split the string using pipe delimiter |
        // and store the values in a properties array
        // let properties = s.split("|")
        let properties = s.split(",")

        // For each header, if the value contains
        // multiple comma separated data, then we
        // store it in the form of array otherwise
        // directly the value is stored
        for (let j in headers) {
            if (properties[j].includes(", ")) {
                obj[headers[j]] = properties[j]
                    .split(", ").map(item => item.trim())
            }
            else obj[headers[j]] = properties[j]
        }

        // Add the generated object to our
        // result array
        result.push(obj)
      }
      return result;
    }
  }
});
