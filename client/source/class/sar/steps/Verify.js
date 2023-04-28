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
    __deviationsImage: null,
    __reportButton: null,

    // overriden
    _getDescriptionText: function() {
      return "\
        Explores the space of the valid model to find the most critical regions of the test space, such that:\
        <br>- the test cases are pulled toward the most extreme regions of the data pace,\
        <br>- the test cases exert a repulsive force on each other to ensure even coverage of the critical regions,\
        <br>- the test cases have meaningful coordinates.\
        <br><br>The resulting test conditions, with the computed z-values and associated probabilities to pass the mpe value are saved as a csv file.\
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
      const acceptanceValue = new qx.ui.basic.Label();
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
              acceptanceValue.setValue(data["Acceptance criteria"]);
            }
            this.__criticalDataAnalyzed();
          })
          .catch(err => console.error(err))
          .finally(() => verifyButton.setFetching(false));
      });

      const reportButton = this.__reportButton = sar.steps.Utils.createGenerateReportButton("verify", "VerificationReport.pdf");
      stepLayout.add(reportButton, {
        row,
        column: 0,
        colSpan: 2
      });
      row++;

      return optionsLayout;
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

    __criticalDataAnalyzed: function() {
      this.__reportButton.setEnabled(true);
      this.__fetchResults();
    },

    __fetchResults: function() {
      this.__populateDeviationsImage();
    },

    resetResults: function() {
      this.__deviationsImage.resetSource();
    },

    __populateDeviationsImage: function() {
      const endpoints = sar.io.Resources.getEndPoints("verify");
      this.__deviationsImage.setSource(endpoints["getDeviations"].url);
    },
  }
});
