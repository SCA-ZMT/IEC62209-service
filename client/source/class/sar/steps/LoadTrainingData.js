/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.LoadTrainingData", {
  extend: sar.steps.LoadData,

  events: {
    "trainingDataSet": "qx.event.type.Data"
  },

  members: {
    // overriden
    _getDescriptionText: function() {
      return "\
        Complete the SAR measurements on the measurement system using the exported file from the 'Training Set Generation' window, and fill in the sar10g and u10g fields. Then load this data using the button below.\
      ";
    },

    // overriden
    _getFileInput: function() {
      const fileInput = this._fileInput = new sar.widget.FileInput("Load Training data...", ["csv"]);
      fileInput.addListener("selectionChanged", () => {
        const file = fileInput.getFile();
        if (file) {
          this.__submitFile(file);
        }
      });
      return fileInput;
    },

    __submitFile: function(file) {
      const endpoints = sar.io.Resources.getEndPoints("trainingData");
      const successCallback = resp => this.setStepData(resp);
      sar.steps.Utils.postFile(file, endpoints["load"].url, successCallback, null, this);
    },

    // overriden
    _resetPressed: function() {
      this.base(arguments);
      sar.io.Resources.fetch("trainingData", "resetData");
    },

    // overriden
    _applyStepData: function(trainingData) {
      this.base(arguments, trainingData);

      this.fireDataEvent("trainingDataSet", trainingData);
    },
  }
});
