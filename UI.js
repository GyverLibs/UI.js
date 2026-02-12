import { addCSS, EL, State } from '@alexgyver/component';
// import './UI.css'

//#region Widget
class Widget {
    constructor(value, label) {
        this._default = value;
        this._state = new State({ value, label, hidden: false });
    }
    get label() {
        return this._state.label;
    }
    set label(v) {
        return this._state.label = v;
    }
    get value() {
        return this._state.value;
    }
    set value(v) {
        return this._state.value = v;
    }
    get input() {
        return this.$input;
    }
    display(state) {
        this._state.hidden = !state;
    }
    show() {
        this.display(true);
    }
    hide() {
        this.display(false);
    }
    remove() {
        this.$container.remove();
    }
    default() {
        this._state.value = this._default;
    }
}
class WidgetSelect extends Widget {
    constructor(value, label) {
        super(value, label);
    }
    set options(options) {
        this._state.options = _getOptions(options);
    }
    get options() {
        return this._state.options.map(opt => opt.text);
    }
    reset() {
        this.value = 0;
    }
    get text() {
        return this.options[this.value];
    }
}
class WidgetColor extends Widget {
    constructor(value, label) {
        super(value, label);
    }
    set valueInt(v) {
        return this.value = '#' + v.toString(16).padStart(6, 0);
    }
    get valueInt() {
        return parseInt(this.value.slice(1), 16);
    }
}
class WidgetFile extends Widget {
    constructor(value, label) {
        super(value, label);
        this._state.addStates({ filename: '...', active: false });
    }
}

//#region UI
export default class UI {
    /**
     * @param {object} cfg {x, y, width {number px | string px/%}, parent, title, zIndex, autoVar, class, theme {'dark' | 'light' | 'dark noback' | 'light noback'}}
     * @returns {UI}
     */
    constructor(cfg = {}) {
        addCSS(UI.css);

        let def = { width: '200px', parent: document.body, title: '', zIndex: 3, theme: 'light', autoVar: true, class: '' };
        cfg = { ...def, ...cfg };

        const toPx = p => (p == null) ? 0 : ((typeof p == 'string') ? p : (p + 'px'));

        let style = {};

        if (cfg.x != null || cfg.y != null) {
            style.left = toPx(cfg.x);
            style.top = toPx(cfg.y);
            style.position = 'absolute';
        }

        this._autoVar = cfg.autoVar;
        this._class = cfg.class;

        this._dragCount = 0;
        this._lastDragState = 0;

        const dragHandle = (e, dir) => {
            e.preventDefault();
            e.stopPropagation();

            this._dragCount = (dir === null) ? 0 : Math.max(0, this._dragCount + dir);

            const active = this._dragCount != 0;

            if (this._lastDragState != active) {
                this._lastDragState = active;

                this._widgets.forEach(w => {
                    if (w instanceof WidgetFile) w._state.active = (this._dragCount != 0);
                });
            }
        }

        EL.make('div', {
            ctx: this,
            $: 'ui',
            parent: cfg.parent,
            style: {
                zIndex: cfg.zIndex,
                width: cfg.width + ((typeof cfg.width === 'string') ? '' : 'px'),
                ...style,
            },
            child: [
                {
                    $: 'title',
                    text: cfg.title,
                    class: 'ui_title_bar',
                },
                {
                    $: 'widgets',
                    class: 'ui_content',
                }
            ],
            events: {
                dragenter: e => dragHandle(e, 1),
                dragover: e => dragHandle(e, 0),
                dragleave: e => dragHandle(e, -1),
                drop: e => dragHandle(e, null),
            }
        });

        return this.setTheme(cfg.theme);
    }

    //#region methods

    /**
     * 'dark' | 'light' | 'dark noback' | 'light noback'
     * @returns {UI}
     */
    setTheme(theme) {
        this.$ui.className = `ui_main theme-${theme} ${this._class}`;
        return this;
    }

    /**
     * Use mouse wheel on Number, Slider and Select
     * @param {Boolean} use 
     */
    useWheel(use) {
        this._wheel = use;
    }

