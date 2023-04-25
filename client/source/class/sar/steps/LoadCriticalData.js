/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.LoadCriticalData", {
  extend: sar.steps.LoadData,

  events: {
    "criticalDataSet": "qx.event.type.Data"
  },

  members: {
    // overriden
    _getDescriptionText: function() {
      return "Load Critical Data"
    },

    // overriden
    _getFileInput: function() {
      const fileInput = this.__fileInput = new sar.widget.FileInput("Load Critical data...", ["csv"]);
      fileInput.addListener("selectionChanged", () => {
        const file = fileInput.getFile();
        if (file) {
          this.__submitFile(file);
        }
      });
      return fileInput;
    },

    __submitFile: function(file) {
      const successCallback = resp => this.setCriticalData(resp);
      sar.steps.Utils.postFile(file, "/critical-data/load", successCallback, null, this);
    },

    // overriden
    _getDataTable: function() {
      return sar.steps.Utils.testDataTable();
    },

    // overriden
    _applyStepData: function(criticalData) {
      this.base(arguments, criticalData);

      this.fireDataEvent("criticalDataSet", criticalData);
    },

    __popoluateTable: function(data) {
      sar.steps.Utils.populateTestDataTable(this._dataTable, data);
    },
  }
});
