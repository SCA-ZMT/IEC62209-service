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
    __distributionImage: null,

    // overriden
    _getDescriptionText: function() {
      return "\
        Enter the frequency range, measurement area, and number of samples, then select 'Create Training data'. This will generate the set of test conditions to create the GPI model. These are shown as a list (in the 'Data' tab) and plotted to show the distributions for different dimensions (in the 'Distribution' tab).\
        <br><br>Click 'Export training data' to export the set to a CSV file. Measure each of these test conditions and fill in the sar10g and u10g columns. The uncertainty values should be reported with a 95% confidence level (k = 2 standard deviations).\
      "
    },

    _createOptions: function() {
      const optionsLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));

      const dummyForm = new qx.ui.form.Form();
      sar.steps.Utils.addVPIFASelectBoxToForm(dummyForm);
      sar.steps.Utils.add2PEAKSelectBoxToForm(dummyForm);
      const dummyFormRenderer = new qx.ui.form.renderer.Single(dummyForm);
      optionsLayout.add(dummyFormRenderer);

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

      form.addGroupHeader(""); // just for adding some padding
      const sampleSize = new qx.ui.form.Spinner().set({
        minimum: 40,
        maximum: 1000,
        value: 400
      });
      form.add(sampleSize, "<b>Sample size</b>", null, "sampleSize");

      const formRenderer = new qx.ui.form.renderer.Single(form);
      optionsLayout.add(formRenderer);

      const createButton = new sar.widget.FetchButton("Create Training data");
      sar.steps.Utils.setIdToWidget(createButton, "createTrainingSetBtn");
      createButton.addListener("execute", () => {
        createButton.setFetching(true);
        this.__distributionImage.resetSource();
        const data = {};
        for (const [key, item] of Object.entries(form.getItems())) {
          data[key] = item.getValue()
        }
        const params = {
          data
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
      sar.steps.Utils.setIdToWidget(exportButton, "exportTrainingSetBtn");
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

      const dataView = this._createDataView();
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
      sar.steps.Utils.populateDataTable(this._dataTable, data);
    },

    __populateDistributionImage: function() {
      const endpoints = sar.io.Resources.getEndPoints("trainingSetGeneration");
      this.__distributionImage.setSource(endpoints["getDistribution"].url);
    },

    __trainingDataExported: function(data) {
      sar.steps.Utils.downloadCSV(data, "TrainingData.csv");
    }
  }
});
