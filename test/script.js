import UI from "https://gyverlibs.github.io/UI.js/UI.min.js";

document.addEventListener("DOMContentLoaded", () => {    
    let ui = new UI({ title: "Test UI", theme: 'dark' })
        .addFile('file', 'File')
        .addText('text', 'Text', '')
        .addNumber('number', 'Number', 128, 1)
        .addSlider('range', 'Range', 0, -180, 180, 5)
        .addSelect('select', 'Select', ['Mode 1', 'mode2', 'MODE_3'])
        .addHTML('html', 'HTML', '<h2>Hello</h2>')
        .addSwitch('switch', 'Switch', 0)
        .addColor('color', 'Color')
        .addArea('area', 'Area', 'abc')
        .addButton('button', 'Button')
        .addButtons({ 'btn1': ['label 1', null], 'btn2': 'label 2' });
    
    ui.set("code", "some new code");
    
    // библиотека создаёт сеттер и геттер по id
    ui.link = 'abc';
    console.log(ui.link);
});