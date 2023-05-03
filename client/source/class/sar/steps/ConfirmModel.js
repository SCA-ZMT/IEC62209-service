/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.ConfirmModel", {
  extend: sar.steps.StepBase,

  construct: function() {
    this.__valueLabels = [];
    this.__images = [];

    this.base(arguments);
  },

  members: {
    __valueLabels: null,
    __images: null,
    __modelViewer: null,
    __reportButton: null,
    __qqImage: null,
    __deviationsImage: null,

    // overriden
    _getDescriptionText: function() {
      return "\
        This step confirms the model with the following tests:\
        <br>- all tests must pass the acceptance criteria (within the mpe)\
        <br>- the Shapiro-Wilk hypothesis p-value, which must be at least 0.05 for the normality to pass,\
        <br>- the QQ location and scale which need to be in the range of [-1, 1] and [0.5, 1.5] respectively for the test to pass.\
        <br><br>After pressing the 'Confirm' button, press 'Generate Report' to export a PDF report of the findings.\
      ";
    },

    _createOptions: function() {
      const optionsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(null, true, false);
      optionsLayout.add(modelViewer);

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
      const confirmButton = new sar.widget.FetchButton("Confirm").set({
        alignY: "middle",
        allowGrowY: false
      });
      stepLayout.add(confirmButton, {
        row,
        column: 0
      });

      const resultsGrid = new qx.ui.layout.Grid(10, 10);
      const resultsLayout = new qx.ui.container.Composite(resultsGrid).set({
        allowGrowX: false
      });
      // titles
      const acceptanceTitle = new qx.ui.basic.Label().set({
        value: "Acceptance criteria:",
        alignX: "right",
        alignY: "middle",
        textAlign: "right",
      });
      resultsLayout.add(acceptanceTitle, {
        row: 0,
        column: 0
      });
      const normalityTitle = new qx.ui.basic.Label().set({
        value: "Normality:",
        alignX: "right",
        alignY: "middle",
        textAlign: "right",
      });
      resultsLayout.add(normalityTitle, {
        row: 1,
        column: 0
      });
      const qqLocationTitle = new qx.ui.basic.Label().set({
        value: "QQ location:",
        alignX: "right",
        alignY: "middle",
        textAlign: "right",
      });
      resultsLayout.add(qqLocationTitle, {
        row: 2,
        column: 0
      });
      const qqScaleTitle = new qx.ui.basic.Label().set({
        value: "QQ scale:",
        alignX: "right",
        alignY: "middle",
        textAlign: "right",
      });
      resultsLayout.add(qqScaleTitle, {
        row: 3,
        column: 0
      });
      // values
      const acceptanceValue = new qx.ui.basic.Label();
      this.__valueLabels.push(acceptanceValue);
      sar.steps.Utils.decoratePassFailLabel(acceptanceValue);
      resultsLayout.add(acceptanceValue, {
        row: 0,
        column: 1
      });
      const normalityValue = new qx.ui.basic.Label();
      this.__valueLabels.push(normalityValue);
      sar.steps.Utils.decoratePassFailLabel(normalityValue);
      resultsLayout.add(normalityValue, {
        row: 1,
        column: 1
      });
      const qqLocationValue = new qx.ui.basic.Label();
      this.__valueLabels.push(qqLocationValue);
      sar.steps.Utils.decoratePassFailLabel(qqLocationValue);
      resultsLayout.add(qqLocationValue, {
        row: 2,
        column: 1
      });
      const qqScaleValue = new qx.ui.basic.Label();
      this.__valueLabels.push(qqScaleValue);
      sar.steps.Utils.decoratePassFailLabel(qqScaleValue);
      resultsLayout.add(qqScaleValue, {
        row: 3,
        column: 1
      });
      stepLayout.add(resultsLayout, {
        row,
        column: 1
      });
      confirmButton.addListener("execute", () => {
        confirmButton.setFetching(true);
        this.__resetValueLabels();
        sar.io.Resources.fetch("confirmModel", "confirm")
          .then(data => {
            if ("Acceptance criteria" in data) {
              acceptanceValue.setValue(data["Acceptance criteria"]);
            }
            if ("Normality" in data) {
              normalityValue.setValue(data["Normality"]);
            }
            if ("QQ location" in data) {
              qqLocationValue.setValue(data["QQ location"]);
            }
            if ("QQ scale" in data) {
              qqScaleValue.setValue(data["QQ scale"]);
            }
            this.__modelConfirmed();
          })
          .catch(err => console.error(err))
          .finally(() => confirmButton.setFetching(false));
      });
      row++;

      const reportButton = this.__reportButton = sar.steps.Utils.createGenerateReportButton("confirmModel", "ModelConfirmationReport.pdf");
      stepLayout.add(reportButton, {
        row,
        column: 0,
        colSpan: 2
      });
      row++;

      return optionsLayout;
    },

    __createQQView: function() {
      const qqImage = this.__qqImage = sar.steps.Utils.createImageViewer();
      this.__images.push(qqImage);
      const tabPage = sar.steps.Utils.createTabPage("QQ plot", qqImage);
      return tabPage;
    },

    __createDeviationsView: function() {
      const deviationsImage = this.__deviationsImage = sar.steps.Utils.createImageViewer();
      this.__images.push(deviationsImage);
      const tabPage = sar.steps.Utils.createTabPage("Deviations", deviationsImage);
      return tabPage;
    },

    _createResults: function() {
      const resultsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const resultsTabView = new qx.ui.tabview.TabView().set({
        contentPadding: 10
      });
      resultsLayout.add(resultsTabView);

      const qqView = this.__createQQView();
      resultsTabView.add(qqView);

      const deviationsView = this.__createDeviationsView();
      resultsTabView.add(deviationsView);

      return resultsLayout;
    },

    // overriden
    _applyModel: function(modelMetadata) {
      if (this.__modelViewer) {
        this._optionsLayout.remove(this.__modelViewer);
      }
      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(modelMetadata, true, false);
      this._optionsLayout.addAt(modelViewer, 0);

      if (modelMetadata === null) {
        this.resetResults();
      }
    },

    __modelConfirmed: function() {
      this.__reportButton.setEnabled(true);
      this.__fetchResults();
    },

    __fetchResults: function() {
      this.__populateQQImage();
      this.__populateDeviationsImage();
    },

    __populateQQImage: function() {
      const endpoints = sar.io.Resources.getEndPoints("confirmModel");
      this.__qqImage.setSource(endpoints["getQQPlot"].url);
    },

    __populateDeviationsImage: function() {
      const endpoints = sar.io.Resources.getEndPoints("confirmModel");
      this.__deviationsImage.setSource(endpoints["getDeviations"].url);
    },

    __resetValueLabels: function() {
      this.__valueLabels.forEach(valueLabel => valueLabel.resetValue());
    },

    __resetImages: function() {
      this.__images.forEach(image => image.resetSource());
    },

    resetResults: function() {
      this.__resetValueLabels();
      this.__resetImages();
      this.__reportButton.setEnabled(false);
    },
  }
});