    /**
     * Destroy UI
     */
    destroy() {
        this.removeAll();
        if (this.$ui) {
            this.$ui.remove();
            this.$ui = null;
            this._widgets = new Map();
        }
    }

    /**
     * Set labels from object
     * @param {object} labels {id: label} 
     */
    setLabels(labels) {
        for (let id in labels) {
            if (this._widgets.has(id)) {
                this.widget(id).label = labels[id];
            }
        }
    }

    /**
     * Export values to object {id: value}
     * @returns {Object}
     */
    toObject() {
        let obj = {};
        this._widgets.forEach((val, key) => obj[key] = val.value);
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
            if (this._widgets.has(id)) {
                this.widget(id).value = data[id];
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
    widget(id) {
        return this._widgets.get(id);
    }
    // legacy
    getWidget = (id) => this.widget(id);
    control = (id) => this.widget(id);

    /**
     * Get control value
     * @param {string} id 
     */
    get(id) {
        return this._widgets.has(id) ? this.widget(id).value : null;
    }

    /**
     * Set control value
     * @param {string} id 
     * @param {*} value 
     */
    set(id, value) {
        if (this._widgets.has(id)) {
            this.widget(id).value = value;
        }
        return value;
    }

    /**
     * Remove control
     * @param {string | Array} id 'id' | ['id']
     */
    remove(ids) {
        if (typeof ids === 'string') ids = [ids];

        for (let id of ids) {
            if (this._widgets.has(id)) {
                this.widget(id).remove();
                this._widgets.delete(id);
                delete this[id];
                delete this[id + 'Text'];
                // Object.defineProperty(this, id, {
                //     get: undefined,
                //     set: undefined,
                // });
                // Object.defineProperty(this, id + 'Text', {
                //     get: undefined,
                // });
            }
        }
    }

    // Remove all widgets
    removeAll() {
        this.remove(Array.from(this._widgets.keys()));
        EL.clear(this.$widgets);
    }

    // Change callback (id, value, text) - text for addSelect only
    onChange(cb) {
        this._cb = cb;
    }

    //#region addSwitch
    /**
     * @param {string} id 
     * @param {string} label 
     * @param {boolean} value 
     * @param {function} callback 
     * @returns {UI}
     */
    addSwitch(id, label, value, callback) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(Boolean(value), label);

        EL.make('div', this._getWidget(w, {
            tag: 'label',
            class: 'ui_checkbox_cont',
            child: [
                {
                    tag: 'label',
                    text: w._state.bind('label'),
                },
                {
                    tag: 'div',
                    class: 'ui_checkbox',
                    child: {
                        tag: 'label',
                        child: [
                            {
                                tag: 'input',
                                type: 'checkbox',
                                $: 'input',
                                checked: w._state.bind('value'),
                                onChange: this._handleValue(w, id, el => el.checked, callback),
                            },
                            {
                                tag: 'span'
                            }
                        ]
                    }
                }
            ]
        }));

        this._widgets.set(id, w);
        this._addSetGet(id);
        return this;
    }

    //#region addNumber

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {number} value 
     * @param {number} step 
     * @param {function} callback 
     * @returns {UI}
     */
    addNumber(id, label, value, step, callback) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(_num(value), label);

        EL.make('div', this._getContainer(w, {
            tag: 'input',
            type: 'number',
            $: 'input',
            class: 'ui_input_base ui_input',
            step: (step ?? 1),
            value: w._state.bind('value'),
            onInput: this._handleValue(w, id, el => _num(el.value), callback),
            onMousewheel: (e) => {
                if (!this._wheel) {
                    e.preventDefault();
                    window.scrollBy({ top: e.deltaY, behavior: 'smooth' });
                }
            }
        }));

        this._widgets.set(id, w);
        this._addSetGet(id);
        return this;
    }

    //#region addText

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {string} value 
     * @param {function} callback 
     * @returns {UI}
     */
    addText(id, label, value, callback) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(_str(value), label);

        EL.make('div', this._getContainer(w, {
            tag: 'input',
            type: 'text',
            $: 'input',
            class: 'ui_input_base ui_input',
            value: w._state.bind('value'),
            onInput: this._handleValue(w, id, el => _str(el.value), callback),
        }));

