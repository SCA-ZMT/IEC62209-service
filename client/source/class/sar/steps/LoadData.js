/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.LoadData", {
  extend: sar.steps.StepBase,
  type: "abstract",

  properties: {
    stepData: {
      check: "Object",
      init: null,
      nullable: true,
      apply: "_applyStepData"
    }
  },

  members: {
    _fileInput: null,
    _resetBtn: null,
    _dataTable: null,

    // overriden
    _getDescriptionText: function() {
      throw new Error("Abstract method called!");
    },

    _createOptions: function() {
      const optionsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const fileInput = this._fileInput = this._getFileInput();
      optionsLayout.add(fileInput);

      const resetBtn = this._resetBtn = new qx.ui.form.Button("Reset data").set({
        allowGrowX: false
      });
      resetBtn.addListener("execute", () => this.setStepData(null));
      optionsLayout.add(resetBtn);

      return optionsLayout;
    },

    _getFileInput: function() {
      throw new Error("Abstract method called!");
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
      const dataTable = this._dataTable = this._getDataTable();
      const layout = new qx.ui.layout.VBox();
      const tabPage = new qx.ui.tabview.Page("Data").set({
        layout
      });
      tabPage.add(dataTable);
      return tabPage;
    },

    _getDataTable: function() {
      throw new Error("Abstract method called!");
    },

    _applyModel: function(model) {
      console.log("model", model);
    },

    _applyStepData: function(testData) {
      if (testData) {
        this._fileInput.exclude();
        this._resetBtn.show();
      } else {
        this._fileInput.show();
        this._resetBtn.exclude();
      }

      if (testData) {
        this._popoluateTable(testData);
      }
    },

    _popoluateTable: function(data) {
      throw new Error("Abstract method called!");
    },
  }
});
