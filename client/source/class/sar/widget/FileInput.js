/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

/**
 * A file input that allows the user to select a file and stores its content.
 */
qx.Class.define("sar.widget.FileInput", {
  extend: qx.ui.core.Widget,
  construct: function(btnText, extensions, multiple = false) {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.HBox(5).set({
      alignY: "middle"
    }));
    this.set({
      marginTop: 3
    });

    if (extensions) {
      this.setExtensions(extensions);
    }
    if (multiple) {
      this.setMultiple(multiple);
    }
    const input = this.__input = new qx.html.Input("file", {
      display: "none"
    }, {
      accept: this.getExtensions().map(ext => "." + ext).join(","),
      multiple
    });
    this.getContentElement().add(input);

    this.__selectBtn = new qx.ui.form.Button(btnText);
    this._add(this.__selectBtn);

    this.__attachEventHandlers();

    this.hideInputWidget();
  },

  properties: {
    extensions: {
      check: "Array",
      init: []
    },
    multiple: {
      check: "Boolean",
      init: false
    }
  },

  events: {
    "selectionChanged": "qx.event.type.Event"
  },

  members: {
    __input: null,
    __selectBtn: null,

    __attachEventHandlers: function() {
      this.__input.addListener("change", () => {
        const fileNames = [];
        const files = this.__input.getDomElement().files;
        for (let i=0; i<files.length; i++) {
          fileNames.push(files[i].name);
        }
        this.fireEvent("selectionChanged");
      }, this);
      this.__selectBtn.addListener("execute", () => {
        this.__input.getDomElement().click();
      }, this);
    },

    hideInputWidget: function() {
      this.__input.setStyle("display", "none");
      this.__input.setStyle("opacity", 0.01);
    },

    getValue: function() {
      const file = this.__input.getDomElement().files.item(0);
      return file ? file.name : null;
    },

    getFile: function() {
      return this.__input.getDomElement().files.item(0);
    }
  }
});
