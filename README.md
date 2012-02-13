localStorage memory for textareas
=================================

By Pablo Villalba for [Teambox](http://teambox.com) collaboration software.

Usage
-----

Saves textareas to localStorage when the data-save-id attribute is defined
as a unique string identifier for that textarea.

    <textarea data-save-id="task-123"></textarea>

- Typing on a textarea will save its value locally every 200 ms.
- Clicking on an empty textarea will load the saved value if there is one.
- Calling $(selector).loadSavedTextareas() will restore textareas saved.

READ THE CODE to understand how it works, it's not so long :)

Notes
-----

- Depends on underscore.js, jQuery 1.7.
- You will need to manually clear localStorage if you need it.

Licence
-------

MIT Licence, do whatever you want with it :)