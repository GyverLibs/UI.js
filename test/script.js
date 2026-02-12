import UI from 'https://gyverlibs.github.io/UI.js/UI.min.js'
// import UI from "../UI.js";

document.addEventListener("DOMContentLoaded", () => {
    let ui = new UI({ title: 'Test UI', theme: 'dark' })
        .addFile('file', 'File')
        .addText('text', 'Text', '')
        .addNumber('number', 'Number', 128, 1)
        .addSlider('range', 'Range', 0, -180, 180, 5)
        .addSelect('select', 'Select', ['Mode 1', 'mode2', 'MODE_3'], changef)
        .addHTML('html', 'HTML', '<h2>Hello</h2>')
        .addSwitch('switch', 'Switch', 0)
        .addArea('area', 'Area', 'abc')
        .addColor('color', 'Color')
        .addLabel('label', 'Text', 'Value')
        .addButtons({ 'btn1': ['Button 1', null], 'btn2': 'Button 2' })
        .addButton('button', 'Button')

    ui.onChange((id, val, t) => console.log(id, val, t));

    function changef(val, t) {
        console.log(val, t);
        console.log(ui.widget('select').text);
        console.log(ui.widget('select').options);
    }

    // ui.removeAll();
    // ui.widget('text').display(false)

    // ui.widget('select').options = [1, 2, 3];

    // return;

    new UI({ x: '220px', title: 'Test UI', theme: 'dark noback' })
        .addFile('file', 'File')
        .addText('text', 'Text', '')
        .addNumber('number', 'Number', 128, 1)
        .addSlider('range', 'Range', 0, -180, 180, 5)
        .addSelect('select', 'Select', ['Mode 1', 'mode2', 'MODE_3'], changef)
        .addHTML('html', 'HTML', '<h2>Hello</h2>')
        .addSwitch('switch', 'Switch', 0)
        .addArea('area', 'Area', 'abc')
        .addColor('color', 'Color')
        .addLabel('label', 'Text', 'Value')
        .addButtons({ 'btn1': ['Button 1', null], 'btn2': 'Button 2' })
        .addButton('button', 'Button')

    new UI({ x: '440px', title: 'Test UI', theme: 'light' })
        .addFile('file', 'File')
        .addText('text', 'Text', '')
        .addNumber('number', 'Number', 128, 1)
        .addSlider('range', 'Range', 0, -180, 180, 5)
        .addSelect('select', 'Select', ['Mode 1', 'mode2', 'MODE_3'], changef)
        .addHTML('html', 'HTML', '<h2>Hello</h2>')
        .addSwitch('switch', 'Switch', 0)
        .addArea('area', 'Area', 'abc')
        .addColor('color', 'Color')
        .addLabel('label', 'Text', 'Value')
        .addButtons({ 'btn1': ['Button 1', null], 'btn2': 'Button 2' })
        .addButton('button', 'Button')

    new UI({ x: '660px', title: 'Test UI', theme: 'light noback' })
        .addFile('file', 'File')
        .addText('text', 'Text', '')
        .addNumber('number', 'Number', 128, 1)
        .addSlider('range', 'Range', 0, -180, 180, 5)
        .addSelect('select', 'Select', ['Mode 1', 'mode2', 'MODE_3'], changef)
        .addHTML('html', 'HTML', '<h2>Hello</h2>')
        .addSwitch('switch', 'Switch', 0)
        .addArea('area', 'Area', 'abc')
        .addColor('color', 'Color')
        .addLabel('label', 'Text', 'Value')
        .addButtons({ 'btn1': ['Button 1', null], 'btn2': 'Button 2' })
        .addButton('button', 'Button')
});