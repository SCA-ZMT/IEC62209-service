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
      return "Load Training Data";
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
      const successCallback = resp => this.setStepData(resp);
      sar.steps.Utils.postFile(file, "/training-data/load", successCallback, null, this);
    },

    // overriden
    _applyStepData: function(trainingData) {
      this.base(arguments, trainingData);

      this.fireDataEvent("trainingDataSet", trainingData);
    },
  }
});
