/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.widget.StepButton", {
  extend: qx.ui.core.Widget,

  construct: function(text, iconSrc) {
    this.base(arguments);

    const width = 120;
    const height = 120;
    this.set({
      width,
      height,
      cursor: "pointer",
      padding: 10
    });
    this.initIsActive();

    const grid = new qx.ui.layout.Grid(5, 5);
    grid.setRowHeight(0, height-60);
    grid.setRowHeight(1, 40);
    this._setLayout(grid);

    if (iconSrc) {
      const offset = iconSrc.includes(".svg") ? 10 : 0;
      const image = new qx.ui.basic.Image().set({
        maxWidth: width-20 - offset,
        maxHeight: height-60 - offset,
        source: iconSrc,
        scale: true,
        alignX: "center",
        alignY: "middle"
      });
      this._add(image, {
        row: 0,
        column: 0
      });
    }
    if (text) {
      const label = new qx.ui.basic.Label().set({
        value: text,
        font: "text-16",
        rich: true,
        width: width - 20,
        alignX: "center",
        alignY: "middle",
        textAlign: "center"
      });
      this._add(label, {
        row: 1,
        column: 0
      });
    }
  },

  properties: {
    isActive: {
      check: "Boolean",
      init: false,
      apply: "__applyIsActive",
      event: "changeIsActive"
    }
  },

  members: {
    __applyIsActive: function(isActive) {
      this.getContentElement().setStyles({
        "border-radius": "4px",
        "border-width": "1px",
        "border-style": "double",
        "border-color": isActive ? "#5768c4" : "#0e0e0e"
      });
    }
  }
});
