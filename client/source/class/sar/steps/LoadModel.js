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
      return "Load Model"
    },

    _createOptions: function() {
      const optionsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const fileInput = this.__fileInput = new sar.widget.FileInput("Load Model...", ["json"]);
      fileInput.addListener("selectionChanged", () => {
        const file = fileInput.getFile();
        if (file) {
          this.__submitFile(file);
        }
      });
      optionsLayout.add(fileInput);

      const resetBtn = this.__resetBtn = new qx.ui.form.Button("Reset Model").set({
        allowGrowX: false
      });
      resetBtn.addListener("execute", () => this.setModel(null));
      optionsLayout.add(resetBtn);

      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(null);
      optionsLayout.add(modelViewer);

      return optionsLayout;
    },

    _createResults: function() {
      return null;
    },

    __submitFile: function(file) {
      const fileName = file.name;
      
      const formData = new FormData();
      formData.append("file", file);

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
          const newModel = JSON.parse(req.responseText);
          this.setModel(newModel);
        } else if (req.status == 400) {
          console.error("transferFailed");
        }
      });
      req.addEventListener("error", e => console.error(e));
      req.addEventListener("abort", e => console.error(e));
      req.open("POST", "/model/load", true);
      req.send(formData);
    },

    _applyModel: function(model) {
      if (model) {
        this.__fileInput.exclude();
        this.__resetBtn.show();
      } else {
        this.__fileInput.show();
        this.__resetBtn.exclude();
      }

      this._optionsLayout.remove(this.__modelViewer);
      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(model);
      this._optionsLayout.add(modelViewer);
      this.fireDataEvent("modelSet", model);
    }
  }
});
