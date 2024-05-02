(function () {
  htmx.defineExtension("create-token", {
    transformResponse: function (text, xhr, elt) {
      resJson = JSON.parse(text);
      localStorage.setItem("access_token", resJson["access_token"]);
      return text;
    },
  });

  htmx.defineExtension("check-auth", {
    onEvent: function (name, evt) {
      if (name === "htmx:configRequest") {
        evt.detail.headers["Authorization"] = `Bearer ${localStorage.getItem("access_token")}`;
        return true;
      }
    },
  });
})();
