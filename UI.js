import { EL } from '@alexgyver/component';
import { addStyle, clearNode } from '@alexgyver/utils';
// import './UI.css'

//#region ControlInput
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
class ControlColor extends ControlNumber {
    constructor(data) {
        super(data);
    }
    set value(v) {
        return super.value = v;
    }
    get value() {
        return this._data.$control.value;
    }
    set valueInt(v) {
        return '#' + v.toString(16).padStart(6, 0);
    }
    get valueInt() {
        return parseInt(this.value.slice(1), 16);
    }
}
class ControlSwitch extends ControlInput {
    constructor(data) {
        super(data);
    }
    get value() {
        return this._data.$control.checked ? 1 : 0;
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
        return this._data.$control.replaceChildren(...options.map((x, i) => EL.make('option', { text: x, value: i + '' })));
    }
    get options() {
        return Array.from(this._data.$control.options).map(option => option.text);
    }
    get text() {
        return this.options[this.value];
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
     * @param {object} cfg {x, y, width {number px | string px/%}, parent, title, zIndex, theme {'dark' | 'light' | 'dark noback' | 'light noback'}, autoVar, class}
     * @returns {UI}
     */
    constructor(cfg = {}) {
        UI.css = addStyle(UI.css);

        let def = { x: null, y: null, width: '200px', parent: document.body, title: '', zIndex: 3, theme: 'light', autoVar: true, class: '' };
        cfg = { ...def, ...cfg };

        let style = {};
        if (cfg.x !== null || cfg.y !== null) {
            style.left = cfg.x + 'px';
            style.top = cfg.y + 'px';
            style.position = 'absolute';
        }

        this.autoVar = cfg.autoVar;
        this.class = cfg.class;

        EL.makeIn(this, 'div', {
            style: {
                zIndex: cfg.zIndex,
                width: (typeof cfg.width === 'string') ? cfg.width : (cfg.width + 'px'),
                ...style,
            },
            parent: cfg.parent,
            children: [
                {
                    class: 'ui_title_bar',
                    text: cfg.title,
                    $: 'title',
                },
                {
                    class: 'ui_content',
                    $: 'content',
                }
            ],
            $: 'root',
        });

        return this.setTheme(cfg.theme);
    }

    /**
     * 'dark' | 'light' | 'dark noback' | 'light noback'
     * @returns {UI}
     */
    setTheme(theme) {
        this.$root.classList = `ui_main theme-${theme} ${this.class}`;
        return this;
    }

    /**
     * Destroy UI
     */
    destroy() {
        this.removeAll();
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

    /**
     * Export values to object {id: value}
     * @returns {Object}
     */
    toObject() {
        let obj = {};
        this.#controls.forEach((val, key) => {
            if (!(val instanceof ControlButton)) {
                obj[key] = val.value;
            }
        });
        return obj;
    }

    /**
     * Export values to JSON {id: value}
     * @returns {JSON}
     */
    toJson() {
        return JSON.stringify(this.toObject());
    }

    /**
     * Import values {id: value}
     * @param {Object} data
     */
    fromObject(data) {
        for (let id in data) {
            if (this.#controls.has(id)) {
                this.#controls.get(id).value = data[id];
            }
        }
    }

    /**
     * Import values {id: value}
     * @param {JSON} data
     */
    fromJson(json) {
        this.fromObject(JSON.parse(json));
    }

    /**
     * Get control object
     * @param {string} id 
     * @returns {ControlInput}
     */
    getWidget(id) {
        return this.#controls.get(id);
    }
    control(id) {
        return this.#controls.get(id);
    }

    /**
     * Get control value
     * @param {string} id 
     */
    get(id) {
        return this.#controls.has(id) ? this.#controls.get(id).value : undefined;
    }

