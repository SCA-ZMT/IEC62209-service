/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.widget.MainView", {
  extend: qx.ui.core.Widget,

  construct: function() {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.VBox(20));

    this.__steps = [];
    this.__builLayout();
    this.__attachHandlers();
    this.__initStates();
  },

  members: {
    __steps: null,
    __trainingSetGeneration: null,
    __loadTrainingData: null,
    __analysisCreation: null,
    __loadModel: null,
    __testSetGeneration: null,
    __loadTestData: null,
    __confirmModel: null,
    __exploreSpace: null,
    __loadCriticalData: null,
    __verify: null,

    __builLayout: function() {
      const introLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      const introTitle = new qx.ui.basic.Label().set({
        value: "SAR System Validation Procedure",
        font: "text-30",
        minWidth: 450,
      });
      introLayout.add(introTitle)
      const infoButton = new qx.ui.basic.Image().set({
        source: "sar/icons/info.png",
        cursor: "pointer",
        alignY: "middle",
        scale: true,
        width: 30,
        height: 30,
      });
      infoButton.addListener("tap", () => {
        const win = new qx.ui.window.Window("Info").set({
          layout: new qx.ui.layout.VBox(0),
          contentPadding: 20,
          resizable: false,
          showClose: true,
          showMaximize: false,
          showMinimize: false,
          modal: true,
          width: 750
        });
        const introPage = new sar.widget.IntroPage();
        win.add(introPage), {
          flex: 1
        };
        win.center();
        win.open();
      });
      introLayout.add(infoButton)
      this._add(introLayout);

      const stepsGrid = new qx.ui.layout.Grid(15, 10);
      const nSteps = 10;
      for (let i=0; i<nSteps; i++) {
        stepsGrid.setColumnAlign(i, "center", "middle");
      }
      const stepsLayout = new qx.ui.container.Composite(stepsGrid).set({
        allowGrowX: false
      });

      let col = 0;
      [{
        label: "Model Creation",
        colSpan: 3
      }, {
        label: "",
        colSpan: 1
      }, {
        label: "Model Confirmation",
        colSpan: 3
      }, {
        label: "Critical Data Space Search",
        colSpan: 3
      }].forEach(sectionInfo => {
        const sectionLabel = new qx.ui.basic.Label().set({
          value: sectionInfo.label,
          font: "text-18",
          textAlign: "center",
          minWidth: sectionInfo.colSpan>1 ? 220 : null,
        });
        stepsLayout.add(sectionLabel, {
          row: 0,
          column: col,
          colSpan: sectionInfo.colSpan
        });
        col += sectionInfo.colSpan
      });

      this.__trainingSetGeneration = new sar.steps.TrainingSetGeneration();
      this.__loadTrainingData = new sar.steps.LoadTrainingData();
      this.__analysisCreation = new sar.steps.AnalysisCreation();
      this.__loadModel = new sar.steps.LoadModel();
      this.__testSetGeneration = new sar.steps.TestSetGeneration();
      this.__loadTestData = new sar.steps.LoadTestData();
      this.__confirmModel = new sar.steps.ConfirmModel();
      this.__exploreSpace = new sar.steps.ExploreSpace();
      this.__loadCriticalData = new sar.steps.LoadCriticalData();
      this.__verify = new sar.steps.Verify();

      const stepButtons = [];
      const stepsStack = new qx.ui.container.Stack();
      [{
        icon: "sar/icons/step0_icon.png",
        label: "Training Set Generation",
        step: this.__trainingSetGeneration,
      }, {
        icon: "sar/icons/step_import_icon.svg",
        label: "Load Training Data",
        step: this.__loadTrainingData
      }, {
        icon: "sar/icons/step1_icon.png",
        label: "Analysis & Creation",
        step: this.__analysisCreation,
      }, {
        icon: "sar/icons/step_import_icon.svg",
        label: "Load Model",
        step: this.__loadModel
      }, {
        icon: "sar/icons/step2_icon.png",
        label: "Test Set Generation",
        step: this.__testSetGeneration,
      }, {
        icon: "sar/icons/step_import_icon.svg",
        label: "Load Test Data",
        step: this.__loadTestData
      }, {
        icon: "sar/icons/step3_icon.png",
        label: "Confirm Model",
        step: this.__confirmModel,
      }, {
        icon: "sar/icons/step4_icon.png",
        label: "Search Space",
        step: this.__exploreSpace,
      }, {
        icon: "sar/icons/step_import_icon.svg",
        label: "Load Critical Data",
        step: this.__loadCriticalData
      }, {
        icon: "sar/icons/step5_icon.png",
        label: "Verify",
        step: this.__verify,
      }].forEach((section, idx) => {
        const stepButton = new sar.widget.StepButton(section.label, section.icon);
        if (section.label.includes("Load")) {
          stepButton.getContentElement().setStyles({
            "border-radius": "32px",
            "border-width": "1px",
            "border-style": "double"
          });
        }
        section.step.stepButton = stepButton;
        stepButtons.push(stepButton);
        stepButton.addListener("tap", () => {
          // show step
          stepsStack.setSelection([section.step]);
          // mark step as active and the rest inactive
          stepButtons.forEach((stepButton, buttonIdx) => {
            stepButton.setIsActive(buttonIdx === idx);
          });
        });
        this.__steps.push(section.step);
        stepsStack.add(section.step);
        stepsLayout.add(stepButton, {
          row: 1,
          column: idx
        });
      });
      this._add(stepsLayout);
      this._add(stepsStack);

      // start with the first step by default
      stepButtons[0].setIsActive(true);
    },

    __attachHandlers: function() {
      const trainingDataStep = this.__loadTrainingData;
      if (trainingDataStep) {
        trainingDataStep.addListener("trainingDataSet", e => {
          const trainingData = e.getData();
          this.__trainingDataSet(trainingData);
        });
      }

      const loadModelStep = this.__loadModel;
      if (loadModelStep) {
        loadModelStep.addListener("modelSet", e => {
          const model = e.getData();
          this.__modelSet(model);
        });
      }

      const loadTestData = this.__loadTestData;
      if (loadTestData) {
        loadTestData.addListener("testDataSet", e => {
          const testData = e.getData();
          this.__testDataSet(testData);
        });
      }

      const loadCriticalData = this.__loadCriticalData;
      if (loadCriticalData) {
        loadCriticalData.addListener("criticalDataSet", e => {
          const criticalData = e.getData();
          this.__criticalDataSet(criticalData);
        });
      }
    },

    __initStates: function() {
      this.__loadTrainingData.setStepData(null);
      this.__loadModel.setStepData(null);
      this.__loadTestData.setStepData(null);
      this.__loadCriticalData.setStepData(null);
    },

    __trainingDataSet: function(trainingData) {
      this.__analysisCreation.stepButton.setEnabled(Boolean(trainingData));
    },

    __modelSet: function(model) {
      [
        this.__testSetGeneration,
        this.__confirmModel,
        this.__exploreSpace,
        this.__verify,
      ].forEach(step => {
        step.setModel(model);
      });

      [
        this.__testSetGeneration,
        this.__loadTestData,
        this.__exploreSpace,
        this.__loadCriticalData,
      ].forEach(step => {
        step.stepButton.setEnabled(Boolean(model));
      });
    },

    __testDataSet: function(testData) {
      this.__confirmModel.stepButton.setEnabled(Boolean(testData));
    },

    __criticalDataSet: function(criticalData) {
      this.__verify.stepButton.setEnabled(Boolean(criticalData));
    }
  }
});
