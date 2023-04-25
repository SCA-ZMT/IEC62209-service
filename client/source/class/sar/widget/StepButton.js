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
    const padding = 10;
    this.set({
      width,
      height,
      padding,
      cursor: "pointer",
    });

    this.getContentElement().setStyles({
      "border-radius": "4px",
      "border-width": "1px",
      "border-style": "double"
    });

    this.initIsActive();

    const grid = new qx.ui.layout.Grid(5, 5);
    grid.setRowHeight(0, height-60);
    grid.setRowHeight(1, 40); // two lines of text
    this._setLayout(grid);

    if (iconSrc) {
      const offset = iconSrc.includes(".svg") ? 5 : 0;
      const image = new qx.ui.basic.Image().set({
        maxWidth: width-2*padding - offset,
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
        width: width - 2*padding,
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
      this.setBackgroundColor(isActive ? "#cabbf9" : "#FFFFFF");
    }
  }
});
