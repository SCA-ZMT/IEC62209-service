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
        case "title":
          control = this.self().introLabel().set({
            value: "SAR System Validation Procedure (IEC 62209-3)",
            font: "text-30"
          });
          this._add(control);
          break;
        case "subtitle":
          control = this.self().introLabel().set({
            value: "A Gaussian-process-model-based approach for robust, independent, and implementation-agnostic validation of complex multi-variable measurement systems: application to SAR measurement systems",
            font: "text-24"
          });
          this._add(control);
          break;
        case "description":
          control = this.self().introLabel().set({
            value: "Resource-efficient and robust validation of complex measurement systems that would require millions of test permutations for comprehensive coverage is an unsolved problem. In the paper, a general, robust, trustworthy, efficient, and comprehensive validation approach based on a Gaussian Process model (GP) of the test system has been developed that can operate system-agnostically, prevents calibration to a fixed set of known validation benchmarks, and supports large configuration spaces. The approach includes three steps that can be performed independently by different parties:<br>1) GP model creation,<br>2) model confirmation, and<br>3) model-based critical search for failures.<br><br>The new approach has been applied to two systems utilizing different measurement methods for compliance testing of radiofrequency-emitting devices according to two independent standards, i.e., IEC 62209-1528 for scanning systems and IEC 62209-3 for array systems. The results demonstrate that the proposed measurement system validation is practical and feasible. It reduces the effort to a minimum such that it can be routinely performed by any test lab or other user and constitutes a pragmatic approach for establishing validity and effective equivalence of the two measurement device classes.",
            font: "text-16"
          });
          this._add(control);
          break;
        case "link-documentation":
          control = this.self().introLabel().set({
            value: "- Link to Documentation",
            font: "text-16"
          });
          this._add(control);
          break;
        case "link-samples":
          control = this.self().introLabel().set({
            value: "- Link to Samples",
            font: "text-16"
          });
          this._add(control);
          break;
      }
      return control || this.base(arguments, id);
    },

    builLayout: function() {
      this.getChildControl("title");
      this.getChildControl("subtitle");
      this.getChildControl("description");
      this.getChildControl("link-documentation");
      this.getChildControl("link-samples");
    }
  }
});
