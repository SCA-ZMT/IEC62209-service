/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.LoadModel", {
  extend: sar.steps.LoadData,

  events: {
    "modelSet": "qx.event.type.Data"
  },

  members: {
    __modelViewer: null,

    // overriden
    _getDescriptionText: function() {
      return "Load the GPI model of the measurement system. This model is provided by the measurement system manufacturer or any other party that created the model. It is a json file."
    },

    // overriden
    _getFileInput: function() {
      const fileInput = new sar.widget.FileInput("Load Model...", ["json"]);
      fileInput.addListener("selectionChanged", () => {
        const file = fileInput.getFile();
        if (file) {
          this.__submitFile(file);
        }
      });
      return fileInput;
    },

    // overriden
    _createOptions: function() {
      const optionsLayout = this.base(arguments);

      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(null);
      optionsLayout.add(modelViewer);

      return optionsLayout;
    },

    __submitFile: function(file) {
      const endpoints = sar.io.Resources.getEndPoints("loadModel");
      const successCallback = resp => this.setStepData(resp);
      sar.steps.Utils.postFile(file, endpoints["load"].url, successCallback, null, this);
    },

    // overriden
    _resetPressed: function() {
      this.base(arguments);
      sar.io.Resources.fetch("loadModel", "resetData");
    },

    _applyStepData: function(resp) {
      this.base(arguments, resp ? resp["data"] : null);

      this._optionsLayout.remove(this.__modelViewer);
      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(resp && "metadata" in resp ? resp["metadata"] : null);
      this._optionsLayout.add(modelViewer);

      this.fireDataEvent("modelSet", (resp && "metadata" in resp) ? resp["metadata"] : null);
    },
  }
});
