/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.widget.InfoPage", {
  extend: qx.ui.core.Widget,

  construct: function() {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.VBox(10));

    this.builLayout();
  },

  statics: {
    introLabel: function() {
      return new qx.ui.basic.Label().set({
        rich: true,
        wrap: true,
        selectable: true
      });
    },

    linkLabel: function(label, url) {
      const introLabel = this.introLabel();
      introLabel.addListener("tap", () => window.open(url, "_blank"));
      return introLabel.set({
        value: "<u>"+label+"</>",
        cursor: "pointer",
        font: "text-16"
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
        case "link-publication":
          control = this.self().linkLabel("- Link to the Publication", "https://github.com/ITISFoundation/publication-IEC62209");
          this._add(control);
          break;
        case "link-documentation":
          control = this.self().linkLabel("- Link to the Documentation", "https://raw.githubusercontent.com/ITISFoundation/IEC62209-service/main/assets/Documentation.pdf");
          this._add(control);
          break;
        case "link-samples":
          control = this.self().linkLabel("- Link to the Samples", "https://raw.githubusercontent.com/ITISFoundation/IEC62209-service/main/assets/Samples.zip");
          this._add(control);
          break;
        case "contact-email": {
          const email = "support@sarvalidation.site";
          control = this.self().introLabel().set({
            value: `Contact email <a href="mailto:${email}" style='color: black' target='_blank'>${email}</a>`,
            font: "text-16",
            selectable: true,
          });
          this._add(control);
          break;
        }
      }
      return control || this.base(arguments, id);
    },

    builLayout: function() {
      this.getChildControl("title");
      this.getChildControl("subtitle");
      this.getChildControl("description");
      this.getChildControl("link-publication");
      this.getChildControl("link-documentation");
      this.getChildControl("link-samples");
      this.getChildControl("contact-email");
    }
  }
});
