import { addCSS, EL, State } from '@alexgyver/component';
import { DeferredEmitter } from '@alexgyver/utils';
// import './UI.css'

// MARK: Widget
class Widget {
    constructor(value, label, callback, type) {
        this._default = value;
        this._state = new State({ value, label, hidden: false, groupHidden: false });
        this._cb = callback;
        this._type = type;
    }
    get type() {
        return this._type;
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
    get container() {
        return this.$container;
    }
    call() {
        if (this._cb) this._cb(this.value);
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
        if (this.value >= this._state.options.length) this.value = 0;
    }
    get options() {
        return this._state.options.map(opt => opt.text);
    }
    get text() {
        return this.valueText;
    }
    get valueText() {
        return this.options?.[this.value] ?? '';
    }
    reset() {
        this.value = 0;
    }
    call() {
        if (this._cb) this._cb(this.value, this.valueText);
    }
}
class WidgetColor extends Widget {
    constructor(value, label) {
        super(value, label);
    }
    set valueInt(v) {
        v = Math.max(0, Math.min(0xffffff, v | 0));
        return this.value = '#' + v.toString(16).padStart(6, '0');
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
class WidgetJoystick extends Widget {
    constructor(label, returnCenter, callback) {
        super([0, 0], label, callback, 'joystick');
        this.returnCenter = returnCenter;
    }

    get value() {
        return this._state.value;
    }

    set value(v) {
        const x = Math.max(-1, Math.min(1, Number(v?.[0]) || 0));
        const y = Math.max(-1, Math.min(1, Number(v?.[1]) || 0));

        this._state.value = [x, y];
        if (this.$stick) {
            const radius = Math.max(0, (this.$input.clientWidth - this.$stick.offsetWidth) / 2);
            this.$stick.style.left = `calc(50% + ${x * radius}px)`;
            this.$stick.style.top = `calc(50% - ${y * radius}px)`;
        }
        if (this.$coords) this.$coords.textContent = `${x.toFixed(2)}, ${y.toFixed(2)}`;
    }

    // round
    // set value(v) {
    //     let x = Math.max(-1, Math.min(1, Number(v?.[0]) || 0));
    //     let y = Math.max(-1, Math.min(1, Number(v?.[1]) || 0));
    //     const len = Math.hypot(x, y);
    //     if (len > 1) {
    //         x /= len;
    //         y /= len;
    //     }

    //     this._state.value = [x, y];
    //     if (this.$stick) {
    //         const radius = (this.$input.clientWidth - this.$stick.offsetWidth) / 2;
    //         this.$stick.style.left = `calc(50% + ${x * radius}px)`;
    //         this.$stick.style.top = `calc(50% - ${y * radius}px)`;
    //     }
    //     if (this.$coords) this.$coords.textContent = `${x.toFixed(2)}, ${y.toFixed(2)}`;
    // }

    default() {
        this.value = [0, 0];
    }
}
class WidgetProgress extends Widget {
    constructor(value, label, min, max) {
        super(0, label, null, 'progress');
        this.min = Math.min(min, max);
        this.max = Math.max(min, max);
        this.value = value;
        this._default = this.value;
    }

    get value() {
        return this._state.value;
    }

    set value(v) {
        v = Math.max(this.min, Math.min(this.max, _num(v)));
        this._state.value = v;

        const percent = this.max === this.min ? 0 : (v - this.min) / (this.max - this.min) * 100;
        if (this.$fill) this.$fill.style.width = `${percent}%`;
        if (this.$value) this.$value.textContent = String(v);
    }

    default() {
        this.value = this._default;
    }
}
class WidgetGroup extends Widget {
    constructor(ui, label, expanded = true) {
        super(null, label, null, 'group');
        this._ui = ui;
        this.ids = new Set();
        this.nodes = [];
        this._state.addStates({ expanded: Boolean(expanded) });
    }

    get expanded() {
        return this._state.expanded;
    }

    set expanded(v) {
        this._state.expanded = Boolean(v);

        for (const id of this.ids) {
            const w = this._ui.widget(id);
            if (w) w._state.groupHidden = !this.expanded;
        }

        for (const node of this.nodes) node.style.display = this.expanded ? '' : 'none';
    }

    open() {
        this.expanded = true;
    }

    close() {
        this.expanded = false;
    }

    toggle() {
        this.expanded = !this.expanded;
    }
}

// MARK: UI
export default class UI {
    /**
     * @param {object} cfg {x, y, width {number px | string px/%}, parent, title, zIndex, autoVar, class, theme {'dark' | 'light' | 'dark noback' | 'light noback'}}
     * @returns {UI}
     */
    constructor(cfg = {}) {
        addCSS(UI.css);

        let def = { width: '200px', parent: document.body, title: '', zIndex: 3, theme: 'light', autoVar: true, class: '', debounce: 30 };
        cfg = { ...def, ...cfg };

        const toPx = p => (p == null) ? 0 : ((typeof p == 'string') ? p : (p + 'px'));

        let style = {};

        if (cfg.x != null || cfg.y != null) {
            style.left = toPx(cfg.x);
            style.top = toPx(cfg.y);
            style.position = 'absolute';
        }

        this._callbackEmitter = new DeferredEmitter(cfg.debounce);

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

    // MARK: methods

    /**
     * 'dark' | 'light' | 'dark noback' | 'light noback'
     * @returns {UI}
     */
    setTheme(theme) {
        this.$ui.className = `ui_main theme-${theme} ${this._class}`;
        return this;
    }

    /**
     * Set position in widget list to append new. Call before .addXxxx. Set to null to add in end
     * @param {*} index 
     * @returns {UI}
     */
    setCursor(index) {
        this._before = index;
        return this;
    }

    /**
     * Reset position in widget list to append new
     * @param {*} index 
     * @returns {UI}
     */
    resetCursor() {
        this._before = null;
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
    toObject(ids = null) {
        let obj = {};
        (Array.isArray(ids) ? ids : Array.from(this._widgets.keys())).forEach(id => {
            if (this._widgets.has(id)) {
                obj[id] = this.widget(id).value;
                let t = this.widget(id).valueText;
                if (t) obj[id + 'Text'] = t;
                let i = this.widget(id).valueInt;
                if (i != null && !Number.isNaN(i)) obj[id + 'Int'] = i;
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
        try {
            this.fromObject(JSON.parse(json));
        } catch (e) {
            console.warn('UI.fromJson: invalid JSON', e);
        }
    }

    // amount of widgets
    count() {
        return this._widgets.size;
    }

    /**
     * Get widget object
     * @param {string|Number} idOrIndex 
     * @returns {ControlInput}
     */
    widget(idOrIndex) {
        return this._widgets.get(this._ID(idOrIndex));
    }

    /**
     * Get widget objects
     * @param {Array string|Number} idOrIndex 
     * @returns {ControlInput}
     */
    widgets(idsOrIndexs) {
        return idsOrIndexs.map(id => this._widgets.get(this._ID(id)));
    }
    // legacy
    getWidget = this.widget;
    control = this.widget;

    /**
     * Get widget value
     * @param {string|Number} idOrIndex 
     */
    get(idOrIndex) {
        const widget = this.widget(idOrIndex);
        return widget ? widget.value : null;
    }

    /**
     * Set widget value
     * @param {string|Number} idOrIndex 
     * @param {*} value 
     */
    set(idOrIndex, value) {
        const widget = this.widget(idOrIndex);
        if (widget) widget.value = value;
        return value;
    }

    /**
     * Remove widget
     * @param {string|number|Array<string|number>} ids id | index | [id/index]
     */
    remove(ids) {
        if (!Array.isArray(ids)) ids = [ids];

        for (let idOrIndex of ids) {
            const id = this._ID(idOrIndex);
            if (!this._widgets.has(id)) continue;

            const w = this.widget(id);

            if (w instanceof WidgetGroup) {
                for (const childId of [...w.ids]) this.remove(childId);
                for (const node of w.nodes) node.remove();
                if (this._group === w) this._group = null;
            } else {
                w._group?.ids.delete(id);
            }

            w.remove();
            this._widgets.delete(id);

            delete this[id];
            delete this[id + 'Text'];
            delete this[id + 'Int'];
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

    // MARK: group

    /**
     * @param {string} id
     * @param {string} label
     * @param {boolean} expanded
     * @returns {UI}
     */
    beginGroup(id, label, expanded = false) {
        if (this._group) throw new Error('UI.beginGroup: nested groups are not supported');

        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new WidgetGroup(this, label, expanded);

        EL.make('div', this._getWidget(w, {
            class: 'ui_group_head',
            onClick: () => w.toggle(),
            child: [
                { tag: 'b', text: w._state.bind('label') },
                {
                    tag: 'span',
                    class: {
                        _raw: 'ui_group_chevron',
                        expanded: w._state.bind('expanded')
                    }
                }
            ]
        }, 'ui_widget ui_group'));

        this._widgets.set(id, w);
        this._group = w;

        return this;
    }

    endGroup() {
        if (!this._group) return this;

        const w = this._group;
        const space = EL.make('div', {
            class: 'ui_group_space',
            parent: this.$widgets,
            insertBefore: this._before,
        });

        w.nodes.push(space);
        space.style.display = w.expanded ? '' : 'none';
        this._group = null;

        return this;
    }

    /**
     * @param {string} id
     * @param {string} label
     * @param {function} callback
     * @param {boolean} expanded
     * @returns {UI}
     */
    addGroup(id, label, callback, expanded = false) {
        this.beginGroup(id, label, expanded);
        try {
            if (callback) callback(this);
        } finally {
            this.endGroup();
        }
        return this;
    }

    // MARK: addSwitch
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

        const w = new Widget(Boolean(value), label, callback, 'switch');

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

        this._registerWidget(id, w);
        this._addSetGet(id);
        return this;
    }

    // MARK: addNumber

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

        const w = new Widget(_num(value), label, callback, 'number');

        EL.make('div', this._getContainer(w, {
            tag: 'input',
            type: 'number',
            $: 'input',
            class: 'ui_input_base ui_input',
            step: (step ?? 1),
            value: w._state.bind('value'),
            onInput: this._handleValue(w, id, el => _numInput(el.value), callback),
            onWheel: (e) => {
                if (!this._wheel) e.target.blur();
            }
        }));

        this._registerWidget(id, w);
        this._addSetGet(id);
        return this;
    }

    // MARK: addText

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

        const w = new Widget(_str(value), label, callback, 'text');

        EL.make('div', this._getContainer(w, {
            tag: 'input',
            type: 'text',
            $: 'input',
            class: 'ui_input_base ui_input',
            value: w._state.bind('value'),
            onInput: this._handleValue(w, id, el => _str(el.value), callback),
        }));

        this._registerWidget(id, w);
        this._addSetGet(id);
        return this;
    }
    addInput = (...args) => this.addText(...args);

    // MARK: addSlider

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

        const w = new Widget(_num(value), label, callback, 'slider');

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
                onWheel: (e) => {
                    if (!this._wheel || document.activeElement != e.target) {
                        e.target.blur();
                        return;
                    }
                    e.stopPropagation();
                    e.preventDefault();
                    e.el.value = e.el.valueAsNumber + Number(e.el.step) * (e.deltaY > 0 ? -1 : 1);
                    e.el.dispatchEvent(new Event('input'));
                },
                onDblclick: (e) => {
                    w.default();
                    e.el.dispatchEvent(new Event('input'));
                }
            }
        }, true));

        this._registerWidget(id, w);
        this._addSetGet(id);
        return this;
    }
    addRange = (...args) => this.addSlider(...args);

    // MARK: addProgress

    /**
     * @param {string} id
     * @param {string} label
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {UI}
     */
    addProgress(id, label, value = 0, min = 0, max = 100) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new WidgetProgress(value, label, min, max);

        EL.make('div', this._getWidget(w, [
            {
                class: 'ui_progress_label',
                child: [
                    { tag: 'b', text: w._state.bind('label') },
                    { tag: 'span', $: 'value' }
                ]
            },
            {
                class: 'ui_progress',
                child: {
                    class: 'ui_progress_fill',
                    $: 'fill'
                }
            }
        ]));

        w.value = value;
        this._registerWidget(id, w);
        this._addSetGet(id);
        return this;
    }

