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
      const endpoints = sar.io.Resources.getEndPoints("criticalData");
      const successCallback = resp => this.setStepData(resp);
      sar.steps.Utils.postFile(file, endpoints["load"].url, successCallback, null, this);
    },

    // overriden
    _resetPressed: function() {
      this.base(arguments);
      sar.io.Resources.fetch("criticalData", "resetData");
    },

    // overriden
    _applyStepData: function(criticalData) {
      this.base(arguments, criticalData);

      this.fireDataEvent("criticalDataSet", criticalData);
    },
  }
});
