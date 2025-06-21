# UI.js
Конструктор для создания простого меню настроек

> npm i @alexgyver/ui

[demo](https://gyverlibs.github.io/UI.js/test/)

Основано на библиотеке [quicksettings](https://github.com/bit101/quicksettings). Переписано с нуля на движке [Component](https://github.com/bit101/quicksettings), изменена логика работы, сохранён оригинальный внешний вид, переработаны стили, сделаны тёмная и светлая темы с удобным переключением.

Примеры проектов с UI:
- [Bitmaper](https://alexgyver.github.io/Bitmaper/)

## Дока
```js
/**
 * @param {object} cfg {x, y, width {number | string px/%}, parent, title, zIndex, theme {'dark' | 'light'}, autoVar}
 * @returns {UI}
 */
constructor(cfg = {});

/**
 * @param {object} cfg {x, y, width {number | string px/%}, parent, title, zIndex, theme {'dark' | 'light'}, autoVar}
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
 * Import values {id: value} or widgets [ ['addSwitch', id...] ]
 * @param {Object | Array} data
 */
fromObject(data);

/**
 * Import values {id: value} or widgets [ ['addSwitch', id...] ]
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
 * @param {string | Array} id 
 */
remove(ids);

// Change callback (id, value, text) - text for addSelect only
onChange(cb);

// widgets
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
addColor(id, label, value, callback);
addSpace();
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
    .addRange('range', 'Range', 0, -180, 180, 5)
    .addSelect('select', 'Select', ['Mode 1', 'mode2', 'MODE_3'])
    .addHTML('html', 'HTML', '<h2>Hello</h2>')
    .addSwitch('switch', 'Switch', 0)
    .addColor('color', 'Color')
    .addArea('area', 'Area', 'abc')
    .addButtons({ 'btn1': ['Button 1', null], 'btn2': 'Button 2' })
    .addButton('button', 'Button');
```

Результат

![test](/img/test.png)

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