    // MARK: addJoystick

    /**
     * @param {string} id
     * @param {string} label
     * @param {boolean} returnCenter
     * @param {function} callback
     * @returns {UI}
     */
    addJoystick(id, label, returnCenter = true, callback) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new WidgetJoystick(label, returnCenter, callback);
        let activePointer = null;

        const update = e => {
            const r = w.$input.getBoundingClientRect();
            const radius = Math.max(1, (r.width - w.$stick.offsetWidth) / 2);
            const x = (e.clientX - r.left - r.width / 2) / radius;
            const y = -(e.clientY - r.top - r.height / 2) / radius;

            w.value = [x, y];
            this._emitChange(id, w.value, callback);
        };

        // round
        // const update = e => {
        //     const r = w.$input.getBoundingClientRect();
        //     const radius = (r.width - w.$stick.offsetWidth) / 2;
        //     const x = (e.clientX - r.left - r.width / 2) / radius;
        //     const y = -(e.clientY - r.top - r.height / 2) / radius;

        //     w.value = [x, y];
        //     this._emitChange(id, w.value, callback);
        // };

        const release = e => {
            if (e.pointerId !== activePointer) return;
            activePointer = null;

            if (w.returnCenter) {
                w.value = [0, 0];
                this._emitChange(id, w.value, callback);
            }

            if (w.$input.hasPointerCapture(e.pointerId)) w.$input.releasePointerCapture(e.pointerId);
        };

