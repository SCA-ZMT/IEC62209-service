/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.widget.LargeCard", {
  extend: qx.ui.form.Button,

  construct: function(text) {
    this.base(arguments);

    this.set({
      width: 200,
      height: 200
    });

    if (text) {
      this.setLabel(text);
    }
  }
});
