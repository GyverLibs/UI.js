import UI from "../UI.js";

document.addEventListener("DOMContentLoaded", () => {
    let ui = new UI({ title: 'Test UI', theme: 'light noback' })
        .addFile('file', 'File')
        .addText('text', 'Text', '')
        .addNumber('number', 'Number', 128, 1)
        .addSlider('range', 'Range', 0, -180, 180, 5)
        .addSelect('select', 'Select', ['Mode 1', 'mode2', 'MODE_3'])
        .addHTML('html', 'HTML', '<h2>Hello</h2>')
        .addSwitch('switch', 'Switch', 0)
        .addArea('area', 'Area', 'abc')
        .addColor('color', 'Color')
        .addButtons({ 'btn1': ['Button 1', null], 'btn2': 'Button 2' })
        .addButton('button', 'Button')

    ui.onChange((id, val, t) => console.log(id, val, t));
    // ui.removeAll();

    // new UI({x:'220px', title: 'Test UI', theme: 'dark noback' })
    //     .addFile('file', 'File')
    //     .addText('text', 'Text', '')
    //     .addNumber('number', 'Number', 128, 1)
    //     .addSlider('range', 'Range', 0, -180, 180, 5)
    //     .addSelect('select', 'Select', ['Mode 1', 'mode2', 'MODE_3'])
    //     .addHTML('html', 'HTML', '<h2>Hello</h2>')
    //     .addSwitch('switch', 'Switch', 0)
    //     .addArea('area', 'Area', 'abc')
    //     .addColor('color', 'Color')
    //     .addButtons({ 'btn1': ['Button 1', null], 'btn2': 'Button 2' })
    //     .addButton('button', 'Button')

    // new UI({x:'440px', title: 'Test UI', theme: 'light ' })
    //     .addFile('file', 'File')
    //     .addText('text', 'Text', '')
    //     .addNumber('number', 'Number', 128, 1)
    //     .addSlider('range', 'Range', 0, -180, 180, 5)
    //     .addSelect('select', 'Select', ['Mode 1', 'mode2', 'MODE_3'])
    //     .addHTML('html', 'HTML', '<h2>Hello</h2>')
    //     .addSwitch('switch', 'Switch', 0)
    //     .addArea('area', 'Area', 'abc')
    //     .addColor('color', 'Color')
    //     .addButtons({ 'btn1': ['Button 1', null], 'btn2': 'Button 2' })
    //     .addButton('button', 'Button')

    // new UI({x:'660px', title: 'Test UI', theme: 'dark ' })
    //     .addFile('file', 'File')
    //     .addText('text', 'Text', '')
    //     .addNumber('number', 'Number', 128, 1)
    //     .addSlider('range', 'Range', 0, -180, 180, 5)
    //     .addSelect('select', 'Select', ['Mode 1', 'mode2', 'MODE_3'])
    //     .addHTML('html', 'HTML', '<h2>Hello</h2>')
    //     .addSwitch('switch', 'Switch', 0)
    //     .addArea('area', 'Area', 'abc')
    //     .addColor('color', 'Color')
    //     .addButtons({ 'btn1': ['Button 1', null], 'btn2': 'Button 2' })
    //     .addButton('button', 'Button')
});