        EL.make('div', this._getWidget(w, [
            {
                class: 'ui_label',
                child: [
                    { tag: 'b', text: w._state.bind('label') },
                    { tag: 'span', text: ': ' },
                    { tag: 'span', $: 'coords', text: '0.00, 0.00' }
                ]
            },
            {
                class: 'ui_joystick',
                $: 'input',
                onPointerdown: e => {
                    if (activePointer !== null || e.button !== 0) return;
                    e.preventDefault();
                    activePointer = e.pointerId;
                    e.el.setPointerCapture(e.pointerId);
                    update(e);
                },
                onPointermove: e => {
                    if (e.pointerId === activePointer) update(e);
                },
                onPointerup: release,
                onPointercancel: release,
                onLostpointercapture: release,
                onDblclick: (e) => {
                    e.preventDefault();
                    w.default();
                    this._emitChange(id, w.value, callback);
                },
                child: {
                    class: 'ui_joystick_stick',
                    $: 'stick'
                }
            }
        ]));

        this._registerWidget(id, w);
        this._addSetGet(id);
        return this;
    }
    addJoy = (...args) => this.addJoystick(...args);

    // MARK: addArea

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

        const w = new Widget(_str(value), label, callback, 'area');

        EL.make('div', this._getContainer(w, {
            tag: 'textarea',
            $: 'input',
            class: 'ui_input_base ui_textarea',
            rows: rows,
            value: w._state.bind('value'),
            onInput: this._handleValue(w, id, el => _str(el.value), callback),
        }));

