/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.LoadTestData", {
  extend: sar.steps.StepBase,
  extend: sar.steps.LoadData,

  events: {
    "testDataSet": "qx.event.type.Data"
  },

  members: {
    // overriden
    _getDescriptionText: function() {
      return "Load Test data"
    },

    // overriden
    _getFileInput: function() {
      const fileInput = this._fileInput = new sar.widget.FileInput("Load Test data...", ["csv"]);
      fileInput.addListener("selectionChanged", () => {
        const file = fileInput.getFile();
        if (file) {
          this.__submitFile(file);
        }
      });
      return fileInput;
    },

    __submitFile: function(file) {
      const successCallback = resp => this.setTestData(resp);
      sar.steps.Utils.postFile(file, "/test-data/load", successCallback, null, this);
    },

    // overriden
    _getDataTable: function() {
      return sar.steps.Utils.testDataTable();
    },

    // overriden
    _applyStepData: function(testData) {
      this.base(arguments, testData);

      this.fireDataEvent("testDataSet", testData);
    },

    // overriden
    _popoluateTable: function(data) {
      sar.steps.Utils.populateTestDataTable(this._dataTable, data);
    },
  }
});
