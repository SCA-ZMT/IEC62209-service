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

  members: {
    // overriden
    _getDescriptionText: function() {
      return "\
        This step confirms the model with the following tests:\
        <br>- all tests must pass the acceptance criteria (within the mpe)\
        <br>- the Shapiro-Wilk hypothesis p-value, which must be at least 0.05 for the normality to pass,\
        <br>- the QQ location and scale which need to be in the range of [-1, 1] and [0.5, 1.5] respectively for the test to pass.\
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
      const loadTestButton = new qx.ui.form.Button("Load Test Data");
      stepLayout.add(loadTestButton, {
        row,
        column: 0
      });
      row++;

      const sarSelectBox = sar.steps.Utils.sarSelectBox(null, false);
      stepLayout.add(sarSelectBox, {
        row,
        column: 0
      });

      const sarSelected = new qx.ui.basic.Label().set({
        alignY: "middle",
        rich: true,
        wrap: true,
        selectable: true
      });
      sarSelectBox.addListener("changeSelection", e => {
        const listItem = e.getData()[0];
        sarSelected.setValue(listItem.getLabel())
      }, this);
      stepLayout.add(sarSelected, {
        row,
        column: 1
      });
      row++;

      const createButton = new qx.ui.form.Button("Confirm").set({
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
        value: "Acceptance criteria:"
      });
      resultsLayout.add(acceptanceTitle, {
        row: 0,
        column: 0
      });
      const normalityTitle = new qx.ui.basic.Label().set({
        value: "Normality: 0.293 > 0.05:"
      });
      resultsLayout.add(normalityTitle, {
        row: 1,
        column: 0
      });
      const qqLocationTitle = new qx.ui.basic.Label().set({
        value: "QQ location: -0.049 ∈ [-1, 1]:"
      });
      resultsLayout.add(qqLocationTitle, {
        row: 2,
        column: 0
      });
      const qqScaleTitle = new qx.ui.basic.Label().set({
        value: "QQ scale: 0.944 ∈ [0.5, 1.5]:"
      });
      resultsLayout.add(qqScaleTitle, {
        row: 3,
        column: 0
      });
      stepLayout.add(resultsLayout, {
        row,
        column: 1
      });
      row++;

      return optionsLayout;
    },

    __createQQView: function() {
      const marginalsImage = sar.steps.Utils.createImageViewer("sar/plots/step3_qq.png")
      const tabPage = sar.steps.Utils.createTabPage("QQ plot", marginalsImage);
      return tabPage;
    },

    __createDeviationsView: function() {
      const deviationsImage = sar.steps.Utils.createImageViewer("sar/plots/step3_deviations.png")
      const tabPage = sar.steps.Utils.createTabPage("Deviations", deviationsImage);
      return tabPage;
    },

    __createResidualsView: function() {
      const marginalsImage = sar.steps.Utils.createImageViewer("sar/plots/step3_residuals.png")
      const tabPage = sar.steps.Utils.createTabPage("Residuals", marginalsImage);
      return tabPage;
    },

    __createSemivariogramView: function() {
      const semivariogramImage = sar.steps.Utils.createImageViewer("sar/plots/step3_semivariogram.png")
      const tabPage = sar.steps.Utils.createTabPage("Semivariogram", semivariogramImage);
      return tabPage;
    },

    _createResults: function() {
      const resultsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const resultsTabView = new qx.ui.tabview.TabView().set({
        contentPadding: 10
      });
      resultsLayout.add(resultsTabView);

      const qqView = this.__createQQView()
      resultsTabView.add(qqView);

      const deviationsView = this.__createDeviationsView()
      resultsTabView.add(deviationsView);

      const residualsView = this.__createResidualsView()
      resultsTabView.add(residualsView);

      const variogramView = this.__createSemivariogramView()
      resultsTabView.add(variogramView);

      return resultsLayout;
    }
  }
});