        this._registerWidget(id, w);
        this._addSetGet(id);
        return this;
    }

    // MARK: addHTML

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {string} value 
     * @returns {UI}
     */
    addHTML(id, label, value) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(_str(value), label, null, 'html');

        EL.make('div', this._getContainer(w, {
            $: 'input',
            html: w._state.bind('value'),
        }));

        this._registerWidget(id, w);
        this._addSetGet(id);
        return this;
    }

    // MARK: addElement

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {HTMLElement} value 
     * @returns {UI}
     */
    addElement(id, label, value) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(value, label, null, 'element');

        EL.make('div', this._getContainer(w, {
            $: 'input',
            child_r: w._state.bind('value'),
        }));

        this._registerWidget(id, w);
        this._addSetGet(id);
        return this;
    }

    // MARK: addSelect

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {array} value 
     * @param {function} callback (val, text)
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
            onWheel: (e) => {
                if (!this._wheel || document.activeElement != e.target) {
                    e.target.blur();
                    return;
                }
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

        this._registerWidget(id, w);
        if (this._addSetGet(id)) {
            Object.defineProperty(this, id + 'Text', {
                get: () => this.widget(id).valueText,
                configurable: true,
            });
        }
        return this;
    }

    // MARK: addButton

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {function} callback 
     * @returns {UI}
     */
    addButton(id, label, callback) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(0, label, callback, 'button');

        EL.make('div', this._getWidget(w, this._getButton(w, id, callback), 'ui_button_cont'));

        this._registerWidget(id, w);
        return this;
    }

    // MARK: addButtons

    /**
     * @param {object} buttons {id: [label, callback]}
     * @returns {UI}
     */
    addButtons(buttons) {
        let container = EL.make('div', {
            class: 'ui_button_cont',
            parent: this.$widgets,
            insertBefore: this._before,
        });

        EL.update(container, {
            child: Object.entries(buttons).map(([id, btn]) => {
                id = this._checkID(id);
                if (this._widgets.has(id)) return;

                if (!Array.isArray(btn)) btn = [btn, null];
                let [label, cb] = btn;

                const w = new Widget(0, label, cb, 'button');
                w.$container = container;
                this._registerWidget(id, w);
                return this._getButton(w, id, cb);
            })
        });
        return this;
    }

    // MARK: addFile

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
                attrs: { multiple: true },
                onChange: () => {
                    process(w, w.$input.files, callback);
                    w.$input.value = '';
                },
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

        this._registerWidget(id, w);
        this._addSetGet(id);
        return this;
    }

    // MARK: addColor

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

        const w = new WidgetColor(_color(value), label);

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

        this._registerWidget(id, w);
        if (this._addSetGet(id)) {
            Object.defineProperty(this, id + 'Int', {
                get: () => this.widget(id).valueInt,
                set: (val) => this.widget(id).valueInt = val,
                configurable: true,
            });
        }
        return this;
    }

    // MARK: addLabel

    /**
     * @param {string} id 
     * @param {string} label 
     * @param {string} value 
     * @returns {UI}
     */
    addLabel(id, label, value) {
        id = this._checkID(id);
        if (this._widgets.has(id)) return this;

        const w = new Widget(_str(value), label, null, 'label');

        EL.make('div', this._getContainer(w, null, true));

        this._registerWidget(id, w);
        this._addSetGet(id);
        return this;
    }

    // MARK: addSpace

    addSpace(height = 5) {
        const el = EL.make('div', {
            style: `height: ${height}px`,
            parent: this.$widgets,
            insertBefore: this._before,
        });

        if (this._group) {
            this._group.nodes.push(el);
            if (!this._group.expanded) el.style.display = 'none';
        }

        return this;
    }

    // MARK: system
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
        return id ? id : '_noid_' + this._count++;
    }
    _ID(idOrIndex) {
        if (typeof idOrIndex === 'number') {
            if (idOrIndex < 0) idOrIndex += this._widgets.size;
            return [...this._widgets.keys()][idOrIndex];
        }
        return idOrIndex;
    }

    _registerWidget(id, w) {
        this._widgets.set(id, w);

        if (this._group) {
            this._group.ids.add(id);
            w._group = this._group;
            w._state.groupHidden = !this._group.expanded;
        }
    }

    _getWidget = (w, content, cls = 'ui_widget') => ({
        ctx: w,
        $: 'container',
        class: {
            _raw: cls,
            hidden: w._state.bind('hidden'),
            group_hidden: w._state.bind('groupHidden'),
        },
        parent: this.$widgets,
        insertBefore: this._before,
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

    _emitChange(id, v, cb, extra = []) {
        this._callbackEmitter.emit(() => {
            this._cb(id, v, ...extra);
            if (cb) cb(v, ...extra);
        });
    }

    _handleValue(w, id, map, cb) {
        return (e) => {
            const v = map(e.el);
            if (e.el.type !== 'checkbox' && e.el.value != v) {
                e.el.value = v;
            }
            w._state.value = v;
            this._emitChange(id, v, cb);
        };
    }

    _wheel = true;
    _widgets = new Map();
    _before = null;
    _count = 0;

    _cb = () => { };

    // https://www.minifier.org/
    static css = `.ui_main.theme-light{--border:#aaa;--back:#fff;--mid:#ccc;--tab:#f0f0f0;--font:#000;--font-mid:#555;--thumb:var(--back);--range_f:var(--mid);--joy_s:var(--mid)}.ui_main.theme-dark{--border:#4d5359;--back:#1e232a;--mid:#22272E;--tab:#2D333B;--font:#ccc;--font-mid:#999;--thumb:var(--font-mid);--range_f:#676e75;--joy_s:var(--thumb)}.ui_main{background-color:var(--mid);text-align:left;font:12px sans-serif;user-select:none;border:none;border-radius:6px}.ui_main.noback{background:none}.ui_main.noback .ui_widget{border:1px solid var(--mid);margin:5px 0}.ui_main.noback .ui_title_bar{display:none}.ui_main.noback .ui_button_cont{margin:5px 0}.ui_main.noback .ui_button{border:1px solid var(--mid)}.ui_content{overflow-y:auto;border-radius:6px}.ui_title_bar{text-align:center;font-weight:700;border:none;background:var(--tab);color:var(--font);font-size:15px;border-radius:5px 5px 0 0}.ui_title_bar:not(:empty){padding:4px}.ui_widget{margin:5px;padding:5px;border:none;position:relative;background:var(--tab);color:var(--font);border-radius:5px}.ui_widget.hidden{display:none}.ui_range_cont{display:flex;align-items:center;padding:10px 0 6px 0}.ui_range{appearance:none;box-sizing:border-box;margin:0;padding:0;width:100%;height:2px;background:var(--border);cursor:pointer;touch-action:none}.ui_range:focus{background:var(--range_f)}.ui_range::-webkit-slider-thumb{appearance:none;background:var(--thumb);width:16px;height:16px;border-radius:50%;box-shadow:0 0 4px #0000005a}.ui_range::-moz-range-thumb{border:none;background:var(--thumb);width:16px;height:16px;border-radius:50%}.ui_button_cont{margin:5px;gap:5px;display:flex}.ui_button_cont.hidden{display:none}.ui_button{cursor:pointer;background:var(--tab);color:var(--font-mid);height:26px;border-radius:4px;width:100%;border:none}.ui_button:hover{filter:brightness(.96)}.ui_button:active{background:var(--back)}.ui_checkbox_cont{cursor:pointer;display:flex;align-items:center;justify-content:space-between}.ui_checkbox_cont label{font-weight:700;pointer-events:none}.ui_checkbox{display:inline-block}.ui_checkbox label{display:flex;align-items:center;cursor:pointer;user-select:none}.ui_checkbox input{display:none}.ui_checkbox span{width:18px;height:18px;border:1px solid var(--border);border-radius:4px;background-color:var(--back);position:relative}.ui_checkbox input:checked+span::after{content:"✓";position:absolute;left:3px;top:-2px;font-size:16px;color:var(--font);font-weight:700}.ui_label{user-select:none;-webkit-user-select:none;cursor:default}.ui_input_base{width:100%;box-sizing:border-box;background:var(--back);outline:none;color:var(--font-mid);border:1px solid var(--border);transition:border-color 0.1s;border-radius:4px;margin-top:4px}.ui_input_base:focus{border-color:var(--font-mid)}.ui_input{height:24px;padding:5px;line-height:24px}.ui_select{height:24px;padding:0 2px;cursor:pointer}.ui_textarea{resize:vertical;padding:3px 5px}.ui_textarea::-webkit-scrollbar{width:7px;height:7px}.ui_textarea::-webkit-scrollbar-track{background:none}.ui_textarea::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}.ui_file_chooser_label{padding:5px;height:24px;display:block;cursor:pointer;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.ui_file_chooser_label.active{border-color:var(--font-mid)}.ui_file_chooser{display:none}.ui_color_cont{display:flex;align-items:center;justify-content:space-between}.ui_color_cont .ui_label{margin:0}.ui_color{cursor:pointer;padding:0;margin:0;border:none;background:none;height:22px;width:22px}.ui_joystick{position:relative;display:block;width:min(100%, 140px);height:auto;aspect-ratio:1;box-sizing:border-box;margin:8px auto 4px;border:1px solid var(--border);border-radius:50%;background:var(--back);cursor:pointer;touch-action:none}.ui_joystick::before,.ui_joystick::after{content:'';position:absolute;background:var(--border);opacity:.4;pointer-events:none;z-index:0}.ui_joystick::before{width:1px;height:100%;left:50%}.ui_joystick::after{width:100%;height:1px;top:50%}.ui_joystick_stick{position:absolute;left:50%;top:50%;width:52px;height:52px;box-sizing:border-box;border-radius:50%;background:var(--joy_s);border:1px solid var(--border);transform:translate(-50%,-50%);pointer-events:none;z-index:1}.ui_progress_label{display:flex;align-items:center;justify-content:space-between;gap:5px}.ui_progress_label span{color:var(--font-mid);font-variant-numeric:tabular-nums}.ui_progress{height:8px;margin-top:6px;background:var(--back);border:1px solid var(--border);border-radius:4px;overflow:hidden}.ui_progress_fill{width:0;height:100%;background:var(--joy_s)}.ui_group{padding:0;cursor:pointer}.ui_group_head{display:flex;align-items:center;justify-content:space-between;padding:7px 8px;gap:8px;color:var(--font);user-select:none}.ui_group:hover{filter:brightness(.97)}.ui_group_chevron{width:7px;height:7px;flex-shrink:0;border-right:2px solid var(--font-mid);border-bottom:2px solid var(--font-mid);transform:rotate(-45deg);transition:transform 0.15s;margin-right:3px}.ui_group_chevron.expanded{transform:rotate(45deg)}.ui_group_space{height:5px}.ui_widget.group_hidden{display:none}`;
}

const _str = x => String(x ?? '');
const _getOptions = (arr) => (Array.isArray(arr) ? arr : []).map((x, i) => ({ tag: 'option', text: x, value: i }));
const _color = x => Number.isInteger(x) ? '#' + Math.max(0, Math.min(0xffffff, x)).toString(16).padStart(6, '0') : (x ?? '#000');

const _num = x => Number.isFinite(+x) ? +x : 0;
const _numInput = x => {
    if (x == null || x === '') return '';

    const v = String(x)
        .replace(',', '.')
        .replace(/^(-?)0+(\d)/, (_, sign, d) => d === '0' ? sign + '0' : sign + d);

    return Number.isFinite(+v) ? +v : '';
};