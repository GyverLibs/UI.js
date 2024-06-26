# UI.js
 
> npm i @alexgyver/ui

```js
// x, y, width, parent, title, zIndex, theme 'dark' | 'light'
constructor(cfg = {});
setTheme(theme);
destroy();
setLabels(labels);

get(id);
remove(id);

toObject();
toJson();
fromObject(data);
fromJson(json);

addSwitch(id, label, value, callback);
addNumber(id, label, value, step, callback);
addText(id, label, value, callback);
addRange(id, label, value, min, max, step, callback);
addArea(id, label, value, callback);
addHTML(id, label, value);
addElement(id, label, value);
addSelect(id, label, value, callback);
addButton(id, label, callback);
addButtons(buttons);
addFile(id, label, callback);
```