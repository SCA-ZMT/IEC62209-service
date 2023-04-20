/* ************************************************************************

   Copyright: 2023 undefined

   License: MIT license

   Authors: @odeimaiz

************************************************************************ */

/**
 * This is the main application class of "sar"
 *
 * @asset(sar/*)
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

      const mainLayout = this.__mainLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox());

      const scroll = new qx.ui.container.Scroll();
      scroll.add(mainLayout);

      // this.__addIntroPage();
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

    __addIntroPage: function() {
      this.__mainLayout.removeAll();

      const introPage = new sar.widget.IntroPage();
      this.__mainLayout.add(introPage);

      introPage.addListener("optionSelected", e => {
        const selection = e.getData();
        this.__startingPointSelected(selection);
      });
    },

    __startingPointSelected: function(optionNumber) {
      this.__mainLayout.removeAll();

      const mainView = new sar.widget.MainView(optionNumber);
      this.__mainLayout.add(mainView);
    }
  }
});
