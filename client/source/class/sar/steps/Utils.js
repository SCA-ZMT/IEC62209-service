/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

/**
 * @ignore(fetch)
 * @ignore(Headers)
 */

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
      pass: {
        ids: ["pass"],
        label: "Failure Risk (%)"
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

    setIdToWidget: function(qWidget, id) {
      if (qWidget && qWidget.getContentElement) {
        qWidget.getContentElement().setAttribute("osparc-test-id", id);
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

    downloadPDF: function (data, filename) {
      const blob = new Blob([data], {
        type: "application/pdf"
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
              console.error(resp.error);
              sar.widget.FlashMessage.popUpFM(resp.error, "Error loading data");
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
        value: "A SAR System"
      });
      form.add(systemName, "System name", null, "systemName");
      const manufacturer = new qx.ui.form.TextField().set({
        value: "A Manufacturer"
      });
      form.add(manufacturer, "Manufacturer", null, "manufacturer");
      const phantomType = new qx.ui.form.TextField().set({
        value: "Flat"
      });
      form.add(phantomType, "Phantom type", null, "phantomType");
      const hardwareVersion = new qx.ui.form.TextField().set({
        value: "AD 385 12B"
      });
      form.add(hardwareVersion, "Hardware version", null, "hardwareVersion");
      const softwareVersion = new qx.ui.form.TextField().set({
        value: "V2.0"
      });
      form.add(softwareVersion, "Software version", null, "softwareVersion");

      this.addMeasurementAreaToForm(form, true);

      const formRenderer = new qx.ui.form.renderer.Single(form);
      this.makeFormHeadersWider(formRenderer);
      return formRenderer;
    },

    makeFormHeadersWider: function(formSingleRenderer) {
      formSingleRenderer._getChildren().forEach(item => {
        const lProps = item.getLayoutProperties();
        if ("colSpan" in lProps && lProps["colSpan"] === 2) {
          // hack< way to find group headers
          item.setMinWidth(180);
        }
      });
    },

    modelViewer: function(data, withTitle = false, long = true) {
      const modelViewerGrid = new qx.ui.layout.Grid(10, 10);
      const modelViewerLayout = new qx.ui.container.Composite(modelViewerGrid).set({
        allowGrowX: false
      });
      let offset = 0;
      if (withTitle) {
        const infoLabel = new qx.ui.basic.Label("Model Information").set({
          alignX: "right",
          textAlign: "right"
        });
        modelViewerLayout.add(infoLabel, {
          row: 0,
          column: 0
        });
        offset++;
      }
      const dataIds = [{
        id: "filename",
        label: "Filename"
      }, {
        id: "systemName",
        label: "System name"
      }, {
        id: "manufacturer",
        label: "Manufacturer"
      }, {
        id: "phantomType",
        label: "Phantom type"
      }, {
        id: "hardwareVersion",
        label: "Hardware version"
      }, {
        id: "softwareVersion",
        label: "Software version"
      }];
      if (long) {
        dataIds.push({
          id: "acceptanceCriteria",
          label: "Acceptance criteria"
        });
        dataIds.push({
          id: "normalizedRMSError",
          label: "Norm. RMS Error"
        });
      }
      dataIds.forEach((entry, idx) => {
        const titleLabel = new qx.ui.basic.Label(entry.label + ":").set({
          alignX: "right",
          textAlign: "right",
        });
        modelViewerLayout.add(titleLabel, {
          row: idx+offset,
          column: 0
        });
        if (data && entry.id in data && data[entry.id]) {
          const valueLabel = new qx.ui.basic.Label();
          modelViewerLayout.add(valueLabel, {
            row: idx+offset,
            column: 1
          });
          if (["acceptanceCriteria", "normalizedRMSError"].includes(entry.id)) {
            sar.steps.Utils.decoratePassFailLabel(valueLabel);
          }
          valueLabel.setValue(data[entry.id]);
        }
      });
      return modelViewerLayout;
    },

    addMeasurementAreaToForm: function(form, isModel = false) {
      form.addGroupHeader("Measurement area (mm)");
      const xArea = new qx.ui.form.Spinner().set({
        minimum: 80,
        maximum: 1000,
        value: 100
      });
      form.add(xArea, "x", null, isModel ? "modelAreaX" : "measAreaX");
      const yArea = new qx.ui.form.Spinner().set({
        minimum: 160,
        maximum: 1000,
        value: 200
      });
      form.add(yArea, "y", null, isModel ? "modelAreaY" : "measAreaY");
    },

    addVPIFASelectBoxToForm: function(form) {
      const vpifaSelectBox = new qx.ui.form.SelectBox();
      [{
        id: "VPIFAV1",
        text: "VPIFA v1",
      }, {
        id: "VPIFAV2",
        text: "VPIFA v2",
      }].forEach((sarEntry, idx) => {
        const listItem = new qx.ui.form.ListItem(sarEntry.text);
        listItem.id = sarEntry.id;
        vpifaSelectBox.add(listItem);
        if (idx === 0) {
          vpifaSelectBox.setSelection([listItem]);
        }
      });
      vpifaSelectBox.setEnabled(false);
      form.add(vpifaSelectBox, "Select VPIFA set");
    },

    add2PEAKSelectBoxToForm: function(form) {
      const peakSelectBox = new qx.ui.form.SelectBox();
      [{
        id: "peakV1",
        text: "2-PEAK antenna v1",
      }, {
        id: "peakV2",
        text: "2-PEAK antenna v2",
      }].forEach((sarEntry, idx) => {
        const listItem = new qx.ui.form.ListItem(sarEntry.text);
        listItem.id = sarEntry.id;
        peakSelectBox.add(listItem);
        if (idx === 0) {
          peakSelectBox.setSelection([listItem]);
        }
      });
      peakSelectBox.setEnabled(false);
      form.add(peakSelectBox, "Select 2-PEAK set");
    },

    decoratePassFailLabel: function(label) {
      label.set({
        font: "text-16",
        alignY: "middle",
      });
      label.addListener("changeValue", e => {
        label.resetTextColor();
        const newValue = e.getData();
        if (newValue) {
          if (newValue.includes("Pass")) {
            label.setTextColor("blue");
          } else if (newValue.includes("Fail")) {
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
      // avoid ellipsis
      tabPage.getChildControl("button").setMinWidth(title.length*10);
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

    setTimestampOnQuery: function(url) {
      return url.replace("{timestamp}", Date.now());
    },

    createGenerateReportButton: function(resourceName, filename) {
      const button = new sar.widget.FetchButton("Generate Report").set({
        enabled: false
      });
      button.addListener("execute", () => {
        button.setFetching(true);
        /*
        sar.io.Resources.fetch(resourceName, "getReport")
          .then(data => sar.steps.Utils.downloadPDF(data, filename))
          .catch(err => console.error(err))
          .finally(() => button.setFetching(false));
        */
        // https://gist.github.com/devloco/5f779216c988438777b76e7db113d05c
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        const endpoints = sar.io.Resources.getEndPoints(resourceName);
        fetch(endpoints["getReport"].url, {
          method: "GET",
          headers: headers
        })
          .then(async res => {
            if ("status" in res && res.status === 200) {
              return {
                filename,
                blob: await res.blob()
              }
            } else {
              if ("responseText" in res) {
                const resp = JSON.parse(res.responseText);
                if ("error" in resp) {
                  throw resp.error;
                }
              }
              if ("statusText" in res) {
                throw res.statusText;
              }
              throw "Error";
            }
          })
          .then(resObj => {
            // It is necessary to create a new blob object with mime-type explicitly set for all browsers except Chrome, but it works for Chrome too.
            const newBlob = new Blob([resObj.blob], {
              type: "application/pdf"
            });

            // MS Edge and IE don't allow using a blob object directly as link href, instead it is necessary to use msSaveOrOpenBlob
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(newBlob);
            } else {
              // For other browsers: create a link pointing to the ObjectURL containing the blob.
              const objUrl = window.URL.createObjectURL(newBlob);

              let link = document.createElement("a");
              link.href = objUrl;
              link.download = resObj.filename;
              link.click();

              // For Firefox it is necessary to delay revoking the ObjectURL.
              setTimeout(() => window.URL.revokeObjectURL(objUrl), 250);
            }
          })
          .catch(err => {
            console.error(err);
            sar.widget.FlashMessage.popUpFM(err, "Error generating report");
          })
          .finally(() => button.setFetching(false));
      });
      return button;
    },
  }
});
