/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.TestSetGeneration", {
  extend: sar.steps.StepBase,

  members: {
    // overriden
    _getDescriptionText: function() {
      return "\
        Generates a random latin hypercube sample with 8 dimensions and saves the results to a .csv file. The 8 test variables are:\
        <br>Frequency, output power, peak to average power ratio (PAPR), bandwidth (BW), distance (mm), angle (deg), x (mm), and y (mm).\
        <br>When performing the SAR measurements, fill in the SAR (SAR1g and/or SAR10g), and uncertainty (U1g and/or U10g) values. The uncertainty values should be reported with a 95% confidence level (k = 2 standard deviations).\
      "
    },

    _createOptions: function() {
      const optionsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const form = new qx.ui.form.Form();

      const modulationSelectBox = new qx.ui.form.SelectBox();
      [{
        id: "tableD6",
        text: "Table D.6",
      }, {
        id: "tableD8",
        text: "Table D.8",
      }].forEach((sarEntry, idx) => {
        const listItem = new qx.ui.form.ListItem(sarEntry.text);
        listItem.id = sarEntry.id;
        modulationSelectBox.add(listItem);
        if (idx === 0) {
          modulationSelectBox.setSelection([listItem]);
        }
      });
      modulationSelectBox.setEnabled(false);
      form.add(modulationSelectBox, "Modulation set");

      const vpifaSelectBox = new qx.ui.form.SelectBox();
      [{
        id: "VPIFAV1",
        text: "VPIFA v1",
      }, {
        id: "VPIFAV2",
        text: "VPIFA v2",
      }].forEach((sarEntry, idx) => {
        const listItem = new qx.ui.form.ListItem(sarEntry.text);
        listItem.id = sarEntry.id;
        vpifaSelectBox.add(listItem);
        if (idx === 1) {
          vpifaSelectBox.setSelection([listItem]);
        }
      });
      vpifaSelectBox.setEnabled(false);
      form.add(vpifaSelectBox, "Select VPIFA set");

      const peakSelectBox = new qx.ui.form.SelectBox();
      [{
        id: "peakV1",
        text: "2-PEAK antenna v1",
      }, {
        id: "peakV2",
        text: "2-PEAK antenna v2",
      }].forEach((sarEntry, idx) => {
        const listItem = new qx.ui.form.ListItem(sarEntry.text);
        listItem.id = sarEntry.id;
        peakSelectBox.add(listItem);
        if (idx === 1) {
          peakSelectBox.setSelection([listItem]);
        }
      });
      peakSelectBox.setEnabled(false);
      form.add(peakSelectBox, "Select 2-PEAK set");

      form.addGroupHeader("BW range (MHz)");
      const bwRangeMin = new qx.ui.form.Spinner().set({
        minimum: 0,
        maximum: 0,
        value: 0,
        enabled: false
      });
      form.add(bwRangeMin, "Min");
      const bwRangeMax = new qx.ui.form.Spinner().set({
        minimum: 100,
        maximum: 100,
        value: 100,
        enabled: false
      });
      form.add(bwRangeMax, "Max");

      form.addGroupHeader("PAPR range (dB)");
      const paprRangeMin = new qx.ui.form.Spinner().set({
        minimum: 0,
        maximum: 0,
        value: 0,
        enabled: false
      });
      form.add(paprRangeMin, "Min");
      const paprRangeMax = new qx.ui.form.Spinner().set({
        minimum: 12,
        maximum: 12,
        value: 12,
        enabled: false
      });
      form.add(paprRangeMax, "Max");

      form.addGroupHeader("Frequency range (MHz)");
      const fRangeMin = new qx.ui.form.Spinner().set({
        minimum: 300,
        maximum: 300,
        value: 300,
        enabled: false
      });
      form.add(fRangeMin, "Min");
      const fRangeMax = new qx.ui.form.Spinner().set({
        minimum: 6000,
        maximum: 6000,
        value: 6000,
        enabled: false
      });
      form.add(fRangeMax, "Max");

      sar.steps.Utils.addMeasurementAreaToForm(form);

      const sampleSize = new qx.ui.form.Spinner().set({
        minimum: 40,
        maximum: 40,
        value: 40
      });
      form.add(sampleSize, "Sample size");

      const formRenderer = new qx.ui.form.renderer.Single(form);
      optionsLayout.add(formRenderer);

      const createButton = new qx.ui.form.Button("Create Test data");
      createButton.addListener("execute", () => console.log("Create test data"));
      optionsLayout.add(createButton);

      const exportButton = new qx.ui.form.Button("Export Test data").set({
        enabled: false
      });
      exportButton.addListener("execute", () => console.log("Export test data"));
      optionsLayout.add(exportButton);

      return optionsLayout;
    },

    __createDataTable: function() {
      const tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([
        "no.",
        "antenna",
        "freq. (MHz)",
        "Pin (dBm)",
        "mod.",
        "PAPR (db)",
        "BW (MHz)",
        "d (mm)",
        "O (*)",
        "x (mm)",
        "y (mm)",
        "SAR 1g (W/Kg)",
        "SAR 10g (W/Kg)",
        "U 1g (dB)",
        "U 10g (dB)",
      ]);
      const custom = {
        tableColumnModel: function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };
      const table = new qx.ui.table.Table(tableModel, custom).set({
        selectable: true,
        statusBarVisible: false,
        showCellFocusIndicator: false,
        forceLineHeight: false
      });
      table.getTableColumnModel().setDataCellRenderer(0, new qx.ui.table.cellrenderer.Number());
      table.getTableColumnModel().setDataCellRenderer(1, new qx.ui.table.cellrenderer.String());
      table.getTableColumnModel().setDataCellRenderer(2, new qx.ui.table.cellrenderer.Number());
      table.setColumnWidth(0, 20);
      return table;
    },

    __createDataView: function() {
      const dataTable = this.__createDataTable();
      const layout = new qx.ui.layout.VBox();
      const tabPage = new qx.ui.tabview.Page("Data").set({
        layout
      });
      tabPage.add(dataTable);
      return tabPage;
    },

    __createDistributionView: function() {
      const distributionImage = sar.steps.Utils.createImageViewer("sar/plots/step0_distribution.png")
      const tabPage = sar.steps.Utils.createTabPage("Distribution", distributionImage);
      return tabPage;
    },

    _createResults: function() {
      const resultsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const resultsTabView = new qx.ui.tabview.TabView().set({
        contentPadding: 10
      });
      resultsLayout.add(resultsTabView);

      const dataView = this.__createDataView()
      resultsTabView.add(dataView);

      const distributionView = this.__createDistributionView()
      resultsTabView.add(distributionView);

      return resultsLayout;
    }
  }
});
