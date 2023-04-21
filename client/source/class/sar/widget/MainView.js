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
    this.__initModel();
  },

  members: {
    __steps: null,

    __builLayout: function() {
      const introLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      const introTitle = new qx.ui.basic.Label().set({
        value: "IEC 62209-3 Validation Procedure",
        font: "text-30"
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

      const stepsGrid = new qx.ui.layout.Grid(20, 10);
      stepsGrid.setColumnAlign(0, "center", "middle");
      stepsGrid.setColumnAlign(1, "center", "middle");
      stepsGrid.setColumnAlign(2, "center", "middle");
      stepsGrid.setColumnAlign(3, "center", "middle");
      stepsGrid.setColumnAlign(4, "center", "middle");
      stepsGrid.setColumnAlign(5, "center", "middle");
      const stepsLayout = new qx.ui.container.Composite(stepsGrid).set({
        allowGrowX: false
      });

      let col = 0;
      [{
        label: "Model Creation",
        colSpan: 2
      }, {
        label: "",
        colSpan: 1
      }, {
        label: "Model Confirmation",
        colSpan: 2
      }, {
        label: "Critical Data Space Search",
        colSpan: 2
      }].forEach(sectionInfo => {
        const sectionLabel = new qx.ui.basic.Label().set({
          value: sectionInfo.label,
          font: "text-18"
        });
        stepsLayout.add(sectionLabel, {
          row: 0,
          column: col,
          colSpan: sectionInfo.colSpan
        });
        col += sectionInfo.colSpan
      });

      const stepButtons = [];
      const steps = [];
      const stepsStack = new qx.ui.container.Stack();
      [{
        icon: "sar/icons/step0_icon.png",
        label: "Training Set Generation",
        step: new sar.steps.TrainingSetGeneration(),
      }, {
        icon: "sar/icons/step1_icon.png",
        label: "Analysis & Creation",
        step: new sar.steps.AnalysisCreation(),
      }, {
        icon: "sar/icons/step_import_icon.svg",
        label: "Load Model",
        step: new sar.steps.LoadModel(),
      }, {
        icon: "sar/icons/step2_icon.png",
        label: "Test Set Generation",
        step: new sar.steps.TestSetGeneration(),
      }, {
        icon: "sar/icons/step3_icon.png",
        label: "Confirm Model",
        step: new sar.steps.ConfirmModel(),
      }, {
        icon: "sar/icons/step4_icon.png",
        label: "Explore Space",
        step: new sar.steps.ExploreSpace(),
      }, {
        icon: "sar/icons/step5_icon.png",
        label: "Verify",
        step: new sar.steps.Verify(),
      }].forEach((section, idx) => {
        const stepButton = new sar.widget.StepButton(section.label, section.icon);
        section.step.stepButton = stepButton;
        stepButtons.push(stepButton);
        stepButton.addListener("tap", () => {
          // show step
          stepsStack.setSelection([section.step]);
          // mark step as active and the rest inactive
          stepButtons.forEach((stepButton, buttonIdx) => {
            stepButton.setIsActive(buttonIdx === idx);
          })
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

    __getLoadModelStep: function() {
      return this.__steps.find(step => step instanceof sar.steps.LoadModel);
    },

    __attachHandlers: function() {
      const loadModelStep = this.__getLoadModelStep();
      if (loadModelStep) {
        loadModelStep.addListener("modelSet", e => {
          const model = e.getData();
          this.__steps.forEach(step => {
            if (
              step instanceof sar.steps.TestSetGeneration ||
              step instanceof sar.steps.ConfirmModel ||
              step instanceof sar.steps.ExploreSpace ||
              step instanceof sar.steps.Verify
            ) {
              step.setModel(model);
              step.stepButton.setEnabled(Boolean(model));
            }
          });
        });
      }
    },

    __initModel: function() {
      const loadModelStep = this.__getLoadModelStep();
      if (loadModelStep) {
        loadModelStep.setModel(null);
      }
    }
  }
});
