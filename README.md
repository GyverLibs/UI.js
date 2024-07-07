# UI.js
 
> npm i @alexgyver/ui

Основано на библиотеке [quicksettings](https://github.com/bit101/quicksettings). Переписано с нуля на движке [Component](https://github.com/bit101/quicksettings), изменена логика работы, сохранён оригинальный внешний вид, добавлена тёмная тема.

```js
// {x, y, width, parent, title, zIndex, theme 'dark' | 'light'}
constructor(cfg);
init(cfg);

setTheme(theme);    // установить тему 'dark' | 'light'
destroy();          // уничтожить меню
setLabels(labels);  // установить подписи объектом {id: подпись}

control(id);        // получить контроллер
get(id);            // получить значение
set(id, value);     // установить значение (не приводит к срабатыванию коллбэка)
remove(id);         // удалить контроллер

toObject();         // получить объект с ключами {id: значение}
toJson();           // вывести в JSON
fromObject(data);
fromJson(json);

// виджеты
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
```

Пример
```js
function file_h(file) {
}
// остальные обработчики не указаны, это пример

let ui = new UI({ title: "Test UI", theme: 'dark' })
    .addFile('file', 'File', file_h)
    .addText('link', 'Link', '', link_h)
    .addNumber('width', 'Ширина', 128, 1, resize_h)
    .addButton('fit', 'Fit', fit_h)
    .addRange('rotate', 'Angle', 0, -180, 180, 5, rotate_h)
    .addSelect('mode', 'Режимы', ['Mono', 'Grayscale', 'RGB'], mode_h)
    .addHTML('result', 'Plain HTML', '<h2>Hello</h2>')
    .addArea('code', 'Code area', '')
    .addButtons({ copy: ["Copy", copy_h], header: [".h", saveH_h], bin: [".bin", saveBin_h] })
    .addButton('info', '', info_h);

ui.set("code", "some new code");
```