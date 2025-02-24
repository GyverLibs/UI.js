var e={d:(t,r)=>{for(var a in r)e.o(r,a)&&!e.o(t,a)&&Object.defineProperty(t,a,{enumerable:!0,get:r[a]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},t={};e.d(t,{A:()=>u});class r{static ctx;constructor(e,t={},a=!1){r.ctx=this,this.$root=r.make(e,t,a)}static make(e,t={},a=!1){return e&&"object"==typeof t?t instanceof Node?t:("svg"==e&&(a=!0),r.config(a?document.createElementNS("http://www.w3.org/2000/svg",e):document.createElement(e),t,a)):null}static config(e,t,a=!1){if(Array.isArray(e))return e.forEach((e=>r.config(e,t,a))),null;if(!(e instanceof Node)||"object"!=typeof t)return e;let n=t.context;r.ctx=null===n?null:n||r.ctx,n=r.ctx;let o=t=>{if(t)if(t instanceof Node)e.appendChild(t);else if(t instanceof r)e.appendChild(t.$root);else if("string"==typeof t)e.innerHTML+=t;else if("object"==typeof t){let n=r.make(t.tag??"div",t,a||"svg"==t.tag);n&&e.appendChild(n)}};for(const[r,a]of Object.entries(t))if(a)switch(r){case"tag":case"context":case"get":case"also":continue;case"text":e.textContent=a+"";break;case"html":e.innerHTML=a;break;case"class":(Array.isArray(a)?a:a.split(" ")).map((t=>t&&e.classList.add(t)));break;case"push":a.push(e);break;case"var":n&&(n["$"+a]=e);break;case"events":for(let t in a)e.addEventListener(t,a[t].bind(n));break;case"parent":a&&a.appendChild(e);break;case"attrs":for(let t in a)e.setAttribute(t,a[t]);break;case"props":for(let t in a)e[t]=a[t];break;case"child_r":e.replaceChildren();case"child":o(a);break;case"children_r":e.replaceChildren();case"children":for(const e of a)o(e);break;case"style":if("string"==typeof a)e.style.cssText+=a+";";else for(let t in a)e.style[t]=a[t];break;default:e[r]=a}return t.also&&n&&t.also.call(n,e),e}static makeArray(e,t=!1){return e&&Array.isArray(e)?e.map((e=>r.make(e.tag,e,t))):[]}static makeShadow(e,t={},a=null){if(!e||"object"!=typeof t)return null;let n=e instanceof Node?e:document.createElement(e);return n.attachShadow({mode:"open"}),r.config(n.shadowRoot,{context:t.context,children:[{tag:"style",textContent:a??""},t.child??{},...t.children??[]]}),delete t.children,delete t.child,r.config(n,t),n}}new Set,new Map;class a{_data;constructor(e){this._data=e}get label(){return this._data.$label.innerText}set label(e){return this._data.$label.innerText=e+""}get value(){return this._data.$control.value}set value(e){return this._data.$control.value=e+""}get input(){return this._data.$control}display(e){this._data.$container.style.display=e?"block":"none"}show(){this.display(1)}hide(){this.display(0)}remove(){this._data.$container.remove()}default(){this.value=this._data.default+"",this._data.$output&&(this._data.$output.innerText=this._data.default+"")}}class n extends a{constructor(e){super(e)}set value(e){return this._data.$output&&(this._data.$output.innerText=e+""),this._data.$control.value=e+""}get value(){return Number(this._data.$control.value)}}class o extends a{constructor(e){super(e)}get value(){return this._data.$control.checked}set value(e){return this._data.$control.checked=e}default(){this.value=this._data.default}}class i extends a{constructor(e){super(e)}get value(){return this._data.$control.innerHTML}set value(e){return this._data.$control.innerHTML=e+""}}class s extends a{constructor(e){super(e)}get value(){return this._data.$control.files[0]}set value(e){}}class c extends a{constructor(e){super(e)}set value(e){}get value(){return 1}}class l extends n{constructor(e){super(e)}set options(e){return this._data.$control.replaceChildren(...e.map(((e,t)=>r.make("option",{text:e,value:t+""}))))}}class d extends a{constructor(e){super(e)}set value(e){this._data.$control.innerText=e+""}get value(){return this._data.$control.innerText}}class u{constructor(e={}){return u.css&&(function(e){let t=document.createElement("style");t.innerText=e,document.head.appendChild(t)}(u.css),u.css=null),this.init(e)}init(e){return e&&"object"==typeof e?(this.autoVar=e.autoVar??!0,r.make("div",{class:"ui_main theme-"+(e.theme??"light"),style:{zIndex:e.zIndex??3,left:e.x??0,top:e.y??0,width:e.width?"string"==typeof e.width?e.width:e.width+"px":"200px",position:e.parent?"":"absolute"},parent:e.parent??document.body,children:[{class:"ui_title_bar",text:e.title??"UI"},{class:"ui_content",var:"content"}],var:"root",context:this}),this):this}setTheme(e){return this.$root.classList="ui_main theme-"+e,this}destroy(){this.$root&&(this.$root.remove(),this.$root=void 0,this.#e=new Map)}setLabels(e){for(let t in e)this.#e.has(t)&&(this.#e.get(t).label=e[t])}toObject(){let e={};return this.#e.forEach(((t,r)=>{!t.value||t instanceof c||(e[r]=t.value)})),e}toJson(){return JSON.stringify(this.toObject())}fromObject(e){for(let t in e)this.#e.has(t)&&(this.#e.get(t).value=e[t])}fromJson(e){this.fromObject(JSON.parse(e))}control(e){return this.#e.get(e)}get(e){if(this.#e.has(e))return this.#e.get(e).value}set(e,t){if(this.#e.has(e))return this.#e.get(e).value=t}remove(e){this.#e.has(e)&&(this.#e.get(e).remove(),this.#e.delete(e),Object.defineProperty(this,e,{get:void 0,set:void 0}))}addSwitch(e,t,a,n){let i={default:a=a??!1};return r.make("div",{context:i,var:"container",class:"ui_container",parent:this.$content,children:[{tag:"label",class:"ui_checkbox_label",text:t,var:"label"},{tag:"label",class:"ui_checkbox",children:[{tag:"input",type:"checkbox",checked:a,var:"control",also(e){n&&e.addEventListener("click",(()=>n(e.checked)))}},{tag:"span"}]}]}),e&&this.#e.set(e,new o(i)),this._addSetGet(e),this}addNumber(e,t,a,o,i){a=a??0;let s=this._makeContainer(t);return s.default=a,r.make("input",{parent:s.$container,context:s,type:"number",class:"ui_text_input ui_number",step:(o??1)+"",value:a+"",var:"control",also(e){e.addEventListener("input",(()=>{i&&i(Number(e.value))})),e.addEventListener("mousewheel",(e=>{}))}}),e&&this.#e.set(e,new n(s)),this._addSetGet(e),this}addText(e,t,n,o){n=n??"";let i=this._makeContainer(t);return i.default=n,r.make("input",{parent:i.$container,context:i,type:"text",class:"ui_text_input",value:n+"",var:"control",also(e){o&&e.addEventListener("input",(()=>o(e.value)))}}),e&&this.#e.set(e,new a(i)),this._addSetGet(e),this}addRange(e,t,a,o,i,s,c){a=a??0;let l=this._makeContainerOut(t,a);return l.default=a,r.make("input",{parent:l.$container,context:l,type:"range",class:"ui_range",value:a+"",min:(o??0)+"",max:(i??100)+"",step:(s??1)+"",var:"control",also(e){e.addEventListener("input",(()=>{c&&c(Number(e.value)),l.$output.innerText=e.value})),e.addEventListener("mousewheel",(t=>{t.stopPropagation(),t.preventDefault(),e.value=Number(e.value)+Number(e.step)*(t.deltaY>0?-1:1),e.dispatchEvent(new Event("input"))}))}}),e&&this.#e.set(e,new n(l)),this._addSetGet(e),this}addArea(e,t,n,o,i=5){n=n??"";let s=this._makeContainer(t);return s.default=n,r.make("textarea",{parent:s.$container,context:s,class:"ui_textarea",rows:i,value:n+"",var:"control",also(e){o&&e.addEventListener("input",(()=>o(e.value)))}}),e&&this.#e.set(e,new a(s)),this._addSetGet(e),this}addHTML(e,t,a){a=a??"";let n=this._makeContainer(t);return n.default=a,r.make("div",{parent:n.$container,context:n,html:a+"",var:"control"}),e&&this.#e.set(e,new i(n)),this._addSetGet(e),this}addElement(e,t,r){let a=this._makeContainer(t);return a.default=r,a.$control=r,a.$container.append(r),e&&this.#e.set(e,new i(a)),this._addSetGet(e),this}addSelect(e,t,a,n){a=a??[];let o=this._makeContainer(t);return o.default=0,r.make("select",{parent:o.$container,context:o,class:"ui_select",var:"control",also(e){n&&e.addEventListener("change",(()=>n(Number(e.value))))},children:a.map(((e,t)=>r.make("option",{text:e,value:t+""})))}),e&&this.#e.set(e,new l(o)),this._addSetGet(e),this}addButton(e,t,a){let n={};return r.make("div",{context:n,var:"container",class:"ui_container",parent:this.$content,children:[this._makeButton(n,e,t,a)]}),n.$label=n.$control,e&&this.#e.set(e,new c(n)),this}addButtons(e){let t=r.make("div",{var:"container",class:"ui_container",parent:this.$content});for(let r in e){let a={$container:t};t.append(this._makeButton(a,r,e[r][0],e[r][1])),a.$label=a.$control,r&&this.#e.set(r,new c(a))}return this}addFile(e,t,a){let n=this._makeContainer(t),o=e=>{a&&a(1==e.length?e[0]:e),n.$filename.innerText=e[0].name};return n.$container.append(...r.makeArray([{tag:"input",context:n,class:"ui_file_chooser",type:"file",var:"control",attrs:{multiple:!0},also(e){e.addEventListener("change",(()=>o(e.files)))}},{tag:"label",context:n,class:"ui_file_chooser_label",text:"...",var:"filename",also(e){e.addEventListener("click",(()=>n.$control.click())),e.addEventListener("drop",(e=>o(e.dataTransfer.files)))}}])),e&&this.#e.set(e,new s(n)),["dragenter","dragover","dragleave","drop"].forEach((e=>{this.$root.addEventListener(e,(e=>{e.preventDefault(),e.stopPropagation()}),!1)})),["dragenter","dragover"].forEach((e=>{this.$root.addEventListener(e,(function(){n.$filename.classList.add("active")}),!1)})),["dragleave","drop"].forEach((e=>{this.$root.addEventListener(e,(function(){n.$filename.classList.remove("active")}),!1)})),this._addSetGet(e),this}addColor(e,t,a,o){a=a??"#000";let i=this._makeContainerOut(t,a);return i.default=a,i.$container.append(r.make("input",{context:i,type:"color",class:"ui_color",value:a,var:"control",attrs:{"colorpick-eyedropper-active":!1},also(e){e.addEventListener("input",(()=>{o&&o(e.value),i.$output.innerText=e.value}))}})),e&&this.#e.set(e,new n(i)),this._addSetGet(e),this}addLabel(e,t,r){r=r??"";let a=this._makeContainerOut(t,r);return a.$control=a.$output,e&&this.#e.set(e,new d(a)),this._addSetGet(e),this}addSpace(){return r.make("div",{class:"ui_space",parent:this.$content}),this}_addSetGet(e){this.autoVar&&e&&Object.defineProperty(this,e,{get:()=>this.get(e),set:t=>this.set(e,t),configurable:!0})}_checkID(e){return e||"_empty_"+this.#t++}_makeButton(e,t,a,n){return r.make("button",{context:e,class:"ui_button",var:"control",text:a+"",also(e){n&&e.addEventListener("click",(()=>n(1)))}})}_makeContainer(e){let t={};return r.make("div",{context:t,var:"container",class:"ui_container",parent:this.$content,children:[{class:"ui_label",children:[{tag:"b",var:"label",text:e}]}]}),t}_makeContainerOut(e,t){let a={};return r.make("div",{context:a,var:"container",class:"ui_container",parent:this.$content,children:[{class:"ui_label",children:[{tag:"b",text:e,var:"label"},{tag:"span",text:": "},{tag:"span",text:t+"",var:"output"}]}]}),a}#e=new Map;#t=0;static css=".ui_main.theme-light{--border:#aaa;--back:#fff;--mid:#ccc;--bright:#eee;--font:#000;--font-mid:#555}.ui_main.theme-dark{--border:#444c56;--back:rgb(30, 35, 42);--mid:#22272E;--bright:#2D333B;--font:#ccc;--font-mid:#999}.ui_main{background-color:var(--mid);text-align:left;font:12px sans-serif;box-shadow:5px 5px 8px rgb(0 0 0 / .35);user-select:none;-webkit-user-select:none;border:none}.ui_content{background:var(--mid);overflow-y:auto}.ui_title_bar{user-select:none;-webkit-user-select:none;padding:5px;font-weight:700;border:none;background:var(--bright);color:var(--font)}.ui_container{margin:5px;padding:5px;border:none;position:relative;background:var(--bright);color:var(--font)}.ui_space{height:1px}.ui_range{-webkit-appearance:none;-moz-appearance:none;width:100%;height:17px;padding:0;margin:0;background-color:#fff0;border:none;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.ui_range:focus{outline:none;border:none}.ui_range::-webkit-slider-runnable-track{width:100%;height:15px;cursor:pointer;background:var(--back);-webkit-border-radius:0;-moz-border-radius:0;border-radius:0}.ui_range:focus::-webkit-slider-runnable-track{background:var(--back)}.ui_range::-webkit-slider-thumb{-webkit-appearance:none;height:15px;width:15px;-webkit-border-radius:0;-moz-border-radius:0;border-radius:0;background:var(--border);cursor:pointer;margin-top:0}.ui_range::-moz-range-track{width:100%;height:15px;cursor:pointer;background:var(--back);-webkit-border-radius:0;-moz-border-radius:0;border-radius:0}.ui_range::-moz-range-thumb{height:15px;width:15px;border:none;-webkit-border-radius:0;-moz-border-radius:0;border-radius:0;background:var(--border);cursor:pointer}.ui_button{cursor:pointer;background:var(--mid);color:var(--font-mid);height:26px;border:1px solid var(--border);font:12px sans-serif;margin:2px}.ui_button:active{background:var(--back)}.ui_checkbox{cursor:pointer;display:inline}.ui_checkbox input{position:absolute;left:-99999px}.ui_checkbox span{height:16px;width:100%;display:block;text-indent:20px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALklEQVQ4T2OcOXPmfwYKACPIgLS0NLKMmDVrFsOoAaNhMJoOGBioFwZkZUWoJgApdFaxjUM1YwAAAABJRU5ErkJggg==) no-repeat}.ui_checkbox input:checked+span{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAvElEQVQ4T63Tyw2EIBAA0OFKBxBL40wDRovAUACcKc1IB1zZDAkG18GYZTmSmafzgTnnMgwchoDWGlJKheGcP3JtnPceCqCUAmttSZznuYtgchsXQrgC+77DNE0kUpPbmBOoJaBOIVQylnqWgAAeKhDve/AN+EaklJBzhhgjWRoJVGTbNjiOowAIret6a+4jYIwpX8aDwLIs74C2D0IIYIyVP6Gm898m9kbVm85ljHUTf16k4VUefkwDrxk+zoUEwCt0GbUAAAAASUVORK5CYII=) no-repeat}.ui_checkbox_label{position:absolute;top:7px;left:30px;pointer-events:none}.ui_label{margin-bottom:3px;user-select:none;-webkit-user-select:none;cursor:default;font:12px sans-serif}.ui_text_input{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;width:100%;padding:0 0 0 5px;height:24px;font-size:12px;border:1px inset var(--border);background:var(--back);color:var(--font-mid);outline:none}.ui_select{background:var(--back);-webkit-appearance:none;-moz-appearance:none;appearance:none;color:var(--font-mid);width:100%;height:24px;border:1px solid var(--border);-webkit-border-radius:0;-moz-border-radius:0;border-radius:0;padding:0 5px;-moz-outline:none;font-size:14px;cursor:pointer}.ui_select option{font-size:14px}.ui_select:focus{outline:none}.ui_number{height:24px}.ui_textarea{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;resize:vertical;width:100%;padding:3px 5px;font-size:12px;border:1px inset var(--border);background:var(--back);color:var(--font-mid);outline:none}.ui_textarea::-webkit-scrollbar{width:7px;height:7px}.ui_textarea::-webkit-scrollbar-track{background:none}.ui_textarea::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}.ui_color{padding:0;margin:0;outline:none;cursor:pointer;background:none;border:none;height:30px;width:100%}.ui_file_chooser{position:absolute;left:-999999px}.ui_file_chooser_label{background:var(--back);color:var(--font);height:30px;border:1px solid var(--border);font:12px sans-serif;width:100%;display:block;cursor:pointer;padding:7px;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ui_file_chooser_label.active{border:2px solid var(--font)}"}var h=t.A;export{h as default};