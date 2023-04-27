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
    __xArea: null,
    __yArea: null,
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

      const {
        xArea,
        yArea
      } = sar.steps.Utils.addMeasurementAreaToForm(form);
      this.__xArea = xArea;
      this.__yArea = yArea;

      const sampleSize = new qx.ui.form.Spinner().set({
        minimum: 50,
        maximum: 50,
        value: 50
      });
      form.add(sampleSize, "Sample size", null, "sampleSize");

      const formRenderer = new qx.ui.form.renderer.Single(form);
      optionsLayout.add(formRenderer);

      const createButton = new sar.widget.FetchButton("Create Test data");
      createButton.addListener("execute", () => {
        createButton.setFetching(true);
        const data = {};
        const includeOnly = [
          "measAreaX",
          "measAreaY",
          "sampleSize",
        ];
        for (const [key, item] of Object.entries(form.getItems())) {
          if (includeOnly.includes(key)) {
            data[key] = item.getValue();
          }
        }
        const params = {
          data
        };
        sar.io.Resources.fetch("testSetGeneration", "generate", params)
          .then(() => this.__testDataGenerated())
          .catch(err => console.error(err))
          .finally(() => createButton.setFetching(false));
      });
      optionsLayout.add(createButton);

      const exportButton = this.__exportButton =new qx.ui.form.Button("Export Test data").set({
        enabled: false
      });
      exportButton.addListener("execute", () => {
        sar.io.Resources.fetch("testSetGeneration", "xport")
          .then(data => this.__testDataExported(data))
          .catch(err => console.error(err));
      });
      optionsLayout.add(exportButton);

      return optionsLayout;
    },

    // overriden
    _applyModel: function(modelMetadata) {
      console.log("set area mimimums from", modelMetadata);
    },

    __createDataView: function() {
      const dataTable = this.__dataTable = sar.steps.Utils.createDataTable();
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

      const dataView = this.__createDataView()
      resultsTabView.add(dataView);

      const distributionView = this.__createDistributionView()
      resultsTabView.add(distributionView);

      return resultsLayout;
    },

    __testDataGenerated: function() {
      this.__exportButton.setEnabled(true);
      this.__fetchResults();
    },

    __fetchResults: function() {
      sar.io.Resources.fetch("testSetGeneration", "getData")
        .then(data => this.__popoluateTable(data))
        .catch(err => console.error(err));

      this.__populateDistributionImage();
    },

    __popoluateTable: function(data) {
      sar.steps.Utils.populateDataTable(this.__dataTable, data);
    },

    __populateDistributionImage: function() {
      const endpoints = sar.io.Resources.getEndPoints("testSetGeneration");
      this.__distributionImage.setSource(endpoints["getDistribution"].url);
    },

    __testDataExported: function(data) {
      sar.steps.Utils.downloadCSV(data, "TestData.csv");
    }
  }
});
