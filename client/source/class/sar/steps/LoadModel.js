/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.LoadModel", {
  extend: sar.steps.StepBase,

  events: {
    "modelSet": "qx.event.type.Data"
  },

  members: {
    __loadModelButton: null,
    __modelViewer: null,

    // overriden
    _getDescriptionText: function() {
      return "Load the model that will be used in the coming 4 steps"
    },

    _createOptions: function() {
      const optionsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const loadModelButton = this.__loadModelButton = new qx.ui.form.Button("Load Model").set({
        allowGrowX: false
      });
      loadModelButton.addListener("execute", () => this.__loadModelButtonPressed());
      optionsLayout.add(loadModelButton);

      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(null);
      optionsLayout.add(modelViewer);


      return optionsLayout;
    },

    _createResults: function() {
      return null;
    },

    __loadModelButtonPressed: function() {
      if (this.getModel()) {
        this.setModel(null);
      } else {
        const newModel = {
          "systemName": "cSAR3D",
          "phantomType": "Flat HSL",
          "hardwareVersion": "SD C00 F01 AC",
          "softwareVersion": "V5.2.0",
          "acceptanceCriteria": "Pass",
          "normalizedRMSError": "Pass",
        }
        this.setModel(newModel);
      }
    },

    _applyModel: function(model) {
      if (model) {
        this.__loadModelButton.setLabel("Reset Model");
      } else {
        this.__loadModelButton.setLabel("Load Model")
      }
      this._optionsLayout.remove(this.__modelViewer);
      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(model);
      this._optionsLayout.add(modelViewer);
      this.fireDataEvent("modelSet", model);
    }
  }
});
