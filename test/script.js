import UI from "https://gyverlibs.github.io/UI.js/UI.min.js";

document.addEventListener("DOMContentLoaded", () => {    
    let ui = new UI({ title: "Test UI", theme: 'dark' })
        .addFile('file', 'File')
        .addText('link', 'Link', '')
        .addNumber('width', 'Ширина', 128, 1)
        .addButton('fit', 'Fit')
        .addRange('rotate', 'Angle', 0, -180, 180, 5)
        .addSelect('mode', 'Режимы', ['Mono', 'Grayscale', 'RGB'])
        .addHTML('result', 'Plain HTML', '<h2>Hello</h2>')
        .addArea('code', 'Code area', '')
        .addButton('info', 'Info');
    
    ui.set("code", "some new code");
    
    // библиотека создаёт сеттер и геттер по id
    ui.link = 'abc';
    console.log(ui.link);
});