        this._widgets.set(id, w);
        this._addSetGet(id);
        return this;
    }
    addInput = (...args) => this.addText(...args);

    //#region addSlider

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
    addSlider(id, label, value, min, max, step, callback) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(_num(value), label);

        EL.make('div', this._getContainer(w, {
            class: 'ui_range_cont',
            child: {
                tag: 'input',
                type: 'range',
                $: 'input',
                class: 'ui_range',
                min: min,
                max: max ?? 100,
                step: step ?? 1,
                value: w._state.bind('value'),
                onInput: this._handleValue(w, id, el => _num(el.value), callback),
                onMousewheel: (e) => {
                    if (!this._wheel) return;
                    e.stopPropagation();
                    e.preventDefault();
                    e.el.value = e.el.valueAsNumber + Number(e.el.step) * (e.deltaY > 0 ? -1 : 1);
                    e.el.dispatchEvent(new Event('input'));
                }
            }
        }, true));

        this._widgets.set(id, w);
        this._addSetGet(id);
        return this;
    }
    addRange = (...args) => this.addSlider(...args);

    //#region addArea

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {string} value 
     * @param {function} callback 
     * @returns {UI}
     */
    addArea(id, label, value, callback, rows = 5) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(_str(value), label);

        EL.make('div', this._getContainer(w, {
            tag: 'textarea',
            $: 'input',
            class: 'ui_input_base ui_textarea',
            rows: rows,
            value: w._state.bind('value'),
            onInput: this._handleValue(w, id, el => _str(el.value), callback),
        }));

        this._widgets.set(id, w);
        this._addSetGet(id);
        return this;
    }

    //#region addHTML

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {string} value 
     * @returns {UI}
     */
    addHTML(id, label, value) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(_str(value), label);

        EL.make('div', this._getContainer(w, {
            $: 'input',
            html: w._state.bind('value'),
        }));

        this._widgets.set(id, w);
        this._addSetGet(id);
        return this;
    }

    //#region addElement

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {HTMLElement} value 
     * @returns {UI}
     */
    addElement(id, label, value) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(value, label);

        EL.make('div', this._getContainer(w, {
            $: 'input',
            child_r: w._state.bind('value'),
        }));

        this._widgets.set(id, w);
        this._addSetGet(id);
        return this;
    }

    //#region addSelect

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {array} value 
     * @param {function} callback 
     * @returns {UI}
     */
    addSelect(id, label, value, callback) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new WidgetSelect(0, label);
        w._state.addStates({ options: _getOptions(value) });

        EL.make('div', this._getContainer(w, {
            tag: 'select',
            $: 'input',
            class: 'ui_input_base ui_select',
            value: w._state.bind('value'),
            child_r: w._state.bind('options'),
            onChange: (e) => {
                let v = e.el.selectedIndex;
                let t = e.el.options[v].text;
                w._state.value = v;
                this._cb(id, v, t);
                if (callback) callback(v, t);
            },
            onMousewheel: (e) => {
                if (!this._wheel) return;
                e.stopPropagation();
                e.preventDefault();

                let i = e.el.selectedIndex;
                if (e.deltaY < 0 && i > 0) i--;
                else if (e.deltaY > 0 && i < e.el.options.length - 1) i++;
                else return;
                e.el.value = i;
                e.el.dispatchEvent(new Event('change'));
            },
        }));

        this._widgets.set(id, w);
        if (this._addSetGet(id)) {
            Object.defineProperty(this, id + 'Text', {
                get: () => this.widget(id).text,
                configurable: true,
            });
        }
        return this;
    }

    //#region addButton

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {function} callback 
     * @returns {UI}
     */
    addButton(id, label, callback) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(0, label);

        EL.make('div', this._getWidget(w, this._getButton(w, id, callback), 'ui_button_cont'));

        this._widgets.set(id, w);
        return this;
    }

    //#region addButtons

    /**
     * @param {object} buttons {id: [label, callback]}
     * @returns {UI}
     */
    addButtons(buttons) {
        let container = EL.make('div', {
            class: 'ui_button_cont',
            parent: this.$widgets,
        });

        EL.update(container, {
            child: Object.entries(buttons).map(([id, btn]) => {
                id = this._checkID(id);
                if (this._widgets.has(id)) return;

                if (!Array.isArray(btn)) btn = [btn, null];
                let [label, cb] = btn;

                const w = new Widget(0, label);
                w.$container = container;
                this._widgets.set(id, w);
                return this._getButton(w, id, cb);
            })
        });
        return this;
    }

    //#region addFile

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {function} callback 
     * @returns {UI}
     */
    addFile(id, label, callback) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const process = (w, files, callback) => {
            let label = Array.from(files).map(f => f.name).join(', ');
            w._state.filename = label || '...';
            if (!files.length) return;

            let v = (files.length == 1) ? files[0] : files;
            w._state.value = v;
            this._cb(id, v);
            if (callback) callback(v);
        }

        const w = new WidgetFile(null, label);

        let cont = EL.make('div', this._getContainer(w, [
            {
                tag: 'input',
                type: 'file',
                $: 'input',
                class: 'ui_file_chooser',
                onChange: () => process(w, w.$input.files, callback),
                attrs: { multiple: true },
            },
            {
                tag: 'label',
                class: {
                    _raw: 'ui_input_base ui_file_chooser_label',
                    active: w._state.bind('active')
                },
                text: w._state.bind('filename'),
            }
        ]));

        EL.update(cont, {
            onClick: () => w.$input.click(),
            onDrop: (e) => process(w, e.dataTransfer.files, callback),
        });

        this._widgets.set(id, w);
        this._addSetGet(id);
        return this;
    }

    //#region addColor

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {string} value 
     * @param {function} callback 
     * @returns {UI}
     */
    addColor(id, label, value, callback) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new WidgetColor(value ?? '#000', label);

        let cont = EL.make('div', this._getContainer(w, null, true));

        EL.update(cont, {
            class: 'ui_color_cont',
            child: {
                tag: 'input',
                type: 'color',
                $: 'input',
                class: 'ui_color',
                value: w._state.bind('value'),
                attrs: { 'colorpick-eyedropper-active': false },
                onInput: this._handleValue(w, id, el => el.value, callback),
            }
        });

        this._widgets.set(id, w);
        this._addSetGet(id);
        return this;
    }

    //#region addLabel

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {string} value 
     * @returns {UI}
     */
    addLabel(id, label, value) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(_str(value), label);

        EL.make('div', this._getContainer(w, null, true));

        this._widgets.set(id, w);
        this._addSetGet(id);
        return this;
    }

    //#region addSpace

    addSpace(height = 5) {
        EL.make('div', {
            style: `height: ${height}px`,
            parent: this.$widgets,
        });
        return this;
    }

    //#region system
    _addSetGet(id) {
        if (!this._autoVar || !id || typeof this[id] == 'function') return false;
        Object.defineProperty(this, id, {
            get: () => this.get(id),
            set: (val) => this.set(id, val),
            configurable: true,
        });
        return true;
    }

    _checkID(id) {
        return id ? id : '_empty_' + this._count++;
    }

    _getWidget = (w, content, cls = 'ui_widget') => ({
        ctx: w,
        $: 'container',
        class: {
            _raw: cls,
            hidden: w._state.bind('hidden'),
        },
        parent: this.$widgets,
        child: content,
    })

    _getContainer(w, content, out) {
        return this._getWidget(w, [
            {
                class: 'ui_label',
                child: [
                    {
                        tag: 'b',
                        text: w._state.bind('label'),
                    },
                    out && {
                        tag: 'span',
                        text: ': ',
                    },
                    out && {
                        tag: 'span',
                        text: w._state.bind('value'),
                    }
                ]
            },
            content
        ]);
    }

    _getButton = (w, id, callback) => ({
        tag: 'button',
        class: 'ui_button',
        text: w._state.bind('label'),
        onClick: () => {
            this._cb(id);
            if (callback) callback();
        }
    })

    _handleValue(w, id, map, cb) {
        return (e) => {
            const v = map(e.el);
            w._state.value = v;
            this._cb(id, v);
            if (cb) cb(v);
        };
    }

    _wheel = false;
    _widgets = new Map();
    _count = 0;
    _cb = () => { };

    // https://www.minifier.org/
    static css = `.ui_main.theme-light{--border:#aaa;--back:#fff;--mid:#ccc;--tab:#f0f0f0;--font:#000;--font-mid:#555;--thumb:var(--back)}.ui_main.theme-dark{--border:#484d53;--back:rgb(30, 35, 42);--mid:#22272E;--tab:#2D333B;--font:#ccc;--font-mid:#999;--thumb:var(--font-mid)}.ui_main{background-color:var(--mid);text-align:left;font:12px sans-serif;user-select:none;border:none;border-radius:6px}.ui_main.noback{background:none}.ui_main.noback .ui_widget{border:1px solid var(--mid);margin:5px 0}.ui_main.noback .ui_title_bar{display:none}.ui_main.noback .ui_button_cont{margin:5px 0}.ui_main.noback .ui_button{border:1px solid var(--mid)}.ui_content{overflow-y:auto;border-radius:6px}.ui_title_bar{text-align:center;font-weight:700;border:none;background:var(--tab);color:var(--font);font-size:15px;border-radius:5px 5px 0 0}.ui_title_bar:not(:empty){padding:4px}.ui_widget{margin:5px;padding:5px;border:none;position:relative;background:var(--tab);color:var(--font);border-radius:5px}.ui_widget.hidden{display:none}.ui_range_cont{display:flex;align-items:center;padding:10px 0 6px 0}.ui_range{appearance:none;box-sizing:border-box;margin:0;padding:0;width:100%;height:2px;background:var(--border);cursor:pointer;touch-action:none}.ui_range::-webkit-slider-thumb{appearance:none;background:var(--thumb);width:16px;height:16px;border-radius:50%;box-shadow:0 0 4px #0000005a}.ui_range::-moz-range-thumb{border:none;background:var(--thumb);width:16px;height:16px;border-radius:50%}.ui_button_cont{margin:5px;gap:5px;display:flex}.ui_button{cursor:pointer;background:var(--tab);color:var(--font-mid);height:26px;border-radius:4px;width:100%;border:none}.ui_button:hover{filter:brightness(.96)}.ui_button:active{background:var(--back)}.ui_checkbox_cont{cursor:pointer;display:flex;align-items:center;justify-content:space-between}.ui_checkbox_cont label{font-weight:700;pointer-events:none}.ui_checkbox{display:inline-block}.ui_checkbox label{display:flex;align-items:center;cursor:pointer;user-select:none}.ui_checkbox input{display:none}.ui_checkbox span{width:18px;height:18px;border:1px solid var(--border);border-radius:4px;background-color:var(--back);position:relative}.ui_checkbox input:checked+span::after{content:"✓";position:absolute;left:3px;top:-2px;font-size:16px;color:var(--font);font-weight:700}.ui_label{user-select:none;-webkit-user-select:none;cursor:default}.ui_input_base{width:100%;box-sizing:border-box;background:var(--back);outline:none;color:var(--font-mid);border:1px solid var(--border);transition:border-color 0.1s;border-radius:4px;margin-top:4px}.ui_input_base:focus{border-color:var(--font-mid)}.ui_input{height:24px;padding:5px;line-height:24px}.ui_select{height:24px;padding:0 2px;cursor:pointer}.ui_textarea{resize:vertical;padding:3px 5px}.ui_textarea::-webkit-scrollbar{width:7px;height:7px}.ui_textarea::-webkit-scrollbar-track{background:none}.ui_textarea::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}.ui_file_chooser_label{padding:5px;height:24px;display:block;cursor:pointer;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.ui_file_chooser_label.active{border-color:var(--font-mid)}.ui_file_chooser{display:none}.ui_color_cont{display:flex;align-items:center;justify-content:space-between}.ui_color_cont .ui_label{margin:0}.ui_color{cursor:pointer;padding:0;margin:0;border:none;background:none;height:22px;width:22px}`;
}

const _str = x => String(x ?? '');
const _num = x => Number.isFinite(+x) ? +x : 0;
const _getOptions = (arr) => arr.map((x, i) => ({ tag: 'option', text: x, value: i }));