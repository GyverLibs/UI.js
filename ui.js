import { Component } from '@alexgyver/component';
import { addStyle } from '@alexgyver/utils';
// import './ui.css'

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
        if (this._data.$output) this._data.$output.innerText = v + '';
        return this._data.$control.value = v + '';
    }
    get value() {
        return Number(this._data.$control.value);
    }
}
class ControlSwitch extends ControlInput {
    constructor(data) {
        super(data);
    }
    get value() {
        return this._data.$control.checked;
    }
    set value(v) {
        return this._data.$control.checked = v;
    }
    default() {
        this.value = this._data.default;
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

//#region UI
export default class UI {
    /**
     * @param {object} cfg {x, y, width, parent, title, zIndex, theme 'dark' | 'light'}
     * @returns {UI}
     */
    constructor(cfg = {}) {
        if (UI.css) {
            addStyle(UI.css);
            UI.css = null;
        }
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
                    class: 'ui_title_bar',
                    text: cfg.title ?? 'UI',
                },
                {
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
            Object.defineProperty(this, id, {
                get: undefined,
                set: undefined,
            });
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
        value = value ?? false;
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
        if (id) this.#controls.set(id, new ControlSwitch(data));
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
        value = value ?? 0;
        let data = this._makeContainer(label);
        data.default = value;
        Component.make('input', {
            parent: data.$container,
            context: data,
            type: 'number',
            class: 'ui_text_input ui_number',
            step: (step ?? 1) + '',
            value: value + '',
            var: 'control',
            also(el) {
                el.addEventListener('input', () => {
                    if (callback) callback(Number(el.value));
                });
                el.addEventListener('mousewheel', (e) => { });
            }
        });
        if (id) this.#controls.set(id, new ControlNumber(data));
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
    addText(id, label, value, callback) {
        value = value ?? '';
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
        if (id) this.#controls.set(id, new ControlInput(data));
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
        value = value ?? 0;
        let data = this._makeContainerOut(label, value);
        data.default = value;
        Component.make('input', {
            parent: data.$container,
            context: data,
            type: 'range',
            class: 'ui_range',
            value: value + '',
            min: (min ?? 0) + '',
            max: (max ?? 100) + '',
            step: (step ?? 1) + '',
            var: 'control',
            also(el) {
                el.addEventListener('input', () => {
                    if (callback) callback(Number(el.value));
                    data.$output.innerText = el.value;
                });
                el.addEventListener('mousewheel', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    el.value = Number(el.value) + Number(el.step) * (e.deltaY > 0 ? -1 : 1);
                    el.dispatchEvent(new Event('input'));
                });
            }
        });
        if (id) this.#controls.set(id, new ControlNumber(data));
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
    addArea(id, label, value, callback, rows = 5) {
        value = value ?? '';
        let data = this._makeContainer(label);
        data.default = value;
        Component.make('textarea', {
            parent: data.$container,
            context: data,
            class: 'ui_textarea',
            rows: rows,
            value: value + '',
            var: 'control',
            also(el) {
                if (callback) el.addEventListener('input', () => callback(el.value));
            }
        });
        if (id) this.#controls.set(id, new ControlInput(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {string} value 
     * @returns {UI}
     */
    addHTML(id, label, value) {
        value = value ?? '';
        let data = this._makeContainer(label);
        data.default = value;
        Component.make('div', {
            parent: data.$container,
            context: data,
            html: value + '',
            var: 'control',
        });
        if (id) this.#controls.set(id, new ControlHtml(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {HTMLElement} value 
     * @returns {UI}
     */
    addElement(id, label, value) {
        let data = this._makeContainer(label);
        data.default = value;
        data.$control = value;
        data.$container.append(value);
        if (id) this.#controls.set(id, new ControlHtml(data));
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
        value = value ?? [];
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
        if (id) this.#controls.set(id, new ControlSelect(data));
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
        if (id) this.#controls.set(id, new ControlButton(data));
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
            if (id) this.#controls.set(id, new ControlButton(data));
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
        if (id) this.#controls.set(id, new ControlFile(data));


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
        value = value ?? '#000';
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
        if (id) this.#controls.set(id, new ControlNumber(data));
        this._addSetGet(id);
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {string} value 
     * @returns {UI}
     */
    addLabel(id, label, value) {
        value = value ?? '';
        let data = this._makeContainerOut(label, value);
        data.$control = data.$output;
        if (id) this.#controls.set(id, new ControlLabel(data));
        this._addSetGet(id);
        return this;
    }

    addSpace() {
        Component.make('div', {
            class: 'ui_space',
            parent: this.$content,
        });
        return this;
    }

    _addSetGet(id) {
        if (!this.autoVar || !id) return;
        Object.defineProperty(this, id, {
            get: () => { return this.get(id) },
            set: (val) => this.set(id, val),
            configurable: true,
        });
    }

    _checkID(id) {
        return id ? id : '_empty_' + this.#count++;
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
    #count = 0;

    // https://www.minifier.org/
    static css = `.ui_main.theme-light{--border:#aaa;--back:#fff;--mid:#ccc;--bright:#eee;--font:#000;--font-mid:#555}.ui_main.theme-dark{--border:#444c56;--back:rgb(30, 35, 42);--mid:#22272E;--bright:#2D333B;--font:#ccc;--font-mid:#999}.ui_main{background-color:var(--mid);text-align:left;font:12px sans-serif;box-shadow:5px 5px 8px rgb(0 0 0 / .35);user-select:none;-webkit-user-select:none;border:none}.ui_content{background:var(--mid);overflow-y:auto}.ui_title_bar{user-select:none;-webkit-user-select:none;padding:5px;font-weight:700;border:none;background:var(--bright);color:var(--font)}.ui_container{margin:5px;padding:5px;border:none;position:relative;background:var(--bright);color:var(--font)}.ui_space{height:1px}.ui_range{-webkit-appearance:none;-moz-appearance:none;width:100%;height:17px;padding:0;margin:0;background-color:#fff0;border:none;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.ui_range:focus{outline:none;border:none}.ui_range::-webkit-slider-runnable-track{width:100%;height:15px;cursor:pointer;background:var(--back);-webkit-border-radius:0;-moz-border-radius:0;border-radius:0}.ui_range:focus::-webkit-slider-runnable-track{background:var(--back)}.ui_range::-webkit-slider-thumb{-webkit-appearance:none;height:15px;width:15px;-webkit-border-radius:0;-moz-border-radius:0;border-radius:0;background:var(--border);cursor:pointer;margin-top:0}.ui_range::-moz-range-track{width:100%;height:15px;cursor:pointer;background:var(--back);-webkit-border-radius:0;-moz-border-radius:0;border-radius:0}.ui_range::-moz-range-thumb{height:15px;width:15px;border:none;-webkit-border-radius:0;-moz-border-radius:0;border-radius:0;background:var(--border);cursor:pointer}.ui_button{cursor:pointer;background:var(--mid);color:var(--font-mid);height:26px;border:1px solid var(--border);font:12px sans-serif;margin:2px}.ui_button:active{background:var(--back)}.ui_checkbox{cursor:pointer;display:inline}.ui_checkbox input{position:absolute;left:-99999px}.ui_checkbox span{height:16px;width:100%;display:block;text-indent:20px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALklEQVQ4T2OcOXPmfwYKACPIgLS0NLKMmDVrFsOoAaNhMJoOGBioFwZkZUWoJgApdFaxjUM1YwAAAABJRU5ErkJggg==) no-repeat}.ui_checkbox input:checked+span{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAvElEQVQ4T63Tyw2EIBAA0OFKBxBL40wDRovAUACcKc1IB1zZDAkG18GYZTmSmafzgTnnMgwchoDWGlJKheGcP3JtnPceCqCUAmttSZznuYtgchsXQrgC+77DNE0kUpPbmBOoJaBOIVQylnqWgAAeKhDve/AN+EaklJBzhhgjWRoJVGTbNjiOowAIret6a+4jYIwpX8aDwLIs74C2D0IIYIyVP6Gm898m9kbVm85ljHUTf16k4VUefkwDrxk+zoUEwCt0GbUAAAAASUVORK5CYII=) no-repeat}.ui_checkbox_label{position:absolute;top:7px;left:30px;pointer-events:none}.ui_label{margin-bottom:3px;user-select:none;-webkit-user-select:none;cursor:default;font:12px sans-serif}.ui_text_input{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;width:100%;padding:0 0 0 5px;height:24px;font-size:12px;border:1px inset var(--border);background:var(--back);color:var(--font-mid);outline:none}.ui_select{background:var(--back);-webkit-appearance:none;-moz-appearance:none;appearance:none;color:var(--font-mid);width:100%;height:24px;border:1px solid var(--border);-webkit-border-radius:0;-moz-border-radius:0;border-radius:0;padding:0 5px;-moz-outline:none;font-size:14px;cursor:pointer}.ui_select option{font-size:14px}.ui_select:focus{outline:none}.ui_number{height:24px}.ui_textarea{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;resize:vertical;width:100%;padding:3px 5px;font-size:12px;border:1px inset var(--border);background:var(--back);color:var(--font-mid);outline:none}.ui_textarea::-webkit-scrollbar{width:7px;height:7px}.ui_textarea::-webkit-scrollbar-track{background:none}.ui_textarea::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}.ui_color{padding:0;margin:0;outline:none;cursor:pointer;background:none;border:none;height:30px;width:100%}.ui_file_chooser{position:absolute;left:-999999px}.ui_file_chooser_label{background:var(--back);color:var(--font);height:30px;border:1px solid var(--border);font:12px sans-serif;width:100%;display:block;cursor:pointer;padding:7px;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ui_file_chooser_label.active{border:2px solid var(--font)}`;
}