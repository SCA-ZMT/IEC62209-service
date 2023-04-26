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
      return "Load Model"
    },

    // overriden
    _getFileInput: function() {
      const fileInput = this._fileInput = new sar.widget.FileInput("Load Model...", ["json"]);
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
      const successCallback = resp => this.setStepData(resp);
      sar.steps.Utils.postFile(file, "/model/load", successCallback, null, this);
    },

    _applyStepData: function(model) {
      this.base(arguments, model);

      this._optionsLayout.remove(this.__modelViewer);
      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(model);
      this._optionsLayout.add(modelViewer);

      this.fireDataEvent("modelSet", model);
    },

    // overriden
    _popoluateTable: function(data) {
      console.log("model", data);
      this.base(arguments, data);
    },
  }
});
