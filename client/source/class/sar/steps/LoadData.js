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
    __fileInput: null,
    _selectedFileName: null,
    _resetLayout: null,

    // overriden
    _getDescriptionText: function() {
      throw new Error("Abstract method called!");
    },

    _createOptions: function() {
      const optionsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const fileInput = this.__fileInput = this._getFileInput();
      optionsLayout.add(fileInput);

      const resetLayout = this._resetLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox(15));
      const resetBtn = new qx.ui.form.Button("Reset data").set({
        allowGrowX: false
      });
      resetBtn.addListener("execute", () => {
        fileInput.resetValue();
        this._resetPressed();
      });
      resetLayout.add(resetBtn);
      const selectedFileName = this._selectedFileName = new qx.ui.basic.Label().set({
        alignY: "middle"
      });
      fileInput.addListener("selectionChanged", () => {
        const file = fileInput.getFile();
        if (file) {
          selectedFileName.setValue(file.name);
        }
      });
      resetLayout.add(selectedFileName);
      optionsLayout.add(resetLayout);

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

      const dataView = this._createDataView();
      resultsTabView.add(dataView);

      return resultsLayout;
    },

    _getDataTable: function() {
      return sar.steps.Utils.createDataTable();
    },

    _popoluateTable: function(data) {
      sar.steps.Utils.populateDataTable(this._dataTable, data);
    },

    __emptyTable: function() {
      sar.steps.Utils.emptyDataTable(this._dataTable);
    },

    _applyModel: function(model) {
      console.log("model", model);
    },

    _resetPressed: function() {
      this.setStepData(null);
    },

    _applyStepData: function(testData) {
      if (testData) {
        this.__fileInput.exclude();
        this._resetLayout.show();
      } else {
        this.__fileInput.show();
        this._resetLayout.exclude();
      }

      if (testData) {
        this._popoluateTable(testData);
      } else {
        this.__emptyTable();
      }
    },
  }
});
