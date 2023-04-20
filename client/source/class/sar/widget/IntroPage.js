/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.widget.IntroPage", {
  extend: qx.ui.core.Widget,

  construct: function() {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.VBox(10));

    this.builLayout();
  },

  events: {
    "optionSelected": "qx.event.type.Data"
  },

  statics: {
    introLabel: function() {
      return new qx.ui.basic.Label().set({
        rich: true,
        wrap: true,
        selectable: true
      });
    }
  },

  members: {
    _createChildControlImpl: function(id) {
      let control;
      switch (id) {
        case "intro-title":
          control = this.self().introLabel().set({
            value: "Welcome to the IEC 62209-3 Validation Procedure",
            font: "text-30"
          });
          this._add(control);
          break;
        case "intro-subtitle":
          control = this.self().introLabel().set({
            value: "A Gaussian-process-model-based approach for robust, independent, and implementation-agnostic validation of complex multi-variable measurement systems: application to SAR measurement systems",
            font: "text-24"
          });
          this._add(control);
          break;
        case "intro-description":
          control = this.self().introLabel().set({
            value: "Resource-efficient and robust validation of complex measurement systems that would require millions of test permutations for comprehensive coverage is an unsolved problem. In the paper, a general, robust, trustworthy, efficient, and comprehensive validation approach based on a Gaussian Process model (GP) of the test system has been developed that can operate system-agnostically, prevents calibration to a fixed set of known validation benchmarks, and supports large configuration spaces. The approach includes three steps that can be performed independently by different parties: 1) GP model creation, 2) model confirmation, and 3) model-based critical search for failures. The new approach has been applied to two systems utilizing different measurement methods for compliance testing of radiofrequency-emitting devices according to two independent standards, i.e., IEC 62209-1528 for scanning systems and IEC 62209-3 for array systems. The results demonstrate that the proposed measurement system validation is practical and feasible. It reduces the effort to a minimum such that it can be routinely performed by any test lab or other user and constitutes a pragmatic approach for establishing validity and effective equivalence of the two measurement device classes.",
            font: "text-16"
          });
          this._add(control);
          break;
        case "options-helper":
          control = this.self().introLabel().set({
            value: "Where do you want to start from?",
            font: "text-18"
          });
          this._add(control);
          break;
        case "options-layout":
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
          this._add(control);
          break;
        case "option-0": {
          const layout = this.getChildControl("options-layout");
          control = new sar.widget.LargeCard("Create my own Model");
          control.addListener("execute", () => this.fireDataEvent("optionSelected", 0));
          layout.add(control);
          break;
        }
        case "option-1": {
          const layout = this.getChildControl("options-layout");
          control = new sar.widget.LargeCard("Import Model");
          control.addListener("execute", () => this.fireDataEvent("optionSelected", 1));
          layout.add(control);
          break;
        }
      }
      return control || this.base(arguments, id);
    },

    builLayout: function() {
      this.getChildControl("intro-title");
      this.getChildControl("intro-subtitle");
      this.getChildControl("intro-description");
      /*
      this.getChildControl("options-helper");
      this.getChildControl("option-0");
      this.getChildControl("option-1");
      */
    }
  }
});
