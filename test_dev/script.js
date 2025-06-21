import UI from "../UI.js";

document.addEventListener("DOMContentLoaded", () => {
    let ui = new UI({ title: 0, theme: 'light ' })
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

    ui.onChange((id, val, t) => console.log(id, val, t));

    // ui.fromObject([
    //     ['addSwitch', 'switch2', 'Switch 2'],
    //     ['addArea', 'area2', 'Area 2', 'abc'],
    // ]);
});