    /**
     * Set control value
     * @param {string} id 
     * @param {*} value 
     */
    set(id, value) {
        if (this.#controls.has(id)) this.#controls.get(id).value = value;
        return value;
    }

    /**
     * Remove control
     * @param {string | Array} id 'id' | ['id']
     */
    remove(ids) {
        if (typeof ids === 'string') ids = [ids];

        for (let id of ids) {
            if (this.#controls.has(id)) {
                this.#controls.get(id).remove();
                this.#controls.delete(id);
                Object.defineProperty(this, id, {
                    get: undefined,
                    set: undefined,
                });
                Object.defineProperty(this, id + 'Text', {
                    get: undefined,
                });
            }
        }
    }

    // Remove all widgets
    removeAll() {
        this.remove(Array.from(this.#controls.keys()));
        clearNode(this.$content);
    }

    // Change callback (id, value, text) - text for addSelect only
    onChange(cb) {
        this.#cb = cb;
    }

    //#region widgets
    /**
     * @param {string} id 
     * @param {string} label 
     * @param {boolean} value 
     * @param {function} callback 
     * @returns {UI}
     */
    addSwitch(id, label, value, callback) {
        if (this.#controls.has(id)) return this;
        value = value ? 1 : 0;
        let data = { default: value };

        EL.makeIn(data, 'div', {
            $: 'container',
            class: 'ui_container',
            parent: this.$content,
            child: {
                tag: 'label',
                class: 'ui_checkbox_cont',
                children: [
                    {
                        tag: 'label',
                        text: label,
                        $: 'label',
                    },
                    {
                        tag: 'div',
                        class: 'ui_checkbox',
                        child: {
                            tag: 'label',
                            children: [
                                {
                                    tag: 'input',
                                    type: 'checkbox',
                                    checked: value,
                                    $: 'control',
                                    change: (e) => {
                                        let v = e.target.checked ? 1 : 0;
                                        this.#cb(id, v);
                                        if (callback) callback(v);
                                    }
                                },
                                {
                                    tag: 'span'
                                }
                            ]
                        },
                    }
                ],
            },
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
        if (this.#controls.has(id)) return this;
        value = value ?? 0;
        let data = this._makeContainer(label);
        data.default = value;
        EL.makeIn(data, 'input', {
            parent: data.$container,
            type: 'number',
            class: 'ui_input',
            step: (step ?? 1) + '',
            value: value + '',
            $: 'control',
            input: e => {
                let v = Number(e.target.value);
                this.#cb(id, v);
                if (callback) callback(v);
            },
            mousewheel: () => { }
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
    addInput(id, label, value, callback) {
        return this.addText(id, label, value, callback);
    }
    addText(id, label, value, callback) {
        if (this.#controls.has(id)) return this;
        value = value ?? '';
        let data = this._makeContainer(label);
        data.default = value;
        EL.makeIn(data, 'input', {
            parent: data.$container,
            type: 'text',
            class: 'ui_input',
            value: value + '',
            $: 'control',
            input: e => {
                let v = e.target.value;
                this.#cb(id, v);
                if (callback) callback(v);
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
    addRange(...args) {
        return this.addSlider(...args);
    }
    addSlider(id, label, value, min, max, step, callback) {
        if (this.#controls.has(id)) return this;
        value = value ?? 0;
        let data = this._makeContainerOut(label, value);
        data.default = value;
        EL.makeIn(data, 'div', {
            parent: data.$container,
            class: 'ui_range_cont',
            child: {
                tag: 'input',
                type: 'range',
                class: 'ui_range',
                min: (min ?? 0) + '',
                max: (max ?? 100) + '',
                step: (step ?? 1) + '',
                value: value + '',
                $: 'control',
                input: e => {
                    let v = Number(e.target.value);
                    this.#cb(id, v);
                    if (callback) callback(v);
                    data.$output.innerText = v;
                },
                mousewheel: e => {
                    e.stopPropagation();
                    e.preventDefault();
                    let el = e.target;
                    el.value = Number(el.value) + Number(el.step) * (e.deltaY > 0 ? -1 : 1);
                    el.dispatchEvent(new Event('input'));
                }
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
        if (this.#controls.has(id)) return this;
        value = value ?? '';
        let data = this._makeContainer(label);
        data.default = value;
        EL.makeIn(data, 'textarea', {
            parent: data.$container,
            class: 'ui_textarea',
            rows: rows,
            value: value + '',
            $: 'control',
            input: e => {
                let v = e.target.value;
                this.#cb(id, v);
                if (callback) callback(v);
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
        if (this.#controls.has(id)) return this;
        value = value ?? '';
        let data = this._makeContainer(label);
        data.default = value;
        EL.makeIn(data, 'div', {
            parent: data.$container,
            html: value + '',
            $: 'control',
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
        if (this.#controls.has(id)) return this;
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
        if (this.#controls.has(id)) return this;
        value = value ?? [];
        let data = this._makeContainer(label);
        data.default = 0;
        EL.makeIn(data, 'select', {
            parent: data.$container,
            class: 'ui_select',
            $: 'control',
            change: e => {
                let v = e.target.selectedIndex;
                let t = e.target.options[v].text;
                this.#cb(id, v, t);
                if (callback) callback(v, t);
            },
            mousewheel: e => {
                e.stopPropagation();
                e.preventDefault();
                let el = e.target;
                if (e.deltaY < 0 && el.selectedIndex > 0) el.selectedIndex--;
                else if (e.deltaY > 0 && el.selectedIndex < el.options.length - 1) el.selectedIndex++;
                else return;

                el.dispatchEvent(new Event('change'));
            },
            children: value.map((x, i) => EL.make('option', { text: x, value: i + '' })),
        });
        if (id) this.#controls.set(id, new ControlSelect(data));
        if (this._addSetGet(id))
            Object.defineProperty(this, id + 'Text', {
                get: () => this.getWidget(id).text,
                configurable: true,
            });
        return this;
    }

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {function} callback 
     * @returns {UI}
     */
    addButton(id, label, callback) {
        if (this.#controls.has(id)) return this;
        let data = {};
        EL.makeIn(data, 'div', {
            $: 'container',
            class: 'ui_button_cont',
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
        let container = EL.make('div', {
            class: 'ui_button_cont',
            parent: this.$content,
        });

        for (let id in buttons) {
            let data = { $container: container };
            let b = buttons[id];
            container.append(Array.isArray(b) ? this._makeButton(data, id, b[0], b[1]) : this._makeButton(data, id, b));
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
        if (this.#controls.has(id)) return this;
        let data = this._makeContainer(label);
        let process = (files) => {
            let label = '';
            for (let i = 0; i < files.length; i++) label += (i ? ', ' : '') + files[i].name;
            data.$filename.innerText = label.length ? label : '...';
            if (!files.length) return;

            let v = files.length == 1 ? files[0] : files;
            this.#cb(id, v);
            if (callback) callback(v);
        }

        EL.makeIn(data, 'input', {
            parent: data.$container,
            class: 'ui_file_chooser',
            type: 'file',
            $: 'control',
            change: () => process(data.$control.files),
            attrs: {
                multiple: true,
            },
        });
        EL.makeIn(data, 'label', {
            parent: data.$container,
            class: 'ui_file_chooser_label',
            text: '...',
            $: 'filename',
            events: {
                click: () => data.$control.click(),
                drop: (e) => process(e.dataTransfer.files),
            },
        });
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
        if (this.#controls.has(id)) return this;
        value = value ?? '#000';
        let data = this._makeContainerOut(label, value);
        data.default = value;
        EL.configIn(data, data.$container, {
            class: 'ui_color_cont',
            child: {
                tag: 'input',
                type: 'color',
                class: 'ui_color',
                value: value,
                $: 'control',
                attrs: { 'colorpick-eyedropper-active': false },
                input: e => {
                    let v = e.target.value;
                    this.#cb(id, v);
                    if (callback) callback(v);
                    data.$output.innerText = v;
                }
            }
        });
        if (id) this.#controls.set(id, new ControlColor(data));
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
        if (this.#controls.has(id)) return this;
        value = value ?? '';
        let data = this._makeContainerOut(label, value);
        data.$control = data.$output;
        if (id) this.#controls.set(id, new ControlLabel(data));
        this._addSetGet(id);
        return this;
    }

    addSpace(height = 5) {
        EL.make('div', {
            style: `height: ${height}px`,
            parent: this.$content,
        });
        return this;
    }

    //#region system
    _addSetGet(id) {
        if (!this.autoVar || !id || typeof this[id] == 'function') return false;
        Object.defineProperty(this, id, {
            get: () => { return this.get(id) },
            set: (val) => this.set(id, val),
            configurable: true,
        });
        return true;
    }

    _checkID(id) {
        return id ? id : '_empty_' + this.#count++;
    }

    _makeButton(context, id, label, callback) {
        return EL.makeIn(context, 'button', {
            class: 'ui_button',
            $: 'control',
            text: label + '',
            click: e => {
                this.#cb(id);
                if (callback) callback();
            }
        });
    }

    _makeContainer(label) {
        let data = {};
        EL.makeIn(data, 'div', {
            $: 'container',
            class: 'ui_container',
            parent: this.$content,
            children: [
                {
                    class: 'ui_label',
                    children: [
                        {
                            tag: 'b',
                            $: 'label',
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
        EL.makeIn(data, 'div', {
            $: 'container',
            class: 'ui_container',
            parent: this.$content,
            children: [
                {
                    class: 'ui_label',
                    children: [
                        {
                            tag: 'b',
                            text: label,
                            $: 'label',
                        },
                        {
                            tag: 'span',
                            text: ': ',
                        },
                        {
                            tag: 'span',
                            text: value + '',
                            $: 'output',
                        }
                    ]
                }
            ],
        });
        return data;
    }

    #controls = new Map();
    #count = 0;
    #cb = () => { };

    // https://www.minifier.org/
    static css = `.ui_main.theme-light{--border:#aaa;--back:#fff;--mid:#ccc;--tab:#f0f0f0;--font:#000;--font-mid:#555;--thumb:var(--back)}.ui_main.theme-dark{--border:#484d53;--back:rgb(30, 35, 42);--mid:#22272E;--tab:#2D333B;--font:#ccc;--font-mid:#999;--thumb:var(--font-mid)}.ui_main{background-color:var(--mid);text-align:left;font:12px sans-serif;user-select:none;border:none;border-radius:6px}.ui_main.noback{background:none}.ui_main.noback .ui_container{border:1px solid var(--mid);margin:5px 0}.ui_main.noback .ui_title_bar{display:none}.ui_main.noback .ui_button_cont{margin:5px 0}.ui_main.noback .ui_button{border:1px solid var(--mid)}.ui_content{overflow-y:auto;border-radius:6px}.ui_title_bar{text-align:center;font-weight:700;border:none;background:var(--tab);color:var(--font);font-size:15px;border-radius:5px 5px 0 0}.ui_title_bar:not(:empty){padding:4px}.ui_container{margin:5px;padding:5px;border:none;position:relative;background:var(--tab);color:var(--font);border-radius:5px}.ui_range_cont{display:flex;align-items:center;padding:8px 0 6px 0}.ui_range{appearance:none;box-sizing:border-box;margin:0;padding:0;width:100%;height:2px;background:var(--border);cursor:pointer;touch-action:none}.ui_range::-webkit-slider-thumb{appearance:none;background:var(--thumb);width:16px;height:16px;border-radius:50%;box-shadow:0 0 4px #0000005a}.ui_range::-moz-range-thumb{border:none;background:var(--thumb);width:16px;height:16px;border-radius:50%}.ui_button_cont{margin:5px;gap:5px;display:flex}.ui_button{cursor:pointer;background:var(--tab);color:var(--font-mid);height:26px;border-radius:4px;width:100%;border:none}.ui_button:hover{filter:brightness(.96)}.ui_button:active{background:var(--back)}.ui_checkbox_cont{cursor:pointer;display:flex;align-items:center;justify-content:space-between}.ui_checkbox_cont label{font-weight:700;pointer-events:none}.ui_checkbox{display:inline-block}.ui_checkbox label{display:flex;align-items:center;cursor:pointer;user-select:none}.ui_checkbox input{display:none}.ui_checkbox span{width:18px;height:18px;border:1px solid var(--border);border-radius:4px;background-color:var(--back);position:relative}.ui_checkbox input:checked+span::after{content:"✓";position:absolute;left:3px;top:-2px;font-size:16px;color:var(--font);font-weight:700}.ui_label{margin-bottom:3px;user-select:none;-webkit-user-select:none;cursor:default}.ui_input{box-sizing:border-box;width:100%;padding:5px;height:24px;line-height:24px;border:1px solid var(--border);background:var(--back);color:var(--font-mid);border-radius:4px}.ui_select{background:var(--back);color:var(--font-mid);width:100%;height:24px;border:1px solid var(--border);border-radius:0;padding:0 2px;cursor:pointer;border-radius:4px}.ui_textarea{box-sizing:border-box;resize:vertical;width:100%;padding:3px 5px;border:1px solid var(--border);background:var(--back);color:var(--font-mid);border-radius:4px}.ui_textarea::-webkit-scrollbar{width:7px;height:7px}.ui_textarea::-webkit-scrollbar-track{background:none}.ui_textarea::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}.ui_color_cont{display:flex;align-items:center;justify-content:space-between}.ui_color_cont .ui_label{margin:0}.ui_color{cursor:pointer;padding:0;margin:0;border:none;background:none;height:22px;width:22px}.ui_file_chooser{display:none}.ui_file_chooser_label{background:var(--back);color:var(--font-mid);height:24px;border:1px solid var(--border);width:100%;display:block;cursor:pointer;padding:5px;box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-radius:4px}.ui_file_chooser_label.active{border-width:2px}`;
}
