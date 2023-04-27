/* ************************************************************************

   Copyright: 2023 undefined

   License: MIT license

   Authors: @odeimaiz

************************************************************************ */

/**
 * This is the main application class of "sar"
 *
 * @asset(sar/*)
 * @asset(common/common.css)
 */

qx.Class.define("sar.Application", {
  extend : qx.application.Standalone,

  members: {
    __mainLayout: null,

    main() {
      // Call super class
      super.main();

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug")) {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      this.__loadOwnCss();

      const mainLayout = this.__mainLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox());

      const scroll = new qx.ui.container.Scroll();
      scroll.add(mainLayout);

      const mainView = new sar.widget.MainView();
      this.__mainLayout.add(mainView);

      const doc = this.getRoot();
      const padding = 30;
      doc.add(scroll, {
        left: padding,
        top: padding,
        right: padding,
        bottom: padding
      });
    },

    __loadOwnCss: function() {
      qx.bom.Stylesheet.includeFile(qx.util.ResourceManager.getInstance().toUri(
        "common/common.css"
      ));
    },

    __startingPointSelected: function(optionNumber) {
      this.__mainLayout.removeAll();

      const mainView = new sar.widget.MainView(optionNumber);
      this.__mainLayout.add(mainView);
    }
  }
});
