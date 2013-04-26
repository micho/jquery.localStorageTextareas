/*global Modernizr*/
// Saves textareas to localStorage when the data-save-id attribute is defined
// as a unique string identifier for that textarea.
//
// <textarea data-save-id="task-123"></textarea>
//
// Typing on a textarea will save its value locally every 200 ms.
// Clicking on an empty textarea will load the saved value if there is one.
// Calling $(selector).loadSavedTextareas() will restore textareas saved.
//
// READ THE CODE to understand how it works, it's not so long :)
//
// Notes:
//
// - Depends on Modernizr.js, underscore.js, jQuery 1.7.
// - You will need to manually clear localStorage if you need it.
//
// By Pablo Villalba, for Teambox 4 (http://teambox.com)


(function () {

  // Don't load if localStorage isn't supported
  function localStorageSupported() {
    try {
      return !!localStorage.getItem;
    } catch (e) {
      return false;
    }
  }

  if (!localStorageSupported()) {
    return;
  }

  var saveTextarea, dirty = {};

  function id(el) {
    return "textareas-autosave/" + $(el).attr('data-save-id');
  }

  // setItem wrapper to fix some localStorage issues in *le* iPad
  // More info: http://stackoverflow.com/questions/2603682/
  function setkey(key, val) {
    localStorage.removeItem(key);
    localStorage.setItem(key, val);
  }

  // Save text to its unique identifier at most every 200ms
  saveTextarea = _.debounce(function (event) {
    setkey(id(this), $(this).val());
    $(this).attr("data-restored", true);
    dirty[id(this)] = true;
  }, 200);

  // Load text for the textarea if clicked and it's empty
  function loadTextarea(event) {
    var _id = id(this)
      , msg = "There is a saved version for this content. Would you like to restore the saved version?"
      , should_restore;
    // Only attempt to restore if there's saved content
    // and we haven't restored it yet.
    if (localStorage.getItem(_id) && !$(this).attr("data-restored")) {
      should_restore =
        // Empty..
        $(this).val().length === 0 ||
        // ..or different that what we have saved (request confirmation)
        ($(this).val() !== localStorage.getItem(_id) && confirm(msg));
      if (should_restore) {
        $(this).val(localStorage.getItem(_id));
        $(this).attr("data-restored", true);
        dirty[id(this)] = true;
      }
    }
  }

  /**
   * Load all textareas on demand
   *
   *   Usage: $(".container").loadSavedTextareas();
   *
   * @return {jQuery}
   */
  $.fn.loadSavedTextareas = function () {
    var _id = id;
    return this.each(function () {
      var id = _id;
      $(this).find("textarea[data-save-id]").each(function () {
        var $this = $(this);
        if ($this.val().length === 0) {
          $this.val(localStorage.getItem(id(this)));
          $this.attr("data-restored", true);
          dirty[id(this)] = true;
        }
      });
    });
  };

  /**
   * Remove a given textarea
   *
   *   Usage: $("textarea").clearSavedTextarea();
   *
   * @return {jQuery}
   */
  $.fn.clearSavedTextarea = function () {
    var _id = id(this);

    if (localStorage.getItem(_id)) {
      localStorage.removeItem(_id);
    }

    return this;
  };

  // Iterate over all textareas to see if they should be cleared
  // from the DOM
  function resetEmptyTextareas(event) {
    $("textarea[data-save-id]").each(function (i, t) {
      var _id = id(t)
        , is_saved = localStorage.getItem(_id)
        , is_empty = t.value ? t.value.length === 0 : true
        , is_dirty = dirty[_id];

      if (is_saved && is_empty && is_dirty) {
        localStorage.removeItem(_id);
      }
    });
  }

  // Bind events
  $(document).on("keyup", "textarea[data-save-id]", saveTextarea);
  $(document).on("click", "textarea[data-save-id]", loadTextarea);
  $(document).ajaxSuccess(resetEmptyTextareas);

}());
