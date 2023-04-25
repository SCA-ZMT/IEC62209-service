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
        <br>Frequency, output power, peak to average power ratio (PAPR), bandwidth (BW), distance (mm), angle (deg), x (mm), and y (mm).\
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
        minimum: 40,
        maximum: 1000,
        value: 400
      });
      form.add(sampleSize, "Sample size", null, "sampleSize");

      const formRenderer = new qx.ui.form.renderer.Single(form);
      optionsLayout.add(formRenderer);

      const createButton = new sar.widget.FetchButton("Create Training data");
      createButton.addListener("execute", () => {
        createButton.setFetching(true);
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
          .catch(err => console.error(err))
          .finally(() => createButton.setFetching(false));
      });
      optionsLayout.add(createButton);

      const exportButton = this.__exportButton = new sar.widget.FetchButton("Export Training data").set({
        enabled: false
      });
      exportButton.addListener("execute", () => {
        exportButton.setFetching(true);
        sar.io.Resources.fetch("trainingSetGeneration", "xport")
          .then(data => this.__trainingDataExported(data))
          .catch(err => console.error(err))
          .finally(exportButton.setFetching(false));
      });
      optionsLayout.add(exportButton);

      return optionsLayout;
    },

    __createDataView: function() {
      const dataTable = this.__dataTable = sar.steps.Utils.trainingDataTable();
      const layout = new qx.ui.layout.VBox();
      const tabPage = new qx.ui.tabview.Page("Data").set({
        layout
      });
      tabPage.add(dataTable);
      return tabPage;
    },

    __createDistributionView: function() {
      const distributionImage = this.__distributionImage = sar.steps.Utils.createImageViewer();
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
      sar.io.Resources.fetch("trainingSetGeneration", "getData")
        .then(data => this.__popoluateTable(data))
        .catch(err => console.error(err));

      this.__populateDistributionImage();
    },

    __popoluateTable: function(data) {
      sar.steps.Utils.populateTrainingDataTable(this.__dataTable, data);
    },

    __populateDistributionImage: function() {
      const endpoints = sar.io.Resources.resources["trainingSetGeneration"].endpoints;
      this.__distributionImage.setSource(endpoints["getDistribution"].url);
    },

    __trainingDataExported: function(data) {
      sar.steps.Utils.downloadCSV(data, "TrainingData.csv");
    }
  }
});
