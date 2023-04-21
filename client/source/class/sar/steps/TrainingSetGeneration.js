/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.TrainingSetGeneration", {
  extend: sar.steps.StepBase,

  members: {
    __exportButton: null,
    __dataTable: null,
    __distributionImage: null,

    // overriden
    _getDescriptionText: function() {
      return "\
        Generates a random latin hypercube sample with 8 dimensions and saves the results to a .csv file. The 8 test variables are:\
        <br>frequency, output power, peak to average power ratio (PAPR), bandwidth (BW), distance (mm), angle (deg), x (mm), and y (mm).\
        <br><br>When performing the SAR measurements, fill in the SAR (SAR1g and/or SAR10g), and uncertainty (U1g and/or U10g) values. The uncertainty values should be reported with a 95% confidence level (k = 2 standard deviations).\
      "
    },

    _createOptions: function() {
      const optionsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));

      const form = new qx.ui.form.Form();
      form.addGroupHeader("Frequency range (MHz)");
      const fRangeMin = new qx.ui.form.Spinner().set({
        minimum: 300,
        maximum: 300,
        value: 300,
        enabled: false
      });
      form.add(fRangeMin, "Min", null, "fRangeMin");
      const fRangeMax = new qx.ui.form.Spinner().set({
        minimum: 6000,
        maximum: 6000,
        value: 6000,
        enabled: false
      });
      form.add(fRangeMax, "Max", null, "fRangeMax");
      sar.steps.Utils.addMeasurementAreaToForm(form);

      const sampleSize = new qx.ui.form.Spinner().set({
        minimum: 400,
        maximum: 400,
        value: 400
      });
      form.add(sampleSize, "Sample size", null, "sampleSize");

      const formRenderer = new qx.ui.form.renderer.Single(form);
      optionsLayout.add(formRenderer);

      const createButton = new qx.ui.form.Button("Create Training data");
      createButton.addListener("execute", () => {
        createButton.setEnabled(false);
        const data = {};
        for (const [key, item] of Object.entries(form.getItems())) {
          data[key] = item.getValue()
        }
        const params = {
          data,
          options: {
            resolveWResponse: true
          }
        };
        sar.io.Resources.fetch("trainingSetGeneration", "generate", params)
          .then(() => this.__trainingDataGenerated())
          .catch(err => {
            this.__trainingDataGenerated();
            console.error(err);
          })
          .finally(() => createButton.setEnabled(true));
      });
      optionsLayout.add(createButton);

      const exportButton = this.__exportButton = new qx.ui.form.Button("Export Training data").set({
        enabled: false
      });
      exportButton.addListener("execute", () => {
        sar.io.Resources.fetch("trainingSetGeneration", "xport", params)
          .then(data => this.__trainingDataExported(data))
          .catch(err => console.error(err))
          .finally(() => createButton.setEnabled(true));
      });
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
      table.setColumnWidth(0, 10);
      return table;
    },

    __createDataView: function() {
      const dataTable = this.__dataTable = this.__createDataTable();
      const layout = new qx.ui.layout.VBox();
      const tabPage = new qx.ui.tabview.Page("Data").set({
        layout
      });
      tabPage.add(dataTable);
      return tabPage;
    },

    __createDistributionView: function() {
      const distributionImage = this.__distributionImage = sar.steps.Utils.createImageViewer("sar/plots/step0_distribution.png")
      const tabPage = sar.steps.Utils.createTabPage("Distribution", distributionImage);
      return tabPage;
    },

    _createResults: function() {
      const resultsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      const resultsTabView = new qx.ui.tabview.TabView().set({
        contentPadding: 10
      });
      resultsLayout.add(resultsTabView);

      const dataView = this.__createDataView();
      resultsTabView.add(dataView);

      const distributionView = this.__createDistributionView();
      resultsTabView.add(distributionView);

      return resultsLayout;
    },

    __trainingDataGenerated: function() {
      this.__exportButton.setEnabled(true);
      this.__fetchResults();
    },

    __fetchResults: function() {
      console.log("fetching results");

      const data = {
        "headings": ["no.", "antenna", "freq. (MHz)", "Pin (dBm)", "mod.", "PAPR (db)", "BW (MHz)", "d (mm)", "O (*)", "x (mm)", "y (mm)", "SAR 1g (W/Kg)", "SAR 10g (W/Kg)", "U 1g (dB)", "U 10g (dB)"],
        "rows": [
          [1,"asfd",3,4,5,6,7,8,9,10,11,,,,],
          [2,"yxcv",4,5,6,7,8,9,10,11,12,,,,],
          [3,"qwre",5,6,7,8,9,10,11,12,13,,,,]
        ]};
      this.__popoluateTable(data);

      /*
      sar.io.Resources.fetch("trainingSetGeneration", "getData")
        .then(data => this.__popoluateTable(data))
        .catch(err => console.error(err));
        
      sar.io.Resources.fetch("trainingSetGeneration", "getDistribution")
        .then(data => this.__popoluateDistributionImage(data))
        .catch(err => console.error(err));
      */
    },

    __popoluateTable: function(data) {
      const table = this.__dataTable;
      const tableModel = table.getTableModel();
      if ("headings" in data) {
        // tableModel.setColumns(data["headings"])
      }
      if ("rows" in data) {
        tableModel.setData(data["rows"])
      }
    },

    __popoluateDistributionImage: function(data) {
      const distributionImage = this.__distributionImage;
      console.log(data);
    },

    __trainingDataExported: function(data) {
      console.log("__trainingDataExported", data);
    }
  }
});
