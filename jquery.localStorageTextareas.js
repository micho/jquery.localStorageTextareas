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

  // Run only if localStorage is supported
  if (typeof Modernizr === 'undefined' || !Modernizr.localstorage) {
    return;
  }

  var saveTextarea, dirty = {};

  function id(el) {
    return "textareas-autosave/" + $(el).attr('data-save-id');
  }

  // Save text to its unique identifier at most every 200ms
  saveTextarea = _.debounce(function (event) {
    localStorage[id(this)] = $(this).val();
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
    if (localStorage[_id] && !$(this).attr("data-restored")) {
      should_restore = $(this).val().length === 0 || ($(this).val() !== localStorage[_id] && confirm(msg));
      if (should_restore) {
        $(this).val(localStorage[_id]);
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
        if ($(this).val().length === 0) {
          $(this).val(localStorage[id(this)]);
          $(this).attr("data-restored", true);
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

    if (localStorage[_id]) {
      localStorage.removeItem(_id);
    }

    return this;
  };

  // Iterate over all textareas to see if they should be cleared
  // from the DOM
  function resetEmptyTextareas(event) {
    $("textarea[data-save-id]").each(function (i, t) {
      var _id = id(t)
        , is_saved = localStorage[_id]
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