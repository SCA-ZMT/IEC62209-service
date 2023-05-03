/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.SearchSpace", {
  extend: sar.steps.StepBase,

  events: {
    "criticalsFound": "qx.event.type.Data"
  },

  members: {
    __modelViewer: null,
    __criticalsValue: null,
    __distributionImage: null,
    __exportButton: null,

    // overriden
    _getDescriptionText: function() {
      return "\
        Explores the space of the valid model to find the most critical regions of the test space, such that:\
        <br>- the test cases are pulled toward the most extreme regions of the data pace,\
        <br>- the test cases exert a repulsive force on each other to ensure even coverage of the critical regions,\
        <br>- the test cases have meaningful coordinates.\
        <br><br>The resulting test conditions, with the computed z-values and associated probabilities to pass the mpe value are saved as a csv file.\
        <br><br>This process can take up to 5 minutes.\
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
      const stepGridLayout = new qx.ui.container.Composite(stepGrid).set({
        allowGrowX: false
      });
      optionsLayout.add(stepGridLayout);

      const searchButton = new sar.widget.FetchButton("Search");
      searchButton.addListener("execute", () => {
        searchButton.setFetching(true);
        this.__criticalsValue.resetValue();
        this.__distributionImage.resetSource();
        sar.io.Resources.fetch("searchSpace", "search")
          .then(data => this.__spaceSearched(data))
          .catch(err => console.error(err))
          .finally(() => searchButton.setFetching(false));
        
      });
      stepGridLayout.add(searchButton, {
        row: 0,
        column: 0
      });

      const resultsGrid = new qx.ui.layout.Grid(10, 10);
      const resultsLayout = new qx.ui.container.Composite(resultsGrid).set({
        allowGrowX: false
      });
      // titles
      const criticalsTitle = new qx.ui.basic.Label().set({
        value: "Critical test conditions found:",
        alignX: "right",
        alignY: "middle",
        textAlign: "right",
      });
      resultsLayout.add(criticalsTitle, {
        row: 0,
        column: 0
      });
      // values
      const criticalsValue = this.__criticalsValue = new qx.ui.basic.Label();
      resultsLayout.add(criticalsValue, {
        row: 0,
        column: 1
      });
      stepGridLayout.add(resultsLayout, {
        row: 0,
        column: 1
      });

      const exportButton = this.__exportButton = new sar.widget.FetchButton("Export Critical tests").set({
        enabled: false
      });
      exportButton.addListener("execute", () => {
        exportButton.setFetching(true);
        sar.io.Resources.fetch("searchSpace", "xport")
          .then(data => this.__searchSpaceExported(data))
          .catch(err => console.error(err))
          .finally(() => exportButton.setFetching(false));
        
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

      const dataView = this._createDataView()
      resultsTabView.add(dataView);

      const distributionView = this.__createDistributionView()
      resultsTabView.add(distributionView);

      return resultsLayout;
    },

    // overriden
    _applyModel: function(modelMetadata) {
      if (this.__modelViewer) {
        this._optionsLayout.remove(this.__modelViewer);
      }
      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(modelMetadata, true, false);
      this._optionsLayout.addAt(modelViewer, 0);
    },

    __spaceSearched: function(data) {
      this.__exportButton.setEnabled(true);
      if (data && "rows" in data) {
        const nCriticals = data["rows"].length;
        this.__criticalsValue.setValue(nCriticals.toString());
        this.fireDataEvent("criticalsFound", nCriticals);
      } else {
        this.__criticalsValue.resetValue();
      }

      this.__fetchResults(data);
    },

    __fetchResults: function(data) {
      if (data) {
        this.__popoluateTable(data);
      }

      this.__populateDistributionImage();
    },

    __popoluateTable: function(data) {
      sar.steps.Utils.populateDataTable(this._dataTable, data);
    },

    __populateDistributionImage: function() {
      const endpoints = sar.io.Resources.getEndPoints("searchSpace");
      this.__distributionImage.setSource(endpoints["getDistribution"].url);
    },

    __searchSpaceExported: function(data) {
      sar.steps.Utils.downloadCSV(data, "SearchSpace.csv");
    }
  }
});
