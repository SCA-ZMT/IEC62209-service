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
    COLUMN_ALIASES: {
      number: {
        ids: ["number", "no."],
        label: "no."
      },
      antenna: {
        ids: ["antenna"],
        label: "Antenna"
      },
      frequency: {
        ids: ["frequency"],
        label: "f (MHz)"
      },
      power: {
        ids: ["power"],
        label: "Pf (dBm)"
      },
      modulation: {
        ids: ["modulation"],
        label: "Mod"
      },
      description: {
        ids: ["description"],
        label: "Description"
      },
      par: {
        ids: ["par"],
        label: "PAPR (dB)"
      },
      bandwidth: {
        ids: ["bandwidth"],
        label: "BW (MHz)"
      },
      distance: {
        ids: ["distance"],
        label: "s (mm)"
      },
      angle: {
        ids: ["angle"],
        label: "θ (°)"
      },
      x: {
        ids: ["x"],
        label: "x (mm)"
      },
      y: {
        ids: ["y"],
        label: "y (mm)"
      },
      sar1g: {
        ids: ["sar1g"],
        label: "SAR 1g (W/Kg)"
      },
      sar10g: {
        ids: ["sar10g"],
        label: "SAR 10g (W/Kg)"
      },
      u1g: {
        ids: ["u1g"],
        label: "u 1g (dB)"
      },
      u10g: {
        ids: ["u10g"],
        label: "u 10g (dB)"
      },
    },

    __getAliasFromId: function(id) {
      const entryFound = Object.entries(this.COLUMN_ALIASES).find(entry => entry[1].ids.includes(id));
      if (entryFound) {
        return entryFound[1].label;
      }
      return id;
    },

    createDataTable: function() {
      const table = new qx.ui.table.Table().set({
        selectable: true,
        statusBarVisible: false,
        showCellFocusIndicator: false,
        forceLineHeight: false
      });
      return table;
    },

    populateDataTable: function(table, data) {
      const tableModel = new qx.ui.table.model.Simple();
      const columnLabels = [];
      if ("headings" in data) {
        data["headings"].forEach(headerId => {
          columnLabels.push(this.__getAliasFromId(headerId));
        });
      }
      tableModel.setColumns(columnLabels);
      table.setTableModel(tableModel);
      for (let i=0; i<columnLabels.length; i++) {
        table.setColumnWidth(i, 70);
      }
      if ("rows" in data) {
        tableModel.setData(data["rows"]);
      }
    },

    emptyDataTable: function(table) {
      if (table.getTableModel()) {
        table.getTableModel().setData([]);
      }
    },

    downloadCSV: function (data, filename) {
      const blob = new Blob([data], {
        type: "text/csv"
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", filename);
      a.click();
    },

    downloadJson: function (data, filename) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
      const a = document.createElement("a");
      a.setAttribute("href", dataStr);
      a.setAttribute("download", filename);
      a.click();
    },

    postFile: function(file, path, successCbk, failureCbk, context) {
      const filename = file.name;
      console.log("submitFile", filename);

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
        } else {
          console.error("transferFailed");
          if (failureCbk) {
            failureCbk.call();
          } else {
            const resp = JSON.parse(req.responseText);
            if ("error" in resp) {
              console.error();
              const flashMessage = new sar.widget.FlashMessage(resp.error);
              const win = new qx.ui.window.Window("Error loading data").set({
                layout: new qx.ui.layout.VBox(0),
                contentPadding: 20,
                resizable: false,
                showClose: true,
                showMaximize: false,
                showMinimize: false,
                modal: true,
                width: 500
              });
              win.getChildControl("captionbar").set({
                backgroundColor: "red"
              });
              win.add(flashMessage), {
                flex: 1
              };
              win.center();
              win.open();
              flashMessage.addListener("closeMessage", () => win.close());
              setTimeout(() => win.close(), 10000);
            } else {
              console.error(resp);
            }
          }
        }
      });
      [
        "error",
        "abort"
      ].forEach(errEv => {
        req.addEventListener(errEv, e => {
          console.error(e);
        });
      });
      req.open("POST", path, true);
      req.send(formData);
    },

    modelEditor: function() {
      const form = new qx.ui.form.Form();
      form.addGroupHeader("Model information");
      const filename = new qx.ui.form.TextField().set({
        value: "Model.json"
      });
      form.add(filename, "Filename", null, "filename");
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
        id: "filename",
        label: "Filename"
      }, {
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
        label: "Norm. RMS Error"
      }].forEach((entry, idx) => {
        const titleLabel = new qx.ui.basic.Label(entry.label + ":");
        modelViewerLayout.add(titleLabel, {
          row: idx,
          column: 0
        });
        if (data && entry.id in data && data[entry.id]) {
          const valueLabel = new qx.ui.basic.Label();
          modelViewerLayout.add(valueLabel, {
            row: idx,
            column: 1
          });
          if (entry.id === "acceptanceCriteria") {
            sar.steps.Utils.decoratePassFailLabel(valueLabel);
          }
          valueLabel.setValue(data[entry.id]);
        }
      });
      return modelViewerLayout;
    },

    addMeasurementAreaToForm: function(form) {
      form.addGroupHeader("Measurement area (mm)");
      const xArea = new qx.ui.form.Spinner().set({
        minimum: 80,
        maximum: 1000,
        value: 100
      });
      form.add(xArea, "x", null, "measAreaX");
      const yArea = new qx.ui.form.Spinner().set({
        minimum: 160,
        maximum: 1000,
        value: 200
      });
      form.add(yArea, "y", null, "measAreaY");
      return {
        xArea,
        yArea
      }
    },

    decoratePassFailLabel: function(label) {
      label.addListener("changeValue", e => {
        label.resetTextColor();
        const newValue = e.getData();
        if (newValue) {
          if (newValue === "Pass") {
            label.setTextColor("blue");
          } else if (newValue === "Fail") {
            label.setTextColor("red");
          }
        }
      });
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

    createGenerateReportButton: function(resourceName) {
      const button = new sar.widget.FetchButton("Generate Report").set({
        enabled: false
      });
      button.addListener("execute", () => {
        button.setFetching(true);
        sar.io.Resources.fetch(resourceName, "getReport")
          .then(data => console.log(data))
          .catch(err => console.error(err))
          .finally(() => button.setFetching(false));
      });
      return button;
    }
  }
});
