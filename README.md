# UI.js
Конструктор для создания простого меню настроек

[demo](https://gyverlibs.github.io/UI.js/test/)

![test](/img/test.png)

> **Browser**: https://gyverlibs.github.io/UI.js/UI.min.js

> **Node**: npm i @alexgyver/ui

## Дока
```js
/**
 * 'dark' | 'light' | 'dark noback' | 'light noback'
 * @returns {UI}
 */
setTheme(theme);

/**
 * Set position in widget list to append new. Call before .addXxxx. Set to null to add in end
 * @param {*} index 
 * @returns {UI}
 */
setCursor(index);

/**
 * Reset position in widget list to append new
 * @param {*} index 
 * @returns {UI}
 */
resetCursor();

/**
 * Use mouse wheel on Number, Slider and Select
 * @param {Boolean} use 
 */
useWheel(use);

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
toObject(ids = null);

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

// amount of widgets
count();

/**
 * Get widget object
 * @param {string|Number} idOrIndex 
 * @returns {ControlInput}
 */
widget(idOrIndex);

/**
 * Get widget value
 * @param {string|Number} idOrIndex 
 */
get(idOrIndex);

/**
 * Set widget value
 * @param {string|Number} idOrIndex 
 * @param {*} value 
 */
set(idOrIndex, value);

/**
 * Remove widget
 * @param {string|number|Array<string|number>} ids id | index | [id/index]
 */
remove(ids);

// Remove all widgets
removeAll();

// Change callback (id, value, text) - text for addSelect only
onChange(cb);

// Widgets
addSwitch(id, label, value, callback);
addNumber(id, label, value, step, callback);
addText(id, label, value, callback);
addSlider(id, label, value, min, max, step, callback);
addArea(id, label, value, callback, rows = 5);
addHTML(id, label, value);
addElement(id, label, value);
addSelect(id, label, value, callback);
addFile(id, label, callback);
addColor(id, label, value, callback);
addLabel(id, label, value);
addSpace(height = 5);
addButton(id, label, callback);
addButtons(buttons);    // {id: [label, callback]} | {id: label}
```

- При передаче id пустой строкой будет сгенерирован авто-id
- В объекте UI автоматически создаются сеттеры/геттеры на id виджетов
- Для Select добавляется геттер `<name>Text` для чтения значения как текста
- Для Color добавляется сеттер и геттер `<name>Int` для значения как числа

Можно обратиться к виджету как `ui.widget(id)` и получить доступ к:

```js
// для всех
get type();     // тип
get label();    // подпись
set label(v);   // подпись
get value();    // значение
set value(v);   // значение
get input();    // HTMLElement виджета
get container();// контейнер виджета
call();         // вызвать обработчик
display(state); // скрыть/отобразить
show();         // отобразить
hide();         // скрыть
remove();       // удалить
default();      // установить значение по умолчанию

// + для Select
set options(options);   // установить список массивом строк
get options();          // получить список массивом строк
get valueText();        // получить значение как строку
reset();

// + для Color
set valueInt(v);        // установить значение как число
get valueInt();         // получить значение как число
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

ui.number = 123;            // запись через авто-сеттер
ui.widget('color').input;   // input-элемент
ui.selectText;              // доп. поле для чтения Select
```