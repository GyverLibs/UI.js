import { Component } from '@alexgyver/component';
import './ui.css'

class ControlInput {
    _data;

    // {$container, $label, $control}
    constructor(data) {
        this._data = data;
    }
    get label() {
        return this._data.$label.innerText;
    }
    set label(v) {
        return this._data.$label.innerText = v + '';
    }
    get value() {
        return this._data.$control.value;
    }
    set value(v) {
        return this._data.$control.value = v + '';
    }
    get input() {
        return this._data.$control;
    }
    display(state) {
        this._data.$container.style.display = state ? 'block' : 'none';
    }
    show() {
        this.display(1);
    }
    hide() {
        this.display(0);
    }
    remove() {
        this._data.$container.remove();
    }
    default() {
        this.value = this._data.default + '';
        if (this._data.$output) this._data.$output.innerText = this._data.default + '';
    }
}
class ControlNumber extends ControlInput {
    constructor(data) {
        super(data);
    }
    set value(v) {
        return this._data.$control.value = v + '';
    }
    get value() {
        return Number(this._data.$control.value);
    }
}
class ControlCheck extends ControlInput {
    constructor(data) {
        super(data);
    }
    get value() {
        return this._data.$control.checked;
    }
    set value(v) {
        return this._data.$control.checked = v;
    }
}
class ControlHtml extends ControlInput {
    constructor(data) {
        super(data);
    }
    get value() {
        return this._data.$control.innerHTML;
    }
    set value(v) {
        return this._data.$control.innerHTML = v + '';
    }
}
class ControlFile extends ControlInput {
    constructor(data) {
        super(data);
    }
    get value() {
        return this._data.$control.files[0];
    }
    set value(v) {
    }
}
class ControlButton extends ControlInput {
    constructor(data) {
        super(data);
    }
    set value(v) {
    }
    get value() {
        return 1;
    }
}
class ControlSelect extends ControlNumber {
    constructor(data) {
        super(data);
    }
    set options(options) {
        return this._data.$control.replaceChildren(...options.map((x, i) => Component.make('option', { text: x, value: i + '' })));
    }
}
class ControlLabel extends ControlInput {
    constructor(data) {
        super(data);
    }
    set value(v) {
        this._data.$control.innerText = v + '';
    }
    get value() {
        return this._data.$control.innerText;
    }
}

export default class UI {
    /**
     * @param {object} cfg {x, y, width, parent, title, zIndex, theme 'dark' | 'light'}
     * @returns {UI}
     */
    constructor(cfg) {
        return this.init(cfg);
    }

    /**
     * @param {object} cfg x, y, width {number | string px/%}, parent, title, zIndex, theme {'dark' | 'light'}, autoVar
     * @returns {UI}
     */
    init(cfg) {
        if (!cfg || typeof cfg !== 'object') return this;
        this.autoVar = cfg.autoVar ?? true;

        Component.make('div', {
            class: 'ui_main theme-' + (cfg.theme ?? 'light'),
            style: {
                zIndex: cfg.zIndex ?? 3,
                left: cfg.x ?? 0,
                top: cfg.y ?? 0,
                width: cfg.width ? ((typeof cfg.width === 'string') ? cfg.width : (cfg.width + 'px')) : '200px',
                position: cfg.parent ? '' : 'absolute',
            },
            parent: cfg.parent ?? document.body,
            children: [
                {
                    tag: 'div',
                    class: 'ui_title_bar',
                    text: cfg.title ?? 'UI',
                },
                {
                    tag: 'div',
                    class: 'ui_content',
                    var: 'content',
                }
            ],
            var: 'root',
            context: this,
        });
        return this;
    }

    /**
     * @returns {UI}
     */
    setTheme(theme) {
        this.$root.classList = 'ui_main theme-' + theme;
        return this;
    }

    /**
     * Destroy UI
     */
    destroy() {
        if (this.$root) {
            this.$root.remove();
            this.$root = undefined;
            this.#controls = new Map();
        }
    }

    /**
     * Set labels from object
     * @param {object} labels {id: label} 
     */
    setLabels(labels) {
        for (let id in labels) {
            if (this.#controls.has(id)) {
                this.#controls.get(id).label = labels[id];
            }
        }
    }

