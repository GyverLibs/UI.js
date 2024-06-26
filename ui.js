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
        return this._data.$label.innerText = v;
    }
    get value() {
        return this._data.$control.value;
    }
    set value(v) {
        return this._data.$control.value = v;
    }
    get control() {
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
        this.value = this._data.default;
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
        return this._data.$control.innerHtml;
    }
    set value(v) {
        return this._data.$control.innerHtml = v;
    }
}
class ControlButton extends ControlInput {
    constructor(data) {
        super(data);
    }
    get value() {
        return 1;
    }
    set value(v) {
    }
}
class ControlSelect extends ControlInput {
    constructor(data) {
        super(data);
    }
    set options(options) {
        return this._data.$control.replaceChildren(...options.map((x, i) => Component.make('option', { text: x, value: i })));
    }
}

export default class UI {
    /**
     * @param {object} cfg {x, y, width, parent, title, zIndex, theme 'dark' | 'light'}
     * @returns {UI}
     */
    constructor(cfg = {}) {
        Component.make('div', {
            class: 'ui_main theme-' + (cfg.theme ?? 'light'),
            style: {
                zIndex: cfg.zIndex ?? 3,
                left: cfg.x ?? 0,
                top: cfg.y ?? 0,
                width: (cfg.width ?? 200) + 'px',
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

    setTheme(theme) {
        this.$root.classList = 'ui_main theme-' + theme;
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
    get(id) {
        return this.#controls.get(id);
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
                                el.addEventListener('click', () => callback({ id: id, value: el.checked }));
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
        let data = label ? this._makeContainerOut(label, value) : this._makeContainer(label);
        data.default = value;
        Component.make('input', {
            parent: data.$container,
            context: data,
            type: 'number',
            class: 'ui_text_input ui_number',
            step: step,
            value: value,
            var: 'control',
            also(el) {
                el.addEventListener('input', () => {
                    callback({ id: id, value: el.value });
                    data.$output.innerText = el.value;
                });
            }
        });
        this.#controls.set(id, new ControlInput(data));
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
            value: value,
            var: 'control',
            also(el) {
                el.addEventListener('input', () => callback({ id: id, value: el.value }));
            }
        });
        this.#controls.set(id, new ControlInput(data));
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
        let data = label ? this._makeContainerOut(label, value) : this._makeContainer(label);
        data.default = value;
        Component.make('input', {
            parent: data.$container,
            context: data,
            type: 'range',
            class: 'ui_range',
            value: value,
            min: min,
            max: max,
            step: step,
            var: 'control',
            also(el) {
                el.addEventListener('input', () => {
                    callback({ id: id, value: el.value });
                    data.$output.innerText = el.value;
                });
            }
        });
        this.#controls.set(id, new ControlInput(data));
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
            value: value,
            var: 'control',
            also(el) {
                el.addEventListener('input', () => callback({ id: id, value: el.value }));
            }
        });
        this.#controls.set(id, new ControlInput(data));
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
            html: value,
            var: 'control',
        });
        this.#controls.set(id, new ControlHtml(data));
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
                el.addEventListener('change', () => callback({ id: id, value: el.value }));
            },
            children: value.map((x, i) => Component.make('option', { text: x, value: i })),
        });
        this.#controls.set(id, new ControlSelect(data));
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
        data.$container.append(...Component.makeArray([
            {
                tag: 'input',
                context: data,
                class: 'ui_file_chooser',
                type: 'file',
                var: 'control',
                also(el) {
                    el.addEventListener('change', () => {
                        callback({ id: id, value: el.files[0] });
                        data.$filename.innerText = el.files[0].name;
                    });
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
                },
            }
        ]));
        this.#controls.set(id, new ControlInput(data));
        return this;
    }

    _makeButton(context, id, label, callback) {
        return Component.make('button', {
            context: context,
            class: 'ui_button',
            var: 'control',
            text: label,
            also(el) {
                el.addEventListener('click', () => callback({ id: id, value: 1 }));
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
                            var: 'label',
                            text: label,
                        },
                        ': ',
                        {
                            tag: 'span',
                            text: value,
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