/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Class.define("sar.widget.FlashMessage", {
  extend: qx.ui.core.Widget,

  /**
   * Constructor for the FlashMessage.
   *
   * @param {String} message Message that the user will read.
   */
  construct: function(message) {
    this.base(arguments);
    this._setLayout(new qx.ui.layout.HBox(15));

    this.set({
      padding: 18,
      maxWidth: 400,
      allowStretchX: false,
      alignX: "center"
    });

    if (message) {
      this.setMessage(message);
    }
  },

  properties: {
    message: {
      check: "String",
      nullable: true,
      apply: "__applyMessage"
    }
  },

  members: {
    __closeCb: null,
    _createChildControlImpl: function(id) {
      let control;
      switch (id) {
        case "message":
          control = new qx.ui.basic.Label().set({
            font: "text-16",
            rich: true
          });
          this._add(control, {
            flex: 1
          });
          break;
      }
      return control || this.base(arguments, id);
    },

    __applyMessage: function(value) {
      const label = this.getChildControl("message");
      if (label) {
        label.setValue(value);
      }
    }
  }
});
