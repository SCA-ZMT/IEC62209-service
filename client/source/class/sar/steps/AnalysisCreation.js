/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.AnalysisCreation", {
  extend: sar.steps.StepBase,

  members: {
    __createButton: null,
    __exportButton: null,
    __variogramImage: null,

    // overriden
    _getDescriptionText: function() {
      return "\
        Builds a model and outputs the empirical (blue) and theoretical (red) semi-variogram after rescaling to an isotropic space.\
        <br>The system analyses geostatistical properties along each direction in the data space, computes an invertible mapping that converts the space to an isotropic one.\
        <br>The tests evaluate whether:\
        <br>- the acceptance criteria are met for each measurement,\
        <br>- the normalized mean squared error (nrsme) is within 0.25 to ensure that the variogram model fits the empirical variances\
      "
    },

    _createOptions: function() {
      const optionsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const stepGrid = new qx.ui.layout.Grid(20, 20);
      stepGrid.setColumnFlex(0, 1);
      stepGrid.setColumnFlex(1, 1);
      stepGrid.setRowFlex(0, 0);
      stepGrid.setRowFlex(1, 1);
      stepGrid.setColumnMinWidth(0, 200);
      const stepLayout = new qx.ui.container.Composite(stepGrid).set({
        allowGrowX: false
      });
      optionsLayout.add(stepLayout);

      let row = 0;
      const createButton = this.__createButton = new sar.widget.FetchButton("Create & Analyze").set({
        allowGrowY: false
      });
      stepLayout.add(createButton, {
        row,
        column: 0
      });

      const resultsGrid = new qx.ui.layout.Grid(10, 10);
      const resultsLayout = new qx.ui.container.Composite(resultsGrid).set({
        allowGrowX: false
      });
      const acceptanceTitle = new qx.ui.basic.Label().set({
        value: "Acceptance criteria:",
        alignX: "right",
        textAlign: "right",
      });
      resultsLayout.add(acceptanceTitle, {
        row: 0,
        column: 0
      });
      const acceptanceValue = new qx.ui.basic.Label();
      resultsLayout.add(acceptanceValue, {
        row: 0,
        column: 1
      });
      const rmsErrorTitle = new qx.ui.basic.Label().set({
        value: "Norm. RMS error 10.2%<25%:",
        alignX: "right",
        textAlign: "right",
      });
      resultsLayout.add(rmsErrorTitle, {
        row: 1,
        column: 0
      });
      const rmsErrorValue = new qx.ui.basic.Label();
      resultsLayout.add(rmsErrorValue, {
        row: 1,
        column: 1
      });
      resultsLayout.add(acceptanceValue, {
        row: 0,
        column: 1
      });
      stepLayout.add(resultsLayout, {
        row,
        column: 1
      });
      createButton.addListener("execute", () => {
        createButton.setFetching(true);
        acceptanceValue.setValue("");
        rmsErrorValue.setValue("");
        sar.io.Resources.fetch("analysisCreation", "create")
          .then(data => {
            if ("Acceptance criteria" in data) {
              acceptanceValue.setValue(data["Acceptance criteria"]);
            }
            if ("Normalized RMS error" in data) {
              rmsErrorValue.setValue(data["Normalized RMS error"]);
            }
            this.__trainingDataAnalyzed();
          })
          .catch(err => console.error(err))
          .finally(() => createButton.setFetching(false));
      });
      row++;

      const modelEditor = sar.steps.Utils.modelEditor();
      stepLayout.add(modelEditor, {
        row,
        column: 0,
        colSpan: 2
      });
      row++;

      const exportButton = this.__exportButton = new sar.widget.FetchButton("Export Model").set({
        enabled: false
      });
      exportButton.addListener("execute", () => {
        exportButton.setFetching(true);
        const data = {};
        for (const [key, item] of Object.entries(modelEditor._form.getItems())) {
          data[key] = item.getValue()
        }
        data["acceptanceCriteria"] = acceptanceValue.getValue();
        data["normalizedRMSError"] = rmsErrorValue.getValue();
        const params = {
          data
        };
        sar.io.Resources.fetch("analysisCreation", "xport", params)
          .then(data => this.__modelExported(data))
          .catch(err => console.error(err))
          .finally(() => exportButton.setFetching(false));
      });
      stepLayout.add(exportButton, {
        row,
        column: 0,
        colSpan: 2
      });
      row++;

      return optionsLayout;
    },

    __createVariogramView: function() {
      const variogramImage = sar.steps.Utils.createImageViewer();
      const tabPage = sar.steps.Utils.createTabPage("Variogram", variogramImage);
      return tabPage;
    },

    _createResults: function() {
      const resultsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const resultsTabView = new qx.ui.tabview.TabView().set({
        contentPadding: 10
      });
      resultsLayout.add(resultsTabView);

      const variogramView = this.__variogramImage = this.__createVariogramView()
      resultsTabView.add(variogramView);

      return resultsLayout;
    },

    __trainingDataAnalyzed: function() {
      this.__exportButton.setEnabled(true);
      this.__fetchResults();
    },

    __fetchResults: function() {
      this.__populateVariogramImage();
    },

    __populateVariogramImage: function() {
      const endpoints = sar.io.Resources.resources["analysisCreation"].endpoints;
      this.__variogramImage.setSource(endpoints["getVariogram"].url);
    },

    __modelExported: function(data) {
      sar.steps.Utils.downloadJson(data, "Model.json");
    }
  }
});
