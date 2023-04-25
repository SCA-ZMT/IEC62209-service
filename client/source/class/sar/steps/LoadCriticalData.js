/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.LoadCriticalData", {
  extend: sar.steps.StepBase,

  properties: {
    criticalData: {
      check: "Object",
      init: null,
      nullable: true,
      apply: "__applyCriticalData"
    }
  },

  events: {
    "criticalDataSet": "qx.event.type.Data"
  },

  members: {
    __input: null,
    __loadModelButton: null,
    __dataTable: null,

    // overriden
    _getDescriptionText: function() {
      return "Load Critical Data"
    },

    _createOptions: function() {
      const optionsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const fileInput = this.__fileInput = new sar.widget.FileInput("Load Critical data...", ["csv"]);
      fileInput.addListener("selectionChanged", () => {
        const file = fileInput.getFile();
        if (file) {
          this.__submitFile(file);
        }
      });
      optionsLayout.add(fileInput);

      const resetBtn = this.__resetBtn = new qx.ui.form.Button("Reset Critical data").set({
        allowGrowX: false
      });
      resetBtn.addListener("execute", () => this.setCriticalData(null));
      optionsLayout.add(resetBtn);

      return optionsLayout;
    },

    _createResults: function() {
      const resultsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const resultsTabView = new qx.ui.tabview.TabView().set({
        contentPadding: 10
      });
      resultsLayout.add(resultsTabView);

      const dataView = this.__createDataView();
      resultsTabView.add(dataView);

      return resultsLayout;
    },

    __createDataView: function() {
      const dataTable = this.__dataTable = sar.steps.Utils.testDataTable();
      const layout = new qx.ui.layout.VBox();
      const tabPage = new qx.ui.tabview.Page("Data").set({
        layout
      });
      tabPage.add(dataTable);
      return tabPage;
    },

    __submitFile: function(file) {
      const successCallback = resp => this.setCriticalData(resp);
      sar.steps.Utils.postFile(file, "/critical-data/load", successCallback, null, this);
    },

    _applyModel: function(model) {
      console.log("model", model);
    },

    __applyCriticalData: function(testData) {
      if (testData) {
        this.__fileInput.exclude();
        this.__resetBtn.show();
      } else {
        this.__fileInput.show();
        this.__resetBtn.exclude();
      }

      if (testData) {
        this.__popoluateTable(testData);
      }
      this.fireDataEvent("criticalDataSet", testData);
    },

    __popoluateTable: function(data) {
      sar.steps.Utils.populateTestDataTable(this.__dataTable, data);
    },
  }
});
