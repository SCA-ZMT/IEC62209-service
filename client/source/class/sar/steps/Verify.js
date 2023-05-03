/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.Verify", {
  extend: sar.steps.StepBase,

  members: {
    __modelViewer: null,
    __acceptanceValue: null,
    __deviationsImage: null,
    __reportButton: null,

    // overriden
    _getDescriptionText: function() {
      return "\
        Select the 'Verify' button to evaluate whether the critical test set passes the acceptance criteria in IEC 62209-3. \
        Then select 'Generate Report' to export a PDF report of the findings.\
      "
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
      const verifyButton = new sar.widget.FetchButton("Verify").set({
        alignY: "middle",
        allowGrowY: false
      });
      stepLayout.add(verifyButton, {
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
      // values
      const acceptanceValue = this.__acceptanceValue = new qx.ui.basic.Label();
      sar.steps.Utils.decoratePassFailLabel(acceptanceValue);
      resultsLayout.add(acceptanceValue, {
        row: 0,
        column: 1
      });
      stepLayout.add(resultsLayout, {
        row,
        column: 1
      });
      row++;

      verifyButton.addListener("execute", () => {
        verifyButton.setFetching(true);
        sar.io.Resources.fetch("verify", "verify")
          .then(data => {
            if ("Acceptance criteria" in data) {
              this.setAcceptanceValue(data["Acceptance criteria"]);
            }
            this.__criticalDataAnalyzed();
          })
          .catch(err => console.error(err))
          .finally(() => verifyButton.setFetching(false));
      });

      const reportButton = this.__reportButton = sar.steps.Utils.createGenerateReportButton("verify", "CriticalDataReport.pdf");
      stepLayout.add(reportButton, {
        row,
        column: 0,
        colSpan: 2
      });
      row++;

      return optionsLayout;
    },

    setAcceptanceValue: function(val) {
      if (this.__acceptanceValue) {
        this.__acceptanceValue.setValue(val);
      }
    },

    resetAcceptanceValue: function() {
      if (this.__acceptanceValue) {
        this.__acceptanceValue.resetValue();
      }
    },

    __createDeviationsView: function() {
      const deviationsImage = this.__deviationsImage = sar.steps.Utils.createImageViewer()
      const tabPage = sar.steps.Utils.createTabPage("Deviations", deviationsImage);
      return tabPage;
    },

    _createResults: function() {
      const resultsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const resultsTabView = new qx.ui.tabview.TabView().set({
        contentPadding: 10
      });
      resultsLayout.add(resultsTabView);

      const deviationsView = this.__createDeviationsView()
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

    __criticalDataAnalyzed: function() {
      this.__reportButton.setEnabled(true);
      this.__fetchResults();
    },

    __fetchResults: function() {
      this.__populateDeviationsImage();
    },

    __populateDeviationsImage: function() {
      const endpoints = sar.io.Resources.getEndPoints("verify");
      this.__deviationsImage.setSource(endpoints["getDeviations"].url);
    },

    resetResults: function() {
      this.__acceptanceValue.resetValue();
      this.__deviationsImage.resetSource();
      this.__reportButton.setEnabled(false);
    },
  }
});
