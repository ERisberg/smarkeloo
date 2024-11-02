// https://raw.githack.com/
// https://stackoverflow.com/questions/33056230/uncaught-typeerror-ready-is-not-a-function

export class DOM {
  public static createButton(
    label: string,
    onClick: () => void,
    id: string = ""
  ) {
    return (function ($) {
      const btn = $("<button/>", {
        text: label,
        click: onClick,
      });

      $(btn).attr("id", id);
      $("#erlib_menu").append(btn);

      return btn;
    })(jQuery);
  }

  public static createMenu() {
    (function ($) {
      $("head").append(
        $('<link rel="stylesheet" type="text/css" />').attr(
          "href",
          "https://raw.githack.com/ERisberg/smarkeloo/main/src/css/main.css"
        )
      );

      const menu = $("<div></div>");
      $(menu).attr("id", "erlib_menu").addClass("erlib_menu");

      const toggleBtn = DOM.createButton(
        "Toggle",
        () => DOM.toggleMenu(),
        "erlib_toggleBtn"
      );
      $(menu).append(toggleBtn);

      $("body").append(menu);
    })(jQuery);
  }

  public static toggleMenu() {}
}