    toObject() {
        let obj = {};
        this.#controls.forEach((val, key) => {
            if (val.value && !(val instanceof ControlButton)) {
                obj[key] = val.value;
            }
        });
        return obj;
    }

    toJson() {
        return JSON.stringify(this.toObject());
    }

    fromObject(data) {
        for (let id in data) {
            if (this.#controls.has(id)) {
                this.#controls.get(id).value = data[id];
            }
        }
    }

    fromJson(json) {
        this.fromObject(JSON.parse(json));
    }

    /**
     * @param {string} id 
     * @returns {ControlInput}
     */
    control(id) {
        return this.#controls.get(id);
    }

    /**
     * Get control value
     * @param {string} id 
     * @returns 
     */
    get(id) {
        if (this.#controls.has(id)) return this.#controls.get(id).value;
    }

    /**
     * Set control value
     * @param {string} id 
     * @param {*} value 
     * @returns 
     */
    set(id, value) {
        if (this.#controls.has(id)) return this.#controls.get(id).value = value;
    }

    /**
     * Remove control
     * @param {string} id 
     */
    remove(id) {
        if (this.#controls.has(id)) {
            this.#controls.get(id).remove();
            this.#controls.delete(id);
        }
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {boolean} value 
     * @param {function} callback 
     * @returns {UI}
     */
    addSwitch(id, label, value, callback) {
        let data = { default: value };

        Component.make('div', {
            context: data,
            var: 'container',
            class: 'ui_container',
            parent: this.$content,
            children: [
                {
                    tag: 'label',
                    class: 'ui_checkbox_label',
                    text: label,
                    var: 'label',
                },
                {
                    tag: 'label',
                    class: 'ui_checkbox',
                    children: [
                        {
                            tag: 'input',
                            type: 'checkbox',
                            checked: value,
                            var: 'control',
                            also(el) {
                                if (callback) el.addEventListener('click', () => callback(el.checked));
                            }
                        },
                        {
                            tag: 'span'
                        }
                    ]
                }
            ],
        });
        this.#controls.set(id, new ControlCheck(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {number} value 
     * @param {number} step 
     * @param {function} callback 
     * @returns {UI}
     */
    addNumber(id, label, value, step, callback) {
        let data = this._makeContainerOut(label, value);
        data.default = value;
        Component.make('input', {
            parent: data.$container,
            context: data,
            type: 'number',
            class: 'ui_text_input ui_number',
            step: step + '',
            value: value + '',
            var: 'control',
            also(el) {
                el.addEventListener('input', () => {
                    if (callback) callback(Number(el.value));
                    data.$output.innerText = el.value;
                });
            }
        });
        this.#controls.set(id, new ControlNumber(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {number} value 
     * @param {function} callback 
     * @returns {UI}
     */
    addText(id, label, value, callback) {
        let data = this._makeContainer(label);
        data.default = value;
        Component.make('input', {
            parent: data.$container,
            context: data,
            type: 'text',
            class: 'ui_text_input',
            value: value + '',
            var: 'control',
            also(el) {
                if (callback) el.addEventListener('input', () => callback(el.value));
            }
        });
        this.#controls.set(id, new ControlInput(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @param {number} step 
     * @param {function} callback 
     * @returns {UI}
     */
    addRange(id, label, value, min, max, step, callback) {
        let data = this._makeContainerOut(label, value);
        data.default = value;
        Component.make('input', {
            parent: data.$container,
            context: data,
            type: 'range',
            class: 'ui_range',
            value: value + '',
            min: min + '',
            max: max + '',
            step: step + '',
            var: 'control',
            also(el) {
                el.addEventListener('input', () => {
                    if (callback) callback(Number(el.value));
                    data.$output.innerText = el.value;
                });
            }
        });
        this.#controls.set(id, new ControlNumber(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {number} value 
     * @param {function} callback 
     * @returns {UI}
     */
    addArea(id, label, value, callback) {
        let data = this._makeContainer(label);
        data.default = value;
        Component.make('textarea', {
            parent: data.$container,
            context: data,
            class: 'ui_textarea',
            rows: 5,
            value: value + '',
            var: 'control',
            also(el) {
                if (callback) el.addEventListener('input', () => callback(el.value));
            }
        });
        this.#controls.set(id, new ControlInput(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {number} value 
     * @returns {UI}
     */
    addHTML(id, label, value) {
        let data = this._makeContainer(label);
        data.default = value;
        Component.make('div', {
            parent: data.$container,
            context: data,
            html: value + '',
            var: 'control',
        });
        this.#controls.set(id, new ControlHtml(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {number} value 
     * @returns {UI}
     */
    addElement(id, label, value) {
        let data = this._makeContainer(label);
        data.default = value;
        data.$control = value;
        data.$container.append(value);
        this.#controls.set(id, new ControlHtml(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {array} value 
     * @param {function} callback 
     * @returns {UI}
     */
    addSelect(id, label, value, callback) {
        let data = this._makeContainer(label);
        data.default = 0;
        Component.make('select', {
            parent: data.$container,
            context: data,
            class: 'ui_select',
            var: 'control',
            also(el) {
                if (callback) el.addEventListener('change', () => callback(Number(el.value)));
            },
            children: value.map((x, i) => Component.make('option', { text: x, value: i + '' })),
        });
        this.#controls.set(id, new ControlSelect(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {function} callback 
     * @returns {UI}
     */
    addButton(id, label, callback) {
        let data = {};
        Component.make('div', {
            context: data,
            var: 'container',
            class: 'ui_container',
            parent: this.$content,
            children: [
                this._makeButton(data, id, label, callback)
            ]
        });
        data.$label = data.$control;
        this.#controls.set(id, new ControlButton(data));
        return this;
    }

    /**
     * @param {object} buttons {id: [label, callback]}
     * @returns {UI}
     */
    addButtons(buttons) {
        let container = Component.make('div', {
            var: 'container',
            class: 'ui_container',
            parent: this.$content,
        });

        for (let id in buttons) {
            let data = { $container: container };
            container.append(this._makeButton(data, id, buttons[id][0], buttons[id][1]));
            data.$label = data.$control;
            this.#controls.set(id, new ControlButton(data));
        }
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {function} callback 
     * @returns {UI}
     */
    addFile(id, label, callback) {
        let data = this._makeContainer(label);
        let process = (files) => {
            if (callback) callback(files.length == 1 ? files[0] : files);
            data.$filename.innerText = files[0].name;
        }

        data.$container.append(...Component.makeArray([
            {
                tag: 'input',
                context: data,
                class: 'ui_file_chooser',
                type: 'file',
                var: 'control',
                attrs: {
                    multiple: true,
                },
                also(el) {
                    el.addEventListener('change', () => process(el.files));
                },
            },
            {
                tag: 'label',
                context: data,
                class: 'ui_file_chooser_label',
                text: '...',
                var: 'filename',
                also(el) {
                    el.addEventListener('click', () => data.$control.click());
                    el.addEventListener('drop', (e) => process(e.dataTransfer.files));
                },
            }
        ]));
        this.#controls.set(id, new ControlFile(data));


        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
            this.$root.addEventListener(ev, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        ['dragenter', 'dragover'].forEach(e => {
            this.$root.addEventListener(e, function () {
                data.$filename.classList.add('active');
            }, false);
        });
        ['dragleave', 'drop'].forEach(e => {
            this.$root.addEventListener(e, function () {
                data.$filename.classList.remove('active');
            }, false);
        });
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {string} value 
     * @param {function} callback 
     * @returns {UI}
     */
    addColor(id, label, value, callback) {
        let data = this._makeContainerOut(label, value);
        data.default = value;
        data.$container.append(Component.make('input', {
            context: data,
            type: 'color',
            class: 'ui_color',
            value: value,
            var: 'control',
            attrs: { 'colorpick-eyedropper-active': false },
            also(el) {
                el.addEventListener('input', () => {
                    if (callback) callback(el.value);
                    data.$output.innerText = el.value;
                });
            }
        }));
        this.#controls.set(id, new ControlNumber(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {function} callback 
     * @returns {UI}
     */
    addLabel(id, label, value) {
        let data = this._makeContainerOut(label, value);
        data.$control = data.$output;
        this.#controls.set(id, new ControlLabel(data));
        this._addSetGet(id);
        return this;
    }

    _addSetGet(id) {
        if (!this.autoVar) return;
        Object.defineProperty(this, id, {
            get: () => { return this.get(id) },
            set: (val) => this.set(id, val),
        });
    }

    _makeButton(context, id, label, callback) {
        return Component.make('button', {
            context: context,
            class: 'ui_button',
            var: 'control',
            text: label + '',
            also(el) {
                if (callback) el.addEventListener('click', () => callback(1));
            }
        });
    }

    _makeContainer(label) {
        let data = {};
        Component.make('div', {
            context: data,
            var: 'container',
            class: 'ui_container',
            parent: this.$content,
            children: [
                {
                    tag: 'div',
                    class: 'ui_label',
                    children: [
                        {
                            tag: 'b',
                            var: 'label',
                            text: label,
                        }
                    ]
                }
            ],
        });
        return data;
    }
    _makeContainerOut(label, value) {
        let data = {};
        Component.make('div', {
            context: data,
            var: 'container',
            class: 'ui_container',
            parent: this.$content,
            children: [
                {
                    tag: 'div',
                    class: 'ui_label',
                    children: [
                        {
                            tag: 'b',
                            text: label,
                            var: 'label',
                        },
                        {
                            tag: 'span',
                            text: ': ',
                        },
                        {
                            tag: 'span',
                            text: value + '',
                            var: 'output',
                        }
                    ]
                }
            ],
        });
        return data;
    }

    #controls = new Map();
}