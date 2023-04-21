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
      const loadCriticalTestButton = new qx.ui.form.Button("Load Critical tests data");
      stepLayout.add(loadCriticalTestButton, {
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

      const confirmButton = new qx.ui.form.Button("Confirm").set({
        allowGrowY: false
      });
      stepLayout.add(confirmButton, {
        row,
        column: 0
      });
      const acceptanceTitle = new qx.ui.basic.Label().set({
        value: "Acceptance criteria:"
      });
      stepLayout.add(acceptanceTitle, {
        row,
        column: 1
      });
      row++;

      return optionsLayout;
    },

    __createDeviationsView: function() {
      const deviationsImage = sar.steps.Utils.createImageViewer("sar/plots/step3_deviations.png")
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
    }
  }
});
