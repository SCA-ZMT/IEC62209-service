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

  statics: {
    popUpFM: function(message, title = "Error") {
      const flashMessage = new sar.widget.FlashMessage(message);
      const win = new qx.ui.window.Window(title).set({
        layout: new qx.ui.layout.VBox(0),
        contentPadding: 20,
        resizable: false,
        showClose: true,
        showMaximize: false,
        showMinimize: false,
        modal: true,
        width: 500
      });
      win.getChildControl("captionbar").set({
        backgroundColor: "red"
      });
      win.add(flashMessage), {
        flex: 1
      };
      win.center();
      win.open();
      flashMessage.addListener("closeMessage", () => win.close());
      setTimeout(() => win.close(), 10000);
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
