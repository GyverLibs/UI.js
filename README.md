# UI.js
Конструктор для создания простого меню настроек

[demo](https://gyverlibs.github.io/UI.js/test/)

![test](/img/test.png)

> **Browser**: https://gyverlibs.github.io/UI.js/UI.min.js

> **Node**: npm i @alexgyver/ui

## Дока
```js
/**
 * @param {object} cfg {x, y, width {number | string px/%}, parent, title, zIndex, theme {'dark' | 'light' | 'dark noback' | 'light noback'}, autoVar}
 * @returns {UI}
 */
constructor(cfg = {});

/**
 * @param {object} cfg {x, y, width {number | string px/%}, parent, title, zIndex, theme {'dark' | 'light' | 'dark noback' | 'light noback'}, autoVar}
 * @returns {UI}
 */
init(cfg);

/**
 * @returns {UI}
 */
setTheme(theme);

/**
 * Destroy UI
 */
destroy();

/**
 * Set labels from object
 * @param {object} labels {id: label} 
 */
setLabels(labels);

/**
 * Export values to object {id: value}
 * @returns {Object}
 */
toObject();

/**
 * Export values to JSON {id: value}
 * @returns {JSON}
 */
toJson();

/**
 * Import values {id: value}
 * @param {Object} data
 */
fromObject(data);

/**
 * Import values {id: value}
 * @param {JSON} data
 */
fromJson(json);

/**
 * Get control object
 * @param {string} id 
 * @returns {ControlInput}
 */
control(id);

/**
 * Get control value
 * @param {string} id 
 */
get(id);

/**
 * Set control value
 * @param {string} id 
 * @param {*} value 
 */
set(id, value);

/**
 * Remove control
 * @param {string | Array} id 'id' | ['id']
 */
remove(ids);

// Remove all widgets
removeAll();

// Change callback (id, value, text) - text for addSelect only
onChange(cb);

// widgets
addSwitch(id, label, value, callback);
addNumber(id, label, value, step, callback);
addText(id, label, value, callback);
addSlider(id, label, value, min, max, step, callback);
addArea(id, label, value, callback);
addHTML(id, label, value);
addElement(id, label, value);
addSelect(id, label, value, callback);
addButton(id, label, callback);
addButtons(buttons);
addFile(id, label, callback);
addColor(id, label, value, callback);
addSpace(height);
```

## Пример
```js
function file_h(file) {
}
// остальные обработчики не указаны, это пример

let ui = new UI({ title: "Test UI", theme: 'dark' })
    .addFile('file', 'File')
    .addText('text', 'Text', '')
    .addNumber('number', 'Number', 128, 1)
    .addSlider('slider', 'Slider', 0, -180, 180, 5)
    .addSelect('select', 'Select', ['Mode 1', 'mode2', 'MODE_3'])
    .addHTML('html', 'HTML', '<h2>Hello</h2>')
    .addSwitch('switch', 'Switch', 0)
    .addColor('color', 'Color')
    .addArea('area', 'Area', 'abc')
    .addButtons({ 'btn1': ['Button 1', null], 'btn2': 'Button 2' })
    .addButton('button', 'Button');
```

Можно обратиться к виджету как `.control(id)` и получить доступ к
```js
get label();    // подпись
set label(v);   // подпись
get value();    // значение
set value(v);   // значение
get input();    // HTMLElement виджета
display(state); // скрыть/отобразить
show();         // отобразить
hide();         // скрыть
remove();       // удалить
default();      // установить значение по умолчанию
```