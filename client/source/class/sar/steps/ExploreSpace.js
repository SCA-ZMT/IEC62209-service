/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.steps.ExploreSpace", {
  extend: sar.steps.StepBase,

  members: {
    __modelViewer: null,
    __exportButton: null,
    __distributionImage: null,

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

      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(null, true);
      optionsLayout.add(modelViewer);

      const searchButton = new sar.widget.FetchButton("Search");
      searchButton.addListener("execute", () => {
        searchButton.setFetching(true);
        sar.io.Resources.fetch("searchSpace", "search")
          .then(data => this.__spaceSearched(data))
          .catch(err => console.error(err))
          .finally(() => searchButton.setFetching(false));
        
      });
      optionsLayout.add(searchButton);

      const exportButton = this.__exportButton = new sar.widget.FetchButton("Export Critical tests").set({
        enabled: false
      });
      exportButton.addListener("execute", () => {
        exportButton.setFetching(true);
        sar.io.Resources.fetch("searchSpace", "xport")
          .then(() => this.__searchSpaceExported())
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
      const modelViewer = this.__modelViewer = sar.steps.Utils.modelViewer(modelMetadata, true);
      this._optionsLayout.addAt(modelViewer, 0);
    },

    __spaceSearched: function(data) {
      this.__exportButton.setEnabled(true);
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
