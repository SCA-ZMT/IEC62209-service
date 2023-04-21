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
    __input: null,
    __loadModelButton: null,
    __modelViewer: null,

    // overriden
    _getDescriptionText: function() {
      return "Load the model that will be used in the coming 4 steps"
    },

    _createOptions: function() {
      const optionsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const input = this.__input = new qx.html.Input("file", {
        display: "none"
      }, {
        accept: "json"
      });
      this.getContentElement().add(this.__input);

      const loadModelButton = this.__loadModelButton = new qx.ui.form.Button("Load Model...").set({
        allowGrowX: false
      });
      optionsLayout.add(loadModelButton);

      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(null);
      optionsLayout.add(modelViewer);

      input.addListener("change", () => {
        const file = input.getDomElement().files.item(0);
        this.__submitFile(file);
      }, this);
      loadModelButton.addListener("execute", () => this.__loadModelButtonPressed(), this);

      return optionsLayout;
    },

    _createResults: function() {
      return null;
    },

    __submitFile: function(file) {
      const fileName = file.name;
      console.log("submitFile", fileName);
      
      const body = new FormData();
      body.append("fileName", fileName);

      const req = new XMLHttpRequest();
      req.upload.addEventListener("progress", ep => {
        // updateProgress
        if (ep.lengthComputable) {
          const percentComplete = ep.loaded / ep.total * 100;
          console.log("percentComplete", percentComplete);
        } else {
          console.log("Unable to compute progress information since the total size is unknown");
        }
      }, false);
      req.addEventListener("load", e => {
        // transferComplete
        if (req.status == 200) {
          console.log("transferComplete");
        } else if (req.status == 400) {
          console.error("transferFailed");
        }
      });
      req.addEventListener("error", e => console.error(e));
      req.addEventListener("abort", e => console.error(e));
      req.open("POST", "/load-model", true);
      req.send(body);

      const newModel = {
        "filename": "fileName",
        "systemName": "cSAR3D",
        "phantomType": "Flat HSL",
        "hardwareVersion": "SD C00 F01 AC",
        "softwareVersion": "V5.2.0",
        "acceptanceCriteria": "Pass",
        "normalizedRMSError": "Pass",
      }
      this.setModel(newModel);
    },

    __loadModelButtonPressed: function() {
      if (this.getModel()) {
        this.setModel(null);
      } else {
        this.__input.getDomElement().click();
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
