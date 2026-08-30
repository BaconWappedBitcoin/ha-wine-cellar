/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$2=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t=>t,s$1=t$1.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$2=`lit$${Math.random().toFixed(9).slice(2)}$`,n$1="?"+o$2,r$2=`<${n$1}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$2:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$2+x):s+o$2+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$2),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$2)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$2),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n$1)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$2,t+1));)d.push({type:7,index:l}),t+=o$2.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$1.litHtmlPolyfillSupport;B?.(S,k),(t$1.litHtmlVersions??=[]).push("3.3.2");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=t=>(e,o)=>{ void 0!==o?o.addInitializer(()=>{customElements.define(t,e);}):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t,true,r);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t,true,r);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

const sharedStyles = i$3 `
  :host {
    --wc-primary: #722f37;
    --wc-primary-light: #9a4a54;
    --wc-primary-text: #c48b91;
    --wc-bg: var(--ha-card-background, var(--card-background-color, #fff));
    --wc-surface: var(--ha-card-background, var(--card-background-color, #fff));
    --wc-text: var(--primary-text-color, #212121);
    --wc-text-secondary: var(--secondary-text-color, #727272);
    --wc-border: var(--divider-color, #e0e0e0);
    --wc-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0, 0, 0, 0.1));
    --wc-hover: rgba(128, 128, 128, 0.12);
    font-family: var(--paper-font-body1_-_font-family, "Roboto", sans-serif);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 0;
    font-size: 1.2em;
    font-weight: 500;
    color: var(--wc-text);
  }

  .card-content {
    padding: 16px;
  }

  .stats-bar {
    display: flex;
    gap: 16px;
    padding: 8px 16px;
    font-size: 0.85em;
    color: var(--wc-text-secondary);
  }

  .stats-bar .stat {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .stats-bar .stat-value {
    font-weight: 600;
    color: var(--wc-text);
  }

  .tab-bar {
    display: flex;
    gap: 4px;
    padding: 8px 16px;
    overflow-x: auto;
    border-bottom: 1px solid var(--wc-border);
  }

  .tab {
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid var(--wc-border);
    background: transparent;
    color: var(--wc-text-secondary);
    cursor: pointer;
    white-space: nowrap;
    font-size: 0.85em;
    transition: all 0.2s;
  }

  .tab:hover {
    background: var(--wc-hover);
  }

  .tab.active {
    background: var(--wc-primary);
    color: #fff;
    border-color: var(--wc-primary);
  }

  .manage-racks-btn {
    margin-left: auto;
    border-color: transparent;
    color: var(--wc-primary-text);
    font-weight: 500;
    font-size: 0.8em;
    padding: 6px 12px;
  }

  .manage-racks-btn:hover {
    background: var(--wc-hover);
  }

  /* Sits right after .manage-racks-btn with the tab-bar's normal gap — no
     margin-left: auto of its own, or it would claim the remaining space and
     drift away from it instead of staying grouped together. */
  .settings-tab-btn {
    border-color: transparent;
    color: var(--wc-primary-text);
    font-weight: 500;
    font-size: 0.8em;
    padding: 6px 12px;
  }

  .settings-tab-btn:hover {
    background: var(--wc-hover);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 0.9em;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-primary {
    background: var(--wc-primary);
    color: #fff;
  }

  .btn-primary:hover {
    background: var(--wc-primary-light);
  }

  .btn-outline {
    background: transparent;
    color: var(--wc-text);
    border: 1px solid var(--wc-border);
  }

  .btn-outline:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .btn-icon {
    background: transparent;
    border: none;
    color: var(--wc-text-secondary);
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-icon:hover {
    background: var(--wc-hover);
  }

  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    animation: fadeIn 0.2s ease;
  }

  .dialog {
    background: var(--wc-bg);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
    max-width: 500px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
    /* user-select is inherited, so it crosses the Shadow DOM boundary from
       whatever wraps this card (e.g. Home Assistant's dashboard drag-reorder
       chrome) — re-declare it explicitly so dialog text stays selectable
       regardless of what the host page sets. */
    user-select: text;
    -webkit-user-select: text;
    -webkit-touch-callout: default;
  }

  .dialog-header {
    padding: 20px 20px 12px;
    font-size: 1.2em;
    font-weight: 500;
    border-bottom: 1px solid var(--wc-border);
  }

  .dialog-body {
    padding: 16px 20px;
  }

  .dialog-footer {
    padding: 12px 20px 20px;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    font-size: 0.85em;
    font-weight: 500;
    color: var(--wc-text-secondary);
    margin-bottom: 4px;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--wc-border);
    border-radius: 8px;
    font-size: 0.95em;
    background: var(--wc-bg);
    color: var(--wc-text);
    box-sizing: border-box;
  }

  .form-group textarea {
    min-height: 60px;
    resize: vertical;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* Phone: full-screen dialogs, compact forms */
  @media (max-width: 599px) {
    .dialog {
      width: 100%;
      max-width: 100%;
      max-height: 100vh;
      border-radius: 12px 12px 0 0;
      margin-top: auto;
    }
    .dialog-overlay {
      align-items: flex-end;
    }
    .dialog-header {
      padding: 16px 16px 10px;
      font-size: 1.1em;
    }
    .dialog-body {
      padding: 12px 16px;
    }
    .dialog-footer {
      padding: 10px 16px 16px;
    }
    .form-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    .tab-bar {
      padding: 6px 12px;
      gap: 3px;
    }
    .tab {
      padding: 5px 12px;
      font-size: 0.8em;
    }
    .depth-panel {
      width: 100% !important;
      border-radius: 0 !important;
    }
  }

  /* --- Depth Side Panel --- */
  .depth-panel-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
    animation: fadeIn 0.2s ease;
  }

  /* While dragging a wine out of the panel, let the backdrop pass drag/drop
     events through to the racks behind it instead of swallowing them. */
  .depth-panel-backdrop.drag-through {
    pointer-events: none;
  }

  .depth-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    background: var(--wc-bg);
    z-index: 100;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
  }

  .depth-panel.open {
    transform: translateX(0);
  }

  .depth-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--wc-border, #e0e0e0);
    flex-shrink: 0;
  }

  .depth-panel-title {
    font-weight: 600;
    font-size: 1em;
    color: var(--wc-text, #333);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .depth-panel-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .depth-panel-sort {
    background: none;
    border: 1px solid var(--wc-border, #ddd);
    border-radius: 12px;
    color: var(--wc-text-secondary, #888);
    cursor: pointer;
    font-size: 0.72em;
    padding: 4px 9px;
    white-space: nowrap;
  }

  .depth-panel-sort:hover:not(:disabled) {
    border-color: var(--wc-primary, #722f37);
    color: var(--wc-primary, #722f37);
  }

  .depth-panel-sort:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .depth-panel-confirm {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0 12px 8px;
    padding: 10px 12px;
    border: 1px solid #c98a00;
    border-radius: 8px;
    background: rgba(201, 138, 0, 0.08);
    font-size: 0.76em;
    color: var(--wc-text-secondary, #888);
    line-height: 1.4;
  }

  .depth-panel-confirm strong {
    color: var(--wc-text, #333);
  }

  .depth-panel-confirm-btns {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 2px;
  }

  .depth-panel-confirm-btns button {
    background: none;
    border: 1px solid var(--wc-border, #ddd);
    border-radius: 8px;
    color: var(--wc-text-secondary, #888);
    cursor: pointer;
    font-size: 1em;
    padding: 5px 12px;
  }

  .depth-panel-confirm-btns button.primary {
    background: var(--wc-primary, #722f37);
    border-color: var(--wc-primary, #722f37);
    color: #fff;
    font-weight: 600;
  }

  .depth-panel-rack {
    font-size: 0.78em;
    font-weight: 500;
    color: var(--wc-text-secondary, #888);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .depth-panel-subtitle {
    font-size: 0.8em;
    font-weight: 400;
    color: var(--wc-text-secondary, #888);
  }

  .depth-panel-close {
    background: none;
    border: none;
    font-size: 1.2em;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    color: var(--wc-text-secondary, #888);
  }

  .depth-panel-close:hover {
    background: var(--wc-hover);
  }

  .depth-panel-slots {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .depth-slot {
    position: relative;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }

  .depth-slot:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .depth-slot.drag-over {
    box-shadow: 0 0 0 2px rgba(66, 165, 245, 0.8);
    background: rgba(66, 165, 245, 0.15);
  }

  .depth-slot.highlight {
    box-shadow: 0 0 0 2px rgba(196, 139, 145, 0.9);
    animation: highlightPulse 1.2s ease-in-out 3;
  }

  @keyframes highlightPulse {
    0%, 100% { box-shadow: 0 0 0 2px rgba(196, 139, 145, 0.9); }
    50% { box-shadow: 0 0 0 5px rgba(196, 139, 145, 0.4); }
  }

  .depth-slot-delete {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8em;
    line-height: 1;
    color: var(--wc-text-secondary, #888);
    background: rgba(0, 0, 0, 0.06);
    z-index: 3;
  }

  .depth-slot-delete:hover {
    background: #c62828;
    color: #fff;
  }

  .depth-panel-add-box {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .depth-panel-add-box select {
    flex: 1;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid var(--wc-border, #ddd);
    background: var(--wc-bg);
    color: var(--wc-text, #333);
    font-size: 0.85em;
  }

  .depth-panel-add-box .depth-panel-grow {
    flex-shrink: 0;
    padding: 8px 14px;
    margin-top: 0;
  }

  .depth-slot-label {
    font-size: 0.7em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--wc-text-secondary, #888);
    padding: 0 4px 4px;
  }

  .depth-slot-wine {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--wc-bg);
    border: 1px solid var(--wc-border);
    border-radius: 10px;
  }

  .depth-slot-avatar {
    position: relative;
    flex-shrink: 0;
  }

  .depth-slot-thumb {
    width: 32px;
    height: 44px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .depth-slot-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .depth-slot-disposition {
    position: absolute;
    bottom: -3px;
    right: -4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    font-size: 8px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border: 1.5px solid var(--wc-bg, #fff);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    line-height: 1;
  }

  .depth-slot-disposition.drink {
    background: #2e7d32;
  }

  .depth-slot-disposition.hold {
    background: #1565c0;
  }

  .depth-slot-disposition.past {
    background: #c62828;
  }

  .depth-slot-info {
    flex: 1;
    min-width: 0;
  }

  .depth-slot-name {
    font-weight: 600;
    font-size: 0.88em;
    color: var(--wc-text, #333);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .depth-slot-meta {
    font-size: 0.78em;
    color: var(--wc-text-secondary, #888);
    margin-top: 2px;
  }

  .depth-slot-empty {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 12px;
    border: 2px dashed var(--wc-border, #ddd);
    border-radius: 10px;
    color: var(--wc-text-secondary, #aaa);
    font-size: 0.85em;
  }

  .depth-slot.empty:hover .depth-slot-empty {
    border-color: var(--wc-primary-text);
    color: var(--wc-primary-text);
  }

  .depth-slot-plus {
    font-size: 1.3em;
    font-weight: 300;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--wc-hover);
  }

  .depth-slot.empty:hover .depth-slot-plus {
    background: rgba(196, 139, 145, 0.2);
  }

  .depth-panel-grow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    margin-top: 4px;
    border-radius: 10px;
    border: 1px dashed var(--wc-border, #ddd);
    color: var(--wc-text-secondary, #888);
    cursor: pointer;
    font-size: 0.85em;
    font-weight: 600;
    transition: background 0.15s, color 0.15s;
  }

  .depth-panel-grow:hover {
    border-color: var(--wc-primary-text);
    color: var(--wc-primary-text);
  }
`;

const STORAGE_ROW_TYPE_LABELS = {
    bulk: "Bulk Bin",
    box: "Wine Box",
};
const BOX_SIZES = [1, 3, 6, 12, 24];
const REMOVAL_REASONS = [
    { id: "drank", label: "Drank" },
    { id: "gifted", label: "Gifted" },
    { id: "sold", label: "Sold" },
    { id: "broken", label: "Broken" },
    { id: "spoiled", label: "Spoiled" },
    { id: "other", label: "Other" },
];
const WINE_TYPE_COLORS = {
    red: "#722F37",
    white: "#F5E6CA",
    rosé: "#E8A0BF",
    sparkling: "#D4E09B",
    dessert: "#DAA520",
};
const WINE_TYPE_LABELS = {
    red: "Red",
    white: "White",
    rosé: "Rosé",
    sparkling: "Sparkling",
    dessert: "Dessert",
};
// Every physical (row, col) grid slot in a cabinet, in display order,
// skipping rows configured as bulk/box storage zones.
function getRackSlots(cabinet) {
    const storageRowSet = new Set((cabinet.storage_rows || []).map((sr) => sr.row));
    const slots = [];
    for (let r = 0; r < cabinet.rows; r++) {
        if (storageRowSet.has(r))
            continue;
        for (let c = 0; c < cabinet.cols; c++)
            slots.push({ row: r, col: c });
    }
    return slots;
}
// A precise, human-readable location for a wine: cabinet name, plus the
// zone name and slot number when it's in a bulk bin or wine box, or the
// rack's linear slot number when it's in a grid cell.
function getWineLocation(wine, cabinets) {
    const cabinet = wine.cabinet_id ? cabinets.find((c) => c.id === wine.cabinet_id) || null : null;
    if (!cabinet)
        return { text: "Unassigned", cabinet: null, zone: "", storageRow: null };
    if (wine.row !== null && wine.col !== null) {
        const slotIdx = getRackSlots(cabinet).findIndex((s) => s.row === wine.row && s.col === wine.col);
        const slotLabel = slotIdx >= 0 ? `Slot ${slotIdx + 1}` : `R${wine.row + 1}C${wine.col + 1}`;
        return { text: `${cabinet.name} · ${slotLabel}`, cabinet, zone: "", storageRow: null };
    }
    if (wine.zone && wine.zone !== "bottom") {
        const rowIdx = parseInt(wine.zone.replace("storage-", ""), 10);
        const storageRow = (cabinet.storage_rows || []).find((sr) => sr.row === rowIdx) || null;
        const zoneName = storageRow?.name || "Storage";
        return { text: `${cabinet.name} · ${zoneName} · Slot ${(wine.depth || 0) + 1}`, cabinet, zone: wine.zone, storageRow };
    }
    if (wine.zone === "bottom") {
        return { text: `${cabinet.name} · ${cabinet.bottom_zone_name || "Storage"}`, cabinet, zone: "bottom", storageRow: null };
    }
    return { text: cabinet.name, cabinet, zone: "", storageRow: null };
}

// Shared search / filter / sort helpers.
//
// The card and the inventory dialog used to carry two separate, silently
// diverging search implementations (6 fields vs 11). Everything text-search
// related now lives here so a field only ever has to be added once.
// Accent-insensitive lowercase: "Côtes" and "cotes", "Rosé" and "rose" must
// match. Home Assistant users type without accents far more often than with.
function normalizeText(value) {
    if (value === null || value === undefined)
        return "";
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}
// Free-text search terms that map onto a disposition code rather than onto
// any stored text.
const DISPOSITION_TERMS = {
    drink: "D",
    "drink now": "D",
    hold: "H",
    past: "P",
    peak: "P",
    "past peak": "P",
    "past-peak": "P",
};
// Rebuilding the haystack for every wine on every keystroke is wasteful once
// a cellar gets large; wine objects are replaced wholesale on each reload, so
// a WeakMap keyed on the object stays correct without any invalidation.
const haystackCache = new WeakMap();
function buildHaystack(wine, extra) {
    const tn = wine.tasting_notes;
    const parts = [
        wine.name,
        wine.winery,
        wine.region,
        wine.country,
        wine.grape_variety,
        wine.type,
        wine.vintage,
        wine.notes,
        wine.description,
        wine.food_pairings,
        wine.alcohol,
        wine.barcode,
        wine.drink_by,
        wine.drink_window,
        wine.purchase_date,
        tn?.aroma,
        tn?.taste,
        tn?.finish,
        tn?.overall,
        extra,
    ];
    return parts.map(normalizeText).filter(Boolean).join("\n");
}
function haystackFor(wine, extra) {
    const cached = haystackCache.get(wine);
    if (cached && cached.extra === extra)
        return cached.text;
    const text = buildHaystack(wine, extra);
    haystackCache.set(wine, { extra, text });
    return text;
}
// The cabinet name is searchable too ("kitchen" finds everything stored
// there), which means it has to be resolved before matching.
function cabinetNameFor(wine, cabinets) {
    if (!wine.cabinet_id)
        return "";
    return cabinets.find((c) => c.id === wine.cabinet_id)?.name || "";
}
// Every whitespace-separated token must match somewhere, so "bordeaux 2015"
// finally works — the old single-blob `includes` could never match a query
// spanning two different fields.
function matchesQuery(wine, query, cabinets = []) {
    const normalized = normalizeText(query).trim();
    if (!normalized)
        return true;
    const fullCode = DISPOSITION_TERMS[normalized];
    if (fullCode && wine.disposition === fullCode)
        return true;
    const haystack = haystackFor(wine, normalizeText(cabinetNameFor(wine, cabinets)));
    const tokens = normalized.split(/\s+/).filter(Boolean);
    return tokens.every((token) => {
        if (haystack.includes(token))
            return true;
        const code = DISPOSITION_TERMS[token];
        return !!code && wine.disposition === code;
    });
}
// ── Drink-by ───────────────────────────────────────────────────────────
// `drink_by` is a free-text year ("2028", "drink by 2030") and `drink_window`
// a range ("2025-2028"); both come from the AI, so parse defensively and fall
// back to the end of the window when no explicit year was stored.
function drinkByYear(wine) {
    const explicit = String(wine.drink_by || "").match(/\d{4}/);
    if (explicit)
        return parseInt(explicit[0], 10);
    const windowYears = String(wine.drink_window || "").match(/\d{4}/g);
    if (windowYears && windowYears.length) {
        return parseInt(windowYears[windowYears.length - 1], 10);
    }
    return null;
}
// Wines with no drink-by data sort to the bottom in *both* directions —
// otherwise an ascending sort buries the urgent bottles under every wine
// that was never analyzed.
function compareNullable(a, b, dir, cmp) {
    if (a === null && b === null)
        return 0;
    if (a === null)
        return 1;
    if (b === null)
        return -1;
    return dir * cmp(a, b);
}
// ── Facets ─────────────────────────────────────────────────────────────
// Comma-separated fields (grape varieties, food pairings) are exploded into
// individual values so the filter menus only ever offer what the cellar
// actually contains.
function splitMulti(value) {
    return (value || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
}
function collectFacet(wines, pick) {
    const seen = new Map();
    for (const wine of wines) {
        for (const value of pick(wine)) {
            const key = normalizeText(value);
            if (key && !seen.has(key))
                seen.set(key, value);
        }
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

// A bin's real capacity: for a box row the sum of its boxes, otherwise the
// row's own capacity.
function zoneCapacity(sr) {
    return sr.type === "box"
        ? (sr.boxes || []).reduce((sum, b) => sum + b, 0) || sr.capacity || 0
        : sr.capacity || 0;
}
function storageRowFor(cabinet, zone) {
    if (!cabinet || !zone || zone === "bottom")
        return undefined;
    return (cabinet.storage_rows || []).find((sr) => `storage-${sr.row}` === zone);
}
function containerKey(c) {
    return `${c.cabinetId}|${c.zone}|${c.row ?? ""}|${c.col ?? ""}`;
}
function sameContainer(a, b) {
    return containerKey(a) === containerKey(b);
}
// The container a bottle currently sits in, or null when it is unassigned.
function containerOf(wine) {
    if (!wine.cabinet_id)
        return null;
    if (wine.zone === "bottom") {
        return { cabinetId: wine.cabinet_id, kind: "bottom", zone: "bottom", row: null, col: null };
    }
    if (wine.zone) {
        return { cabinetId: wine.cabinet_id, kind: "zone", zone: wine.zone, row: null, col: null };
    }
    if (wine.row !== null && wine.col !== null) {
        return { cabinetId: wine.cabinet_id, kind: "slot", zone: "", row: wine.row, col: wine.col };
    }
    return null;
}
function winesInContainer(c, wines) {
    return wines.filter((w) => {
        const wc = containerOf(w);
        return wc !== null && sameContainer(wc, c);
    });
}
function containerCapacity(c, cabinet) {
    if (!cabinet)
        return 0;
    if (c.kind === "bottom")
        return 0; // unlimited
    if (c.kind === "zone") {
        const sr = storageRowFor(cabinet, c.zone);
        return sr ? zoneCapacity(sr) : 0;
    }
    return cabinet.depth || 1;
}
function containerUsage(c, cabinet, wines) {
    const capacity = containerCapacity(c, cabinet);
    const occupied = new Set(winesInContainer(c, wines).map((w) => w.depth || 0));
    // First free slot rather than "one past the last": a bottle removed from the
    // middle leaves a gap that should be reused, not skipped over.
    let nextDepth = 0;
    while (occupied.has(nextDepth))
        nextDepth++;
    const unlimited = capacity <= 0;
    return {
        used: occupied.size,
        capacity,
        nextDepth,
        free: unlimited ? Infinity : Math.max(0, capacity - occupied.size),
        full: !unlimited && (occupied.size >= capacity || nextDepth >= capacity),
    };
}
// Human-readable name for the container itself — no slot number, since a
// container holds several bottles.
function containerLabel(c, cabinets) {
    const cabinet = cabinets.find((cab) => cab.id === c.cabinetId);
    if (!cabinet)
        return "Unassigned";
    if (c.kind === "bottom")
        return `${cabinet.name} · ${cabinet.bottom_zone_name || "Storage"}`;
    if (c.kind === "zone") {
        const sr = storageRowFor(cabinet, c.zone);
        return `${cabinet.name} · ${sr?.name || (sr?.type === "box" ? "Box" : "Bulk Bin")}`;
    }
    const idx = getRackSlots(cabinet).findIndex((s) => s.row === c.row && s.col === c.col);
    const slot = idx >= 0 ? `Slot ${idx + 1}` : `R${(c.row ?? 0) + 1}C${(c.col ?? 0) + 1}`;
    return `${cabinet.name} · ${slot}`;
}
// Every container in a cabinet, in the order the grid draws them: bins and
// boxes first, then the bottom zone, then the grid slots in reading order.
function containersOf(cabinet) {
    const out = [];
    for (const sr of cabinet.storage_rows || []) {
        out.push({ cabinetId: cabinet.id, kind: "zone", zone: `storage-${sr.row}`, row: null, col: null });
    }
    if (cabinet.has_bottom_zone) {
        out.push({ cabinetId: cabinet.id, kind: "bottom", zone: "bottom", row: null, col: null });
    }
    for (const s of getRackSlots(cabinet)) {
        out.push({ cabinetId: cabinet.id, kind: "slot", zone: "", row: s.row, col: s.col });
    }
    return out;
}
// The wine-shaped patch that puts a bottle into `c`, at its first free depth.
// Returns null when the container has no room left.
function placementIn(c, cabinet, wines) {
    const usage = containerUsage(c, cabinet, wines);
    if (usage.full)
        return null;
    return {
        cabinet_id: c.cabinetId,
        zone: c.zone,
        row: c.row,
        col: c.col,
        depth: usage.nextDepth,
    };
}
// Where each of `count` identical bottles would land, given a chosen
// destination. Returns fewer entries than asked when the destination runs out
// of room, so the caller can clamp rather than silently dropping bottles.
function planSlots(target, cabinets, wines, count) {
    const cabinet = cabinets.find((c) => c.id === target.cabinet_id);
    const unplaced = { row: null, col: null, zone: "", depth: 0 };
    // No rack chosen: the bottles go in unassigned, where nothing can clash.
    if (!cabinet)
        return Array.from({ length: count }, () => ({ ...unplaced }));
    const out = [];
    const placed = [];
    const known = () => [...wines, ...placed];
    const fill = (c) => {
        while (out.length < count) {
            const usage = containerUsage(c, cabinet, known());
            if (usage.full)
                break;
            out.push({ row: c.row, col: c.col, zone: c.zone, depth: usage.nextDepth });
            // Feed each placement back in so the next bottle sees the slot as taken.
            placed.push({
                cabinet_id: c.cabinetId,
                zone: c.zone,
                row: c.row,
                col: c.col,
                depth: usage.nextDepth,
            });
        }
    };
    if (target.zone) {
        const c = {
            cabinetId: cabinet.id,
            kind: target.zone === "bottom" ? "bottom" : "zone",
            zone: target.zone,
            row: null,
            col: null,
        };
        // An unlimited container would never stop filling; cap it at the request.
        if (c.kind === "zone" && !storageRowFor(cabinet, target.zone))
            return out;
        fill(c);
        return out;
    }
    // Grid: fill the chosen slot's depths first, then carry on through the
    // rack's remaining slots in reading order — a six-pack should not stop at
    // the first slot just because it only holds one bottle.
    const slots = getRackSlots(cabinet);
    const startIdx = Math.max(0, slots.findIndex((x) => x.row === target.row && x.col === target.col));
    const ordered = [...slots.slice(startIdx), ...slots.slice(0, startIdx)];
    for (const slot of ordered) {
        fill({ cabinetId: cabinet.id, kind: "slot", zone: "", row: slot.row, col: slot.col });
        if (out.length >= count)
            break;
    }
    return out;
}
// Free space at a chosen destination; Infinity when there is no limit.
function freeAt(target, cabinets, wines) {
    const cabinet = cabinets.find((c) => c.id === target.cabinet_id);
    if (!cabinet)
        return Infinity;
    if (target.zone) {
        const c = {
            cabinetId: cabinet.id,
            kind: target.zone === "bottom" ? "bottom" : "zone",
            zone: target.zone,
            row: null,
            col: null,
        };
        if (c.kind === "zone" && !storageRowFor(cabinet, target.zone))
            return 0;
        return containerUsage(c, cabinet, wines).free;
    }
    // No zone: everything still free across the cabinet's grid slots.
    const total = getRackSlots(cabinet).length * (cabinet.depth || 1);
    const used = wines.filter((w) => w.cabinet_id === cabinet.id && w.row !== null && w.col !== null).length;
    return Math.max(0, total - used);
}

const TIER_ORDER = ["same-wine", "same-winery", "same-family"];
const key = (value) => normalizeText(value).trim();
// Names are free text and a good half of them carry the vintage ("Sassicaia
// 2019") or a bottling note ("Margaux 2018 (Case #2)"). Comparing them raw
// would make "same wine, any vintage" almost never fire, which is the one
// tier the user actually cares about.
function cuveeKey(value) {
    return key(value)
        .replace(/\((?:[^()]*)\)/g, " ")
        .replace(/\b(?:19|20)\d{2}\b/g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}
function tierOf(draft, wine) {
    const dName = cuveeKey(draft.name);
    const dWinery = key(draft.winery);
    const wName = cuveeKey(wine.name);
    const wWinery = key(wine.winery);
    // Same wine, any vintage: the cuvée is what identifies it, not the year.
    // With no winery recorded on either side the name has to carry it alone.
    if (dName && dName === wName && (!dWinery || !wWinery || dWinery === wWinery))
        return "same-wine";
    if (dWinery && dWinery === wWinery)
        return "same-winery";
    const dRegion = key(draft.region);
    if (dRegion && dRegion === key(wine.region) && draft.type && draft.type === wine.type) {
        return "same-family";
    }
    return null;
}
function vintageList(wines) {
    const years = Array.from(new Set(wines.map((w) => w.vintage).filter((v) => typeof v === "number"))).sort((a, b) => a - b);
    return years.join(", ");
}
function reasonFor(tier, draft, matches) {
    const n = matches.length;
    const bottles = n === 1 ? "1 bottle" : `${n} bottles`;
    if (tier === "same-wine") {
        const years = vintageList(matches);
        const sameYear = matches.every((w) => w.vintage === draft.vintage);
        if (sameYear)
            return `${bottles} of this exact wine already here`;
        return years ? `${bottles} of this wine here (${years})` : `${bottles} of this wine already here`;
    }
    if (tier === "same-winery") {
        const winery = matches[0]?.winery || draft.winery || "this winery";
        return `${bottles} from ${winery} here`;
    }
    const first = matches[0];
    const region = first?.region || draft.region || "";
    const type = first ? WINE_TYPE_LABELS[first.type] || "" : "";
    return `${bottles} of ${[region, type].filter(Boolean).join(" ")} here`.replace(/\s+/g, " ");
}
// The best place to send the bottle instead, when the natural destination is
// full: somewhere in the same cabinet with room, preferring a container that
// already holds relatives, then simply the nearest one with space.
function alternativeFor(full, cabinet, wines, matchIds) {
    const all = containersOf(cabinet);
    const fullIdx = all.findIndex((c) => sameContainer(c, full));
    const scored = all
        .map((c, idx) => ({ c, idx, usage: containerUsage(c, cabinet, wines) }))
        .filter((x) => !sameContainer(x.c, full) && !x.usage.full)
        .map((x) => ({
        ...x,
        relatives: wines.filter((w) => {
            const wc = containerOf(w);
            return wc !== null && sameContainer(wc, x.c) && matchIds.has(w.id);
        }).length,
    }));
    if (!scored.length)
        return null;
    scored.sort((a, b) => b.relatives - a.relatives ||
        Math.abs(a.idx - fullIdx) - Math.abs(b.idx - fullIdx) ||
        b.usage.free - a.usage.free);
    const best = scored[0];
    return {
        container: best.c,
        label: containerLabel(best.c, [cabinet]),
        free: best.usage.free,
    };
}
// Ranked destinations for a bottle about to be added. Empty when the cellar
// holds nothing related — better to say nothing than to invent a reason.
function suggestDestinations(draft, wines, cabinets, limit = 3) {
    const byContainer = new Map();
    for (const wine of wines) {
        const container = containerOf(wine);
        if (!container)
            continue;
        // Never point at a bin the rack layout no longer knows about: bottles can
        // outlive a deleted storage row, but sending a new one there would be
        // sending it nowhere.
        const cabinet = cabinets.find((c) => c.id === container.cabinetId);
        if (!cabinet)
            continue;
        if (container.kind === "zone" && !storageRowFor(cabinet, container.zone))
            continue;
        if (container.kind === "bottom" && !cabinet.has_bottom_zone)
            continue;
        const tier = tierOf(draft, wine);
        if (!tier)
            continue;
        const k = `${containerKey(container)}::${tier}`;
        const entry = byContainer.get(k);
        if (entry)
            entry.matches.push(wine);
        else
            byContainer.set(k, { container, tier, matches: [wine] });
    }
    // A container reached through several tiers is only worth listing once, at
    // its most specific tier.
    const bestPerContainer = new Map();
    for (const entry of byContainer.values()) {
        const k = containerKey(entry.container);
        const current = bestPerContainer.get(k);
        if (!current || TIER_ORDER.indexOf(entry.tier) < TIER_ORDER.indexOf(current.tier)) {
            bestPerContainer.set(k, entry);
        }
    }
    const ranked = Array.from(bestPerContainer.values()).sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || b.matches.length - a.matches.length);
    return ranked.slice(0, limit).map((entry) => {
        const cabinet = cabinets.find((c) => c.id === entry.container.cabinetId);
        const usage = containerUsage(entry.container, cabinet, wines);
        const matchIds = new Set(entry.matches.map((w) => w.id));
        return {
            container: entry.container,
            label: containerLabel(entry.container, cabinets),
            usage,
            tier: entry.tier,
            reason: reasonFor(entry.tier, draft, entry.matches),
            matches: entry.matches,
            alternative: usage.full && cabinet ? alternativeFor(entry.container, cabinet, wines, matchIds) : null,
        };
    });
}

const MIN_GROUP_BOTTLES = 3;
const MIN_CONTAINER_BOTTLES = 4;
const DOMINANCE = 0.75;
const MAX_INTRUDERS = 2;
const groupKey = (w) => `${cuveeKey(w.name)}|${normalizeText(w.winery).trim()}`.replace(/^\||\|$/g, "");
// A bottle whose window is closing: explicitly marked drink/past, or carrying a
// drink-by year that has arrived.
function isDrinkSoon(wine) {
    const code = (wine.disposition || "").toUpperCase();
    if (code === "D" || code === "P")
        return true;
    const year = drinkByYear(wine);
    return year !== null && year <= new Date().getFullYear();
}
function isKeeper(wine) {
    return (wine.disposition || "").toUpperCase() === "H" && !isDrinkSoon(wine);
}
// Containers that actually exist in the current rack layout. Bottles can
// outlive a deleted storage row, but proposing a move into one would be
// proposing a move into nothing.
function liveContainers(cabinets) {
    const out = new Map();
    for (const cabinet of cabinets) {
        for (const container of containersOf(cabinet)) {
            out.set(containerKey(container), { container, cabinet });
        }
    }
    return out;
}
function placedWines(wines, live) {
    return wines
        .map((wine) => ({ wine, container: containerOf(wine) }))
        .filter((x) => x.container !== null && live.has(containerKey(x.container)));
}
function dominantType(bottles) {
    const counts = new Map();
    for (const w of bottles)
        counts.set(w.type, (counts.get(w.type) || 0) + 1);
    let best = null;
    let bestCount = 0;
    for (const [type, count] of counts) {
        if (count > bestCount) {
            best = type;
            bestCount = count;
        }
    }
    if (best === null)
        return null;
    return { type: best, share: bestCount / bottles.length };
}
// Bottles of one wine scattered across several places. The fix is real work,
// so only worth raising for a series big enough to be worth gathering.
function findScatter(placed, live, cabinets, wines) {
    const groups = new Map();
    for (const entry of placed) {
        const k = groupKey(entry.wine);
        if (!k)
            continue;
        const list = groups.get(k);
        if (list)
            list.push(entry);
        else
            groups.set(k, [entry]);
    }
    const out = [];
    for (const [key, entries] of groups) {
        if (entries.length < MIN_GROUP_BOTTLES)
            continue;
        const byContainer = new Map();
        for (const e of entries) {
            const ck = containerKey(e.container);
            const list = byContainer.get(ck);
            if (list)
                list.push(e);
            else
                byContainer.set(ck, [e]);
        }
        if (byContainer.size < 2)
            continue;
        // Gather towards wherever most of the series already sits, preferring the
        // one that can actually take the rest.
        const candidates = [...byContainer.entries()]
            .map(([ck, held]) => {
            const entry = live.get(ck);
            const strays = entries.length - held.length;
            const usage = containerUsage(entry.container, entry.cabinet, wines);
            return { ck, held, strays, free: usage.free, container: entry.container };
        })
            .sort((a, b) => (b.free >= b.strays ? 1 : 0) - (a.free >= a.strays ? 1 : 0) || b.held.length - a.held.length || b.free - a.free);
        const target = candidates[0];
        if (!target || target.free < 1)
            continue;
        const strays = entries.filter((e) => containerKey(e.container) !== target.ck);
        const movable = strays.slice(0, Number.isFinite(target.free) ? target.free : strays.length);
        if (!movable.length)
            continue;
        const targetLabel = containerLabel(target.container, cabinets);
        const name = entries[0].wine.name || entries[0].wine.winery || "This wine";
        const partial = movable.length < strays.length;
        out.push({
            id: `consolidate:${key}`,
            kind: "consolidate",
            title: `${name} — ${entries.length} bottles across ${byContainer.size} places`,
            detail: partial
                ? `${targetLabel} holds ${target.held.length} of them and has room for ${movable.length} more, not all ${strays.length}. Gathering what fits still cuts the search in half.`
                : `${targetLabel} already holds ${target.held.length} of them and has room for the other ${movable.length}.`,
            wines: entries.map((e) => e.wine),
            moves: movable.map((e) => ({
                wine: e.wine,
                from: e.container,
                to: target.container,
                fromLabel: containerLabel(e.container, cabinets),
                toLabel: targetLabel,
            })),
        });
    }
    return out;
}
// A bin that is overwhelmingly one kind of wine, with a couple of bottles that
// are not. The bin's purpose was never declared, but at this concentration it
// plainly has one.
function findOutliers(placed, live, cabinets, wines) {
    const byContainer = new Map();
    for (const e of placed) {
        const ck = containerKey(e.container);
        const list = byContainer.get(ck);
        if (list)
            list.push(e.wine);
        else
            byContainer.set(ck, [e.wine]);
    }
    // Where each type feels at home, for suggesting somewhere better.
    const homes = new Map();
    for (const [ck, bottles] of byContainer) {
        const dom = dominantType(bottles);
        if (!dom || dom.share < DOMINANCE)
            continue;
        const entry = live.get(ck);
        const list = homes.get(dom.type) || [];
        list.push({ ...entry, count: bottles.filter((w) => w.type === dom.type).length });
        homes.set(dom.type, list);
    }
    const out = [];
    for (const [ck, bottles] of byContainer) {
        if (bottles.length < MIN_CONTAINER_BOTTLES)
            continue;
        const dom = dominantType(bottles);
        if (!dom || dom.share < DOMINANCE)
            continue;
        const intruders = bottles.filter((w) => w.type !== dom.type);
        if (!intruders.length || intruders.length > MAX_INTRUDERS)
            continue;
        const here = live.get(ck);
        const moves = [];
        for (const wine of intruders) {
            const better = (homes.get(wine.type) || [])
                .filter((h) => containerKey(h.container) !== ck)
                .map((h) => ({ ...h, free: containerUsage(h.container, h.cabinet, wines).free }))
                .filter((h) => h.free > 0)
                .sort((a, b) => b.count - a.count || b.free - a.free)[0];
            if (!better)
                continue;
            moves.push({
                wine,
                from: here.container,
                to: better.container,
                fromLabel: containerLabel(here.container, cabinets),
                toLabel: containerLabel(better.container, cabinets),
            });
        }
        if (!moves.length)
            continue;
        const label = containerLabel(here.container, cabinets);
        const typeName = WINE_TYPE_LABELS[dom.type] || dom.type;
        out.push({
            id: `outlier:${ck}:${dom.type}`,
            kind: "outlier",
            title: `${label} is ${Math.round(dom.share * 100)}% ${typeName}`,
            detail: `${intruders.length === 1 ? "One bottle does" : `${intruders.length} bottles do`} not belong to that group. Nothing says this bin is only for ${typeName} — but it nearly is.`,
            wines: intruders,
            moves,
        });
    }
    return out;
}
// A bottle whose drinking window is closing, stuck behind or under bottles
// meant to be kept. No move is proposed: freeing it means two bottles trading
// places, and writing that as one-way moves would misdescribe the rack.
function findBuried(placed, cabinets) {
    const byContainer = new Map();
    for (const e of placed) {
        const ck = containerKey(e.container);
        const list = byContainer.get(ck);
        if (list)
            list.push(e);
        else
            byContainer.set(ck, [e]);
    }
    const out = [];
    for (const entries of byContainer.values()) {
        if (entries.length < 2)
            continue;
        for (const e of entries) {
            if (!isDrinkSoon(e.wine))
                continue;
            const depth = e.wine.depth || 0;
            const inFront = entries.filter((o) => (o.wine.depth || 0) < depth && isKeeper(o.wine));
            if (!inFront.length)
                continue;
            const label = containerLabel(e.container, cabinets);
            const year = drinkByYear(e.wine);
            out.push({
                id: `buried:${e.wine.id}`,
                kind: "buried",
                title: `${e.wine.name || "A bottle"} is due${year ? ` by ${year}` : ""} but hard to reach`,
                detail: `It sits at slot ${depth + 1} of ${label}, behind ${inFront.length === 1 ? "a bottle" : `${inFront.length} bottles`} marked to keep. Swap them by hand next time the door is open.`,
                wines: [e.wine, ...inFront.map((o) => o.wine)],
                moves: [],
            });
        }
    }
    return out;
}
const KIND_ORDER = ["consolidate", "outlier", "buried"];
// Everything the cellar's own arrangement disagrees about, minus what the user
// has waved off for good.
function analyzeArrangement(wines, cabinets, dismissed = []) {
    const live = liveContainers(cabinets);
    const placed = placedWines(wines, live);
    const hidden = new Set(dismissed);
    return [
        ...findScatter(placed, live, cabinets, wines),
        ...findOutliers(placed, live, cabinets, wines),
        ...findBuried(placed, cabinets),
    ]
        .filter((f) => !hidden.has(f.id))
        .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
}

const SECTIONS = [
    {
        kind: "consolidate",
        title: "Scattered",
        blurb: "Bottles of one wine sitting in several places.",
    },
    {
        kind: "outlier",
        title: "Odd ones out",
        blurb: "Bins that are almost entirely one kind of wine, with a stray or two.",
    },
    {
        kind: "buried",
        title: "Hard to reach",
        blurb: "Bottles due soon, stuck behind ones you meant to keep.",
    },
];
// The arrangement report. Deliberately a place you visit rarely — after
// scanning a cellar in, mostly — and leave empty once the moves are done.
//
// Every move is applied only when the user says it happened. The database
// follows the bottles, never the other way around: renumbering a rack the
// moment a suggestion is generated would make every later "where is it"
// a lie.
let ArrangementDialog = class ArrangementDialog extends i {
    constructor() {
        super(...arguments);
        this.open = false;
        this.wines = [];
        this.cabinets = [];
        this.dismissed = [];
        this._busy = "";
        this._error = "";
    }
    get _findings() {
        return analyzeArrangement(this.wines, this.cabinets, this.dismissed);
    }
    // Apply every move in a finding, then tell the card to reload. Moves are
    // sequential on purpose: each one consumes a slot the next one might have
    // been aiming at.
    async _applyMoves(finding) {
        this._busy = finding.id;
        this._error = "";
        try {
            let known = [...this.wines];
            for (const move of finding.moves) {
                const cabinet = this.cabinets.find((c) => c.id === move.to.cabinetId);
                // Re-derive the landing slot per move rather than trusting the depth
                // the analysis saw: earlier moves in this same batch have taken slots
                // since, and the cellar may have changed under us.
                const patch = placementIn(move.to, cabinet, known.filter((w) => w.id !== move.wine.id));
                if (!patch) {
                    this._error = `${move.toLabel} filled up before the move could be recorded.`;
                    break;
                }
                await this.hass.callWS({
                    type: "wine_cellar/move_wine",
                    wine_id: move.wine.id,
                    cabinet_id: patch.cabinet_id,
                    row: patch.row ?? undefined,
                    col: patch.col ?? undefined,
                    zone: patch.zone,
                    depth: patch.depth,
                });
                known = known.map((w) => (w.id === move.wine.id ? { ...w, ...patch } : w));
            }
            this.dispatchEvent(new CustomEvent("moves-applied", { bubbles: true, composed: true }));
        }
        catch (err) {
            this._error = `Could not record the move: ${err?.message || err}`;
        }
        finally {
            this._busy = "";
        }
    }
    _dismiss(finding) {
        this.dispatchEvent(new CustomEvent("dismiss-finding", {
            detail: { id: finding.id },
            bubbles: true,
            composed: true,
        }));
    }
    _renderMove(move) {
        return b `
      <div class="arr-move">
        <span>${move.wine.name || "Bottle"}${move.wine.vintage ? ` ${move.wine.vintage}` : ""}</span>
        <span class="arr-move-where">${move.fromLabel}</span>
        <span class="arr-move-arrow">→</span>
        <span class="arr-move-where">${move.toLabel}</span>
      </div>
    `;
    }
    _renderFinding(finding) {
        const busy = this._busy === finding.id;
        return b `
      <div class="arr-finding">
        <div class="arr-title">${finding.title}</div>
        <div class="arr-detail">${finding.detail}</div>
        ${finding.moves.length
            ? b `<div class="arr-moves">${finding.moves.map((m) => this._renderMove(m))}</div>`
            : A}
        <div class="arr-actions">
          ${finding.moves.length
            ? b `
                <button class="btn btn-primary" ?disabled=${busy} @click=${() => this._applyMoves(finding)}>
                  ${busy
                ? "Recording..."
                : finding.moves.length === 1
                    ? "I moved it"
                    : `I moved all ${finding.moves.length}`}
                </button>
              `
            : A}
          <button class="btn btn-outline" ?disabled=${busy} @click=${() => this._dismiss(finding)}>
            ${finding.moves.length ? "Leave it as it is" : "Noted"}
          </button>
        </div>
      </div>
    `;
    }
    render() {
        if (!this.open)
            return A;
        const findings = this._findings;
        return b `
      <div class="dialog-overlay" @click=${() => this.dispatchEvent(new CustomEvent("close"))}>
        <div class="dialog" style="max-width:620px" @click=${(e) => e.stopPropagation()}>
          <div class="dialog-header">🧹 Arrangement</div>

          <div class="dialog-body">
            ${findings.length === 0
            ? b `
                  <div class="arr-empty">
                    Nothing worth moving. Your cellar agrees with itself.
                  </div>
                `
            : b `
                  <div class="arr-intro">
                    Read from where your bottles already are — there are no rules to
                    configure. Tick a move once you have actually made it; nothing is
                    recorded before that.
                  </div>
                  ${SECTIONS.map((section) => {
                const inSection = findings.filter((f) => f.kind === section.kind);
                if (!inSection.length)
                    return A;
                return b `
                      <div class="arr-section">
                        <div class="arr-section-title">${section.title}</div>
                        <div class="arr-section-blurb">${section.blurb}</div>
                        ${inSection.map((f) => this._renderFinding(f))}
                      </div>
                    `;
            })}
                `}
            ${this._error ? b `<div class="arr-error">${this._error}</div>` : A}
          </div>

          <div class="dialog-footer">
            <button class="btn btn-outline" @click=${() => this.dispatchEvent(new CustomEvent("close"))}>
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    }
};
ArrangementDialog.styles = [
    sharedStyles,
    i$3 `
      .arr-intro {
        font-size: 0.85em;
        color: var(--wc-text-secondary);
        margin-bottom: 14px;
      }

      .arr-section {
        margin-bottom: 18px;
      }

      .arr-section-title {
        font-weight: 600;
        font-size: 0.9em;
        margin-bottom: 2px;
      }

      .arr-section-blurb {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-bottom: 8px;
      }

      .arr-finding {
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        padding: 10px 12px;
        margin-bottom: 8px;
      }

      .arr-title {
        font-weight: 600;
        font-size: 0.88em;
      }

      .arr-detail {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-top: 3px;
      }

      .arr-moves {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .arr-move {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.78em;
        flex-wrap: wrap;
      }

      .arr-move-where {
        color: var(--wc-text-secondary);
      }

      .arr-move-arrow {
        opacity: 0.6;
      }

      .arr-actions {
        margin-top: 10px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .arr-empty {
        text-align: center;
        padding: 28px 12px;
        color: var(--wc-text-secondary);
        font-size: 0.9em;
      }

      .arr-error {
        color: #c62828;
        font-size: 0.8em;
        margin-top: 8px;
      }
    `,
];
__decorate([
    n({ type: Boolean })
], ArrangementDialog.prototype, "open", void 0);
__decorate([
    n({ attribute: false })
], ArrangementDialog.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], ArrangementDialog.prototype, "wines", void 0);
__decorate([
    n({ attribute: false })
], ArrangementDialog.prototype, "cabinets", void 0);
__decorate([
    n({ attribute: false })
], ArrangementDialog.prototype, "dismissed", void 0);
__decorate([
    r()
], ArrangementDialog.prototype, "_busy", void 0);
__decorate([
    r()
], ArrangementDialog.prototype, "_error", void 0);
ArrangementDialog = __decorate([
    t("arrangement-dialog")
], ArrangementDialog);

let CabinetGrid = class CabinetGrid extends i {
    constructor() {
        super(...arguments);
        this.wines = [];
        // Set briefly by "locate" so the bottle is marked on the rack drawing too,
        // not just in the side panel's slot list.
        this.highlightWineId = null;
        this._dragOverCell = null;
        // --- Long press (mobile move) ---
        this._longPressTimer = null;
    }
    _getWinesAt(row, col) {
        return this.wines.filter((w) => w.cabinet_id === this.cabinet.id && w.row === row && w.col === col);
    }
    _getStorageRowSet() {
        const rows = this.cabinet.storage_rows;
        return new Set((rows || []).map((sr) => sr.row));
    }
    _getStorageRowConfig(row) {
        const rows = this.cabinet.storage_rows;
        return (rows || []).find((s) => s.row === row);
    }
    _getStorageRowName(row) {
        return this._getStorageRowConfig(row)?.name || "Storage";
    }
    _getBottomZoneWines() {
        return this.wines.filter((w) => w.cabinet_id === this.cabinet.id && w.zone === "bottom");
    }
    _getStorageRowWines(row) {
        return this.wines
            .filter((w) => w.cabinet_id === this.cabinet.id && w.zone === `storage-${row}`)
            .sort((a, b) => (a.depth || 0) - (b.depth || 0));
    }
    _onCellClick(row, col, wine, wineCount = 0, cabinetDepth = 1, wines = []) {
        this.dispatchEvent(new CustomEvent("cell-click", {
            detail: {
                cabinet: this.cabinet,
                row,
                col,
                wine,
                wines,
                wineCount,
                cabinetDepth,
            },
            bubbles: true,
            composed: true,
        }));
    }
    _onZoneClick(wine, zone = "bottom") {
        this.dispatchEvent(new CustomEvent("zone-click", {
            detail: {
                cabinet: this.cabinet,
                zone,
                wine,
            },
            bubbles: true,
            composed: true,
        }));
    }
    _onZoneContainerClick(zone, storageRow) {
        this.dispatchEvent(new CustomEvent("zone-container-click", {
            detail: {
                cabinet: this.cabinet,
                zone,
                storageRow,
            },
            bubbles: true,
            composed: true,
        }));
    }
    _brightenColor(hex) {
        // Make wine type colors brighter for the ring border
        const brightMap = {
            "#722F37": "#c44d58", // red → brighter red
            "#F5E6CA": "#fff8e8", // white → bright cream
            "#E8A0BF": "#f5c0d8", // rosé → brighter pink
            "#D4E09B": "#e8f0b8", // sparkling → brighter green
            "#DAA520": "#f0c040", // dessert → brighter gold
        };
        return brightMap[hex] || hex;
    }
    _onTouchStart(wine) {
        this._longPressTimer = window.setTimeout(() => {
            this._longPressTimer = null;
            this.dispatchEvent(new CustomEvent("wine-longpress", {
                detail: { wine, cabinet: this.cabinet },
                bubbles: true,
                composed: true,
            }));
        }, 500);
    }
    _onTouchEnd() {
        if (this._longPressTimer !== null) {
            clearTimeout(this._longPressTimer);
            this._longPressTimer = null;
        }
    }
    _onTouchMove() {
        if (this._longPressTimer !== null) {
            clearTimeout(this._longPressTimer);
            this._longPressTimer = null;
        }
    }
    // --- Drag and drop ---
    _onDragStart(e, wine, row, col, zone) {
        if (!e.dataTransfer)
            return;
        e.dataTransfer.setData("text/plain", JSON.stringify({
            wineId: wine.id,
            cabinetId: this.cabinet.id,
            row: row ?? null,
            col: col ?? null,
            zone: zone || "",
        }));
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.classList.add("drag-source");
    }
    _onDragEnd(e) {
        e.currentTarget.classList.remove("drag-source");
        this._dragOverCell = null;
    }
    _onDragOver(e, key) {
        e.preventDefault();
        if (e.dataTransfer)
            e.dataTransfer.dropEffect = "move";
        this._dragOverCell = key;
    }
    _onDragLeave(_e) {
        this._dragOverCell = null;
    }
    _onDrop(e, targetRow, targetCol, targetZone, targetWine) {
        e.preventDefault();
        this._dragOverCell = null;
        if (!e.dataTransfer)
            return;
        try {
            const source = JSON.parse(e.dataTransfer.getData("text/plain"));
            // Bulk-zone reordering: figure out which bottle the drop landed
            // nearest to (and which half of it), so dropping anywhere in the zone
            // reorders sensibly instead of only working when the cursor lands
            // exactly on a chip — small chips are hard to hit precisely.
            let effectiveTargetWine = targetWine;
            let insertBefore = true;
            if (effectiveTargetWine) {
                const rect = e.currentTarget.getBoundingClientRect();
                insertBefore = e.clientX < rect.left + rect.width / 2;
            }
            else if (targetZone) {
                const container = e.currentTarget;
                const chips = Array.from(container.querySelectorAll(".zone-bottle"));
                let nearest = null;
                let nearestDist = Infinity;
                for (const chip of chips) {
                    if (chip.dataset.wineId === source.wineId)
                        continue;
                    const rect = chip.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const dist = Math.abs(e.clientX - cx);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearest = chip;
                    }
                }
                if (nearest) {
                    const rect = nearest.getBoundingClientRect();
                    insertBefore = e.clientX < rect.left + rect.width / 2;
                    effectiveTargetWine = this.wines.find((w) => w.id === nearest.dataset.wineId);
                }
            }
            this.dispatchEvent(new CustomEvent("wine-drop", {
                detail: {
                    wineId: source.wineId,
                    sourceCabinetId: source.cabinetId,
                    sourceRow: source.row,
                    sourceCol: source.col,
                    sourceZone: source.zone,
                    targetCabinetId: this.cabinet.id,
                    targetRow: targetRow ?? null,
                    targetCol: targetCol ?? null,
                    targetZone: targetZone || "",
                    // When dropping on/near another bottle within the same bulk
                    // zone, carry its id + which side the drop landed on, so the
                    // card can insert relative to it instead of treating it as a
                    // same-zone no-op.
                    targetWineId: effectiveTargetWine?.id ?? null,
                    targetDepth: effectiveTargetWine ? (effectiveTargetWine.depth ?? 0) : null,
                    insertBefore,
                },
                bubbles: true,
                composed: true,
            }));
        }
        catch { /* ignore bad data */ }
    }
    _renderStorageZone(row) {
        const sr = this._getStorageRowConfig(row);
        const zoneName = sr?.name || "Storage";
        const zoneType = sr?.type || "bulk";
        const capacity = sr?.capacity || 20;
        const zoneId = `storage-${row}`;
        const wines = this._getStorageRowWines(row);
        const zoneKey = `zone-${zoneId}`;
        const isDragOver = this._dragOverCell === zoneKey;
        if (zoneType === "box") {
            return this._renderBoxZone(zoneId, zoneKey, zoneName, capacity, wines, isDragOver, sr);
        }
        // Default: bulk
        return this._renderBulkZone(zoneId, zoneKey, zoneName, capacity, wines, isDragOver, sr);
    }
    _renderBulkZone(zoneId, zoneKey, name, capacity, wines, isDragOver, sr) {
        return b `
      <div class="bottom-zone ${isDragOver ? "drag-over" : ""}"
        @click=${() => sr ? this._onZoneContainerClick(zoneId, sr) : this._onZoneClick(undefined, zoneId)}
        @dragover=${(e) => this._onDragOver(e, zoneKey)}
        @dragleave=${(e) => this._onDragLeave(e)}
        @drop=${(e) => this._onDrop(e, undefined, undefined, zoneId)}>
        <div class="bottom-zone-label">◇ ${name} <span class="zone-count">${wines.length}/${capacity}</span></div>
        ${wines.map((wine) => {
            const disp = wine.disposition || "";
            const dispClass = disp === "D" ? "drink" : disp === "H" ? "hold" : disp === "P" ? "past" : "";
            const bottleKey = `${zoneKey}-${wine.id}`;
            return b `
            <div
              class="zone-bottle ${this._dragOverCell === bottleKey ? "drag-over" : ""} ${wine.id === this.highlightWineId ? "locate-highlight" : ""}"
              style="background: ${WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red}"
              data-wine-id="${wine.id}"
              draggable="true"
              @click=${(e) => {
                e.stopPropagation();
                this._onZoneClick(wine, zoneId);
            }}
              @dragstart=${(e) => { e.stopPropagation(); this._onDragStart(e, wine, undefined, undefined, zoneId); }}
              @dragend=${(e) => this._onDragEnd(e)}
              @dragover=${(e) => { e.stopPropagation(); this._onDragOver(e, bottleKey); }}
              @dragleave=${(e) => { e.stopPropagation(); this._onDragLeave(e); }}
              @drop=${(e) => { e.stopPropagation(); this._onDrop(e, undefined, undefined, zoneId, wine); }}
              @touchstart=${(e) => { e.stopPropagation(); this._onTouchStart(wine); }}
              @touchend=${() => this._onTouchEnd()}
              @touchmove=${() => this._onTouchMove()}
              title="${wine.name} (${wine.vintage || "NV"})"
            >
              ${(wine.vintage || "NV").toString().slice(-2)}
              ${dispClass ? b `<span class="disposition ${dispClass}">${disp}</span>` : A}
            </div>
          `;
        })}
      </div>
    `;
    }
    _renderBoxZone(zoneId, zoneKey, name, capacity, wines, isDragOver, sr) {
        const boxes = sr.boxes || [capacity];
        let offset = 0;
        const boxSegments = boxes.map((boxSize) => {
            const start = offset;
            offset += boxSize;
            const boxWines = wines.filter((w) => {
                const d = w.depth || 0;
                return d >= start && d < start + boxSize;
            });
            return {
                size: boxSize,
                start,
                wineCount: boxWines.length,
                hasHighlight: !!this.highlightWineId && boxWines.some((w) => w.id === this.highlightWineId),
            };
        });
        return b `
      <div class="bottom-zone zone-box-row ${isDragOver ? "drag-over" : ""}"
        @click=${() => this._onZoneContainerClick(zoneId, sr)}
        @dragover=${(e) => this._onDragOver(e, zoneKey)}
        @dragleave=${(e) => this._onDragLeave(e)}
        @drop=${(e) => this._onDrop(e, undefined, undefined, zoneId)}>
        <div class="bottom-zone-label">📦 ${name} <span class="zone-count">${wines.length}/${capacity}</span></div>
        <div class="zone-box-grid">
          ${boxSegments.map((seg) => b `
            <div class="zone-box-item ${seg.wineCount > 0 ? "has-wine" : ""} ${seg.hasHighlight ? "locate-highlight" : ""}">
              <div class="zone-box-shape">
                <div class="box-lid"></div>
                <div class="box-body"><span class="box-count">${seg.wineCount}/${seg.size}</span></div>
              </div>
              <div class="zone-box-size">${seg.size}-pk</div>
            </div>
          `)}
        </div>
      </div>
    `;
    }
    _renderGridRow(row, cols) {
        const cabinetDepth = this.cabinet.depth || 1;
        return b `
      <div class="row">
        ${Array.from({ length: cols }, (_, col) => {
            const wines = this._getWinesAt(row, col);
            const wineCount = wines.length;
            const frontWine = wines.length > 0
                ? wines.sort((a, b) => (a.depth || 0) - (b.depth || 0))[0]
                : undefined;
            const bgColor = frontWine
                ? WINE_TYPE_COLORS[frontWine.type] || WINE_TYPE_COLORS.red
                : "transparent";
            const disp = frontWine?.disposition || "";
            const dispClass = disp === "D" ? "drink" : disp === "H" ? "hold" : disp === "P" ? "past" : "";
            const ratingDisplay = frontWine?.rating ? frontWine.rating.toFixed(1) : "";
            const ringColor = frontWine ? this._brightenColor(bgColor) : "";
            const cellKey = `${row}-${col}`;
            const isDragOver = this._dragOverCell === cellKey;
            const isHighlighted = !!this.highlightWineId && wines.some((w) => w.id === this.highlightWineId);
            return b `
            <div
              class="cell ${frontWine ? "filled" : "empty"} ${isDragOver ? "drag-over" : ""} ${isHighlighted ? "locate-highlight" : ""}"
              style=${frontWine ? `background: ${bgColor}; --bottle-type-color: ${ringColor}` : ""}
              draggable=${frontWine ? "true" : "false"}
              @click=${() => this._onCellClick(row, col, frontWine, wineCount, cabinetDepth, wines)}
              @touchstart=${frontWine ? () => this._onTouchStart(frontWine) : A}
              @touchend=${frontWine ? () => this._onTouchEnd() : A}
              @touchmove=${frontWine ? () => this._onTouchMove() : A}
              @dragstart=${frontWine ? (e) => this._onDragStart(e, frontWine, row, col) : A}
              @dragend=${frontWine ? (e) => this._onDragEnd(e) : A}
              @dragover=${(e) => this._onDragOver(e, cellKey)}
              @dragleave=${(e) => this._onDragLeave(e)}
              @drop=${(e) => this._onDrop(e, row, col)}
              title=${frontWine
                ? `${frontWine.name} (${frontWine.vintage || "NV"})${frontWine.rating ? ` ★${frontWine.rating}` : ""}${wineCount > 1 ? ` [${wineCount}/${cabinetDepth} deep]` : ""}`
                : `Empty - Row ${row + 1}, Col ${col + 1}`}
            >
              ${frontWine
                ? b `
                    ${frontWine.image_url ? b `<img class="wine-thumb" src="${frontWine.image_url}" alt="" />` : A}
                    <span class="bottle-label">${frontWine.vintage || "NV"}</span>
                    ${dispClass ? b `<span class="disposition ${dispClass}">${disp}</span>` : A}
                    ${ratingDisplay ? b `<span class="rating-badge">★${ratingDisplay}</span>` : A}
                    ${wineCount > 1 ? b `<span class="depth-badge">${wineCount}</span>` : A}
                    ${cabinetDepth >= 2
                    ? b `
                          <span class="depth-dots">
                            ${Array.from({ length: cabinetDepth }, (_, d) => {
                        const wineAtDepth = wines.find((w) => (w.depth || 0) === d);
                        const dotColor = wineAtDepth
                            ? WINE_TYPE_COLORS[wineAtDepth.type] || WINE_TYPE_COLORS.red
                            : "";
                        return b `<span
                                class="depth-dot ${wineAtDepth ? "" : "empty"}"
                                style=${wineAtDepth ? `background: ${dotColor}` : ""}
                              ></span>`;
                    })}
                          </span>
                        `
                    : A}
                  `
                : cabinetDepth >= 2 && wineCount === 0
                    ? b `
                      <span class="depth-dots">
                        ${Array.from({ length: cabinetDepth }, () => b `<span class="depth-dot empty"></span>`)}
                      </span>
                    `
                    : A}
            </div>
          `;
        })}
      </div>
    `;
    }
    _renderCell(row, col) {
        const cabinetDepth = this.cabinet.depth || 1;
        const wines = this._getWinesAt(row, col);
        const wineCount = wines.length;
        const frontWine = wines.length > 0
            ? wines.sort((a, b) => (a.depth || 0) - (b.depth || 0))[0]
            : undefined;
        const bgColor = frontWine
            ? WINE_TYPE_COLORS[frontWine.type] || WINE_TYPE_COLORS.red
            : "transparent";
        const disp = frontWine?.disposition || "";
        const dispClass = disp === "D" ? "drink" : disp === "H" ? "hold" : disp === "P" ? "past" : "";
        const ratingDisplay = frontWine?.rating ? frontWine.rating.toFixed(1) : "";
        const ringColor = frontWine ? this._brightenColor(bgColor) : "";
        const cellKey = `${row}-${col}`;
        const isDragOver = this._dragOverCell === cellKey;
        return b `
      <div
        class="cell ${frontWine ? "filled" : "empty"} ${isDragOver ? "drag-over" : ""}"
        style=${frontWine ? `background: ${bgColor}; --bottle-type-color: ${ringColor}` : ""}
        draggable=${frontWine ? "true" : "false"}
        @click=${() => this._onCellClick(row, col, frontWine, wineCount, cabinetDepth, wines)}
        @touchstart=${frontWine ? () => this._onTouchStart(frontWine) : A}
        @touchend=${frontWine ? () => this._onTouchEnd() : A}
        @touchmove=${frontWine ? () => this._onTouchMove() : A}
        @dragstart=${frontWine ? (e) => this._onDragStart(e, frontWine, row, col) : A}
        @dragend=${frontWine ? (e) => this._onDragEnd(e) : A}
        @dragover=${(e) => this._onDragOver(e, cellKey)}
        @dragleave=${(e) => this._onDragLeave(e)}
        @drop=${(e) => this._onDrop(e, row, col)}
        title=${frontWine
            ? `${frontWine.name} (${frontWine.vintage || "NV"})${frontWine.rating ? ` ★${frontWine.rating}` : ""}${wineCount > 1 ? ` [${wineCount}/${cabinetDepth} deep]` : ""}`
            : `Empty - Row ${row + 1}, Col ${col + 1}`}
      >
        ${frontWine
            ? b `
              ${frontWine.image_url ? b `<img class="wine-thumb" src="${frontWine.image_url}" alt="" />` : A}
              <span class="bottle-label">${frontWine.vintage || "NV"}</span>
              ${dispClass ? b `<span class="disposition ${dispClass}">${disp}</span>` : A}
              ${ratingDisplay ? b `<span class="rating-badge">★${ratingDisplay}</span>` : A}
              ${wineCount > 1 ? b `<span class="depth-badge">${wineCount}</span>` : A}
              ${cabinetDepth >= 2
                ? b `
                    <span class="depth-dots">
                      ${Array.from({ length: cabinetDepth }, (_, d) => {
                    const wineAtDepth = wines.find((w) => (w.depth || 0) === d);
                    const dotColor = wineAtDepth
                        ? WINE_TYPE_COLORS[wineAtDepth.type] || WINE_TYPE_COLORS.red
                        : "";
                    return b `<span
                          class="depth-dot ${wineAtDepth ? "" : "empty"}"
                          style=${wineAtDepth ? `background: ${dotColor}` : ""}
                        ></span>`;
                })}
                    </span>
                  `
                : A}
            `
            : cabinetDepth >= 2 && wineCount === 0
                ? b `
                <span class="depth-dots">
                  ${Array.from({ length: cabinetDepth }, () => b `<span class="depth-dot empty"></span>`)}
                </span>
              `
                : A}
      </div>
    `;
    }
    _onRackClick() {
        this.dispatchEvent(new CustomEvent("rack-click", {
            detail: { cabinet: this.cabinet },
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        const { rows, cols } = this.cabinet;
        const storageRows = this._getStorageRowSet();
        const hasGridRows = Array.from({ length: rows }, (_, row) => row).some((row) => !storageRows.has(row));
        return b `
      <div class="cabinet">
        <div
          class="cabinet-name ${hasGridRows ? "clickable" : ""}"
          @click=${hasGridRows ? () => this._onRackClick() : A}
          title=${hasGridRows ? "Tap to view and reorder this rack" : ""}
        >${this.cabinet.name}</div>
        <div class="grid-inner">
          ${Array.from({ length: rows }, (_, row) => storageRows.has(row)
            ? this._renderStorageZone(row)
            : this._renderGridRow(row, cols))}
        </div>
        ${this.cabinet.has_bottom_zone
            ? b `
              <div class="bottom-zone ${this._dragOverCell === "zone-bottom" ? "drag-over" : ""}"
                @click=${() => this._onZoneClick()}
                @dragover=${(e) => this._onDragOver(e, "zone-bottom")}
                @dragleave=${(e) => this._onDragLeave(e)}
                @drop=${(e) => this._onDrop(e, undefined, undefined, "bottom")}>
                <div class="bottom-zone-label">
                  ${this.cabinet.bottom_zone_name}
                </div>
                ${this._getBottomZoneWines().map((wine) => b `
                    <div
                      class="zone-bottle"
                      style="background: ${WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red}"
                      draggable="true"
                      @click=${(e) => {
                e.stopPropagation();
                this._onZoneClick(wine);
            }}
                      @dragstart=${(e) => { e.stopPropagation(); this._onDragStart(e, wine, undefined, undefined, "bottom"); }}
                      @dragend=${(e) => this._onDragEnd(e)}
                      title="${wine.name}"
                    >
                      ${(wine.vintage || "NV").toString().slice(-2)}
                    </div>
                  `)}
              </div>
            `
            : A}
      </div>
    `;
    }
};
CabinetGrid.styles = [
    sharedStyles,
    i$3 `
      :host {
        display: block;
      }

      .cabinet {
        background: linear-gradient(135deg, #8b6914 0%, #c4973b 50%, #8b6914 100%);
        border-radius: 12px;
        padding: 8px;
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3),
          0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .cabinet-name {
        text-align: center;
        color: #f5e6ca;
        font-size: 0.8em;
        font-weight: 600;
        padding: 4px 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      .cabinet-name.clickable {
        cursor: pointer;
        border-radius: 6px;
      }

      .cabinet-name.clickable:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .grid-inner {
        background: linear-gradient(180deg, #1a1a3a 0%, #0d0d2b 100%);
        border-radius: 8px;
        padding: 6px;
        position: relative;
        overflow: hidden;
      }

      /* Blue LED glow effect */
      .grid-inner::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
          ellipse at center,
          rgba(50, 100, 255, 0.15) 0%,
          transparent 70%
        );
        pointer-events: none;
      }

      .row {
        display: flex;
        gap: 2px;
        margin-bottom: 2px;
        position: relative;
      }

      /* Scalloped shelf appearance */
      .row::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #6b5010 0%, #a07828 50%, #6b5010 100%);
        border-radius: 0 0 2px 2px;
      }

      .cell {
        flex: 1;
        aspect-ratio: 1;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        min-width: 0;
        z-index: 1;
        container-type: inline-size;
      }

      .cell.empty {
        background: rgba(255, 255, 255, 0.05);
        border: 1px dashed rgba(255, 255, 255, 0.15);
      }

      .cell.empty:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.3);
      }

      .cell.filled {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4),
          inset 0 -2px 4px rgba(0, 0, 0, 0.3),
          0 0 8px rgba(50, 100, 255, 0.15);
        border: 2px solid var(--bottle-type-color, rgba(255, 255, 255, 0.1));
        overflow: hidden;
      }

      .cell .wine-thumb {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }

      .cell.filled:hover {
        transform: scale(1.15);
        z-index: 10;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5),
          0 0 16px rgba(50, 100, 255, 0.3);
      }

      .cell .bottle-label {
        position: absolute;
        bottom: -14px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 6px;
        color: rgba(255, 255, 255, 0.6);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 40px;
        display: none;
        pointer-events: none;
      }

      .cell.filled:hover .bottle-label {
        display: block;
      }

      /* "Locate" marker: a pulsing ring drawn outside the element so it
         reads on a filled bottle, an empty slot and a box alike. */
      .locate-highlight {
        position: relative;
        z-index: 3;
        outline: 2px solid rgba(255, 193, 7, 0.9);
        outline-offset: 1px;
        animation: locatePulse 1.2s ease-in-out 3;
        border-radius: inherit;
      }

      @keyframes locatePulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
          outline: 2px solid rgba(255, 193, 7, 0.9);
          outline-offset: 1px;
        }
        50% {
          box-shadow: 0 0 10px 4px rgba(255, 193, 7, 0.65);
          outline: 2px solid rgba(255, 193, 7, 1);
          outline-offset: 2px;
        }
      }

      .cell .disposition {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 65%;
        height: 65%;
        border-radius: 50%;
        font-size: clamp(7px, 30cqi, 14px);
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        z-index: 2;
        pointer-events: none;
        line-height: 1;
        border: 2px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
      }

      .cell .disposition.drink,
      .zone-bottle .disposition.drink {
        background: #2e7d32;
      }

      .cell .disposition.hold,
      .zone-bottle .disposition.hold {
        background: #1565c0;
      }

      .cell .disposition.past,
      .zone-bottle .disposition.past {
        background: #c62828;
      }

      .cell .rating-badge {
        position: absolute;
        bottom: -2px;
        right: -2px;
        font-size: 6px;
        font-weight: 700;
        color: #fff;
        background: rgba(0,0,0,0.6);
        border-radius: 4px;
        padding: 1px 3px;
        z-index: 2;
        pointer-events: none;
        line-height: 1;
        display: none;
      }

      .cell.filled:hover .rating-badge {
        display: block;
      }

      .cell .depth-badge {
        position: absolute;
        top: -2px;
        left: -2px;
        font-size: 7px;
        font-weight: 700;
        color: #fff;
        background: rgba(30, 136, 229, 0.85);
        border-radius: 50%;
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3;
        pointer-events: none;
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      }

      .depth-dots {
        position: absolute;
        bottom: 16%;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 3px;
        z-index: 3;
        pointer-events: none;
      }

      .depth-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 1.5px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.6);
      }

      .depth-dot.empty {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
      }

      .bottom-zone {
        margin-top: 8px;
        background: linear-gradient(135deg, #6b5010 0%, #8b6914 100%);
        border-radius: 6px;
        padding: 8px;
        min-height: 40px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        cursor: pointer;
        position: relative;
        z-index: 1;
      }

      .bottom-zone-label {
        font-size: 0.65em;
        color: rgba(255, 255, 255, 0.6);
        width: 100%;
        text-align: center;
      }

      .zone-bottle {
        position: relative;
        width: 28px;
        height: 28px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s;
      }

      .zone-bottle .disposition {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 68%;
        height: 68%;
        border-radius: 50%;
        font-size: 9px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        z-index: 2;
        pointer-events: none;
        line-height: 1;
        border: 1.5px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      }

      .zone-bottle:hover {
        transform: scale(1.1);
      }

      /* Drag and drop */
      .cell.drag-source {
        opacity: 0.35;
        transform: scale(0.9);
      }

      .cell.drag-over {
        box-shadow: 0 0 0 3px rgba(66, 165, 245, 0.8);
        transform: scale(1.1);
        background: rgba(66, 165, 245, 0.15) !important;
        z-index: 10;
      }

      .cell[draggable="true"] {
        cursor: grab;
      }

      .cell[draggable="true"]:active {
        cursor: grabbing;
      }

      .zone-bottle.drag-over {
        box-shadow: 0 0 0 2px rgba(66, 165, 245, 0.8);
        transform: scale(1.15);
      }

      .bottom-zone.drag-over {
        box-shadow: inset 0 0 0 2px rgba(66, 165, 245, 0.8);
        background: rgba(66, 165, 245, 0.1);
      }

      .zone-count {
        font-weight: 400;
        opacity: 0.7;
        margin-left: 4px;
      }

      .zone-fill-dots {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;
      }

      .zone-fill-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 1.5px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
      }

      .zone-fill-dot.empty {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .zone-box-row {
        cursor: pointer;
        padding: 4px 8px;
        min-height: 0;
        flex-direction: column;
        align-items: center;
      }

      .zone-box-row:hover {
        background: linear-gradient(135deg, #7a5a12 0%, #9a7820 100%);
      }

      .zone-box-grid {
        display: flex;
        gap: 8px;
        align-items: flex-end;
        justify-content: center;
        padding: 2px 0;
        width: 100%;
      }

      .zone-box-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
      }

      .zone-box-shape {
        width: 56px;
        height: 36px;
        position: relative;
      }

      .zone-box-shape .box-lid {
        position: absolute;
        top: 0;
        left: -2px;
        right: -2px;
        height: 28%;
        background: linear-gradient(180deg, #a08040 0%, #7a6020 100%);
        border-radius: 2px 2px 0 0;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-bottom: none;
      }

      .zone-box-shape .box-body {
        position: absolute;
        top: 28%;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, #8b6914 0%, #6b5010 100%);
        border-radius: 0 0 2px 2px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-top: 1px solid rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .zone-box-shape .box-count {
        font-size: 0.7em;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.5);
        line-height: 1;
      }

      .zone-box-item.has-wine .box-count {
        color: #fff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      .zone-box-size {
        font-size: 0.55em;
        color: rgba(255, 255, 255, 0.5);
      }

      /* Phone: tighter spacing, smaller elements */
      @media (max-width: 599px) {
        .cabinet {
          padding: 6px;
          border-radius: 10px;
        }
        .cabinet-name {
          font-size: 0.75em;
          padding: 3px 0;
        }
        .grid-inner {
          padding: 4px;
        }
        .row {
          gap: 1px;
          margin-bottom: 1px;
        }
        .row::after {
          height: 2px;
        }
        .cell .bottle-label {
          font-size: 5px;
          max-width: 30px;
        }
        .bottom-zone {
          margin-top: 6px;
          padding: 6px;
          gap: 4px;
          min-height: 32px;
        }
        .bottom-zone-label {
          font-size: 0.6em;
        }
        .zone-bottle {
          width: 22px;
          height: 22px;
          font-size: 7px;
        }
      }

      /* Tablet: moderate sizing */
      @media (min-width: 600px) and (max-width: 1023px) {
        .cabinet {
          padding: 6px;
        }
        .grid-inner {
          padding: 5px;
        }
        .row {
          gap: 2px;
          margin-bottom: 1px;
        }
      }
    `,
];
__decorate([
    n({ attribute: false })
], CabinetGrid.prototype, "cabinet", void 0);
__decorate([
    n({ attribute: false })
], CabinetGrid.prototype, "wines", void 0);
__decorate([
    n({ attribute: false })
], CabinetGrid.prototype, "highlightWineId", void 0);
__decorate([
    r()
], CabinetGrid.prototype, "_dragOverCell", void 0);
CabinetGrid = __decorate([
    t("cabinet-grid")
], CabinetGrid);

/** Resize a base64 JPEG (no data: prefix) to a thumbnail data URL for storage.
 *  640px/0.78 keeps back-label text (small print, appellation info) legible
 *  while staying well within reason for a JSON-embedded data URI — roughly
 *  10x the pixels of the old 200px/0.6 default, still only tens of KB. */
function resizeImageForStorage(base64, maxDim = 640, quality = 0.78) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let w = img.width, h = img.height;
            if (w > h) {
                h = Math.round(h * maxDim / w);
                w = maxDim;
            }
            else {
                w = Math.round(w * maxDim / h);
                h = maxDim;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL("image/jpeg", quality);
            resolve(dataUrl);
        };
        img.onerror = () => resolve("");
        img.src = `data:image/jpeg;base64,${base64}`;
    });
}

let StarRating = class StarRating extends i {
    constructor() {
        super(...arguments);
        this.value = 0;
        this.readonly = false;
        this.size = 24;
    }
    _onClick(starIndex, e) {
        if (this.readonly)
            return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const half = x < rect.width / 2;
        const newValue = half ? starIndex + 0.5 : starIndex + 1;
        // Toggle off if clicking same value
        const finalValue = newValue === this.value ? 0 : newValue;
        this.dispatchEvent(new CustomEvent("rating-change", {
            detail: { value: finalValue },
            bubbles: true,
            composed: true,
        }));
    }
    _renderStar(index) {
        const fill = this.value - index;
        const s = this.size;
        let starSvg;
        if (fill >= 1) {
            // Full star
            starSvg = b `
        <svg width=${s} height=${s} viewBox="0 0 24 24">
          <path fill="#f5a623" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      `;
        }
        else if (fill >= 0.5) {
            // Half star
            starSvg = b `
        <svg width=${s} height=${s} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half-${index}">
              <stop offset="50%" stop-color="#f5a623"/>
              <stop offset="50%" stop-color="transparent"/>
            </linearGradient>
          </defs>
          <path fill="url(#half-${index})" stroke="#f5a623" stroke-width="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      `;
        }
        else {
            // Empty star
            starSvg = b `
        <svg width=${s} height=${s} viewBox="0 0 24 24">
          <path fill="none" stroke="#ccc" stroke-width="1.5" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      `;
        }
        return b `
      <span
        class="star ${this.readonly ? "readonly" : ""}"
        @click=${(e) => this._onClick(index, e)}
      >
        ${starSvg}
      </span>
    `;
    }
    render() {
        return b `
      ${[0, 1, 2, 3, 4].map((i) => this._renderStar(i))}
      ${this.value > 0
            ? b `<span class="rating-text">${this.value.toFixed(1)}</span>`
            : ""}
    `;
    }
};
StarRating.styles = i$3 `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .star {
      cursor: pointer;
      position: relative;
      user-select: none;
      transition: transform 0.15s;
    }

    .star:hover {
      transform: scale(1.2);
    }

    .star.readonly {
      cursor: default;
    }

    .star.readonly:hover {
      transform: none;
    }

    .star svg {
      display: block;
    }

    .rating-text {
      margin-left: 6px;
      font-size: 0.9em;
      font-weight: 600;
      color: var(--wc-text, #212121);
    }
  `;
__decorate([
    n({ type: Number })
], StarRating.prototype, "value", void 0);
__decorate([
    n({ type: Boolean })
], StarRating.prototype, "readonly", void 0);
__decorate([
    n({ type: Number })
], StarRating.prototype, "size", void 0);
StarRating = __decorate([
    t("star-rating")
], StarRating);

// Shared camera diagnostics.
//
// Both camera components used to decide what went wrong by substring-matching
// err.message ("NotAllowed", "Permission"). The name is in err.name, and
// Safari's message text ("The request is not allowed by the user agent or the
// platform in the current context.") matches neither, so on iOS every failure
// fell through to a generic "could not access camera" that told the user
// nothing about the actual cause.
// Why the live camera cannot even be attempted, or "" when it can be.
//
// Over plain http:// the page is not a secure context and the browser does not
// expose navigator.mediaDevices at all — calling getUserMedia throws a
// TypeError that reads like a mysterious failure. There is no code-side fix
// for that, so the honest move is to say it up front and point at the device's
// own camera, which needs no secure context.
function cameraBlockedReason() {
    if (typeof window !== "undefined" && !window.isSecureContext) {
        return ("The live camera needs a secure connection. Home Assistant is being served over " +
            "http://, and browsers only allow camera access over https:// (or on localhost).");
    }
    if (!navigator.mediaDevices?.getUserMedia) {
        return "This browser does not offer live camera access.";
    }
    return "";
}
// A getUserMedia failure, in words that suggest what to do about it.
function describeCameraError(err) {
    switch (err?.name) {
        case "NotAllowedError":
        case "SecurityError":
            return "Camera access was denied. Allow it for this site in your browser settings.";
        case "NotFoundError":
        case "OverconstrainedError":
            return "No camera found on this device.";
        case "NotReadableError":
        case "AbortError":
            return "The camera is busy or unavailable — another app may be using it.";
        default:
            return `Could not access the camera${err?.name ? ` (${err.name})` : ""}.`;
    }
}

let LabelCamera = class LabelCamera extends i {
    constructor() {
        super(...arguments);
        this.active = false;
        this._stream = null;
        this._error = "";
        this._captured = false;
        this._capturedImage = "";
    }
    updated(changedProps) {
        if (changedProps.has("active")) {
            if (this.active && !this._captured) {
                this._startCamera();
            }
            else if (!this.active) {
                this._stopCamera();
                this._captured = false;
                this._capturedImage = "";
            }
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._stopCamera();
    }
    async _startCamera() {
        this._error = "";
        // Ask why before asking for the camera: over http:// there is nothing to
        // ask, and a TypeError from a missing navigator.mediaDevices would read as
        // a generic failure.
        const blocked = cameraBlockedReason();
        if (blocked) {
            this._error = blocked;
            return;
        }
        try {
            this._stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 960 },
                    height: { ideal: 1280 },
                    aspectRatio: { ideal: 3 / 4 },
                },
                audio: false,
            });
            await this.updateComplete;
            const video = this.renderRoot.querySelector("video");
            if (video && this._stream) {
                video.srcObject = this._stream;
            }
        }
        catch (err) {
            this._error = describeCameraError(err);
        }
    }
    _stopCamera() {
        if (this._stream) {
            this._stream.getTracks().forEach((t) => t.stop());
            this._stream = null;
        }
    }
    async _capture() {
        const video = this.renderRoot.querySelector("video");
        if (!video)
            return;
        const canvas = document.createElement("canvas");
        const maxDim = 1024;
        let w = video.videoWidth;
        let h = video.videoHeight;
        if (w > maxDim || h > maxDim) {
            const scale = maxDim / Math.max(w, h);
            w = Math.round(w * scale);
            h = Math.round(h * scale);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        const base64 = dataUrl.split(",")[1];
        this._stopCamera();
        this._captured = true;
        this._capturedImage = dataUrl;
        this.dispatchEvent(new CustomEvent("photo-captured", {
            detail: { image: base64 },
            bubbles: true,
            composed: true,
        }));
    }
    _onFileSelected(e) {
        const input = e.target;
        const file = input.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            // Resize if needed
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const maxDim = 1024;
                let w = img.width;
                let h = img.height;
                if (w > maxDim || h > maxDim) {
                    const scale = maxDim / Math.max(w, h);
                    w = Math.round(w * scale);
                    h = Math.round(h * scale);
                }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
                const resizedBase64 = resizedDataUrl.split(",")[1];
                this._stopCamera();
                this._captured = true;
                this._capturedImage = resizedDataUrl;
                this.dispatchEvent(new CustomEvent("photo-captured", {
                    detail: { image: resizedBase64 },
                    bubbles: true,
                    composed: true,
                }));
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    }
    retake() {
        this._captured = false;
        this._capturedImage = "";
        this._startCamera();
    }
    render() {
        if (!this.active)
            return A;
        if (this._captured) {
            return b `
        <img class="captured-preview" src=${this._capturedImage} alt="Captured label" />
      `;
        }
        return b `
      ${this._error
            ? b `
            <div class="error-message">${this._error}</div>
            <div class="hint">
              The button below opens your device's own camera, which works either way.
            </div>
          `
            : b `
            <div class="camera-container">
              <video autoplay playsinline muted></video>
            </div>
            <div class="capture-btn-area">
              <button class="capture-btn" @click=${this._capture} title="Take photo"></button>
            </div>
            <div class="hint">Point the camera at the wine label</div>
          `}

      <div class="fallback-area">
        <label class="file-input-label">
          ${this._error ? "📷 Take a photo" : "📁 Upload from gallery"}
          <input type="file" accept="image/*" capture="environment" @change=${this._onFileSelected} />
        </label>
      </div>
    `;
    }
};
LabelCamera.styles = [
    sharedStyles,
    i$3 `
      :host {
        display: block;
      }

      .camera-container {
        position: relative;
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
        aspect-ratio: 3 / 4;
        border-radius: 12px;
        overflow: hidden;
        background: #000;
      }

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .captured-preview {
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
        display: block;
        border-radius: 12px;
        object-fit: contain;
        max-height: 300px;
      }

      .capture-btn-area {
        display: flex;
        justify-content: center;
        padding: 12px 0;
      }

      .capture-btn {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: 4px solid var(--wc-primary, #722f37);
        background: transparent;
        cursor: pointer;
        position: relative;
        transition: all 0.2s;
      }

      .capture-btn::after {
        content: "";
        position: absolute;
        top: 4px;
        left: 4px;
        right: 4px;
        bottom: 4px;
        border-radius: 50%;
        background: var(--wc-primary, #722f37);
        transition: all 0.15s;
      }

      .capture-btn:hover::after {
        top: 2px;
        left: 2px;
        right: 2px;
        bottom: 2px;
      }

      .capture-btn:active::after {
        top: 8px;
        left: 8px;
        right: 8px;
        bottom: 8px;
      }

      .fallback-area {
        text-align: center;
        padding: 8px 0;
      }

      .file-input-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 8px;
        border: 1px solid var(--wc-border);
        background: transparent;
        color: var(--wc-text-secondary);
        cursor: pointer;
        font-size: 0.85em;
        transition: all 0.2s;
      }

      .file-input-label:hover {
        background: rgba(114, 47, 55, 0.08);
      }

      input[type="file"] {
        display: none;
      }

      .error-message {
        padding: 16px;
        text-align: center;
        color: #ef5350;
        font-size: 0.9em;
      }

      .actions-row {
        display: flex;
        gap: 8px;
        justify-content: center;
        padding: 8px 0;
      }

      .hint {
        text-align: center;
        padding: 4px 0 8px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }
    `,
];
__decorate([
    n({ type: Boolean })
], LabelCamera.prototype, "active", void 0);
__decorate([
    r()
], LabelCamera.prototype, "_stream", void 0);
__decorate([
    r()
], LabelCamera.prototype, "_error", void 0);
__decorate([
    r()
], LabelCamera.prototype, "_captured", void 0);
__decorate([
    r()
], LabelCamera.prototype, "_capturedImage", void 0);
LabelCamera = __decorate([
    t("label-camera")
], LabelCamera);

let WineDetailDialog = class WineDetailDialog extends i {
    constructor() {
        super(...arguments);
        this.wine = null;
        this.cabinets = [];
        this.open = false;
        this.mode = "cellar";
        this._editing = false;
        this._editingFields = false;
        this._editData = {};
        this._userRating = 0;
        this._tastingNotes = { aroma: "", taste: "", finish: "", overall: "" };
        this._saving = false;
        this._refreshing = false;
        this._analyzing = false;
        this._showRemoveConfirm = false;
        this._pendingVivinoImage = null;
        this._showPhotoCamera = false;
        this._photoBusy = false;
        this._photoSide = "front";
        this._photoSwipeStartX = null;
        this._aiFallbackReason = null;
        this.hasGemini = false;
        this.aiFallbackAlways = false;
        this.currency = "USD";
    }
    updated(changedProps) {
        if (changedProps.has("wine") && this.wine) {
            this._userRating = this.wine.user_rating ?? 0;
            this._tastingNotes = this.wine.tasting_notes
                ? { ...this.wine.tasting_notes }
                : { aroma: "", taste: "", finish: "", overall: "" };
            this._editing = false;
            this._editingFields = false;
            this._photoSide = "front";
        }
    }
    _close() {
        this.open = false;
        this._editing = false;
        this._editingFields = false;
        this.dispatchEvent(new CustomEvent("close"));
    }
    _startEditingFields() {
        if (!this.wine)
            return;
        this._editData = {
            name: this.wine.name || "",
            winery: this.wine.winery || "",
            vintage: this.wine.vintage,
            type: this.wine.type || "red",
            region: this.wine.region || "",
            country: this.wine.country || "",
            grape_variety: this.wine.grape_variety || "",
            price: this.wine.price,
            retail_price: this.wine.retail_price,
            purchase_date: this.wine.purchase_date || "",
            drink_by: this.wine.drink_by || "",
            notes: this.wine.notes || "",
            alcohol: this.wine.alcohol || "",
        };
        this._editingFields = true;
    }
    _cancelEditingFields() {
        this._editingFields = false;
        this._editData = {};
    }
    _updateEditField(field, value) {
        this._editData = { ...this._editData, [field]: value };
    }
    // Applying a result to whatever is on screen now is only correct if it is
    // still the same bottle. A Vivino refresh takes a second or two — long
    // enough to close the dialog and open another wine — and the old result
    // would then overwrite the new bottle wholesale, id included, silently
    // showing the previous wine under the new one's name.
    _applyIfStillShowing(wineId, patch) {
        if (!this.wine || this.wine.id !== wineId)
            return false;
        this.wine = { ...this.wine, ...patch };
        return true;
    }
    async _saveFields() {
        const wineId = this.wine?.id ?? "";
        if (!this.wine || !this.hass)
            return;
        this._saving = true;
        try {
            const updates = { ...this._editData };
            // Convert empty strings to null for numeric fields
            if (updates.vintage === "" || updates.vintage === null)
                updates.vintage = null;
            else
                updates.vintage = parseInt(updates.vintage) || null;
            if (updates.price === "" || updates.price === null)
                updates.price = null;
            else
                updates.price = parseFloat(updates.price) || null;
            if (updates.retail_price === "" || updates.retail_price === null)
                updates.retail_price = null;
            else
                updates.retail_price = parseFloat(updates.retail_price) || null;
            if (this.mode === "buylist") {
                await this.hass.callWS({
                    type: "wine_cellar/update_buy_list_item",
                    item_id: this.wine.id,
                    updates,
                });
                if (!this._applyIfStillShowing(wineId, updates))
                    return;
                this._editingFields = false;
                this._editData = {};
                this.dispatchEvent(new CustomEvent("buy-list-updated", { bubbles: true, composed: true }));
            }
            else {
                await this.hass.callWS({
                    type: "wine_cellar/update_wine",
                    wine_id: this.wine.id,
                    updates,
                });
                if (!this._applyIfStillShowing(wineId, updates))
                    return;
                this._editingFields = false;
                this._editData = {};
                this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
            }
        }
        catch (err) {
            console.error("Failed to save wine fields", err);
        }
        this._saving = false;
    }
    _onRemove() {
        if (!this.wine)
            return;
        if (this.mode === "buylist") {
            this.dispatchEvent(new CustomEvent("remove-buy-list-item", {
                detail: { item_id: this.wine.id },
                bubbles: true,
                composed: true,
            }));
            this._close();
        }
        else {
            // Show reason prompt for cellar wines
            this._showRemoveConfirm = true;
        }
    }
    _confirmRemove(reason) {
        if (!this.wine)
            return;
        this.dispatchEvent(new CustomEvent("remove-wine", {
            detail: { wine_id: this.wine.id, reason },
            bubbles: true,
            composed: true,
        }));
        this._showRemoveConfirm = false;
        this._close();
    }
    _onLocate() {
        if (this.wine) {
            this.dispatchEvent(new CustomEvent("locate-wine", {
                detail: { wine: this.wine },
                bubbles: true,
                composed: true,
            }));
            this._close();
        }
    }
    _onMove() {
        if (this.wine) {
            this.dispatchEvent(new CustomEvent("move-wine", {
                detail: { wine: this.wine },
                bubbles: true,
                composed: true,
            }));
            this._close();
        }
    }
    _onCopy() {
        if (this.wine) {
            this.dispatchEvent(new CustomEvent("copy-wine", {
                detail: { wine: this.wine },
                bubbles: true,
                composed: true,
            }));
            this._close();
        }
    }
    _onRatingChange(e) {
        this._userRating = e.detail.value;
    }
    _onTastingChange(field, e) {
        const value = e.target.value;
        this._tastingNotes = { ...this._tastingNotes, [field]: value };
    }
    async _saveRating() {
        const wineId = this.wine?.id ?? "";
        if (!this.wine || !this.hass)
            return;
        this._saving = true;
        try {
            const updates = {
                user_rating: this._userRating || null,
                tasting_notes: this._hasTastingNotes() ? this._tastingNotes : null,
            };
            if (this.mode === "buylist") {
                await this.hass.callWS({
                    type: "wine_cellar/update_buy_list_item",
                    item_id: this.wine.id,
                    updates,
                });
            }
            else {
                await this.hass.callWS({
                    type: "wine_cellar/update_wine",
                    wine_id: this.wine.id,
                    updates,
                });
            }
            if (!this._applyIfStillShowing(wineId, updates))
                return;
            this._editing = false;
            this.dispatchEvent(new CustomEvent(this.mode === "buylist" ? "buy-list-updated" : "wine-updated", { bubbles: true, composed: true }));
        }
        catch (err) {
            console.error("Failed to save rating/notes", err);
        }
        this._saving = false;
    }
    async _refreshFromVivino() {
        const wineId = this.wine?.id ?? "";
        if (!this.wine || !this.hass)
            return;
        this._refreshing = true;
        try {
            const resp = await this.hass.callWS({
                type: "wine_cellar/refresh_wine",
                wine_id: this.wine.id,
            });
            if (resp.no_vivino_match) {
                this._refreshing = false;
                if (!resp.ai_available) {
                    alert(resp.error);
                    return;
                }
                if (this.aiFallbackAlways) {
                    await this._analyzeWithAI();
                }
                else {
                    this._aiFallbackReason = "no_match";
                }
                return;
            }
            if (resp.error) {
                alert(resp.error);
            }
            else if (resp.wine) {
                if (!this._applyIfStillShowing(wineId, resp.wine))
                    return;
                this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
                if (resp.vivino_image_url) {
                    this._pendingVivinoImage = resp.vivino_image_url;
                }
                if (resp.price_needs_ai) {
                    this._aiFallbackReason = "no_price";
                }
            }
        }
        catch (err) {
            console.error("Vivino refresh failed", err);
        }
        this._refreshing = false;
    }
    async _confirmAiFallback(remember) {
        this._aiFallbackReason = null;
        if (remember) {
            this.dispatchEvent(new CustomEvent("set-ai-fallback-always", {
                detail: { value: true },
                bubbles: true,
                composed: true,
            }));
        }
        await this._analyzeWithAI();
    }
    _dismissAiFallback() {
        this._aiFallbackReason = null;
    }
    async _updatePhoto(image_url, field = "image_url") {
        const wineId = this.wine?.id ?? "";
        if (!this.wine || !this.hass)
            return;
        this._photoBusy = true;
        try {
            const updates = { [field]: image_url };
            if (this.mode === "buylist") {
                await this.hass.callWS({ type: "wine_cellar/update_buy_list_item", item_id: this.wine.id, updates });
            }
            else {
                await this.hass.callWS({ type: "wine_cellar/update_wine", wine_id: this.wine.id, updates });
            }
            if (!this._applyIfStillShowing(wineId, { [field]: image_url }))
                return;
            this.dispatchEvent(new CustomEvent(this.mode === "buylist" ? "buy-list-updated" : "wine-updated", { bubbles: true, composed: true }));
        }
        catch (err) {
            console.error("Failed to update photo", err);
        }
        this._photoBusy = false;
    }
    _onImageSwipeStart(e) {
        this._photoSwipeStartX = e.clientX;
    }
    _onImageSwipeEnd(e) {
        if (this._photoSwipeStartX === null)
            return;
        const dx = e.clientX - this._photoSwipeStartX;
        this._photoSwipeStartX = null;
        const THRESHOLD = 30;
        if (dx <= -THRESHOLD) {
            this._photoSide = "back";
        }
        else if (dx >= THRESHOLD) {
            this._photoSide = "front";
        }
    }
    _applyVivinoPhoto() {
        if (!this._pendingVivinoImage)
            return;
        const image_url = this._pendingVivinoImage;
        this._pendingVivinoImage = null;
        this._updatePhoto(image_url);
    }
    _dismissVivinoPhoto() {
        this._pendingVivinoImage = null;
    }
    _onDeletePhoto() {
        const field = this._photoSide === "back" ? "back_image_url" : "image_url";
        if (!this.wine?.[field])
            return;
        if (!window.confirm(this._photoSide === "back" ? "Delete this bottle's back label photo?" : "Delete this bottle's photo?"))
            return;
        this._updatePhoto("", field);
    }
    async _onPhotoReplaced(e) {
        this._showPhotoCamera = false;
        const thumbUrl = await resizeImageForStorage(e.detail.image);
        if (thumbUrl) {
            this._updatePhoto(thumbUrl, this._photoSide === "back" ? "back_image_url" : "image_url");
        }
    }
    async _analyzeWithAI() {
        const wineId = this.wine?.id ?? "";
        if (!this.wine || !this.hass)
            return;
        this._analyzing = true;
        try {
            const resp = await this.hass.callWS({
                type: "wine_cellar/analyze_single_wine",
                wine_id: this.wine.id,
            });
            if (resp.error) {
                alert(resp.error);
            }
            else if (resp.wine) {
                if (!this._applyIfStillShowing(wineId, resp.wine))
                    return;
                this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
            }
        }
        catch (err) {
            console.error("AI analysis failed", err);
        }
        this._analyzing = false;
    }
    _splitPairings(text) {
        const result = [];
        let depth = 0;
        let current = "";
        for (const ch of text) {
            if (ch === "(")
                depth++;
            else if (ch === ")")
                depth--;
            if (ch === "," && depth === 0) {
                if (current.trim())
                    result.push(current.trim());
                current = "";
            }
            else {
                current += ch;
            }
        }
        if (current.trim())
            result.push(current.trim());
        return result;
    }
    _hasTastingNotes() {
        const n = this._tastingNotes;
        return !!(n.aroma || n.taste || n.finish || n.overall);
    }
    // A check later than the last update means that attempt found nothing —
    // worth showing, so a fruitless retry stays visibly different from never
    // having tried at all.
    _renderSourceDates(updatedAt, checkedAt) {
        if (!updatedAt) {
            return b `nothing found · checked ${this._formatUpdatedAt(checkedAt)}`;
        }
        if (checkedAt && checkedAt > updatedAt) {
            return b `${this._formatUpdatedAt(updatedAt)} · rechecked
        ${this._formatUpdatedAt(checkedAt)}, nothing new`;
        }
        return b `${this._formatUpdatedAt(updatedAt)}`;
    }
    _formatUpdatedAt(iso) {
        if (!iso)
            return "";
        const d = new Date(iso);
        if (isNaN(d.getTime()))
            return "";
        return d.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }
    _renderEditForm() {
        const d = this._editData;
        return b `
      <div class="edit-form">
        <div class="form-group">
          <label>Wine Name</label>
          <input type="text" .value=${d.name}
            @input=${(e) => this._updateEditField("name", e.target.value)} />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Winery</label>
            <input type="text" .value=${d.winery}
              @input=${(e) => this._updateEditField("winery", e.target.value)} />
          </div>
          <div class="form-group">
            <label>Vintage</label>
            <input type="number" .value=${d.vintage?.toString() || ""}
              @input=${(e) => this._updateEditField("vintage", e.target.value)} />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Type</label>
            <select .value=${d.type}
              @change=${(e) => this._updateEditField("type", e.target.value)}>
              ${Object.entries(WINE_TYPE_LABELS).map(([value, label]) => b `<option value=${value} ?selected=${d.type === value}>${label}</option>`)}
            </select>
          </div>
          <div class="form-group">
            <label>Purchase Price</label>
            <input type="number" step="0.01" .value=${d.price?.toString() || ""}
              @input=${(e) => this._updateEditField("price", e.target.value)} />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Current Value</label>
            <input type="number" step="0.01" .value=${d.retail_price?.toString() || ""}
              @input=${(e) => this._updateEditField("retail_price", e.target.value)} />
          </div>
          <div class="form-group">
            <label>Region</label>
            <input type="text" .value=${d.region}
              @input=${(e) => this._updateEditField("region", e.target.value)} />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Country</label>
            <input type="text" .value=${d.country}
              @input=${(e) => this._updateEditField("country", e.target.value)} />
          </div>
          <div class="form-group">
            <label>Grape Variety</label>
            <input type="text" .value=${d.grape_variety}
              @input=${(e) => this._updateEditField("grape_variety", e.target.value)} />
          </div>
          <div class="form-group">
            <label>Alcohol</label>
            <input type="text" .value=${d.alcohol} placeholder="e.g. 13.5%"
              @input=${(e) => this._updateEditField("alcohol", e.target.value)} />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Purchase Date</label>
            <input type="date" .value=${d.purchase_date}
              @input=${(e) => this._updateEditField("purchase_date", e.target.value)} />
          </div>
          <div class="form-group">
            <label>Drink By</label>
            <input type="text" placeholder="e.g. 2030" .value=${d.drink_by}
              @input=${(e) => this._updateEditField("drink_by", e.target.value)} />
          </div>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea .value=${d.notes}
            @input=${(e) => this._updateEditField("notes", e.target.value)}></textarea>
        </div>
      </div>

      <div class="edit-actions">
        <button class="btn btn-outline" @click=${this._cancelEditingFields}>Cancel</button>
        <button class="btn btn-primary" ?disabled=${this._saving} @click=${this._saveFields}>
          ${this._saving ? "Saving..." : "Save"}
        </button>
      </div>
    `;
    }
    render() {
        if (!this.open || !this.wine)
            return A;
        const wine = this.wine;
        const typeColor = WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red;
        const typeLabel = WINE_TYPE_LABELS[wine.type] || wine.type;
        const showingBack = this._photoSide === "back";
        const currentImageUrl = showingBack ? wine.back_image_url : wine.image_url;
        return b `
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" style="position:relative" @click=${(e) => e.stopPropagation()}>
          <div class="dialog-top-bar">
            ${this.mode !== "winelist"
            ? b `<button class="icon-btn" title="Edit" @click=${this._startEditingFields}>✏️</button>`
            : A}
            <button class="icon-btn close-btn" title="Close" @click=${this._close}>✕</button>
          </div>
          <div class="wine-header">
            <div class="wine-image-col">
              <div
                class="wine-image-wrap"
                @pointerdown=${this._onImageSwipeStart}
                @pointerup=${this._onImageSwipeEnd}
              >
                ${currentImageUrl
            ? b `<img class="wine-image" src="${currentImageUrl}" alt="${wine.name}${showingBack ? " (back label)" : ""}" />`
            : b `
                      <div class="wine-image-placeholder" style="background: ${typeColor}">
                        🍷
                      </div>
                    `}
                ${showingBack ? b `<div class="photo-side-badge">Back label</div>` : A}
                <div class="photo-dots">
                  <span
                    class="photo-dot ${this._photoSide === "front" ? "active" : ""}"
                    title="Front label"
                    @click=${() => (this._photoSide = "front")}
                  ></span>
                  <span
                    class="photo-dot ${showingBack ? "active" : ""}"
                    title="Back label"
                    @click=${() => (this._photoSide = "back")}
                  ></span>
                </div>
                ${this.mode !== "winelist"
            ? b `
                      <div class="photo-actions">
                        <button
                          class="photo-action-btn"
                          title="Replace ${showingBack ? "back label " : ""}photo"
                          ?disabled=${this._photoBusy}
                          @click=${() => (this._showPhotoCamera = true)}
                        >📷</button>
                        ${currentImageUrl
                ? b `<button
                              class="photo-action-btn"
                              title="Delete ${showingBack ? "back label " : ""}photo"
                              ?disabled=${this._photoBusy}
                              @click=${this._onDeletePhoto}
                            >🗑️</button>`
                : A}
                      </div>
                    `
            : A}
              </div>
              ${this.mode === "cellar"
            ? b `
                    <div class="wine-location" title="Tap to locate" @click=${this._onLocate}>
                      📍 ${getWineLocation(wine, this.cabinets).text}
                    </div>
                  `
            : A}
            </div>
            <div class="wine-title">
              <div class="wine-name">${wine.name}</div>
              <div class="wine-winery">${wine.winery}</div>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                <span class="wine-type-badge" style="background: ${typeColor}">
                  ${typeLabel}
                </span>
                ${wine.disposition
            ? b `<span class="wine-type-badge" style="background: ${wine.disposition === "D" ? "#2e7d32" :
                wine.disposition === "H" ? "#1565c0" :
                    wine.disposition === "P" ? "#c62828" : "#666"}">${wine.disposition === "D" ? "Drink Now" :
                wine.disposition === "H" ? "Hold" :
                    wine.disposition === "P" ? "Past Peak" : wine.disposition}</span>`
            : A}
              </div>
              ${wine.rating
            ? b `
                    <div class="wine-rating">
                      <span class="rating-star">★</span>
                      ${wine.rating.toFixed(1)}
                      <span style="font-size:0.8em;color:var(--wc-text-secondary)">
                        Vivino${wine.ratings_count ? ` (${wine.ratings_count.toLocaleString()} ratings)` : ""}
                      </span>
                    </div>
                  `
            : A}
              ${this.mode !== "winelist"
            ? b `
                    <div style="display:flex;align-items:center;gap:6px;margin-top:4px;font-size:0.9em">
                      <span style="font-size:0.8em;color:var(--wc-text-secondary)">My Rating</span>
                      <star-rating
                        .value=${this._userRating}
                        .readonly=${!this._editing}
                        .size=${20}
                        @rating-change=${this._onRatingChange}
                      ></star-rating>
                      ${!this._editing && this._userRating === 0
                ? b `<span class="no-rating" style="font-size:0.8em">Not rated</span>`
                : A}
                      <button class="edit-toggle" style="font-size:0.75em;padding:2px 6px" @click=${() => (this._editing = !this._editing)}>
                        ${this._editing ? "Cancel" : "Edit"}
                      </button>
                    </div>
                  `
            : A}
            </div>
          </div>

          ${!this._editingFields && (this.mode === "cellar" || this.mode === "buylist")
            ? b `
                <div class="actions">
                  <button class="btn btn-primary" style="background:#8e24aa"
                    ?disabled=${this._refreshing} @click=${this._refreshFromVivino}>
                    ${this._refreshing ? "..." : "🍇 Vivino"}
                  </button>
                  ${this.hasGemini
                ? b `<button class="btn btn-primary" style="background:#1565c0"
                        ?disabled=${this._analyzing} @click=${this._analyzeWithAI}>
                        ${this._analyzing ? "..." : "🤖 AI Scan"}
                      </button>`
                : A}
                  ${this.mode === "cellar"
                ? b `
                        <button class="btn btn-primary" style="background:#546e7a" @click=${this._onCopy}>📋 Copy</button>
                        <button class="btn btn-primary" style="background:#6d4c41" @click=${this._onMove}>↔ Move</button>
                      `
                : A}
                  <button class="btn btn-primary" style="background:#c62828"
                    @click=${this._onRemove}>✕ Remove</button>
                </div>
                ${wine.vivino_checked_at || wine.ai_checked_at || wine.vivino_updated_at || wine.ai_updated_at
                ? b `
                      <div style="text-align:center;font-size:0.68em;color:var(--wc-text-secondary);margin-top:-6px;padding-bottom:10px">
                        ${wine.vivino_checked_at || wine.vivino_updated_at
                    ? b `${wine.vivino_id
                        ? b `<a
                                  href="https://www.vivino.com/w/${wine.vivino_id}"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style="color:inherit;text-decoration:underline"
                                  @click=${(e) => e.stopPropagation()}
                                >Vivino</a>`
                        : b `Vivino`}: ${this._renderSourceDates(wine.vivino_updated_at, wine.vivino_checked_at)}`
                    : A}
                        ${(wine.vivino_checked_at || wine.vivino_updated_at) &&
                    (wine.ai_checked_at || wine.ai_updated_at)
                    ? " · "
                    : A}
                        ${wine.ai_checked_at || wine.ai_updated_at
                    ? b `AI: ${this._renderSourceDates(wine.ai_updated_at, wine.ai_checked_at)}`
                    : A}
                      </div>
                    `
                : A}
              `
            : A}

          ${this._editingFields
            ? this._renderEditForm()
            : b `
                <!-- Drink by banner for disposition wines -->
                ${wine.disposition
                ? b `
                      <div class="drink-by-banner ${wine.disposition === 'D' ? 'drink' : wine.disposition === 'H' ? 'hold' : wine.disposition === 'P' ? 'past' : ''}">
                        ${wine.disposition === "D"
                    ? (wine.drink_window ? `Drink now \u2022 ${wine.drink_window}` : "Drink now")
                    : wine.disposition === "H"
                        ? (wine.drink_window ? `Hold \u2022 drink ${wine.drink_window}` : wine.drink_by ? `Hold until ${wine.drink_by}` : "Hold")
                        : (wine.drink_window ? `Past peak \u2022 was ${wine.drink_window}` : "Past peak")}
                      </div>
                    `
                : A}

                <!-- Description -->
                ${wine.description
                ? b `<div class="wine-description">${wine.description}</div>`
                : A}

                <!-- Info chips (grape, food, alcohol, etc.) -->
                ${wine.food_pairings || wine.alcohol || wine.grape_variety
                ? b `
                      <div class="info-chips">
                        ${wine.grape_variety
                    ? b `<span class="info-chip"><span class="info-chip-icon">🍇</span> ${wine.grape_variety}</span>`
                    : A}
                        ${wine.alcohol
                    ? b `<span class="info-chip"><span class="info-chip-icon">%</span> ${wine.alcohol}</span>`
                    : A}
                        ${wine.food_pairings
                    ? this._splitPairings(wine.food_pairings).map((food) => b `<span class="info-chip">${food}</span>`)
                    : A}
                      </div>
                    `
                : A}

                <!-- AI Ratings -->
                ${wine.ai_ratings && Object.keys(wine.ai_ratings).length > 0
                ? b `
                      <div class="ai-ratings">
                        ${wine.ai_ratings.rating_ws ? b `<span class="ai-rating-chip">${wine.ai_ratings.rating_ws} <span class="source">WS</span></span>` : A}
                        ${wine.ai_ratings.rating_rp ? b `<span class="ai-rating-chip">${wine.ai_ratings.rating_rp} <span class="source">RP</span></span>` : A}
                        ${wine.ai_ratings.rating_jd ? b `<span class="ai-rating-chip">${wine.ai_ratings.rating_jd} <span class="source">JD</span></span>` : A}
                        ${wine.ai_ratings.rating_ag ? b `<span class="ai-rating-chip">${wine.ai_ratings.rating_ag} <span class="source">AG</span></span>` : A}
                      </div>
                    `
                : A}

                <!-- Drink window (shown when no disposition banner) -->
                ${!(wine.disposition) && wine.drink_window
                ? b `<div class="drink-window">Drink window: ${wine.drink_window}</div>`
                : A}

                <div class="details-grid">
                  ${wine.vintage
                ? b `<div class="detail-item"><span class="detail-label">Vintage</span><span class="detail-value">${wine.vintage}</span></div>`
                : A}
                  ${wine.region
                ? b `<div class="detail-item"><span class="detail-label">Region</span><span class="detail-value">${wine.region}</span></div>`
                : A}
                  ${wine.country
                ? b `<div class="detail-item"><span class="detail-label">Country</span><span class="detail-value">${wine.country}</span></div>`
                : A}
                  ${wine.grape_variety
                ? b `<div class="detail-item"><span class="detail-label">Grape</span><span class="detail-value">${wine.grape_variety}</span></div>`
                : A}
                  ${wine.price
                ? b `<div class="detail-item"><span class="detail-label">${this.mode === "winelist" ? "Price" : "Purchase Price"}</span><span class="detail-value">${this.currency} ${wine.price.toFixed(2)}</span></div>`
                : A}
                  ${wine.retail_price
                ? b `<div class="detail-item"><span class="detail-label">Current Value</span><span class="detail-value">${wine.retail_price_currency || this.currency} ${wine.retail_price.toFixed(2)}</span></div>`
                : A}
                  ${wine.purchase_date && this.mode === "cellar"
                ? b `<div class="detail-item"><span class="detail-label">Purchased</span><span class="detail-value">${wine.purchase_date}</span></div>`
                : A}
                  ${wine.drink_by
                ? b `<div class="detail-item"><span class="detail-label">Drink By</span><span class="detail-value">${wine.drink_by}</span></div>`
                : A}
                  ${wine.barcode && this.mode === "cellar"
                ? b `<div class="detail-item"><span class="detail-label">Barcode</span><span class="detail-value">${wine.barcode}</span></div>`
                : A}
                </div>

                ${wine.notes
                ? b `
                      <div class="wine-notes">
                        <div class="detail-label" style="margin-bottom: 4px">Notes</div>
                        <div class="wine-notes-text">${wine.notes}</div>
                      </div>
                    `
                : A}

                ${this.mode !== "winelist" ? b `
                <div class="divider"></div>

                <!-- Tasting Notes section -->
                <div class="section">
                  <div class="section-header">
                    <span class="section-title">Tasting Notes</span>
                  </div>
                  ${this._editing
                ? b `
                        <div class="tasting-grid">
                          <div class="tasting-field">
                            <label>Aroma</label>
                            <textarea
                              .value=${this._tastingNotes.aroma}
                              placeholder="Berries, oak, vanilla..."
                              @input=${(e) => this._onTastingChange("aroma", e)}
                            ></textarea>
                          </div>
                          <div class="tasting-field">
                            <label>Taste</label>
                            <textarea
                              .value=${this._tastingNotes.taste}
                              placeholder="Full-bodied, tannic..."
                              @input=${(e) => this._onTastingChange("taste", e)}
                            ></textarea>
                          </div>
                          <div class="tasting-field">
                            <label>Finish</label>
                            <textarea
                              .value=${this._tastingNotes.finish}
                              placeholder="Long, smooth..."
                              @input=${(e) => this._onTastingChange("finish", e)}
                            ></textarea>
                          </div>
                          <div class="tasting-field">
                            <label>Overall</label>
                            <textarea
                              .value=${this._tastingNotes.overall}
                              placeholder="Overall impression..."
                              @input=${(e) => this._onTastingChange("overall", e)}
                            ></textarea>
                          </div>
                        </div>
                        <div style="margin-top: 12px; text-align: right">
                          <button
                            class="btn btn-primary"
                            ?disabled=${this._saving}
                            @click=${this._saveRating}
                          >
                            ${this._saving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      `
                : this._hasTastingNotes()
                    ? b `
                          <div class="tasting-grid">
                            ${this._tastingNotes.aroma
                        ? b `<div class="tasting-field"><label>Aroma</label><div class="tasting-value">${this._tastingNotes.aroma}</div></div>`
                        : A}
                            ${this._tastingNotes.taste
                        ? b `<div class="tasting-field"><label>Taste</label><div class="tasting-value">${this._tastingNotes.taste}</div></div>`
                        : A}
                            ${this._tastingNotes.finish
                        ? b `<div class="tasting-field"><label>Finish</label><div class="tasting-value">${this._tastingNotes.finish}</div></div>`
                        : A}
                            ${this._tastingNotes.overall
                        ? b `<div class="tasting-field full-width"><label>Overall</label><div class="tasting-value">${this._tastingNotes.overall}</div></div>`
                        : A}
                          </div>
                        `
                    : b `<div class="no-rating">No tasting notes yet. Tap Edit to add your thoughts.</div>`}
                </div>
                ` : A}

              `}
          ${this._showRemoveConfirm ? b `
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10;border-radius:16px">
              <div style="background:var(--wc-bg);border-radius:12px;padding:24px;max-width:320px;width:90%;text-align:center" @click=${(e) => e.stopPropagation()}>
                <h3 style="margin:0 0 4px;font-size:1em;color:var(--wc-text)">Remove Wine</h3>
                <p style="margin:0 0 16px;font-size:0.85em;color:var(--wc-text-secondary)">Why are you removing this bottle?</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
                  ${REMOVAL_REASONS.map(r => b `
                    <button
                      style="padding:8px 16px;border-radius:20px;border:1px solid var(--wc-border);background:transparent;color:var(--wc-text);cursor:pointer;font-size:0.85em;transition:all 0.15s"
                      @click=${() => this._confirmRemove(r.id)}
                    >${r.label}</button>
                  `)}
                </div>
                <button
                  style="margin-top:12px;padding:6px 16px;border-radius:16px;border:none;background:var(--wc-hover);color:var(--wc-text-secondary);cursor:pointer;font-size:0.8em"
                  @click=${() => (this._showRemoveConfirm = false)}
                >Cancel</button>
              </div>
            </div>
          ` : A}
          ${this._pendingVivinoImage ? b `
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10;border-radius:16px">
              <div style="background:var(--wc-bg);border-radius:12px;padding:24px;max-width:320px;width:90%;text-align:center" @click=${(e) => e.stopPropagation()}>
                <h3 style="margin:0 0 4px;font-size:1em;color:var(--wc-text)">Vivino Photo Available</h3>
                <p style="margin:0 0 12px;font-size:0.85em;color:var(--wc-text-secondary)">Vivino found a different bottle photo. Keep your current photo or use Vivino's?</p>
                <div style="display:flex;gap:12px;justify-content:center;margin-bottom:16px">
                  <div style="text-align:center">
                    <img src="${wine.image_url}" style="width:70px;height:100px;object-fit:cover;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.2)" />
                    <div style="font-size:0.7em;color:var(--wc-text-secondary);margin-top:4px">Current</div>
                  </div>
                  <div style="text-align:center">
                    <img src="${this._pendingVivinoImage}" style="width:70px;height:100px;object-fit:cover;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.2)" />
                    <div style="font-size:0.7em;color:var(--wc-text-secondary);margin-top:4px">Vivino</div>
                  </div>
                </div>
                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
                  <button
                    style="padding:8px 16px;border-radius:20px;border:1px solid var(--wc-border);background:transparent;color:var(--wc-text);cursor:pointer;font-size:0.85em"
                    @click=${this._dismissVivinoPhoto}
                  >Keep My Photo</button>
                  <button class="btn btn-primary" style="background:#8e24aa" @click=${this._applyVivinoPhoto}>Use Vivino's</button>
                </div>
              </div>
            </div>
          ` : A}
          ${this._showPhotoCamera ? b `
            <div
              style="position:absolute;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:10;border-radius:16px;padding:16px"
              @click=${() => (this._showPhotoCamera = false)}
            >
              <div style="width:100%" @click=${(e) => e.stopPropagation()}>
                <label-camera .active=${this._showPhotoCamera} @photo-captured=${this._onPhotoReplaced}></label-camera>
                <div style="text-align:center;margin-top:12px">
                  <button
                    style="padding:6px 16px;border-radius:16px;border:none;background:var(--wc-hover);color:var(--wc-text-secondary);cursor:pointer;font-size:0.85em"
                    @click=${() => (this._showPhotoCamera = false)}
                  >Cancel</button>
                </div>
              </div>
            </div>
          ` : A}
          ${this._aiFallbackReason ? b `
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10;border-radius:16px">
              <div style="background:var(--wc-bg);border-radius:12px;padding:24px;max-width:320px;width:90%;text-align:center" @click=${(e) => e.stopPropagation()}>
                <h3 style="margin:0 0 4px;font-size:1em;color:var(--wc-text)">${this._aiFallbackReason === "no_match" ? "No Vivino Match" : "No Price Found"}</h3>
                <p style="margin:0 0 16px;font-size:0.85em;color:var(--wc-text-secondary)">${this._aiFallbackReason === "no_match"
            ? "Vivino couldn't find a confident match for this wine. Try AI instead?"
            : "Vivino has no price for this wine in the selected currency. Estimate it with AI?"}</p>
                <div style="display:flex;flex-direction:column;gap:8px">
                  <button class="btn btn-primary" style="background:#1565c0" @click=${() => this._confirmAiFallback(false)}>Use AI Once</button>
                  <button
                    style="padding:8px 16px;border-radius:20px;border:1px solid var(--wc-border);background:transparent;color:var(--wc-text);cursor:pointer;font-size:0.85em"
                    @click=${() => this._confirmAiFallback(true)}
                  >Always Use AI Automatically</button>
                  <button
                    style="margin-top:4px;padding:6px 16px;border-radius:16px;border:none;background:var(--wc-hover);color:var(--wc-text-secondary);cursor:pointer;font-size:0.8em"
                    @click=${this._dismissAiFallback}
                  >Cancel</button>
                </div>
              </div>
            </div>
          ` : A}
        </div>
      </div>
    `;
    }
};
WineDetailDialog.styles = [
    sharedStyles,
    i$3 `
      .dialog-top-bar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 4px;
        padding: 8px 12px 0;
      }

      .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1em;
        padding: 6px 8px;
        border-radius: 6px;
        color: var(--wc-text-secondary);
        transition: background 0.2s;
        line-height: 1;
      }

      .icon-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .icon-btn.close-btn {
        font-size: 1.3em;
        font-weight: 600;
      }

      .wine-header {
        display: flex;
        gap: 16px;
        padding: 4px 20px 20px;
      }

      .wine-image {
        width: 135px;
        height: 195px;
        border-radius: 8px;
        object-fit: cover;
        background: #f0f0f0;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .wine-image-wrap {
        position: relative;
        flex-shrink: 0;
        touch-action: pan-y;
      }

      .photo-dots {
        position: absolute;
        top: 6px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 4px;
      }

      .photo-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(0, 0, 0, 0.25);
        cursor: pointer;
      }

      .photo-dot.active {
        background: #fff;
      }

      .photo-side-badge {
        position: absolute;
        bottom: 6px;
        left: 6px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 0.6em;
        padding: 2px 6px;
        border-radius: 10px;
        pointer-events: none;
      }

      .photo-actions {
        position: absolute;
        bottom: 6px;
        right: 6px;
        display: flex;
        gap: 6px;
      }

      .photo-action-btn {
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.95);
        color: #333;
        cursor: pointer;
        font-size: 1em;
        line-height: 1;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
        transition: background 0.15s, transform 0.15s;
      }

      .photo-action-btn:hover {
        background: #fff;
        transform: scale(1.06);
      }

      .photo-action-btn:disabled {
        opacity: 0.5;
        cursor: default;
        transform: none;
      }

      .wine-image-placeholder {
        width: 135px;
        height: 195px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2em;
        flex-shrink: 0;
        color: #fff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }

      .wine-image-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }

      .wine-location {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        width: 90px;
        font-size: 0.68em;
        line-height: 1.3;
        text-align: center;
        color: var(--wc-text-secondary, #888);
        cursor: pointer;
      }

      .wine-location:hover {
        color: var(--wc-primary-text);
        text-decoration: underline;
      }

      .wine-title {
        flex: 1;
        min-width: 0;
      }

      .wine-name {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--wc-text);
        margin-bottom: 4px;
      }

      .wine-winery {
        font-size: 0.9em;
        color: var(--wc-text-secondary);
        margin-bottom: 8px;
      }

      .wine-type-badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 0.75em;
        font-weight: 600;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .wine-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 8px;
        font-size: 0.9em;
      }

      .rating-star {
        color: #f5a623;
      }

      .drink-by-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        font-size: 0.9em;
        font-weight: 500;
      }

      .drink-by-banner.drink {
        background: rgba(46, 125, 50, 0.12);
        color: #2e7d32;
      }

      .drink-by-banner.hold {
        background: rgba(21, 101, 192, 0.12);
        color: #1565c0;
      }

      .drink-by-banner.past {
        background: rgba(198, 40, 40, 0.12);
        color: #c62828;
      }

      .wine-description {
        padding: 0 20px 12px;
        font-size: 0.85em;
        color: var(--wc-text-secondary);
        line-height: 1.4;
        font-style: italic;
      }

      .info-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 20px 12px;
      }

      .info-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 16px;
        font-size: 0.75em;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid var(--wc-border);
        color: var(--wc-text-secondary);
      }

      .info-chip-icon {
        font-size: 1.1em;
      }

      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        padding: 0 20px 16px;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
      }

      .detail-label {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
      }

      .detail-value {
        font-size: 0.95em;
        color: var(--wc-text);
        font-weight: 500;
      }

      .wine-notes {
        padding: 0 20px 16px;
      }

      .wine-notes-text {
        font-size: 0.9em;
        color: var(--wc-text-secondary);
        font-style: italic;
        background: rgba(128, 128, 128, 0.08);
        padding: 10px;
        border-radius: 8px;
      }

      /* Rating & Tasting Notes section */
      .section {
        padding: 0 20px 16px;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .section-title {
        font-size: 0.85em;
        font-weight: 600;
        color: var(--wc-text);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .edit-toggle {
        background: none;
        border: none;
        color: var(--wc-primary-text);
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 6px;
        transition: background 0.2s;
      }

      .edit-toggle:hover {
        background: rgba(109, 76, 65, 0.1);
      }

      .rating-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }

      .rating-label {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        min-width: 70px;
      }

      .no-rating {
        font-size: 0.85em;
        color: var(--wc-text-secondary);
        font-style: italic;
      }

      .tasting-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .tasting-field {
        display: flex;
        flex-direction: column;
      }

      .tasting-field.full-width {
        grid-column: 1 / -1;
      }

      .tasting-field label {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .tasting-field textarea {
        font-family: inherit;
        font-size: 0.85em;
        padding: 8px;
        border: 1px solid var(--wc-border, #e0e0e0);
        border-radius: 8px;
        resize: vertical;
        min-height: 50px;
        background: var(--wc-bg);
        color: var(--wc-text);
      }

      .tasting-field textarea:focus {
        outline: none;
        border-color: var(--wc-primary-text);
      }

      .tasting-value {
        font-size: 0.85em;
        color: var(--wc-text);
        background: rgba(128, 128, 128, 0.08);
        padding: 8px;
        border-radius: 8px;
        min-height: 20px;
      }

      .ai-ratings {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 20px 12px;
      }

      .ai-rating-chip {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 16px;
        font-size: 0.75em;
        background: rgba(245, 166, 35, 0.12);
        border: 1px solid rgba(245, 166, 35, 0.3);
        color: #f5a623;
        font-weight: 600;
      }

      .ai-rating-chip .source {
        font-weight: 400;
        opacity: 0.8;
      }

      .drink-window {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        padding: 0 20px 8px;
      }

      .divider {
        height: 1px;
        background: var(--wc-border, #e0e0e0);
        margin: 0 20px 16px;
      }

      .actions {
        display: flex;
        gap: 6px;
        padding: 0 16px 16px;
        border-bottom: 1px solid var(--wc-border);
        justify-content: center;
        flex-wrap: wrap;
      }

      .actions .btn {
        font-size: 0.8em;
        padding: 6px 10px;
        white-space: nowrap;
      }

      /* Edit form styles */
      .edit-form {
        padding: 0 20px 16px;
      }

      .edit-form .form-group {
        margin-bottom: 12px;
      }

      .edit-form .form-group label {
        display: block;
        font-size: 0.75em;
        font-weight: 500;
        color: var(--wc-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .edit-form .form-group input,
      .edit-form .form-group select,
      .edit-form .form-group textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        font-size: 0.9em;
        background: var(--wc-bg);
        color: var(--wc-text);
        box-sizing: border-box;
        font-family: inherit;
      }

      .edit-form .form-group textarea {
        min-height: 60px;
        resize: vertical;
      }

      .edit-form .form-group input:focus,
      .edit-form .form-group select:focus,
      .edit-form .form-group textarea:focus {
        outline: none;
        border-color: var(--wc-primary);
      }

      .edit-form .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .edit-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding: 12px 20px 20px;
        border-top: 1px solid var(--wc-border);
      }

      @media (max-width: 599px) {
        .tasting-grid {
          grid-template-columns: 1fr;
        }
        .tasting-field.full-width {
          grid-column: 1;
        }
        .edit-form .form-row {
          grid-template-columns: 1fr;
        }
      }
    `,
];
__decorate([
    n({ attribute: false })
], WineDetailDialog.prototype, "wine", void 0);
__decorate([
    n({ attribute: false })
], WineDetailDialog.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], WineDetailDialog.prototype, "cabinets", void 0);
__decorate([
    n({ type: Boolean })
], WineDetailDialog.prototype, "open", void 0);
__decorate([
    n({ type: String })
], WineDetailDialog.prototype, "mode", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_editing", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_editingFields", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_editData", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_userRating", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_tastingNotes", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_saving", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_refreshing", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_analyzing", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_showRemoveConfirm", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_pendingVivinoImage", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_showPhotoCamera", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_photoBusy", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_photoSide", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_aiFallbackReason", void 0);
__decorate([
    n({ type: Boolean })
], WineDetailDialog.prototype, "hasGemini", void 0);
__decorate([
    n({ type: Boolean })
], WineDetailDialog.prototype, "aiFallbackAlways", void 0);
__decorate([
    n({ type: String })
], WineDetailDialog.prototype, "currency", void 0);
WineDetailDialog = __decorate([
    t("wine-detail-dialog")
], WineDetailDialog);

let BarcodeScanner = class BarcodeScanner extends i {
    constructor() {
        super(...arguments);
        this.active = false;
        this._error = "";
        this._scanning = false;
        this._stream = null;
        this._detector = null;
        this._rafId = 0;
    }
    updated(changedProps) {
        if (changedProps.has("active")) {
            if (this.active) {
                this._startScanning();
            }
            else {
                this._stopScanning();
            }
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._stopScanning();
    }
    async _startScanning() {
        if (this._scanning)
            return;
        this._error = "";
        // Check for BarcodeDetector support
        if (!("BarcodeDetector" in window)) {
            this._error = "Barcode scanning is not supported on this browser. Please enter the barcode manually below.";
            this.dispatchEvent(new CustomEvent("scanner-error", {
                detail: { error: this._error },
                bubbles: true,
                composed: true,
            }));
            return;
        }
        const blocked = cameraBlockedReason();
        if (blocked) {
            this._error = `${blocked} Enter the barcode manually below.`;
            this.dispatchEvent(new CustomEvent("scanner-error", {
                detail: { error: this._error },
                bubbles: true,
                composed: true,
            }));
            return;
        }
        try {
            this._stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            await this.updateComplete;
            const video = this.renderRoot.querySelector("video");
            if (video && this._stream) {
                video.srcObject = this._stream;
                await video.play();
            }
            this._detector = new window.BarcodeDetector({
                formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
            });
            this._scanning = true;
            this._scanFrame();
        }
        catch (err) {
            this._error = `${describeCameraError(err)} Enter the barcode manually below.`;
            this.dispatchEvent(new CustomEvent("scanner-error", {
                detail: { error: this._error },
                bubbles: true,
                composed: true,
            }));
        }
    }
    async _scanFrame() {
        if (!this._scanning || !this._detector)
            return;
        const video = this.renderRoot.querySelector("video");
        if (!video || video.readyState < 2) {
            this._rafId = requestAnimationFrame(() => this._scanFrame());
            return;
        }
        try {
            const barcodes = await this._detector.detect(video);
            if (barcodes.length > 0) {
                this._onDetected(barcodes[0].rawValue);
                return;
            }
        }
        catch {
            // Detection error on this frame, continue
        }
        this._rafId = requestAnimationFrame(() => this._scanFrame());
    }
    _stopScanning() {
        this._scanning = false;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = 0;
        }
        if (this._stream) {
            this._stream.getTracks().forEach((t) => t.stop());
            this._stream = null;
        }
        this._detector = null;
    }
    _onDetected(barcode) {
        this._stopScanning();
        this.dispatchEvent(new CustomEvent("barcode-detected", {
            detail: { barcode },
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        if (!this.active)
            return A;
        return b `
      ${this._error
            ? b `<div class="error-message">${this._error}</div>`
            : b `
            <div class="scanner-container">
              <video autoplay playsinline muted></video>
              <div class="scan-overlay">
                <div class="scan-corners"></div>
                <div class="scan-line"></div>
              </div>
            </div>
            <div class="hint">Point the camera at the barcode on the bottle</div>
          `}
    `;
    }
};
BarcodeScanner.styles = [
    sharedStyles,
    i$3 `
      :host {
        display: block;
      }

      .scanner-container {
        position: relative;
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        background: #000;
        max-height: 300px;
      }

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        max-height: 300px;
      }

      .scan-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 10;
      }

      .scan-line {
        position: absolute;
        left: 10%;
        right: 10%;
        height: 2px;
        background: rgba(255, 50, 50, 0.8);
        box-shadow: 0 0 8px rgba(255, 50, 50, 0.5);
        animation: scanMove 2s ease-in-out infinite;
      }

      @keyframes scanMove {
        0%, 100% { top: 20%; }
        50% { top: 80%; }
      }

      .scan-corners {
        position: absolute;
        top: 15%;
        left: 15%;
        right: 15%;
        bottom: 15%;
        border: 2px solid rgba(255, 255, 255, 0.6);
        border-radius: 8px;
      }

      .error-message {
        padding: 16px;
        text-align: center;
        color: #ef5350;
        font-size: 0.9em;
      }

      .hint {
        text-align: center;
        padding: 8px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }

      .fallback-note {
        text-align: center;
        padding: 12px;
        font-size: 0.85em;
        color: var(--wc-text-secondary);
        font-style: italic;
      }
    `,
];
__decorate([
    n({ type: Boolean })
], BarcodeScanner.prototype, "active", void 0);
__decorate([
    r()
], BarcodeScanner.prototype, "_error", void 0);
__decorate([
    r()
], BarcodeScanner.prototype, "_scanning", void 0);
BarcodeScanner = __decorate([
    t("barcode-scanner")
], BarcodeScanner);

let AddWineDialog = class AddWineDialog extends i {
    constructor() {
        super(...arguments);
        this.open = false;
        this.cabinets = [];
        this.wines = [];
        this.preselectedCabinet = "";
        this.preselectedRow = null;
        this.preselectedCol = null;
        this.preselectedZone = "";
        this.preselectedDepth = 0;
        this.buyListMode = false;
        this._step = "scan";
        this._scanMode = "idle";
        this._barcode = "";
        this._loading = false;
        this._quantity = 1;
        this._addProgress = 0;
        this._lookupResult = null;
        this._wineData = {};
        this._error = "";
        this._hasGemini = false;
        this._labelLoading = false;
        this._captureStage = "front";
        this._frontImageRaw = "";
        this._showBackPrompt = false;
        this._searchResults = [];
        // Bumped every time the dialog opens. Label recognition waits up to 45
        // seconds on the AI, which is long enough to cancel, close, and start
        // adding a different bottle — and the late reply would then overwrite that
        // bottle's form with the previous one's reading and jump to the details
        // step. Every async handler here checks the session it started in.
        this._session = 0;
    }
    get _steps() {
        return this.buyListMode
            ? ["scan", "details", "confirm"]
            : ["scan", "details", "location", "confirm"];
    }
    updated(changedProps) {
        if (changedProps.has("open")) {
            if (this.open) {
                this._step = "scan";
                this._scanMode = "idle";
                this._barcode = "";
                this._lookupResult = null;
                this._error = "";
                this._loading = false;
                this._quantity = 1;
                this._addProgress = 0;
                this._session++;
                this._labelLoading = false;
                this._searchResults = [];
                this._captureStage = "front";
                this._frontImageRaw = "";
                this._showBackPrompt = false;
                this._wineData = {
                    name: "",
                    winery: "",
                    type: "red",
                    vintage: null,
                    region: "",
                    country: "",
                    grape_variety: "",
                    price: null,
                    retail_price: null,
                    notes: "",
                    user_rating: null,
                    tasting_notes: null,
                    cabinet_id: this.preselectedCabinet || "",
                    row: this.preselectedRow,
                    col: this.preselectedCol,
                    depth: this.preselectedDepth || 0,
                    zone: this.preselectedZone || "",
                };
                this._checkCapabilities();
            }
            else {
                // Ensure cameras stop when dialog closes
                this._scanMode = "idle";
            }
        }
    }
    async _checkCapabilities() {
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/get_capabilities",
            });
            this._hasGemini = result?.has_gemini || false;
        }
        catch {
            this._hasGemini = false;
        }
    }
    _close() {
        this._scanMode = "idle";
        this.open = false;
        this.dispatchEvent(new CustomEvent("close"));
    }
    async _lookupBarcode() {
        if (!this._barcode.trim())
            return;
        const session = this._session;
        this._loading = true;
        this._error = "";
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/lookup_barcode",
                barcode: this._barcode.trim(),
            });
            if (session !== this._session)
                return;
            if (result.result) {
                this._lookupResult = result.result;
                this._wineData = {
                    ...this._wineData,
                    barcode: this._barcode.trim(),
                    name: result.result.name || "",
                    winery: result.result.winery || "",
                    type: result.result.type || "red",
                    vintage: result.result.vintage,
                    region: result.result.region || "",
                    country: result.result.country || "",
                    grape_variety: result.result.grape_variety || "",
                    rating: result.result.rating,
                    ratings_count: result.result.ratings_count || null,
                    image_url: result.result.image_url || "",
                    description: result.result.description || "",
                    food_pairings: result.result.food_pairings || "",
                    alcohol: result.result.alcohol || "",
                    vivino_updated_at: result.result.source === "vivino" ? new Date().toISOString() : this._wineData.vivino_updated_at,
                    vivino_checked_at: result.result.source === "vivino" ? new Date().toISOString() : this._wineData.vivino_checked_at,
                };
                this._step = "details";
            }
            else {
                this._wineData = { ...this._wineData, barcode: this._barcode.trim() };
                this._onBarcodeLookupFailed("No match for this barcode.");
            }
        }
        catch (err) {
            if (session !== this._session)
                return;
            this._wineData = { ...this._wineData, barcode: this._barcode.trim() };
            this._onBarcodeLookupFailed("Barcode lookup failed.");
        }
        this._loading = false;
    }
    _onBarcodeLookupFailed(reason) {
        // Not every bottle has a scannable/known barcode — fall back to AI
        // label recognition automatically instead of dead-ending on "enter
        // details manually" when it's available.
        if (this._hasGemini) {
            this._scanMode = "label";
            this._labelLoading = false;
            this._showBackPrompt = false;
            this._captureStage = "front";
            this._frontImageRaw = "";
            this._error = `${reason} Take a photo of the label instead.`;
        }
        else {
            this._error = `${reason} You can enter details manually.`;
        }
    }
    async _searchWine() {
        const session = this._session;
        const input = this.shadowRoot?.querySelector(".search-input");
        if (!input?.value.trim())
            return;
        this._loading = true;
        this._error = "";
        this._searchResults = [];
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/search_wine",
                query: input.value.trim(),
            });
            if (session !== this._session)
                return;
            if (result.results && result.results.length > 0) {
                this._searchResults = result.results;
            }
            else {
                this._error = "No results found. You can enter details manually.";
            }
        }
        catch {
            this._error = "Search failed. You can enter details manually.";
        }
        this._loading = false;
    }
    _selectSearchResult(item) {
        this._lookupResult = item;
        this._wineData = {
            ...this._wineData,
            name: item.name || "",
            winery: item.winery || "",
            type: item.type || "red",
            vintage: item.vintage,
            region: item.region || "",
            country: item.country || "",
            grape_variety: item.grape_variety || "",
            rating: item.rating,
            ratings_count: item.ratings_count || null,
            image_url: item.image_url || "",
            description: item.description || "",
            food_pairings: item.food_pairings || "",
            alcohol: item.alcohol || "",
            vivino_updated_at: new Date().toISOString(),
            vivino_checked_at: new Date().toISOString(),
        };
        this._searchResults = [];
        this._step = "details";
    }
    _onBarcodeDetected(e) {
        this._barcode = e.detail.barcode;
        this._scanMode = "idle";
        this._lookupBarcode();
    }
    _onLabelPhotoCaptured(e) {
        if (this._captureStage === "front") {
            this._frontImageRaw = e.detail.image;
            this._showBackPrompt = true;
        }
        else {
            this._finishLabelScan(e.detail.image);
        }
    }
    async _finishLabelScan(backImageRaw) {
        const session = this._session;
        this._showBackPrompt = false;
        this._labelLoading = true;
        this._error = "";
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/recognize_label",
                image: this._frontImageRaw,
                ...(backImageRaw ? { back_image: backImageRaw } : {}),
            });
            // The slowest wait in the app. If the dialog was reopened meanwhile,
            // this reading belongs to a bottle the user has moved on from.
            if (session !== this._session)
                return;
            if (result.result) {
                // Resize captured photos to thumbnails for storage
                const thumbUrl = await resizeImageForStorage(this._frontImageRaw);
                const backThumbUrl = backImageRaw ? await resizeImageForStorage(backImageRaw) : "";
                const r = result.result;
                this._wineData = {
                    ...this._wineData,
                    name: r.name || "",
                    winery: r.winery || "",
                    type: r.type || "red",
                    vintage: r.vintage,
                    region: r.region || "",
                    country: r.country || "",
                    grape_variety: r.grape_variety || "",
                    disposition: r.disposition || "",
                    drink_by: r.drink_by || "",
                    drink_window: r.drink_window || "",
                    description: r.description || "",
                    retail_price: r.estimated_price || null,
                    ai_ratings: r.ai_ratings || null,
                    notes: r.notes || "",
                    barcode: r.barcode || this._wineData.barcode || "",
                    image_url: thumbUrl,
                    back_image_url: backThumbUrl,
                    ai_updated_at: new Date().toISOString(),
                    ai_checked_at: new Date().toISOString(),
                };
                this._scanMode = "idle";
                this._step = "details";
                this._captureStage = "front";
                this._frontImageRaw = "";
            }
            else {
                // Show specific error from backend if available
                const errorDetail = result.error || "Unknown error";
                this._error = `Label recognition failed: ${errorDetail}`;
                console.error("Wine Cellar: label recognition failed:", errorDetail);
            }
        }
        catch (err) {
            if (session !== this._session)
                return;
            const msg = err?.message || String(err);
            console.error("Wine Cellar: label recognition error:", msg);
            this._error = `Label recognition error: ${msg}`;
        }
        this._labelLoading = false;
    }
    _goToStep(step) {
        this._step = step;
    }
    _updateField(field, value) {
        this._wineData = { ...this._wineData, [field]: value };
    }
    _zoneUsage(sr) {
        const cabinet = this.cabinets.find((c) => c.id === this._wineData.cabinet_id);
        const container = {
            cabinetId: this._wineData.cabinet_id || "",
            kind: "zone",
            zone: `storage-${sr.row}`,
            row: null,
            col: null,
        };
        return containerUsage(container, cabinet, this.wines);
    }
    _selectZone(sr) {
        // Adding a bottle used to append past the end of a full bin, silently
        // growing it beyond its configured capacity. Refuse instead, the way
        // drag-and-drop and paste already do.
        const { used, capacity, nextDepth, full } = this._zoneUsage(sr);
        const label = sr.name || (sr.type === "box" ? "This box" : "This bin");
        if (full) {
            this._error = `${label} is full (${used}/${capacity}). Free a slot, or raise its capacity in Manage Racks.`;
            return;
        }
        this._error = "";
        this._wineData = {
            ...this._wineData,
            zone: `storage-${sr.row}`,
            row: null,
            col: null,
            depth: nextDepth,
        };
    }
    // Send the bottle to a container the suggestion strip proposed, landing on
    // its first free depth.
    _applyContainer(c) {
        const cabinet = this.cabinets.find((cab) => cab.id === c.cabinetId);
        const patch = placementIn(c, cabinet, this.wines);
        if (!patch) {
            this._error = `${containerLabel(c, this.cabinets)} is full. Free a slot, or raise its capacity in Manage Racks.`;
            return;
        }
        this._error = "";
        this._wineData = { ...this._wineData, ...patch };
    }
    _planSlots(count) {
        return planSlots(this._wineData, this.cabinets, this.wines, count);
    }
    // Free space at the chosen destination; null when there is no limit.
    _availableSlots() {
        const free = freeAt(this._wineData, this.cabinets, this.wines);
        return Number.isFinite(free) ? free : null;
    }
    _setQuantity(value) {
        const available = this._availableSlots();
        const max = available === null ? 99 : Math.max(1, Math.min(99, available));
        this._quantity = Math.max(1, Math.min(max, Math.round(value) || 1));
    }
    async _addWine() {
        this._loading = true;
        try {
            if (this.buyListMode) {
                await this.hass.callWS({
                    type: "wine_cellar/add_to_buy_list",
                    wine: this._wineData,
                });
                this.dispatchEvent(new CustomEvent("buy-list-updated", { bubbles: true, composed: true }));
            }
            else {
                const slots = this._planSlots(this._quantity);
                if (!slots.length) {
                    this._error = "No free slot left at that destination.";
                    this._loading = false;
                    return;
                }
                // Each bottle is added at its own slot, so identical bottles never
                // stack on top of each other.
                const addedIds = [];
                for (let i = 0; i < slots.length; i++) {
                    this._addProgress = i + 1;
                    const result = await this.hass.callWS({
                        type: "wine_cellar/add_wine",
                        wine: { ...this._wineData, ...slots[i] },
                    });
                    if (result?.wine?.id)
                        addedIds.push(result.wine.id);
                }
                // A bin is a pile: what you just put in sits on top, so the new
                // bottles take the first slots and the rest shift down. One call
                // renumbers the bin; listing only the new ids is enough, the backend
                // appends the others in their existing order.
                if (this._wineData.zone && addedIds.length) {
                    await this.hass.callWS({
                        type: "wine_cellar/reorder_zone",
                        cabinet_id: this._wineData.cabinet_id,
                        zone: this._wineData.zone,
                        wine_ids: addedIds,
                    });
                }
                this.dispatchEvent(new CustomEvent("wine-added", { bubbles: true, composed: true }));
            }
            this._close();
        }
        catch (err) {
            this._error = this.buyListMode ? "Failed to add to buy list." : "Failed to add wine.";
        }
        this._addProgress = 0;
        this._loading = false;
    }
    async _quickAddToBuyList() {
        if (!this._wineData.name)
            return;
        this._loading = true;
        try {
            await this.hass.callWS({
                type: "wine_cellar/add_to_buy_list",
                wine: this._wineData,
            });
            this.dispatchEvent(new CustomEvent("buy-list-updated", { bubbles: true, composed: true }));
            this._close();
        }
        catch (err) {
            this._error = "Failed to add to buy list.";
        }
        this._loading = false;
    }
    _renderStepIndicator() {
        const currentIdx = this._steps.indexOf(this._step);
        return b `
      <div class="step-indicator">
        ${this._steps.map((s, i) => b `
            <div
              class="step-dot ${i === currentIdx ? "active" : ""} ${i < currentIdx ? "done" : ""}"
            ></div>
          `)}
      </div>
    `;
    }
    _renderScanStep() {
        // Barcode camera mode
        if (this._scanMode === "barcode") {
            return b `
        <div class="scan-section">
          <barcode-scanner
            .active=${true}
            @barcode-detected=${this._onBarcodeDetected}
            @scanner-error=${(e) => { this._error = e.detail.error; this._scanMode = "idle"; }}
          ></barcode-scanner>
          ${this._loading
                ? b `<div class="label-loading"><span class="loading-spinner"></span><div style="margin-top: 8px">Looking up barcode...</div></div>`
                : A}
          ${this._error ? b `<div class="error-msg">${this._error}</div>` : A}
          <div class="camera-actions">
            <button class="btn btn-outline" @click=${() => { this._scanMode = "idle"; this._error = ""; }}>Cancel Scan</button>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click=${this._close}>Cancel</button>
        </div>
      `;
        }
        // Label camera mode
        if (this._scanMode === "label") {
            return b `
        <div class="scan-section">
          ${this._labelLoading
                ? b `
                <div class="label-loading">
                  <span class="loading-spinner"></span>
                  <div style="margin-top: 8px">Analyzing label with AI...</div>
                </div>
              `
                : this._showBackPrompt
                    ? b `
                  <div style="text-align:center;padding:24px 12px">
                    <div style="font-size:2em;margin-bottom:8px">✅</div>
                    <div style="margin-bottom:12px;font-weight:500">Front label captured</div>
                    <p style="font-size:0.85em;color:var(--wc-text-secondary);margin-bottom:16px">
                      Add a photo of the back label too? It often has the vintage year (and sometimes a barcode).
                    </p>
                    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
                      <button class="btn btn-primary" @click=${() => { this._showBackPrompt = false; this._captureStage = "back"; }}>📷 Add Back Photo</button>
                      <button class="btn btn-outline" @click=${() => this._finishLabelScan()}>Skip, Use Front Only</button>
                    </div>
                  </div>
                `
                    : b `
                  ${this._captureStage === "back"
                        ? b `<div class="hint" style="text-align:center;margin-bottom:6px">Now photograph the back label</div>`
                        : A}
                  <label-camera
                    .active=${true}
                    @photo-captured=${this._onLabelPhotoCaptured}
                  ></label-camera>
                `}
          ${this._error ? b `<div class="error-msg">${this._error}</div>` : A}
          <div class="camera-actions">
            <button class="btn btn-outline" @click=${() => {
                this._scanMode = "idle";
                this._error = "";
                this._labelLoading = false;
                this._showBackPrompt = false;
                this._captureStage = "front";
                this._frontImageRaw = "";
            }}>Cancel</button>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click=${this._close}>Cancel</button>
        </div>
      `;
        }
        // Idle mode - show options
        return b `
      <div class="scan-section">
        <div class="scan-options">
          <button class="scan-option" @click=${() => { this._scanMode = "barcode"; this._error = ""; }}>
            <span class="scan-option-icon">📷</span>
            <div class="scan-option-text">
              <div class="scan-option-title">Scan Barcode</div>
              <div class="scan-option-desc">Point camera at wine bottle barcode</div>
            </div>
          </button>

          <button
            class="scan-option ${this._hasGemini ? "" : "disabled"}"
            @click=${() => this._hasGemini && (() => { this._scanMode = "label"; this._error = ""; })()}
            title=${this._hasGemini ? "" : "Configure Gemini API key in integration settings"}
          >
            <span class="scan-option-icon">🤖</span>
            <div class="scan-option-text">
              <div class="scan-option-title">Recognize Label</div>
              <div class="scan-option-desc">
                ${this._hasGemini
            ? "Take a photo of the wine label"
            : "Requires Gemini API key in settings"}
              </div>
            </div>
          </button>
        </div>

        <div class="or-divider">or enter manually</div>

        <div class="barcode-input-row">
          <input
            type="text"
            placeholder="Enter barcode..."
            .value=${this._barcode}
            @input=${(e) => (this._barcode = e.target.value)}
            @keypress=${(e) => e.key === "Enter" && this._lookupBarcode()}
          />
          <button class="btn btn-primary" @click=${this._lookupBarcode}>
            ${this._loading
            ? b `<span class="loading-spinner"></span>`
            : "Look Up"}
          </button>
        </div>

        ${this._lookupResult
            ? b `
              <div class="lookup-result">
                <div class="result-name">${this._lookupResult.name}</div>
                <div class="result-detail">
                  ${this._lookupResult.winery}
                  ${this._lookupResult.vintage
                ? ` · ${this._lookupResult.vintage}`
                : ""}
                </div>
              </div>
            `
            : A}

        <div class="or-divider">or search by name</div>

        <div class="barcode-input-row">
          <input
            class="search-input"
            type="text"
            placeholder="Search wine name..."
            @keypress=${(e) => e.key === "Enter" && this._searchWine()}
          />
          <button class="btn btn-outline" @click=${this._searchWine}>
            ${this._loading
            ? b `<span class="loading-spinner"></span>`
            : "Search"}
          </button>
        </div>

        ${this._searchResults.length > 0
            ? b `
              <div class="search-results">
                <div class="search-results-label">
                  ${this._searchResults.length} result${this._searchResults.length > 1 ? "s" : ""} — tap to select
                </div>
                ${this._searchResults.map((item) => b `
                    <button
                      class="search-result-item"
                      @click=${() => this._selectSearchResult(item)}
                    >
                      ${item.image_url
                ? b `<img class="search-result-thumb" src="${item.image_url}" alt="" />`
                : b `<div class="search-result-thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.2em;">🍷</div>`}
                      <div class="search-result-info">
                        <div class="search-result-name">${item.name || "Unknown"}</div>
                        <div class="search-result-meta">
                          ${item.winery || ""}${item.vintage ? ` · ${item.vintage}` : ""}${item.region ? ` · ${item.region}` : ""}
                        </div>
                      </div>
                      ${item.rating
                ? b `<span class="search-result-rating">★ ${item.rating.toFixed(1)}</span>`
                : A}
                    </button>
                  `)}
              </div>
            `
            : A}

        ${this._error
            ? b `<div class="error-msg">${this._error}</div>`
            : A}
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${this._close}>Cancel</button>
        <button
          class="btn btn-outline"
          @click=${() => this._goToStep("details")}
        >
          Skip → Manual Entry
        </button>
      </div>
    `;
    }
    _renderDetailsStep() {
        return b `
      <div class="dialog-body">
        <div class="form-group">
          <label>Wine Name *</label>
          <input
            type="text"
            .value=${this._wineData.name || ""}
            @input=${(e) => this._updateField("name", e.target.value)}
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Winery</label>
            <input
              type="text"
              .value=${this._wineData.winery || ""}
              @input=${(e) => this._updateField("winery", e.target.value)}
            />
          </div>
          <div class="form-group">
            <label>Vintage</label>
            <input
              type="number"
              .value=${this._wineData.vintage?.toString() || ""}
              @input=${(e) => this._updateField("vintage", parseInt(e.target.value) || null)}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Type</label>
            <select
              @change=${(e) => this._updateField("type", e.target.value)}
            >
              ${Object.entries(WINE_TYPE_LABELS).map(([value, label]) => b `<option value=${value} ?selected=${(this._wineData.type || "red") === value}>${label}</option>`)}
            </select>
          </div>
          <div class="form-group">
            <label>Purchase Price</label>
            <input
              type="number"
              step="0.01"
              .value=${this._wineData.price?.toString() || ""}
              @input=${(e) => this._updateField("price", parseFloat(e.target.value) || null)}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Current Value</label>
            <input
              type="number"
              step="0.01"
              .value=${this._wineData.retail_price?.toString() || ""}
              @input=${(e) => this._updateField("retail_price", parseFloat(e.target.value) || null)}
            />
          </div>
          <div class="form-group">
            <label>Region</label>
            <input
              type="text"
              .value=${this._wineData.region || ""}
              @input=${(e) => this._updateField("region", e.target.value)}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Country</label>
            <input
              type="text"
              .value=${this._wineData.country || ""}
              @input=${(e) => this._updateField("country", e.target.value)}
            />
          </div>
        </div>

        <div class="form-group">
          <label>Grape Variety</label>
          <input
            type="text"
            .value=${this._wineData.grape_variety || ""}
            @input=${(e) => this._updateField("grape_variety", e.target.value)}
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Purchase Date</label>
            <input
              type="date"
              .value=${this._wineData.purchase_date || ""}
              @input=${(e) => this._updateField("purchase_date", e.target.value)}
            />
          </div>
          <div class="form-group">
            <label>Drink By</label>
            <input
              type="text"
              placeholder="e.g. 2030"
              .value=${this._wineData.drink_by || ""}
              @input=${(e) => this._updateField("drink_by", e.target.value)}
            />
          </div>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea
            .value=${this._wineData.notes || ""}
            @input=${(e) => this._updateField("notes", e.target.value)}
          ></textarea>
        </div>

        <div class="rating-section">
          <div class="rating-label">My Rating</div>
          <star-rating
            .value=${this._wineData.user_rating || 0}
            @rating-change=${(e) => this._updateField("user_rating", e.detail.value || null)}
          ></star-rating>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => this._goToStep("scan")}>
          ← Back
        </button>
        ${!this.buyListMode
            ? b `
              <button
                class="btn btn-primary"
                style="background: #e65100;"
                @click=${this._quickAddToBuyList}
                ?disabled=${!this._wineData.name || this._loading}
                title="Save to buy list instead of cellar"
              >
                ${this._loading ? b `<span class="loading-spinner"></span>` : "🛒 Buy List"}
              </button>
            `
            : A}
        <button
          class="btn btn-primary"
          @click=${() => this._goToStep(this.buyListMode ? "confirm" : "location")}
          ?disabled=${!this._wineData.name}
        >
          Next →
        </button>
      </div>
    `;
    }
    // Destinations deduced from where this bottle's relatives already sit. The
    // cellar has no declared zone rules, so its own layout is the only signal:
    // every suggestion says which bottles are already there and why they match.
    _renderSuggestions() {
        const suggestions = suggestDestinations(this._wineData, this.wines, this.cabinets, 3);
        if (!suggestions.length)
            return A;
        const current = containerOf(this._wineData);
        const spaceText = (s) => {
            if (s.usage.full)
                return `Full · ${s.usage.used}/${s.usage.capacity}`;
            if (!Number.isFinite(s.usage.free))
                return "Room";
            return s.usage.free === 1 ? "1 free" : `${s.usage.free} free`;
        };
        return b `
      <div class="suggest-strip">
        <div class="suggest-title">Suggested — where its relatives are</div>
        ${suggestions.map((s) => {
            const selected = !!current && sameContainer(current, s.container);
            return b `
            <button
              class="suggest-item ${s.usage.full ? "full" : ""} ${selected ? "selected" : ""}"
              ?disabled=${s.usage.full}
              @click=${() => this._applyContainer(s.container)}
            >
              <span class="suggest-where">${s.label}</span>
              <span class="suggest-why">${s.reason}</span>
              <span class="suggest-space ${s.usage.full || s.usage.free <= 1 ? "tight" : ""}">
                ${spaceText(s)}
              </span>
            </button>
            ${s.alternative
                ? b `
                  <div class="suggest-alt">
                    No room left there — split the series into
                    <button @click=${() => this._applyContainer(s.alternative.container)}>
                      ${s.alternative.label}
                    </button>
                    (${s.alternative.free === 1 ? "1 free" : `${s.alternative.free} free`}), or free a
                    slot first.
                  </div>
                `
                : A}
          `;
        })}
      </div>
    `;
    }
    _renderLocationStep() {
        const selectedCabinet = this.cabinets.find((c) => c.id === this._wineData.cabinet_id);
        const zones = selectedCabinet?.storage_rows || [];
        const hasZone = !!this._wineData.zone;
        return b `
      <div class="dialog-body">
        <div style="font-weight: 500; margin-bottom: 8px">Choose Location</div>
        <div style="font-size: 0.85em; color: var(--wc-text-secondary); margin-bottom: 12px">
          Select a cabinet and position for this bottle
        </div>

        ${this._renderSuggestions()}

        <div class="location-grid">
          ${this.cabinets.map((cab) => b `
              <div
                class="location-cabinet ${this._wineData.cabinet_id === cab.id ? "selected" : ""}"
                @click=${() => {
            this._wineData = { ...this._wineData, cabinet_id: cab.id, row: null, col: null, zone: "" };
        }}
              >
                <div class="cab-name">${cab.name}</div>
                <div class="cab-info">${cab.rows}×${cab.cols} slots</div>
              </div>
            `)}
        </div>

        ${selectedCabinet && zones.length > 0 ? b `
          <div style="margin-top:12px">
            <label style="display:block;font-size:0.8em;color:var(--wc-text-secondary);margin-bottom:6px">Bulk / Box Zone</label>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <button
                class="btn ${!hasZone ? "btn-primary" : "btn-outline"}"
                style="font-size:0.8em;padding:6px 10px"
                @click=${() => this._updateField("zone", "")}
              >None — use grid Row/Col</button>
              ${zones.map((sr) => {
            const usage = this._zoneUsage(sr);
            const selected = this._wineData.zone === `storage-${sr.row}`;
            return b `
                  <button
                    class="btn ${selected ? "btn-primary" : "btn-outline"}"
                    style="font-size:0.8em;padding:6px 10px${usage.full ? ";opacity:0.5" : ""}"
                    title=${usage.full ? "Full — free a slot or raise its capacity" : ""}
                    @click=${() => this._selectZone(sr)}
                  >
                    ${sr.name || (sr.type === "box" ? "Box" : "Bulk Bin")}
                    <span style="opacity:0.75">${usage.used}/${usage.capacity}</span>
                  </button>
                `;
        })}
            </div>
          </div>
        ` : A}

        ${this._wineData.cabinet_id && !hasZone
            ? b `
              <div class="pos-inputs">
                <div class="form-group">
                  <label>Row (1-based)</label>
                  <input
                    type="number"
                    min="1"
                    .value=${this._wineData.row != null ? (this._wineData.row + 1).toString() : ""}
                    @input=${(e) => this._updateField("row", parseInt(e.target.value) - 1)}
                  />
                </div>
                <div class="form-group">
                  <label>Column (1-based)</label>
                  <input
                    type="number"
                    min="1"
                    .value=${this._wineData.col != null ? (this._wineData.col + 1).toString() : ""}
                    @input=${(e) => this._updateField("col", parseInt(e.target.value) - 1)}
                  />
                </div>
              </div>
            `
            : A}
        ${this._error ? b `<div class="error-msg">${this._error}</div>` : A}
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => this._goToStep("details")}>
          ← Back
        </button>
        <button class="btn btn-primary" @click=${() => this._onLocationNext()}>
          Next →
        </button>
      </div>
    `;
    }
    _onLocationNext() {
        const d = this._wineData;
        // A cabinet with no zone and no complete row/col is a wine with no
        // findable position — it silently vanishes (assigned to the cabinet,
        // but rendered nowhere). Catch that here instead of at save time.
        if (d.cabinet_id && !d.zone && (d.row == null || d.col == null || isNaN(d.row) || isNaN(d.col))) {
            this._error = "Pick a zone, or enter both Row and Column, so the bottle has a findable spot.";
            return;
        }
        const cabinet = this.cabinets.find((c) => c.id === d.cabinet_id);
        if (cabinet && !d.zone && d.row != null && d.col != null) {
            if (d.row < 0 || d.row >= cabinet.rows || d.col < 0 || d.col >= cabinet.cols) {
                this._error = `That slot is outside ${cabinet.name} (${cabinet.rows} rows × ${cabinet.cols} columns).`;
                return;
            }
            const isStorageRow = (cabinet.storage_rows || []).some((sr) => sr.row === d.row);
            if (isStorageRow) {
                this._error = "That row is a bin or box, not grid slots — pick it from the zone list above.";
                return;
            }
            // Stack behind whatever is already in the slot, up to the rack's depth,
            // instead of landing on top of another bottle at depth 0.
            const occupied = new Set(this.wines
                .filter((w) => w.cabinet_id === d.cabinet_id && w.row === d.row && w.col === d.col)
                .map((w) => w.depth || 0));
            const rackDepth = cabinet.depth || 1;
            let depth = 0;
            while (occupied.has(depth))
                depth++;
            if (depth >= rackDepth) {
                this._error = `Row ${d.row + 1}, column ${d.col + 1} is full (${occupied.size}/${rackDepth} deep).`;
                return;
            }
            this._wineData = { ...this._wineData, depth };
        }
        this._error = "";
        this._goToStep("confirm");
    }
    _renderQuantityPicker() {
        const available = this._availableSlots();
        const max = available === null ? 99 : Math.max(1, Math.min(99, available));
        const destination = this._wineData.cabinet_id
            ? this._planSlots(this._quantity)
            : null;
        return b `
      <div class="qty-row">
        <span class="qty-label">Bottles</span>
        <div class="qty-stepper">
          <button
            class="qty-btn"
            ?disabled=${this._quantity <= 1}
            @click=${() => this._setQuantity(this._quantity - 1)}
          >−</button>
          <input
            class="qty-input"
            type="number"
            min="1"
            max=${max}
            .value=${String(this._quantity)}
            @change=${(e) => this._setQuantity(Number(e.target.value))}
          />
          <button
            class="qty-btn"
            ?disabled=${this._quantity >= max}
            @click=${() => this._setQuantity(this._quantity + 1)}
          >+</button>
        </div>
      </div>
      <div class="qty-hint">
        ${available === null
            ? "Identical bottles, added unassigned."
            : available === 0
                ? "That destination is full."
                : b `${available} slot${available > 1 ? "s" : ""} free here.
              ${destination && destination.length > 1
                    ? `The ${destination.length} bottles take consecutive free slots.`
                    : ""}`}
      </div>
    `;
    }
    _renderConfirmStep() {
        const cabinetName = this.cabinets.find((c) => c.id === this._wineData.cabinet_id)?.name ||
            "Unassigned";
        const zoneCabinet = this.cabinets.find((c) => c.id === this._wineData.cabinet_id);
        const zoneRow = this._wineData.zone
            ? zoneCabinet?.storage_rows.find((sr) => `storage-${sr.row}` === this._wineData.zone)
            : undefined;
        const posLabel = zoneRow
            ? zoneRow.name || (zoneRow.type === "box" ? "Box" : "Bulk Bin")
            : this._wineData.row != null && this._wineData.col != null
                ? `Row ${(this._wineData.row ?? 0) + 1}, Col ${(this._wineData.col ?? 0) + 1}`
                : "Not specified";
        return b `
      <div class="dialog-body">
        <div style="font-weight: 500; margin-bottom: 12px">Confirm & Add</div>

        <div class="confirm-summary">
          <div class="summary-row">
            <span class="summary-label">Name</span>
            <span class="summary-value">${this._wineData.name}</span>
          </div>
          ${this._wineData.winery
            ? b `
                <div class="summary-row">
                  <span class="summary-label">Winery</span>
                  <span class="summary-value">${this._wineData.winery}</span>
                </div>
              `
            : A}
          ${this._wineData.vintage
            ? b `
                <div class="summary-row">
                  <span class="summary-label">Vintage</span>
                  <span class="summary-value">${this._wineData.vintage}</span>
                </div>
              `
            : A}
          <div class="summary-row">
            <span class="summary-label">Type</span>
            <span class="summary-value">
              ${WINE_TYPE_LABELS[this._wineData.type || "red"]}
            </span>
          </div>
          ${this.buyListMode
            ? A
            : b `
                <div class="summary-row">
                  <span class="summary-label">Cabinet</span>
                  <span class="summary-value">${cabinetName}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Position</span>
                  <span class="summary-value">${posLabel}</span>
                </div>
              `}
          ${this._wineData.user_rating
            ? b `
                <div class="summary-row">
                  <span class="summary-label">My Rating</span>
                  <span class="summary-value">${this._wineData.user_rating}/5</span>
                </div>
              `
            : A}
        </div>

        ${this.buyListMode ? A : this._renderQuantityPicker()}

        ${this._error
            ? b `<div class="error-msg">${this._error}</div>`
            : A}
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => this._goToStep(this.buyListMode ? "details" : "location")}>
          ← Back
        </button>
        <button class="btn btn-primary" @click=${this._addWine}>
          ${this._loading
            ? b `<span class="loading-spinner"></span>${this._addProgress && this._quantity > 1
                ? b ` ${this._addProgress}/${this._quantity}`
                : A}`
            : this.buyListMode
                ? "Add to Buy List"
                : this._quantity > 1
                    ? `Add ${this._quantity} Bottles`
                    : "Add Wine"}
        </button>
      </div>
    `;
    }
    render() {
        if (!this.open)
            return A;
        return b `
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" @click=${(e) => e.stopPropagation()}>
          <div class="dialog-header">${this.buyListMode ? "Add to Buy List" : "Add Wine"}</div>
          ${this._renderStepIndicator()}
          ${this._step === "scan" ? this._renderScanStep() : A}
          ${this._step === "details" ? this._renderDetailsStep() : A}
          ${this._step === "location" ? this._renderLocationStep() : A}
          ${this._step === "confirm" ? this._renderConfirmStep() : A}
        </div>
      </div>
    `;
    }
};
AddWineDialog.styles = [
    sharedStyles,
    i$3 `
      .step-indicator {
        display: flex;
        justify-content: center;
        gap: 8px;
        padding: 12px 20px;
      }

      .step-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--wc-border);
        transition: all 0.2s;
      }

      .step-dot.active {
        background: var(--wc-primary);
        width: 24px;
        border-radius: 4px;
      }

      .step-dot.done {
        background: var(--wc-primary);
      }

      .scan-section {
        padding: 16px 20px;
      }

      .scan-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 16px;
      }

      .scan-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        background: rgba(255, 255, 255, 0.06);
        color: var(--wc-text);
        text-align: left;
        font-size: 0.95em;
        width: 100%;
      }

      .scan-option:hover {
        border-color: var(--wc-primary);
        background: rgba(255, 255, 255, 0.12);
      }

      .scan-option-icon {
        font-size: 1.5em;
        flex-shrink: 0;
      }

      .scan-option-text {
        flex: 1;
      }

      .scan-option-title {
        font-weight: 600;
        margin-bottom: 2px;
      }

      .scan-option-desc {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }

      .scan-option.disabled {
        opacity: 0.5;
        cursor: default;
      }

      .barcode-input-row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .barcode-input-row input {
        flex: 1;
        padding: 10px 14px;
        border: 2px solid var(--wc-border);
        border-radius: 10px;
        font-size: 1em;
        text-align: center;
        letter-spacing: 2px;
        background: var(--wc-bg);
        color: var(--wc-text);
        box-sizing: border-box;
      }

      .barcode-input-row input:focus {
        border-color: var(--wc-primary);
        outline: none;
      }

      .or-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 14px 0;
        color: var(--wc-text-secondary);
        font-size: 0.85em;
      }

      .or-divider::before,
      .or-divider::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--wc-border);
      }

      .search-input {
        width: 100%;
        padding: 10px 14px;
        border: 2px solid var(--wc-border);
        border-radius: 10px;
        font-size: 1em;
        box-sizing: border-box;
        background: var(--wc-bg);
        color: var(--wc-text);
      }

      .search-input:focus {
        border-color: var(--wc-primary);
        outline: none;
      }

      .lookup-result {
        background: rgba(114, 47, 55, 0.05);
        border: 1px solid rgba(114, 47, 55, 0.2);
        border-radius: 10px;
        padding: 12px;
        margin-top: 12px;
        text-align: left;
      }

      .lookup-result .result-name {
        font-weight: 600;
        font-size: 1em;
      }

      .lookup-result .result-detail {
        font-size: 0.85em;
        color: var(--wc-text-secondary);
        margin-top: 2px;
      }

      .location-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 8px;
        margin-top: 12px;
      }

      .suggest-strip {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 14px;
        padding: 10px;
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        background: rgba(114, 47, 55, 0.04);
      }

      .suggest-title {
        font-size: 0.75em;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--wc-text-secondary);
      }

      .suggest-item {
        display: flex;
        align-items: baseline;
        gap: 8px;
        width: 100%;
        text-align: left;
        font: inherit;
        color: inherit;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        background: var(--wc-card-bg, transparent);
        padding: 8px 10px;
        cursor: pointer;
        transition: all 0.15s;
      }

      .suggest-item:hover:not(.full) {
        border-color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.08);
      }

      .suggest-item.selected {
        border-color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.12);
      }

      .suggest-item.full {
        cursor: default;
        opacity: 0.65;
      }

      .suggest-item.full .suggest-where {
        text-decoration: line-through;
      }

      .suggest-where {
        font-weight: 600;
        font-size: 0.85em;
        white-space: nowrap;
      }

      .suggest-why {
        flex: 1;
        font-size: 0.78em;
        color: var(--wc-text-secondary);
      }

      .suggest-space {
        font-size: 0.75em;
        white-space: nowrap;
        color: var(--wc-text-secondary);
      }

      .suggest-space.tight {
        color: #c62828;
      }

      .suggest-alt {
        margin: -2px 0 2px 10px;
        font-size: 0.75em;
        color: var(--wc-text-secondary);
      }

      .suggest-alt button {
        font: inherit;
        color: var(--wc-primary);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        text-decoration: underline;
      }

      .location-cabinet {
        border: 2px solid var(--wc-border);
        border-radius: 10px;
        padding: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
      }

      .location-cabinet:hover {
        border-color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.05);
      }

      .location-cabinet.selected {
        border-color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.1);
      }

      .location-cabinet .cab-name {
        font-weight: 600;
        font-size: 0.9em;
      }

      .location-cabinet .cab-info {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        margin-top: 4px;
      }

      .pos-inputs {
        display: flex;
        gap: 12px;
        margin-top: 12px;
      }

      .pos-inputs .form-group {
        flex: 1;
      }

      .error-msg {
        color: #c62828;
        font-size: 0.85em;
        margin-top: 8px;
      }

      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid var(--wc-border);
        border-top-color: var(--wc-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .qty-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 14px;
      }

      .qty-label {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--wc-text-secondary);
      }

      .qty-stepper {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .qty-btn {
        width: 32px;
        height: 32px;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        background: var(--wc-bg);
        color: var(--wc-text);
        font-size: 1.1em;
        line-height: 1;
        cursor: pointer;
      }

      .qty-btn:hover:not(:disabled) {
        border-color: var(--wc-primary);
        color: var(--wc-primary);
      }

      .qty-btn:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .qty-input {
        width: 56px;
        padding: 6px 4px;
        text-align: center;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        background: var(--wc-bg);
        color: var(--wc-text);
        font-size: 1em;
        font-weight: 600;
      }

      .qty-hint {
        margin-top: 6px;
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        line-height: 1.4;
      }

      .confirm-summary {
        background: rgba(128, 128, 128, 0.08);
        border-radius: 10px;
        padding: 16px;
      }

      .confirm-summary .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        font-size: 0.9em;
      }

      .confirm-summary .summary-label {
        color: var(--wc-text-secondary);
      }

      .confirm-summary .summary-value {
        font-weight: 500;
      }

      .label-loading {
        text-align: center;
        padding: 20px;
      }

      .label-loading .loading-spinner {
        width: 32px;
        height: 32px;
        border-width: 3px;
      }

      .camera-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
        padding: 8px 0;
      }

      .rating-section {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--wc-border);
      }

      .rating-label {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--wc-text-secondary);
        margin-bottom: 6px;
      }

      .search-results {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 280px;
        overflow-y: auto;
      }

      .search-results-label {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        margin-bottom: 2px;
      }

      .search-result-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.15s;
        background: transparent;
        text-align: left;
        color: var(--wc-text);
        width: 100%;
        box-sizing: border-box;
      }

      .search-result-item:hover {
        border-color: var(--wc-primary);
        background: var(--wc-hover);
      }

      .search-result-thumb {
        width: 36px;
        height: 48px;
        border-radius: 4px;
        object-fit: cover;
        flex-shrink: 0;
        background: rgba(128, 128, 128, 0.1);
      }

      .search-result-info {
        flex: 1;
        min-width: 0;
      }

      .search-result-name {
        font-weight: 600;
        font-size: 0.9em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .search-result-meta {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-top: 2px;
      }

      .search-result-rating {
        font-size: 0.8em;
        font-weight: 600;
        color: #f5a623;
        flex-shrink: 0;
      }
    `,
];
__decorate([
    n({ type: Boolean })
], AddWineDialog.prototype, "open", void 0);
__decorate([
    n({ attribute: false })
], AddWineDialog.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], AddWineDialog.prototype, "cabinets", void 0);
__decorate([
    n({ attribute: false })
], AddWineDialog.prototype, "wines", void 0);
__decorate([
    n({ attribute: false })
], AddWineDialog.prototype, "preselectedCabinet", void 0);
__decorate([
    n({ attribute: false })
], AddWineDialog.prototype, "preselectedRow", void 0);
__decorate([
    n({ attribute: false })
], AddWineDialog.prototype, "preselectedCol", void 0);
__decorate([
    n({ attribute: false })
], AddWineDialog.prototype, "preselectedZone", void 0);
__decorate([
    n({ attribute: false })
], AddWineDialog.prototype, "preselectedDepth", void 0);
__decorate([
    n({ type: Boolean })
], AddWineDialog.prototype, "buyListMode", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_step", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_scanMode", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_barcode", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_loading", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_quantity", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_addProgress", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_lookupResult", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_wineData", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_error", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_hasGemini", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_labelLoading", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_captureStage", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_frontImageRaw", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_showBackPrompt", void 0);
__decorate([
    r()
], AddWineDialog.prototype, "_searchResults", void 0);
AddWineDialog = __decorate([
    t("add-wine-dialog")
], AddWineDialog);

let WineSearchBar = class WineSearchBar extends i {
    constructor() {
        super(...arguments);
        this.value = "";
        this.filter = "all";
    }
    _onInput(e) {
        const value = e.target.value;
        this.dispatchEvent(new CustomEvent("search-change", {
            detail: { query: value, filter: this.filter },
            bubbles: true,
            composed: true,
        }));
    }
    // Emptying the field by hand is fiddly on a phone even once it is wide
    // enough to see. One tap, and the caret stays where the user can keep typing.
    _clear() {
        this.dispatchEvent(new CustomEvent("search-change", {
            detail: { query: "", filter: this.filter },
            bubbles: true,
            composed: true,
        }));
        const input = this.shadowRoot?.querySelector("input");
        if (input) {
            input.value = "";
            input.focus();
        }
    }
    _onFilterChange(filter) {
        this.filter = filter;
        const input = this.shadowRoot?.querySelector("input");
        this.dispatchEvent(new CustomEvent("search-change", {
            detail: { query: input?.value || "", filter },
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        const filters = [
            { id: "all", label: "All" },
            { id: "red", label: "Red" },
            { id: "white", label: "White" },
            { id: "rosé", label: "Rosé" },
            { id: "sparkling", label: "Sparkling" },
            { id: "dessert", label: "Dessert" },
        ];
        return b `
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="search"
            placeholder="Search wines..."
            enterkeyhint="search"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            .value=${this.value}
            @input=${this._onInput}
          />
          ${this.value
            ? b `
                <button class="search-clear" title="Clear search" aria-label="Clear search" @click=${this._clear}>
                  ✕
                </button>
              `
            : A}
        </div>
        <div class="filter-chips">
          ${filters.map((f) => b `
              <button
                class="chip ${this.filter === f.id ? "active" : ""}"
                @click=${() => this._onFilterChange(f.id)}
              >
                ${f.label}
              </button>
            `)}
        </div>
      </div>
    `;
    }
};
WineSearchBar.styles = [
    sharedStyles,
    i$3 `
      :host {
        display: block;
      }

      /* The chips and the field used to share one non-wrapping row. Six chips
         that refuse to break left the input 46px wide on a phone, of which two
         were usable for text. The field keeps a floor and the chips drop to
         their own line rather than crushing it. */
      .search-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 16px 8px;
        align-items: center;
      }

      .search-input-wrapper {
        flex: 1 1 220px;
        min-width: 0;
        position: relative;
      }

      .search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--wc-text-secondary);
        font-size: 0.9em;
        pointer-events: none;
      }

      input {
        width: 100%;
        padding: 8px 38px 8px 32px;
        border: 1px solid var(--wc-border);
        border-radius: 20px;
        font-size: 0.9em;
        background: var(--wc-bg);
        color: var(--wc-text);
        box-sizing: border-box;
        transition: border-color 0.2s;
      }

      input:focus {
        border-color: var(--wc-primary);
        outline: none;
      }

      /* Safari zooms the whole page when a focused field computes under 16px,
         which is the other half of "the search box is unusable on my phone".
         Touch pointers only, so the desktop field keeps its size. */
      @media (pointer: coarse) {
        input {
          font-size: 16px;
        }
      }

      /* One clear button, ours: WebKit's own only appears on some platforms
         and would sit on top of this one where it does. */
      input::-webkit-search-cancel-button,
      input::-webkit-search-decoration {
        -webkit-appearance: none;
        appearance: none;
      }

      /* 30px rather than the icon's visual size: this is a thumb target on the
         device where the field was unusable in the first place. */
      .search-clear {
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--wc-text-secondary);
        font-size: 0.8em;
        line-height: 1;
        cursor: pointer;
        padding: 0;
      }

      .search-clear:hover {
        background: rgba(114, 47, 55, 0.12);
        color: var(--wc-text);
      }

      .filter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .chip {
        padding: 4px 10px;
        border-radius: 14px;
        border: 1px solid var(--wc-border);
        background: transparent;
        color: var(--wc-text-secondary);
        cursor: pointer;
        font-size: 0.75em;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .chip:hover {
        background: rgba(114, 47, 55, 0.08);
      }

      .chip.active {
        background: var(--wc-primary);
        color: #fff;
        border-color: var(--wc-primary);
      }
    `,
];
__decorate([
    n({ type: String })
], WineSearchBar.prototype, "value", void 0);
__decorate([
    n({ type: String })
], WineSearchBar.prototype, "filter", void 0);
WineSearchBar = __decorate([
    t("wine-search-bar")
], WineSearchBar);

var RackSettingsDialog_1;
let RackSettingsDialog = RackSettingsDialog_1 = class RackSettingsDialog extends i {
    constructor() {
        super(...arguments);
        this.open = false;
        this.cabinets = [];
        this.wines = [];
        this._mode = "list";
        this._editCabinet = {};
        this._editStorageRows = [];
        this._deleteCabinet = null;
        this._loading = false;
        this._error = "";
    }
    updated(changedProps) {
        if (changedProps.has("open") && this.open) {
            this._mode = "list";
            this._error = "";
        }
    }
    _close() {
        this._mode = "list";
        this._error = "";
        this.dispatchEvent(new CustomEvent("close"));
    }
    _notifyUpdate() {
        this.dispatchEvent(new CustomEvent("racks-updated", { bubbles: true, composed: true }));
    }
    _winesInCabinet(cabinetId) {
        return this.wines.filter((w) => w.cabinet_id === cabinetId).length;
    }
    // Storage rows that survive the pending row count — a bin on a row that no
    // longer exists is gone, whatever the editor still holds.
    _survivingStorageRows() {
        const newRows = this._editCabinet.rows || 1;
        return this._editStorageRows.filter((sr) => sr.row < newRows);
    }
    static _capacityOf(sr) {
        return sr.type === "box"
            ? (sr.boxes || []).reduce((sum, b) => sum + b, 0)
            : sr.capacity || 0;
    }
    // Every bottle the pending edit would leave without a slot that exists.
    //
    // The warning and the save both read this, so what the user is promised
    // and what actually happens cannot drift apart. It used to consider only
    // rows and columns, which meant three ways of losing a bottle's position
    // went unwarned and unhandled: making a rack shallower, shrinking a bin
    // past its contents, and deleting a bin outright. None of them ever
    // deleted a bottle — they left it pointing at a slot the rack no longer
    // had, counted in the total and drawn nowhere.
    _displacedWines() {
        const cabinetId = this._editCabinet.id;
        if (!cabinetId)
            return [];
        const newRows = this._editCabinet.rows || 1;
        const newCols = this._editCabinet.cols || 8;
        const newDepth = this._editCabinet.depth || 1;
        const rows = this._survivingStorageRows();
        return this.wines.filter((w) => {
            if (w.cabinet_id !== cabinetId)
                return false;
            if (w.zone) {
                const sr = rows.find((s) => `storage-${s.row}` === w.zone);
                if (!sr)
                    return true;
                return (w.depth || 0) >= RackSettingsDialog_1._capacityOf(sr);
            }
            if (w.row == null || w.col == null)
                return false;
            if (w.row >= newRows || w.col >= newCols)
                return true;
            if ((w.depth || 0) >= newDepth)
                return true;
            return rows.some((sr) => sr.row === w.row);
        });
    }
    _startAdd() {
        this._mode = "add";
        this._error = "";
        this._editCabinet = {
            name: "",
            rows: 1,
            cols: 8,
            depth: 1,
            has_bottom_zone: false,
            bottom_zone_name: "",
        };
        this._editStorageRows = [];
    }
    _startEdit(cabinet) {
        this._mode = "edit";
        this._error = "";
        this._editCabinet = { ...cabinet };
        // Initialize storage rows from cabinet data, ensuring boxes arrays exist
        this._editStorageRows = (cabinet.storage_rows || []).map((sr) => {
            if (sr.type === "box" && !sr.boxes) {
                return { ...sr, boxes: [sr.capacity || 12] };
            }
            return { ...sr };
        });
    }
    _startDelete(cabinet) {
        this._mode = "delete-confirm";
        this._error = "";
        this._deleteCabinet = cabinet;
    }
    _setRowType(row, type) {
        if (type === "slots") {
            // Remove from storage rows
            this._editStorageRows = this._editStorageRows.filter((sr) => sr.row !== row);
        }
        else {
            const existing = this._editStorageRows.find((sr) => sr.row === row);
            const isBox = type === "box";
            const defaultCapacity = isBox ? 12 : 20;
            const newRow = {
                row,
                name: existing?.name || STORAGE_ROW_TYPE_LABELS[type],
                type,
                capacity: defaultCapacity,
                ...(isBox ? { boxes: [12] } : {}),
            };
            if (existing) {
                this._editStorageRows = this._editStorageRows.map((sr) => sr.row === row ? newRow : sr);
            }
            else {
                this._editStorageRows = [...this._editStorageRows, newRow];
            }
        }
    }
    _updateStorageRowName(row, name) {
        this._editStorageRows = this._editStorageRows.map((sr) => sr.row === row ? { ...sr, name } : sr);
    }
    _updateStorageRowCapacity(row, capacity) {
        this._editStorageRows = this._editStorageRows.map((sr) => sr.row === row ? { ...sr, capacity } : sr);
    }
    _updateBoxCount(row, count) {
        this._editStorageRows = this._editStorageRows.map((sr) => {
            if (sr.row !== row || sr.type !== "box")
                return sr;
            const boxes = [...(sr.boxes || [12])];
            while (boxes.length < count)
                boxes.push(12);
            while (boxes.length > count)
                boxes.pop();
            const capacity = boxes.reduce((sum, s) => sum + s, 0);
            return { ...sr, boxes, capacity };
        });
    }
    _updateBoxSize(row, boxIndex, size) {
        this._editStorageRows = this._editStorageRows.map((sr) => {
            if (sr.row !== row || sr.type !== "box")
                return sr;
            const boxes = [...(sr.boxes || [12])];
            boxes[boxIndex] = size;
            const capacity = boxes.reduce((sum, s) => sum + s, 0);
            return { ...sr, boxes, capacity };
        });
    }
    _isStorageRow(row) {
        return this._editStorageRows.some((sr) => sr.row === row);
    }
    _getStorageRow(row) {
        return this._editStorageRows.find((sr) => sr.row === row);
    }
    _addRow() {
        const current = this._editCabinet.rows || 1;
        if (current >= 20)
            return;
        this._editCabinet = { ...this._editCabinet, rows: current + 1 };
    }
    _removeRow() {
        const current = this._editCabinet.rows || 1;
        if (current <= 1)
            return;
        const newRows = current - 1;
        // Remove storage row if last row was storage
        this._editStorageRows = this._editStorageRows.filter((sr) => sr.row < newRows);
        this._editCabinet = { ...this._editCabinet, rows: newRows };
    }
    _addCol() {
        const current = this._editCabinet.cols || 1;
        if (current >= 20)
            return;
        this._editCabinet = { ...this._editCabinet, cols: current + 1 };
    }
    _removeCol() {
        const current = this._editCabinet.cols || 1;
        if (current <= 1)
            return;
        this._editCabinet = { ...this._editCabinet, cols: current - 1 };
    }
    _addDepth() {
        const current = this._editCabinet.depth || 1;
        if (current >= 6)
            return;
        this._editCabinet = { ...this._editCabinet, depth: current + 1 };
    }
    _removeDepth() {
        const current = this._editCabinet.depth || 1;
        if (current <= 1)
            return;
        this._editCabinet = { ...this._editCabinet, depth: current - 1 };
    }
    async _saveAdd() {
        this._loading = true;
        this._error = "";
        try {
            await this.hass.callWS({
                type: "wine_cellar/add_cabinet",
                cabinet: {
                    name: this._editCabinet.name || "New Rack",
                    rows: this._editCabinet.rows || 1,
                    cols: this._editCabinet.cols || 8,
                    depth: this._editCabinet.depth || 1,
                    has_bottom_zone: false,
                    bottom_zone_name: "",
                    storage_rows: this._editStorageRows,
                    order: this.cabinets.length,
                    orientation: "vertical",
                },
            });
            this._notifyUpdate();
            this._mode = "list";
        }
        catch {
            this._error = "Failed to add rack.";
        }
        this._loading = false;
    }
    async _saveEdit() {
        this._loading = true;
        this._error = "";
        try {
            const cabinetId = this._editCabinet.id;
            const newRows = this._editCabinet.rows || 1;
            const newCols = this._editCabinet.cols || 8;
            // Filter out storage rows beyond the new row count
            const validStorageRows = this._survivingStorageRows();
            // Worked out before the rack changes shape: afterwards the old slot
            // is unrecoverable, and this is the same list the warning showed.
            const displaced = this._displacedWines();
            await this.hass.callWS({
                type: "wine_cellar/update_cabinet",
                cabinet_id: cabinetId,
                updates: {
                    name: this._editCabinet.name,
                    rows: newRows,
                    cols: newCols,
                    depth: this._editCabinet.depth || 1,
                    has_bottom_zone: false,
                    bottom_zone_name: "",
                    storage_rows: validStorageRows,
                    orientation: "vertical",
                },
            });
            for (const wine of displaced) {
                await this.hass.callWS({
                    type: "wine_cellar/update_wine",
                    wine_id: wine.id,
                    updates: { cabinet_id: "", row: null, col: null, zone: "", depth: 0 },
                });
            }
            this._notifyUpdate();
            this._mode = "list";
        }
        catch {
            this._error = "Failed to update rack.";
        }
        this._loading = false;
    }
    async _confirmDelete() {
        if (!this._deleteCabinet)
            return;
        this._loading = true;
        this._error = "";
        try {
            await this.hass.callWS({
                type: "wine_cellar/remove_cabinet",
                cabinet_id: this._deleteCabinet.id,
            });
            this._notifyUpdate();
            this._mode = "list";
            this._deleteCabinet = null;
        }
        catch {
            this._error = "Failed to delete rack.";
        }
        this._loading = false;
    }
    async _moveUp(cabinet) {
        const sorted = [...this.cabinets].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((c) => c.id === cabinet.id);
        if (idx <= 0)
            return;
        const prev = sorted[idx - 1];
        try {
            await Promise.all([
                this.hass.callWS({
                    type: "wine_cellar/update_cabinet",
                    cabinet_id: cabinet.id,
                    updates: { order: prev.order },
                }),
                this.hass.callWS({
                    type: "wine_cellar/update_cabinet",
                    cabinet_id: prev.id,
                    updates: { order: cabinet.order },
                }),
            ]);
            this._notifyUpdate();
        }
        catch {
            this._error = "Failed to reorder racks.";
        }
    }
    async _moveDown(cabinet) {
        const sorted = [...this.cabinets].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((c) => c.id === cabinet.id);
        if (idx < 0 || idx >= sorted.length - 1)
            return;
        const next = sorted[idx + 1];
        try {
            await Promise.all([
                this.hass.callWS({
                    type: "wine_cellar/update_cabinet",
                    cabinet_id: cabinet.id,
                    updates: { order: next.order },
                }),
                this.hass.callWS({
                    type: "wine_cellar/update_cabinet",
                    cabinet_id: next.id,
                    updates: { order: cabinet.order },
                }),
            ]);
            this._notifyUpdate();
        }
        catch {
            this._error = "Failed to reorder racks.";
        }
    }
    _renderList() {
        const sorted = [...this.cabinets].sort((a, b) => a.order - b.order);
        return b `
      <div class="dialog-body">
        <div class="rack-list">
          ${sorted.map((cab, idx) => {
            const storageCount = (cab.storage_rows || []).length;
            return b `
                <div class="rack-item">
                  <div class="rack-info">
                    <div class="rack-name">${cab.name}</div>
                    <div class="rack-meta">
                      ${cab.rows} × ${cab.cols} grid${(cab.depth || 1) > 1 ? ` × ${cab.depth} deep` : ""}
                      · ${this._winesInCabinet(cab.id)} bottles
                      ${storageCount > 0 ? ` · ${storageCount} storage` : ""}
                    </div>
                  </div>
                  <div class="rack-actions">
                    <button
                      class="small-btn"
                      @click=${() => this._moveUp(cab)}
                      ?disabled=${idx === 0}
                      title="Move up"
                    >↑</button>
                    <button
                      class="small-btn"
                      @click=${() => this._moveDown(cab)}
                      ?disabled=${idx === sorted.length - 1}
                      title="Move down"
                    >↓</button>
                    <button
                      class="small-btn"
                      @click=${() => this._startEdit(cab)}
                    >Edit</button>
                    <button
                      class="small-btn danger"
                      @click=${() => this._startDelete(cab)}
                    >Del</button>
                  </div>
                </div>
              `;
        })}

          <button class="add-rack-btn" @click=${this._startAdd}>
            + Add Rack
          </button>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${this._close}>Close</button>
      </div>
    `;
    }
    _renderForm() {
        const isEdit = this._mode === "edit";
        const numRows = this._editCabinet.rows || 1;
        const numCols = this._editCabinet.cols || 8;
        const numDepth = this._editCabinet.depth || 1;
        // Which bottles this edit would displace, whichever way it shrinks.
        const displaced = isEdit ? this._displacedWines() : [];
        return b `
      <div class="dialog-body">
        <div class="form-group">
          <label>Rack Name</label>
          <input
            type="text"
            .value=${this._editCabinet.name || ""}
            @input=${(e) => (this._editCabinet = {
            ...this._editCabinet,
            name: e.target.value,
        })}
          />
        </div>

        <!-- Grid Editor -->
        <div class="grid-editor">
          <div class="grid-editor-title">Grid Layout</div>

          <!-- Stepper controls -->
          <div class="stepper-row">
            <div class="stepper-wrap">
              <div class="stepper-label">Rows</div>
              <div class="stepper">
                <button class="stepper-btn" @click=${this._removeRow} ?disabled=${numRows <= 1}>−</button>
                <span class="stepper-value">${numRows}</span>
                <button class="stepper-btn" @click=${this._addRow} ?disabled=${numRows >= 20}>+</button>
              </div>
            </div>
            <div class="stepper-wrap">
              <div class="stepper-label">Columns</div>
              <div class="stepper">
                <button class="stepper-btn" @click=${this._removeCol} ?disabled=${numCols <= 1}>−</button>
                <span class="stepper-value">${numCols}</span>
                <button class="stepper-btn" @click=${this._addCol} ?disabled=${numCols >= 20}>+</button>
              </div>
            </div>
            <div class="stepper-wrap">
              <div class="stepper-label">Depth</div>
              <div class="stepper">
                <button class="stepper-btn" @click=${this._removeDepth} ?disabled=${numDepth <= 1}>−</button>
                <span class="stepper-value">${numDepth}</span>
                <button class="stepper-btn" @click=${this._addDepth} ?disabled=${numDepth >= 6}>+</button>
              </div>
            </div>
          </div>

          <!-- Visual grid preview -->
          <div class="grid-preview">
            ${Array.from({ length: numRows }, (_, row) => {
            const isStorage = this._isStorageRow(row);
            const sr = this._getStorageRow(row);
            const typeIcon = sr?.type === "box" ? "📦" : "◇";
            return b `
                <div class="grid-preview-row ${isStorage ? "storage" : ""}">
                  <span class="grid-preview-label">R${row + 1}</span>
                  ${isStorage
                ? b `<div class="grid-preview-cell"></div><span class="grid-preview-storage-label">${typeIcon} ${sr?.name || "Storage"}</span>`
                : Array.from({ length: Math.min(numCols, 15) }, () => b `<div class="grid-preview-cell"></div>`)}
                  ${!isStorage && numCols > 15
                ? b `<span style="font-size:0.65em;color:var(--wc-text-secondary)">+${numCols - 15}</span>`
                : A}
                </div>
              `;
        })}
          </div>

          <!-- Row list with type selectors -->
          <div class="row-list">
            ${Array.from({ length: numRows }, (_, row) => {
            const isStorage = this._isStorageRow(row);
            const sr = this._getStorageRow(row);
            const currentType = sr?.type || "slots";
            return b `
                <div class="row-entry ${isStorage ? "storage" : ""}">
                  <span class="row-num">R${row + 1}</span>
                  <select
                    class="row-type-select"
                    @change=${(e) => {
                const val = e.target.value;
                this._setRowType(row, val);
            }}
                    @click=${(e) => e.stopPropagation()}
                  >
                    <option value="slots" ?selected=${!isStorage}>Slots</option>
                    <option value="bulk" ?selected=${currentType === "bulk"}>Bulk Bin</option>
                    <option value="box" ?selected=${currentType === "box"}>Wine Box</option>
                  </select>
                  ${isStorage
                ? b `
                        <input
                          type="text"
                          class="row-name-input"
                          .value=${sr?.name ?? ""}
                          @input=${(e) => this._updateStorageRowName(row, e.target.value)}
                          @click=${(e) => e.stopPropagation()}
                          placeholder="Zone name"
                        />
                        ${sr?.type === "box"
                    ? b `
                              <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
                                <div class="row-cap-stepper">
                                  <button class="stepper-btn-sm" @click=${(e) => { e.stopPropagation(); this._updateBoxCount(row, Math.max(1, (sr?.boxes || [12]).length - 1)); }}>−</button>
                                  <span class="stepper-val-sm">${(sr?.boxes || [12]).length}</span>
                                  <button class="stepper-btn-sm" @click=${(e) => { e.stopPropagation(); this._updateBoxCount(row, Math.min(10, (sr?.boxes || [12]).length + 1)); }}>+</button>
                                </div>
                                ${(sr?.boxes || [12]).map((boxSize, bi) => b `
                                  <select
                                    class="row-cap-select"
                                    @change=${(e) => this._updateBoxSize(row, bi, parseInt(e.target.value))}
                                    @click=${(e) => e.stopPropagation()}
                                  >
                                    ${BOX_SIZES.map((s) => b `<option value=${s} ?selected=${boxSize === s}>${s}-pk</option>`)}
                                  </select>
                                `)}
                                <span style="font-size:0.7em;color:var(--wc-text-secondary);">= ${sr?.capacity || 12}</span>
                              </div>
                            `
                    : b `
                              <div class="row-cap-stepper">
                                <button class="stepper-btn-sm" @click=${(e) => { e.stopPropagation(); this._updateStorageRowCapacity(row, Math.max(1, (sr?.capacity || 20) - 1)); }}>−</button>
                                <span class="stepper-val-sm">${sr?.capacity || 20}</span>
                                <button class="stepper-btn-sm" @click=${(e) => { e.stopPropagation(); this._updateStorageRowCapacity(row, Math.min(100, (sr?.capacity || 20) + 1)); }}>+</button>
                              </div>
                            `}
                      `
                : b `<span class="row-type-info">${numCols} col${numCols !== 1 ? "s" : ""}${numDepth > 1 ? ` × ${numDepth} deep` : ""}</span>`}
                </div>
              `;
        })}
          </div>
          <!-- Use the Rows stepper above to add/remove rows -->
        </div>

        ${displaced.length > 0
            ? b `
              <div class="warning-msg">
                This leaves ${displaced.length}
                bottle${displaced.length > 1 ? "s" : ""} without a slot.
                ${displaced.length > 1 ? "They" : "It"} will be moved to
                <strong>Unassigned</strong> — nothing is deleted, and you can put
                ${displaced.length > 1 ? "them" : "it"} back anywhere.
                <div class="warning-list">
                  ${displaced.slice(0, 6).map((w) => b `<div>${w.name || "Unnamed wine"}</div>`)}
                  ${displaced.length > 6
                ? b `<div>…and ${displaced.length - 6} more</div>`
                : A}
                </div>
              </div>
            `
            : A}

        ${this._error
            ? b `<div class="error-msg" style="color:#ef5350;margin-top:8px">${this._error}</div>`
            : A}
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => (this._mode = "list")}>
          Cancel
        </button>
        <button
          class="btn btn-primary"
          @click=${isEdit ? this._saveEdit : this._saveAdd}
          ?disabled=${this._loading}
        >
          ${this._loading ? "Saving..." : "Save"}
        </button>
      </div>
    `;
    }
    _renderDeleteConfirm() {
        if (!this._deleteCabinet)
            return A;
        const count = this._winesInCabinet(this._deleteCabinet.id);
        return b `
      <div class="dialog-body">
        <div class="delete-info">
          Are you sure you want to delete
          <strong>"${this._deleteCabinet.name}"</strong>?
          ${count > 0
            ? b `<br /><span class="delete-count"
                >${count} wine${count > 1 ? "s" : ""} will be unassigned.</span
              >`
            : A}
        </div>
        ${this._error
            ? b `<div style="color:#ef5350;font-size:0.85em">${this._error}</div>`
            : A}
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => (this._mode = "list")}>
          Cancel
        </button>
        <button
          class="btn btn-primary"
          style="background:#c62828"
          @click=${this._confirmDelete}
          ?disabled=${this._loading}
        >
          ${this._loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    `;
    }
    render() {
        if (!this.open)
            return A;
        const titles = {
            list: "Manage Racks",
            add: "Add Rack",
            edit: "Edit Rack",
            "delete-confirm": "Delete Rack?",
        };
        return b `
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" @click=${(e) => e.stopPropagation()}>
          <div class="dialog-header">${titles[this._mode]}</div>
          ${this._mode === "list" ? this._renderList() : A}
          ${this._mode === "add" || this._mode === "edit"
            ? this._renderForm()
            : A}
          ${this._mode === "delete-confirm"
            ? this._renderDeleteConfirm()
            : A}
        </div>
      </div>
    `;
    }
};
RackSettingsDialog.styles = [
    sharedStyles,
    i$3 `
      .rack-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .rack-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        transition: background 0.2s;
      }

      .rack-item:hover {
        background: var(--wc-hover);
      }

      .rack-info {
        flex: 1;
        min-width: 0;
      }

      .rack-name {
        font-weight: 600;
        font-size: 0.95em;
      }

      .rack-meta {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        margin-top: 2px;
      }

      .rack-actions {
        display: flex;
        gap: 4px;
        align-items: center;
        flex-shrink: 0;
      }

      .small-btn {
        background: transparent;
        border: 1px solid var(--wc-border);
        border-radius: 6px;
        cursor: pointer;
        padding: 4px 8px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        transition: all 0.2s;
      }

      .small-btn:hover {
        background: var(--wc-hover);
      }

      .small-btn:disabled {
        opacity: 0.3;
        cursor: default;
      }

      .small-btn.danger {
        color: #c62828;
        border-color: rgba(198, 40, 40, 0.3);
      }

      .small-btn.danger:hover {
        background: rgba(198, 40, 40, 0.08);
      }

      .warning-msg {
        background: rgba(255, 152, 0, 0.1);
        border: 1px solid rgba(255, 152, 0, 0.3);
        border-radius: 8px;
        padding: 10px;
        font-size: 0.85em;
        color: #e65100;
        margin-top: 12px;
      }

      .warning-list {
        margin-top: 6px;
        padding-left: 10px;
        font-size: 0.95em;
        opacity: 0.85;
      }

      .delete-info {
        font-size: 0.95em;
        margin: 12px 0;
        line-height: 1.5;
      }

      .delete-count {
        color: #c62828;
        font-weight: 600;
      }

      .add-rack-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        border: 2px dashed var(--wc-border);
        border-radius: 10px;
        background: transparent;
        color: var(--wc-text-secondary);
        cursor: pointer;
        font-size: 0.9em;
        transition: all 0.2s;
        width: 100%;
      }

      .add-rack-btn:hover {
        border-color: var(--wc-primary);
        color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.05);
      }

      /* Grid editor */
      .grid-editor {
        margin-top: 12px;
      }

      .grid-editor-title {
        font-size: 0.85em;
        font-weight: 600;
        color: var(--wc-text);
        margin-bottom: 12px;
      }

      /* Stepper controls for cols/depth */
      .stepper-row {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }

      .stepper {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        overflow: hidden;
      }

      .stepper-label {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
        font-weight: 500;
      }

      .stepper-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .stepper-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1.1em;
        font-weight: 600;
        color: var(--wc-text-secondary);
        transition: all 0.15s;
        flex-shrink: 0;
      }

      .stepper-btn:hover:not(:disabled) {
        background: rgba(114, 47, 55, 0.1);
        color: var(--wc-primary);
      }

      .stepper-btn:disabled {
        opacity: 0.25;
        cursor: default;
      }

      .stepper-value {
        flex: 1;
        text-align: center;
        font-size: 0.9em;
        font-weight: 600;
        color: var(--wc-text);
        padding: 6px 0;
        min-width: 40px;
      }

      /* Visual grid preview */
      .grid-preview {
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        padding: 8px;
        margin-bottom: 8px;
        overflow-x: auto;
      }

      .grid-preview-row {
        display: flex;
        gap: 3px;
        margin-bottom: 3px;
        align-items: center;
      }

      .grid-preview-row:last-child {
        margin-bottom: 0;
      }

      .grid-preview-label {
        width: 28px;
        font-size: 0.65em;
        font-weight: 600;
        color: var(--wc-text-secondary);
        text-align: center;
        flex-shrink: 0;
      }

      .grid-preview-cell {
        width: 20px;
        height: 16px;
        border-radius: 3px;
        background: rgba(114, 47, 55, 0.15);
        border: 1px solid rgba(114, 47, 55, 0.25);
        flex-shrink: 0;
      }

      .grid-preview-row.storage .grid-preview-cell {
        background: rgba(139, 105, 20, 0.15);
        border-color: rgba(139, 105, 20, 0.3);
      }

      .grid-preview-storage-label {
        font-size: 0.6em;
        color: #8b6914;
        font-weight: 600;
        white-space: nowrap;
        padding-left: 4px;
      }

      .grid-preview-row.storage .grid-preview-cell {
        width: unset;
        flex: 1;
        max-width: none;
      }

      /* Row list */
      .row-list {
        display: flex;
        flex-direction: column;
        gap: 3px;
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        padding: 6px;
      }

      .row-entry {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 6px;
        border-radius: 6px;
        font-size: 0.8em;
        transition: background 0.15s;
      }

      .row-entry:hover {
        background: var(--wc-hover);
      }

      .row-entry.storage {
        background: rgba(139, 105, 20, 0.1);
        border: 1px solid rgba(139, 105, 20, 0.3);
      }

      .row-entry .row-num {
        width: 28px;
        font-weight: 600;
        color: var(--wc-text-secondary);
        font-size: 0.85em;
      }

      .row-type-select {
        padding: 2px 4px;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        font-size: 0.8em;
        background: var(--wc-bg);
        color: var(--wc-text);
        cursor: pointer;
      }

      .row-name-input {
        width: 80px;
        padding: 2px 6px;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        font-size: 0.8em;
        background: var(--wc-bg);
        color: var(--wc-text);
        flex-shrink: 1;
        min-width: 60px;
      }

      .row-cap-select {
        padding: 2px 4px;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        font-size: 0.8em;
        background: var(--wc-bg);
        color: var(--wc-text);
        cursor: pointer;
      }

      .row-cap-stepper {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .stepper-btn-sm {
        width: 20px;
        height: 20px;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        background: var(--wc-bg);
        color: var(--wc-text);
        cursor: pointer;
        font-size: 0.8em;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }

      .stepper-btn-sm:hover {
        background: var(--wc-hover);
      }

      .stepper-val-sm {
        font-size: 0.8em;
        font-weight: 600;
        min-width: 22px;
        text-align: center;
      }

      .row-type-info {
        flex: 1;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }

      .row-entry input[type="text"] {
        width: 100px;
        padding: 2px 6px;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        font-size: 0.85em;
        background: var(--wc-bg);
        color: var(--wc-text);
      }

      .row-controls {
        display: flex;
        gap: 6px;
        margin-top: 6px;
      }

      .row-ctrl-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 6px 0;
        border: 1px dashed var(--wc-border);
        border-radius: 6px;
        background: transparent;
        color: var(--wc-text-secondary);
        cursor: pointer;
        font-size: 0.8em;
        transition: all 0.15s;
      }

      .row-ctrl-btn:hover:not(:disabled) {
        border-color: var(--wc-primary);
        color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.05);
      }

      .row-ctrl-btn:disabled {
        opacity: 0.3;
        cursor: default;
      }

      .row-ctrl-btn.danger:hover:not(:disabled) {
        border-color: #c62828;
        color: #c62828;
        background: rgba(198, 40, 40, 0.05);
      }
    `,
];
__decorate([
    n({ type: Boolean })
], RackSettingsDialog.prototype, "open", void 0);
__decorate([
    n({ attribute: false })
], RackSettingsDialog.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], RackSettingsDialog.prototype, "cabinets", void 0);
__decorate([
    n({ attribute: false })
], RackSettingsDialog.prototype, "wines", void 0);
__decorate([
    r()
], RackSettingsDialog.prototype, "_mode", void 0);
__decorate([
    r()
], RackSettingsDialog.prototype, "_editCabinet", void 0);
__decorate([
    r()
], RackSettingsDialog.prototype, "_editStorageRows", void 0);
__decorate([
    r()
], RackSettingsDialog.prototype, "_deleteCabinet", void 0);
__decorate([
    r()
], RackSettingsDialog.prototype, "_loading", void 0);
__decorate([
    r()
], RackSettingsDialog.prototype, "_error", void 0);
RackSettingsDialog = RackSettingsDialog_1 = __decorate([
    t("rack-settings-dialog")
], RackSettingsDialog);

let WineListDialog = class WineListDialog extends i {
    constructor() {
        super(...arguments);
        this.open = false;
        this.cellarWines = [];
        this._phase = "capture";
        this._wines = [];
        this._restaurantName = null;
        this._currency = "USD";
        this._error = "";
        this._enriching = false;
        // _aiEnriching removed — AI analysis now included in extraction call
        this._expandedIndex = null;
        this._addedIndices = new Set();
        this._cancelEnrichment = false;
        this._buyListIndices = new Set();
        this._detailWine = null;
        this._showDetail = false;
        this.hasGemini = false;
    }
    updated(changedProps) {
        if (changedProps.has("open") && this.open) {
            // Reset when opening
            this._phase = "capture";
            this._wines = [];
            this._restaurantName = null;
            this._currency = "USD";
            this._error = "";
            this._enriching = false;
            this._expandedIndex = null;
            this._addedIndices = new Set();
            this._buyListIndices = new Set();
            this._cancelEnrichment = false;
        }
    }
    _close() {
        this._cancelEnrichment = true;
        this.open = false;
        this.dispatchEvent(new CustomEvent("close"));
    }
    async _onPhotoCaptured(e) {
        this._phase = "extracting";
        this._error = "";
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/extract_wine_list",
                image: e.detail.image,
            });
            if (result.error) {
                this._error = result.error;
                this._phase = "capture";
                return;
            }
            const data = result;
            if (!data || !Array.isArray(data.wines)) {
                this._error = "No wines found in the image. Try a clearer photo.";
                this._phase = "capture";
                return;
            }
            const baseIndex = this._wines.length;
            const newWines = data.wines.map((w, i) => ({
                ...w,
                index: baseIndex + i,
                vivino_rating: null,
                vivino_ratings_count: null,
                vivino_price: null,
                vivino_image_url: "",
                ai_ratings: w.ai_ratings || null,
                ai_description: w.description || "",
                ai_disposition: w.disposition || "",
                ai_drink_window: w.drink_window || "",
                ai_estimated_price: w.estimated_retail_price || null,
                vivino_status: "pending",
                ai_status: (w.ai_ratings || w.disposition || w.description) ? "done" : "skipped",
            }));
            this._wines = [...this._wines, ...newWines];
            this._restaurantName = data.restaurant_name || this._restaurantName;
            this._currency = data.currency || "USD";
            this._phase = "results";
        }
        catch (err) {
            this._error = `Extraction failed: ${err?.message || err}`;
            this._phase = "capture";
        }
    }
    async _startVivinoEnrichment() {
        this._enriching = true;
        this._cancelEnrichment = false;
        for (const wine of this._wines) {
            if (this._cancelEnrichment)
                break;
            if (wine.vivino_status !== "pending")
                continue;
            wine.vivino_status = "loading";
            this._wines = [...this._wines];
            try {
                const resp = await this.hass.callWS({
                    type: "wine_cellar/enrich_wine_vivino",
                    wine: {
                        name: wine.name,
                        winery: wine.winery,
                        vintage: wine.vintage,
                        type: wine.type,
                    },
                });
                if (resp.result) {
                    wine.vivino_rating = resp.result.rating;
                    wine.vivino_ratings_count = resp.result.ratings_count;
                    wine.vivino_price = resp.result.price || null;
                    wine.vivino_image_url = resp.result.image_url || "";
                }
                wine.vivino_status = "done";
            }
            catch {
                wine.vivino_status = "error";
            }
            this._wines = [...this._wines];
            // Rate limit
            await new Promise((r) => setTimeout(r, 1000));
        }
        this._enriching = false;
    }
    // AI enrichment is now included in the Gemini extraction call
    // (disposition, ratings, description, drink_window are returned per wine)
    // The _startAIEnrichment method is no longer needed.
    async _addToCellar(wine) {
        try {
            await this.hass.callWS({
                type: "wine_cellar/add_wine",
                wine: {
                    name: wine.name,
                    winery: wine.winery,
                    vintage: wine.vintage,
                    type: wine.type,
                    region: wine.region,
                    country: wine.country,
                    grape_variety: wine.grape_variety,
                    rating: wine.vivino_rating,
                    ratings_count: wine.vivino_ratings_count,
                    image_url: wine.vivino_image_url,
                    price: wine.list_price,
                    retail_price: wine.vivino_price || wine.ai_estimated_price,
                    description: wine.ai_description,
                    ai_ratings: wine.ai_ratings,
                    disposition: wine.ai_disposition,
                    drink_window: wine.ai_drink_window,
                },
            });
            this._addedIndices = new Set([...this._addedIndices, wine.index]);
            this.dispatchEvent(new CustomEvent("wine-added", { bubbles: true, composed: true }));
        }
        catch (err) {
            console.error("Failed to add wine from list", err);
        }
    }
    async _addToBuyList(wine) {
        try {
            await this.hass.callWS({
                type: "wine_cellar/add_to_buy_list",
                wine: {
                    name: wine.name,
                    winery: wine.winery,
                    vintage: wine.vintage,
                    type: wine.type,
                    region: wine.region,
                    country: wine.country,
                    grape_variety: wine.grape_variety,
                    rating: wine.vivino_rating,
                    ratings_count: wine.vivino_ratings_count,
                    image_url: wine.vivino_image_url,
                    price: wine.list_price,
                    retail_price: wine.vivino_price || wine.ai_estimated_price,
                    description: wine.ai_description,
                    ai_ratings: wine.ai_ratings,
                    disposition: wine.ai_disposition,
                    drink_window: wine.ai_drink_window,
                },
            });
            this._buyListIndices = new Set([...this._buyListIndices, wine.index]);
            this.dispatchEvent(new CustomEvent("buy-list-updated", { bubbles: true, composed: true }));
        }
        catch (err) {
            console.error("Failed to add wine to buy list", err);
        }
    }
    _scanAnotherPage() {
        this._phase = "capture";
        this._error = "";
    }
    _formatPrice(amount, currency = "USD") {
        if (amount === null || amount === undefined)
            return "---";
        const symbols = {
            USD: "$", EUR: "\u20AC", GBP: "\u00A3", JPY: "\u00A5",
            CHF: "CHF ", AUD: "A$", CAD: "C$",
        };
        const sym = symbols[currency] || `${currency} `;
        return `${sym}${amount.toFixed(0)}`;
    }
    _calcMarkup(listPrice, marketPrice) {
        if (!listPrice || !marketPrice || marketPrice <= 0)
            return null;
        const pct = ((listPrice - marketPrice) / marketPrice) * 100;
        const text = `${pct >= 0 ? "+" : ""}${Math.round(pct)}%`;
        const ratio = listPrice / marketPrice;
        const color = ratio <= 1.5 ? "#2e7d32" : ratio <= 2.5 ? "#f57f17" : "#c62828";
        return { text, color };
    }
    _getValueBadge(wine) {
        const listPrice = wine.list_price;
        const marketPrice = wine.vivino_price || wine.ai_estimated_price;
        if (!listPrice || !marketPrice)
            return null;
        const ratio = listPrice / marketPrice;
        if (ratio <= 1.5)
            return { label: "Great Value", color: "#2e7d32" };
        if (ratio <= 2.0)
            return { label: "Fair Price", color: "#558b2f" };
        if (ratio <= 3.0)
            return { label: "Typical", color: "#f57f17" };
        return { label: "Premium", color: "#c62828" };
    }
    _showWineDetail(wine) {
        // Convert WineListItem to Wine-like object for the detail dialog
        this._detailWine = {
            id: `winelist-${wine.index}`,
            barcode: "",
            name: wine.name,
            winery: wine.winery,
            region: wine.region,
            country: wine.country,
            vintage: wine.vintage || 0,
            type: wine.type || "red",
            grape_variety: wine.grape_variety,
            rating: wine.vivino_rating || 0,
            ratings_count: wine.vivino_ratings_count || 0,
            image_url: wine.vivino_image_url || "",
            price: wine.list_price || 0,
            retail_price: wine.vivino_price || wine.ai_estimated_price || 0,
            purchase_date: "",
            drink_by: "",
            drink_window: wine.ai_drink_window || "",
            notes: "",
            description: wine.ai_description || "",
            food_pairings: "",
            alcohol: "",
            cabinet_id: "",
            row: null,
            col: null,
            depth: 0,
            zone: "",
            disposition: wine.ai_disposition || "",
            ai_ratings: wine.ai_ratings,
            added_at: "",
        };
        this._showDetail = true;
    }
    _findCellarMatch(wine) {
        if (!this.cellarWines?.length)
            return null;
        const wName = (wine.name || "").toLowerCase().trim();
        const wWinery = (wine.winery || "").toLowerCase().trim();
        const wVintage = wine.vintage;
        return this.cellarWines.find((c) => {
            const cName = (c.name || "").toLowerCase().trim();
            const cWinery = (c.winery || "").toLowerCase().trim();
            // Match by name + winery (both must partially match)
            const nameMatch = cName.includes(wName) || wName.includes(cName);
            const wineryMatch = !wWinery || !cWinery || cWinery.includes(wWinery) || wWinery.includes(cWinery);
            const vintageMatch = !wVintage || !c.vintage || wVintage === c.vintage;
            return nameMatch && wineryMatch && vintageMatch;
        }) || null;
    }
    _renderWineItem(wine) {
        const typeColor = WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red;
        const expanded = this._expandedIndex === wine.index;
        const added = this._addedIndices.has(wine.index);
        const marketPrice = wine.vivino_price || wine.ai_estimated_price;
        const markup = this._calcMarkup(wine.list_price, marketPrice);
        const valueBadge = this._getValueBadge(wine);
        const cellarMatch = this._findCellarMatch(wine);
        return b `
      <div
        class="wine-list-item ${expanded ? "expanded" : ""}"
        @click=${() => this._showWineDetail(wine)}
      >
        <div class="wl-type-dot" style="background: ${typeColor}"></div>
        ${wine.vivino_image_url
            ? b `<img class="wl-thumb" src="${wine.vivino_image_url}" alt="" />`
            : A}
        <div class="wl-info">
          <div class="wl-name">
            ${wine.winery ? `${wine.winery} ` : ""}${wine.name}
            ${cellarMatch ? b `<span class="wl-cellar-badge">IN CELLAR</span>` : A}
          </div>
          <div class="wl-meta">
            ${wine.vintage || "NV"} ${wine.region ? `\u2022 ${wine.region}` : ""}
            ${wine.grape_variety ? `\u2022 ${wine.grape_variety}` : ""}
          </div>

          <!-- Prices + Scores combined row -->
          <div class="wl-price-row">
            ${wine.list_price !== null
            ? b `<span class="wl-list-price">${this._formatPrice(wine.list_price, this._currency)}</span>`
            : A}
            ${marketPrice
            ? b `<span class="wl-market-price">${this._formatPrice(marketPrice, "USD")}</span>`
            : A}
            ${markup
            ? b `<span class="wl-markup-badge" style="background:${markup.color}">${markup.text}</span>`
            : A}
            ${valueBadge
            ? b `<span class="wl-value-badge" style="background:${valueBadge.color}">${valueBadge.label}</span>`
            : A}
            ${wine.vivino_status === "loading"
            ? b `<span class="wl-loading-dot"></span>`
            : wine.vivino_rating
                ? b `<span class="wl-vivino-rating">\u2605 ${wine.vivino_rating.toFixed(1)}</span>`
                : A}
            ${wine.ai_status === "loading"
            ? b `<span class="wl-loading-dot"></span>`
            : A}
            ${cellarMatch?.user_rating
            ? b `<span class="wl-user-score">\uD83C\uDF77 ${cellarMatch.user_rating}/100</span>`
            : A}
            ${wine.ai_ratings?.rating_ws ? b `<span class="wl-ai-chip">WS ${wine.ai_ratings.rating_ws}</span>` : A}
            ${wine.ai_ratings?.rating_rp ? b `<span class="wl-ai-chip">RP ${wine.ai_ratings.rating_rp}</span>` : A}
            ${wine.ai_ratings?.rating_jd ? b `<span class="wl-ai-chip">JD ${wine.ai_ratings.rating_jd}</span>` : A}
            ${wine.ai_ratings?.rating_ag ? b `<span class="wl-ai-chip">AG ${wine.ai_ratings.rating_ag}</span>` : A}
          </div>

          <!-- Expanded details -->
          ${expanded
            ? b `
                <div class="wl-expanded-detail">
                  ${wine.ai_description
                ? b `<div class="wl-detail-row" style="font-style:italic">${wine.ai_description}</div>`
                : A}
                  ${wine.ai_drink_window
                ? b `<div class="wl-detail-row"><span class="wl-detail-label">Drink window:</span>${wine.ai_drink_window}</div>`
                : A}
                  ${wine.glass_price
                ? b `<div class="wl-detail-row"><span class="wl-detail-label">By the glass:</span>${this._formatPrice(wine.glass_price, this._currency)}</div>`
                : A}
                  ${wine.bottle_size && wine.bottle_size !== "750ml"
                ? b `<div class="wl-detail-row"><span class="wl-detail-label">Size:</span>${wine.bottle_size}</div>`
                : A}
                  ${wine.vivino_rating
                ? b `<div class="wl-detail-row"><span class="wl-detail-label">Vivino:</span>${wine.vivino_rating.toFixed(1)}${wine.vivino_ratings_count ? ` (${wine.vivino_ratings_count.toLocaleString()} ratings)` : ""}</div>`
                : A}
                </div>
              `
            : A}
        </div>

        <div class="wl-actions" @click=${(e) => e.stopPropagation()}>
          <button
            class="wl-add-btn ${added ? "added" : ""}"
            ?disabled=${added}
            @click=${() => !added && this._addToCellar(wine)}
          >
            ${added ? "\u2713" : "+ Add"}
          </button>
          <button
            class="wl-buy-btn ${this._buyListIndices.has(wine.index) ? "added" : ""}"
            ?disabled=${this._buyListIndices.has(wine.index)}
            @click=${() => !this._buyListIndices.has(wine.index) && this._addToBuyList(wine)}
          >
            ${this._buyListIndices.has(wine.index) ? "\u2713" : "\uD83D\uDED2 Buy"}
          </button>
        </div>
      </div>
    `;
    }
    render() {
        if (!this.open)
            return A;
        const vivinoDone = this._wines.filter((w) => w.vivino_status === "done" || w.vivino_status === "error").length;
        const total = this._wines.length;
        return b `
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" style="max-width:600px" @click=${(e) => e.stopPropagation()}>
          <div class="header">
            <span class="header-title">
              ${this._phase === "capture"
            ? "\uD83C\uDF7D\uFE0F Scan List"
            : this._restaurantName
                ? `\uD83C\uDF7D\uFE0F ${this._restaurantName}`
                : "\uD83C\uDF7D\uFE0F Scanned List"}
            </span>
            <button class="close-btn" @click=${this._close}>\u2715</button>
          </div>

          ${this._phase === "capture"
            ? b `
                ${this._error
                ? b `<div class="error-msg">${this._error}</div>`
                : A}
                ${this._wines.length > 0
                ? b `<div class="header-subtitle">${this._wines.length} wines already scanned. Take another photo to add more.</div>`
                : b `<div class="header-subtitle">Take a photo of a wine list or receipt to see ratings, scores, and value.</div>`}
                <div style="padding: 0 16px 16px">
                  <label-camera .active=${this._phase === "capture"} @photo-captured=${this._onPhotoCaptured}></label-camera>
                </div>
                ${this._wines.length > 0
                ? b `
                      <div class="footer-actions">
                        <button class="btn btn-primary" @click=${() => (this._phase = "results")}>
                          Back to Results (${this._wines.length})
                        </button>
                      </div>
                    `
                : A}
              `
            : A}

          ${this._phase === "extracting"
            ? b `
                <div class="extracting">
                  <div class="spinner"></div>
                  <div>Analyzing list...</div>
                  <div style="font-size:0.85em">Gemini is reading wines and scoring them</div>
                  <div style="font-size:0.78em; color: var(--secondary-text-color); margin-top: 8px;">Long lists may take up to 3 minutes</div>
                </div>
              `
            : A}

          ${this._phase === "results"
            ? b `
                <div class="header-subtitle">
                  ${total} wine${total !== 1 ? "s" : ""} found
                  ${this._currency !== "USD" ? ` \u2022 Prices in ${this._currency}` : ""}
                </div>

                <!-- Vivino enrichment progress -->
                ${this._enriching
                ? b `
                      <div class="enrichment-bar">
                        <span>\uD83C\uDF47 Vivino ${vivinoDone}/${total}</span>
                        <div class="progress-track">
                          <div
                            class="progress-fill vivino"
                            style="width: ${total ? (vivinoDone / total) * 100 : 0}%"
                          ></div>
                        </div>
                      </div>
                    `
                : A}

                <div class="wine-list-results">
                  ${this._wines.map((w) => this._renderWineItem(w))}
                </div>

                <div class="footer-actions">
                  ${!this._enriching && this._wines.some((w) => w.vivino_status === "pending")
                ? b `
                        <button
                          class="btn btn-primary"
                          style="background:#8e24aa"
                          @click=${this._startVivinoEnrichment}
                        >
                          \uD83C\uDF47 Get Vivino Scores
                        </button>
                      `
                : A}
                  <button
                    class="btn btn-primary"
                    style="background:#00695c"
                    @click=${this._scanAnotherPage}
                  >
                    \uD83D\uDCF7 Scan Another Page
                  </button>
                </div>
              `
            : A}
        </div>
      </div>

      <!-- Wine detail dialog for wine list items -->
      <wine-detail-dialog
        .wine=${this._detailWine}
        .hass=${this.hass}
        .open=${this._showDetail}
        .hasGemini=${this.hasGemini}
        .mode=${"winelist"}
        @close=${() => (this._showDetail = false)}
      ></wine-detail-dialog>
    `;
    }
};
WineListDialog.styles = [
    sharedStyles,
    i$3 `
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px 8px;
      }

      .header-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--wc-text);
      }

      .header-subtitle {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        padding: 0 20px 12px;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.3em;
        cursor: pointer;
        color: var(--wc-text-secondary);
        padding: 4px 8px;
        border-radius: 6px;
        line-height: 1;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .extracting {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 40px 20px;
        color: var(--wc-text-secondary);
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--wc-border);
        border-top: 3px solid var(--wc-primary, #6d4c41);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .error-msg {
        padding: 12px 20px;
        color: #c62828;
        font-size: 0.85em;
        background: rgba(198, 40, 40, 0.08);
        border-radius: 8px;
        margin: 0 20px 12px;
      }

      .enrichment-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 20px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }

      .progress-track {
        flex: 1;
        height: 4px;
        background: var(--wc-border);
        border-radius: 2px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s;
      }

      .progress-fill.vivino { background: #8e24aa; }
      .progress-fill.ai { background: #1565c0; }

      .wine-list-results {
        max-height: 55vh;
        overflow-y: auto;
        padding: 0 16px 16px;
      }

      .wine-list-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 5px 10px;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        margin-bottom: 3px;
        transition: background 0.2s;
        cursor: pointer;
      }

      .wine-list-item:hover {
        background: rgba(255, 255, 255, 0.04);
      }

      .wine-list-item.expanded {
        background: rgba(255, 255, 255, 0.06);
      }

      .wl-type-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        margin-top: 5px;
      }

      .wl-thumb {
        width: 22px;
        height: 32px;
        border-radius: 3px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .wl-info {
        flex: 1;
        min-width: 0;
      }

      .wl-name {
        font-weight: 600;
        font-size: 0.82em;
        color: var(--wc-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wl-cellar-badge {
        font-size: 0.65em;
        font-weight: 700;
        padding: 1px 4px;
        border-radius: 4px;
        background: rgba(46, 125, 50, 0.2);
        border: 1px solid rgba(46, 125, 50, 0.4);
        color: #4caf50;
        margin-left: 4px;
        vertical-align: middle;
      }

      .wl-meta {
        font-size: 0.72em;
        color: var(--wc-text-secondary);
        margin-top: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wl-vivino-rating {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-size: 0.78em;
        font-weight: 600;
        color: #f5a623;
      }

      .wl-user-score {
        font-size: 0.78em;
        font-weight: 600;
        color: #4caf50;
      }

      .wl-price-row {
        display: flex;
        gap: 4px;
        align-items: center;
        margin-top: 1px;
        font-size: 0.78em;
        flex-wrap: wrap;
      }

      .wl-list-price {
        font-weight: 600;
        color: var(--wc-text);
      }

      .wl-market-price {
        color: var(--wc-text-secondary);
        text-decoration: line-through;
      }

      .wl-markup-badge {
        font-size: 0.68em;
        font-weight: 600;
        padding: 1px 5px;
        border-radius: 6px;
        color: #fff;
      }

      .wl-value-badge {
        font-size: 0.66em;
        font-weight: 500;
        padding: 1px 5px;
        border-radius: 6px;
        color: #fff;
      }

      .wl-ai-chip {
        font-size: 0.65em;
        padding: 1px 4px;
        border-radius: 8px;
        background: rgba(245, 166, 35, 0.12);
        border: 1px solid rgba(245, 166, 35, 0.3);
        color: #f5a623;
        font-weight: 600;
      }

      .wl-expanded-detail {
        margin-top: 4px;
        padding-top: 4px;
        border-top: 1px solid var(--wc-border);
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        line-height: 1.3;
      }

      .wl-detail-row {
        margin-bottom: 2px;
      }

      .wl-detail-label {
        font-weight: 600;
        color: var(--wc-text);
        margin-right: 4px;
      }

      .wl-loading-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border: 2px solid var(--wc-border);
        border-top: 2px solid var(--wc-primary, #6d4c41);
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      .wl-actions {
        flex-shrink: 0;
      }

      .wl-add-btn {
        background: #2e7d32;
        color: #fff;
        border: none;
        border-radius: 5px;
        font-size: 0.7em;
        padding: 3px 6px;
        cursor: pointer;
        white-space: nowrap;
      }

      .wl-add-btn:hover { background: #1b5e20; }

      .wl-add-btn.added {
        background: #546e7a;
        cursor: default;
      }

      .wl-buy-btn {
        background: #e65100;
        color: #fff;
        border: none;
        border-radius: 5px;
        font-size: 0.7em;
        padding: 3px 6px;
        cursor: pointer;
        white-space: nowrap;
        margin-top: 2px;
      }

      .wl-buy-btn:hover { background: #bf360c; }

      .wl-buy-btn.added {
        background: #546e7a;
        cursor: default;
      }

      .footer-actions {
        display: flex;
        gap: 8px;
        padding: 12px 16px 16px;
        border-top: 1px solid var(--wc-border);
        justify-content: center;
        flex-wrap: wrap;
      }

      .footer-actions .btn {
        font-size: 0.8em;
        padding: 6px 12px;
      }

      @media (max-width: 599px) {
        .wine-list-results {
          max-height: 65vh;
        }
      }
    `,
];
__decorate([
    n({ type: Boolean })
], WineListDialog.prototype, "open", void 0);
__decorate([
    n({ attribute: false })
], WineListDialog.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], WineListDialog.prototype, "cellarWines", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_phase", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_wines", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_restaurantName", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_currency", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_error", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_enriching", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_expandedIndex", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_addedIndices", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_cancelEnrichment", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_buyListIndices", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_detailWine", void 0);
__decorate([
    r()
], WineListDialog.prototype, "_showDetail", void 0);
__decorate([
    n({ type: Boolean })
], WineListDialog.prototype, "hasGemini", void 0);
WineListDialog = __decorate([
    t("wine-list-dialog")
], WineListDialog);

// Persisted so the inventory reopens the way it was left; the search query is
// deliberately excluded — a stale query silently hiding the cellar is far more
// confusing than a stale sort order.
const PREFS_KEY = "wine_cellar_inventory_prefs_v1";
const DEFAULT_FILTERS = {
    typeFilter: "all",
    dispositionFilter: "all",
    countryFilter: "all",
    grapeFilter: "all",
    foodFilter: "all",
    cabinetFilter: "all",
    minRating: 0,
    maxPrice: null,
    vintageMin: null,
    vintageMax: null,
    preset: "all",
};
let InventoryDialog = class InventoryDialog extends i {
    constructor() {
        super(...arguments);
        this.open = false;
        this.wines = [];
        this.cabinets = [];
        this.hasGemini = false;
        this.currency = "USD";
        this._searchQuery = "";
        this._typeFilter = DEFAULT_FILTERS.typeFilter;
        this._dispositionFilter = DEFAULT_FILTERS.dispositionFilter;
        this._countryFilter = DEFAULT_FILTERS.countryFilter;
        this._grapeFilter = DEFAULT_FILTERS.grapeFilter;
        this._foodFilter = DEFAULT_FILTERS.foodFilter;
        this._cabinetFilter = DEFAULT_FILTERS.cabinetFilter;
        this._minRating = DEFAULT_FILTERS.minRating;
        this._maxPrice = DEFAULT_FILTERS.maxPrice;
        this._vintageMin = DEFAULT_FILTERS.vintageMin;
        this._vintageMax = DEFAULT_FILTERS.vintageMax;
        this._preset = DEFAULT_FILTERS.preset;
        this._showFilters = false;
        this._sortField = "name";
        this._sortDir = "asc";
        this._detailWine = null;
        this._showDetail = false;
        this._backingUp = false;
        this._importing = false;
        this._restoring = false;
        this._confirmRestore = false;
        this._restoreData = null;
        this._confirmImport = false;
        this._pendingImport = null;
        this._importMatches = 0;
        this._statusMsg = "";
        this._serverBackingUp = false;
        this._serverBackupLabel = "";
        this._showServerRestore = false;
        this._serverBackups = [];
        this._serverRestoring = false;
        this._backupKeep = 10;
        this._backupKeepChoices = [0, 5, 10, 20, 50];
        this._storageInfo = null;
        this._enriching = "";
        this._confirmEnrich = "";
        this._confirmEnrichRetry = false;
        this._viewMode = "inventory";
        this._historyItems = [];
        this._historyLoading = false;
    }
    updated(changedProps) {
        if (changedProps.has("open") && this.open) {
            // Only the search query is transient. Sort order and filters are
            // restored from localStorage on connect and must survive a reopen —
            // resetting them here would silently undo the saved preferences.
            this._searchQuery = "";
            this._showDetail = false;
            this._detailWine = null;
            this._statusMsg = "";
            this._confirmRestore = false;
            this._confirmEnrich = "";
            this._confirmEnrichRetry = false;
            this._confirmImport = false;
            this._pendingImport = null;
            this._showServerRestore = false;
            this._restoreData = null;
            this._viewMode = "inventory";
            this._historyItems = [];
        }
    }
    _close() {
        this.open = false;
        this.dispatchEvent(new CustomEvent("close"));
    }
    // ── Preferences (sort + filters survive a reopen) ─────────────
    connectedCallback() {
        super.connectedCallback();
        this._loadPrefs();
    }
    _loadPrefs() {
        try {
            const raw = localStorage.getItem(PREFS_KEY);
            if (!raw)
                return;
            const p = JSON.parse(raw);
            if (p.sortField)
                this._sortField = p.sortField;
            if (p.sortDir)
                this._sortDir = p.sortDir;
            if (p.typeFilter)
                this._typeFilter = p.typeFilter;
            if (p.dispositionFilter)
                this._dispositionFilter = p.dispositionFilter;
            if (p.countryFilter)
                this._countryFilter = p.countryFilter;
            if (p.grapeFilter)
                this._grapeFilter = p.grapeFilter;
            if (p.foodFilter)
                this._foodFilter = p.foodFilter;
            if (p.cabinetFilter)
                this._cabinetFilter = p.cabinetFilter;
            if (typeof p.minRating === "number")
                this._minRating = p.minRating;
            if (p.maxPrice !== undefined)
                this._maxPrice = p.maxPrice;
            if (p.vintageMin !== undefined)
                this._vintageMin = p.vintageMin;
            if (p.vintageMax !== undefined)
                this._vintageMax = p.vintageMax;
            if (p.preset)
                this._preset = p.preset;
        }
        catch {
            // A corrupt or unavailable localStorage must never keep the dialog
            // from opening — fall back to defaults silently.
        }
    }
    _savePrefs() {
        try {
            localStorage.setItem(PREFS_KEY, JSON.stringify({
                sortField: this._sortField,
                sortDir: this._sortDir,
                typeFilter: this._typeFilter,
                dispositionFilter: this._dispositionFilter,
                countryFilter: this._countryFilter,
                grapeFilter: this._grapeFilter,
                foodFilter: this._foodFilter,
                cabinetFilter: this._cabinetFilter,
                minRating: this._minRating,
                maxPrice: this._maxPrice,
                vintageMin: this._vintageMin,
                vintageMax: this._vintageMax,
                preset: this._preset,
            }));
        }
        catch {
            // Private browsing / full quota — not worth surfacing.
        }
    }
    _clearFilters() {
        this._typeFilter = DEFAULT_FILTERS.typeFilter;
        this._dispositionFilter = DEFAULT_FILTERS.dispositionFilter;
        this._countryFilter = DEFAULT_FILTERS.countryFilter;
        this._grapeFilter = DEFAULT_FILTERS.grapeFilter;
        this._foodFilter = DEFAULT_FILTERS.foodFilter;
        this._cabinetFilter = DEFAULT_FILTERS.cabinetFilter;
        this._minRating = DEFAULT_FILTERS.minRating;
        this._maxPrice = DEFAULT_FILTERS.maxPrice;
        this._vintageMin = DEFAULT_FILTERS.vintageMin;
        this._vintageMax = DEFAULT_FILTERS.vintageMax;
        this._preset = DEFAULT_FILTERS.preset;
        this._searchQuery = "";
        this._savePrefs();
    }
    // Everything that is currently narrowing the list, so a persisted filter
    // can never silently hide half the cellar.
    _activeFilterCount() {
        let n = 0;
        if (this._typeFilter !== "all")
            n++;
        if (this._dispositionFilter !== "all")
            n++;
        if (this._countryFilter !== "all")
            n++;
        if (this._grapeFilter !== "all")
            n++;
        if (this._foodFilter !== "all")
            n++;
        if (this._cabinetFilter !== "all")
            n++;
        if (this._minRating > 0)
            n++;
        if (this._maxPrice !== null)
            n++;
        if (this._vintageMin !== null)
            n++;
        if (this._vintageMax !== null)
            n++;
        if (this._preset !== "all")
            n++;
        return n;
    }
    // ── Facets ────────────────────────────────────────────────────
    _countryOptions() {
        return collectFacet(this.wines, (w) => (w.country ? [w.country] : []));
    }
    _grapeOptions() {
        return collectFacet(this.wines, (w) => splitMulti(w.grape_variety));
    }
    // Vivino returns pairings from a closed vocabulary ("Beef", "Blue cheese",
    // "Spicy food"…), so offering the ones actually present in the cellar beats
    // hoping the user guesses the exact wording.
    _foodOptions() {
        return collectFacet(this.wines, (w) => splitMulti(w.food_pairings));
    }
    _winesWithoutPairings() {
        return this.wines.filter((w) => !splitMulti(w.food_pairings).length).length;
    }
    // ── Enrichment ────────────────────────────────────────────────
    // Vivino is the *only* source of food pairings; it also supplies the
    // description. Rating and photo are deliberately not part of the test —
    // Vivino has no match for plenty of bottles, and a wine that will never
    // gain a photo must not sit in this list forever nagging the user.
    _missingVivinoData(w) {
        return !w.food_pairings || !w.description;
    }
    // The AI supplies the drinking verdict and window; it never returns food
    // pairings. Critic scores are excluded for the same reason as the photo
    // above — the AI legitimately has none for many wines.
    _missingAIData(w) {
        return !w.disposition || !w.drink_window;
    }
    // Never consulted: the source has genuinely not been asked yet.
    _winesNeedingVivino() {
        return this.wines.filter((w) => !w.vivino_checked_at && this._missingVivinoData(w));
    }
    _winesNeedingAI() {
        return this.wines.filter((w) => !w.ai_checked_at && this._missingAIData(w));
    }
    // Asked, and the source had nothing. Kept apart from the counts above so a
    // retry is a deliberate act rather than an endless nag: Vivino does add
    // bottles to its catalogue over time, so retrying later is worth offering,
    // just not automatically.
    _winesVivinoNotFound() {
        return this.wines.filter((w) => !!w.vivino_checked_at && this._missingVivinoData(w));
    }
    _winesAINotFound() {
        return this.wines.filter((w) => !!w.ai_checked_at && this._missingAIData(w));
    }
    async _runEnrich(source, retry = false) {
        const wines = retry
            ? source === "vivino"
                ? this._winesVivinoNotFound()
                : this._winesAINotFound()
            : source === "vivino"
                ? this._winesNeedingVivino()
                : this._winesNeedingAI();
        this._confirmEnrich = "";
        this._confirmEnrichRetry = false;
        if (!wines.length)
            return;
        const sourceLabel = source === "vivino" ? "Vivino" : "the AI";
        this._enriching = source;
        this._statusMsg = `Refreshing ${wines.length} wines via ${sourceLabel}…`;
        try {
            const result = await this.hass.callWS({
                type: source === "vivino" ? "wine_cellar/batch_refresh_vivino" : "wine_cellar/batch_analyze_wines",
                wine_ids: wines.map((w) => w.id),
            });
            if (result?.error) {
                this._statusMsg = `Refresh failed: ${result.error}`;
            }
            else {
                const updated = result?.updated ?? 0;
                const unchanged = result?.unchanged ?? 0;
                const errors = result?.errors ?? 0;
                const source = sourceLabel;
                const parts = [`${updated} updated`];
                if (unchanged)
                    parts.push(`${unchanged} had nothing new on ${source}`);
                if (errors)
                    parts.push(`${errors} could not be reached`);
                this._statusMsg =
                    `${parts.join(", ")}.` +
                        (unchanged
                            ? retry
                                ? " Their check date is updated — try again later."
                                : " Their check date is updated; they move to the retry line."
                            : "");
                this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
            }
        }
        catch (err) {
            this._statusMsg = `Refresh failed: ${err.message || err}`;
        }
        this._enriching = "";
    }
    // ── Filtering & sorting ───────────────────────────────────────
    _matchesPreset(wine, currentYear, recentCutoff) {
        switch (this._preset) {
            case "drink_this_year": {
                if (wine.disposition === "P")
                    return false;
                const year = drinkByYear(wine);
                return year !== null ? year <= currentYear : wine.disposition === "D";
            }
            case "past_peak":
                return wine.disposition === "P";
            case "unrated":
                return !wine.user_rating;
            case "incomplete":
                return (!wine.food_pairings || !wine.description || !wine.drink_window || !wine.image_url);
            case "recent":
                return !!wine.added_at && wine.added_at >= recentCutoff;
            default:
                return true;
        }
    }
    _getFilteredAndSortedWines() {
        let wines = [...this.wines];
        if (this._typeFilter !== "all") {
            wines = wines.filter((w) => w.type === this._typeFilter);
        }
        if (this._dispositionFilter !== "all") {
            const want = this._dispositionFilter;
            wines = wines.filter((w) => want === "none" ? !w.disposition : w.disposition === want);
        }
        if (this._countryFilter !== "all") {
            const want = normalizeText(this._countryFilter);
            wines = wines.filter((w) => normalizeText(w.country) === want);
        }
        if (this._grapeFilter !== "all") {
            const want = normalizeText(this._grapeFilter);
            wines = wines.filter((w) => normalizeText(w.grape_variety).includes(want));
        }
        if (this._foodFilter !== "all") {
            const want = normalizeText(this._foodFilter);
            wines = wines.filter((w) => normalizeText(w.food_pairings).includes(want));
        }
        if (this._cabinetFilter !== "all") {
            const known = new Set(this.cabinets.map((c) => c.id));
            wines = wines.filter((w) => this._cabinetFilter === "unassigned"
                ? !w.cabinet_id || !known.has(w.cabinet_id)
                : w.cabinet_id === this._cabinetFilter);
        }
        if (this._minRating > 0) {
            wines = wines.filter((w) => (w.rating || 0) >= this._minRating);
        }
        // "Under X" can only be answered for wines that actually carry a price —
        // an unpriced bottle is unknown, not cheap.
        if (this._maxPrice !== null) {
            const max = this._maxPrice;
            wines = wines.filter((w) => {
                const price = w.retail_price || w.price;
                return !!price && price <= max;
            });
        }
        if (this._vintageMin !== null) {
            const min = this._vintageMin;
            wines = wines.filter((w) => w.vintage !== null && w.vintage >= min);
        }
        if (this._vintageMax !== null) {
            const max = this._vintageMax;
            wines = wines.filter((w) => w.vintage !== null && w.vintage <= max);
        }
        if (this._preset !== "all") {
            const currentYear = new Date().getFullYear();
            const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
            wines = wines.filter((w) => this._matchesPreset(w, currentYear, cutoff));
        }
        if (this._searchQuery) {
            wines = wines.filter((w) => matchesQuery(w, this._searchQuery, this.cabinets));
        }
        const dir = this._sortDir === "asc" ? 1 : -1;
        wines.sort((a, b) => {
            switch (this._sortField) {
                case "name":
                    return dir * a.name.localeCompare(b.name);
                case "winery":
                    return dir * (a.winery || "").localeCompare(b.winery || "");
                case "vintage":
                    return dir * ((a.vintage || 0) - (b.vintage || 0));
                case "type":
                    return dir * (a.type || "").localeCompare(b.type || "");
                case "rating":
                    return dir * ((a.rating || 0) - (b.rating || 0));
                case "user_rating":
                    return dir * ((a.user_rating || 0) - (b.user_rating || 0));
                case "price":
                    return dir * ((a.retail_price || a.price || 0) - (b.retail_price || b.price || 0));
                case "drink_by":
                    return compareNullable(drinkByYear(a), drinkByYear(b), dir, (x, y) => x - y);
                case "urgency": {
                    // Past peak first, then drink-now, then hold, then unanalyzed —
                    // within a bucket, the soonest drink-by year leads.
                    const rank = (w) => w.disposition === "P" ? 0 : w.disposition === "D" ? 1 : w.disposition === "H" ? 2 : 3;
                    const byRank = rank(a) - rank(b);
                    if (byRank !== 0)
                        return dir * byRank;
                    return compareNullable(drinkByYear(a), drinkByYear(b), dir, (x, y) => x - y);
                }
                case "purchase_date":
                    return compareNullable(a.purchase_date || null, b.purchase_date || null, dir, (x, y) => x.localeCompare(y));
                case "added_at":
                    return dir * (a.added_at || "").localeCompare(b.added_at || "");
                case "cabinet": {
                    const cabA = this.cabinets.find((c) => c.id === a.cabinet_id)?.name || "";
                    const cabB = this.cabinets.find((c) => c.id === b.cabinet_id)?.name || "";
                    return dir * cabA.localeCompare(cabB);
                }
                default:
                    return 0;
            }
        });
        return wines;
    }
    _computeStats(wines) {
        const count = wines.length;
        let totalValue = 0;
        const byType = {};
        for (const w of wines) {
            if (w.retail_price)
                totalValue += w.retail_price;
            else if (w.price)
                totalValue += w.price;
            const t = w.type || "unknown";
            byType[t] = (byType[t] || 0) + 1;
        }
        return { count, totalValue, byType };
    }
    // ── History ──────────────────────────────────────────────────
    async _switchToHistory() {
        this._viewMode = "history";
        this._historyLoading = true;
        this._loadStorageInfo();
        try {
            const result = await this.hass.callWS({ type: "wine_cellar/get_wine_history" });
            this._historyItems = (result?.history || []).sort((a, b) => (b.removed_at || "").localeCompare(a.removed_at || ""));
        }
        catch (err) {
            console.error("Failed to load wine history", err);
            this._historyItems = [];
        }
        this._historyLoading = false;
    }
    async _clearHistory() {
        try {
            await this.hass.callWS({ type: "wine_cellar/clear_wine_history" });
            this._historyItems = [];
            this._loadStorageInfo();
            this._statusMsg = "History cleared";
        }
        catch (err) {
            console.error("Failed to clear history", err);
        }
    }
    async _restoreFromHistory(historyId) {
        try {
            await this.hass.callWS({ type: "wine_cellar/restore_wine", history_id: historyId });
            this._historyItems = this._historyItems.filter((i) => i.id !== historyId);
            this._statusMsg = "Wine restored to Unassigned";
            this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
        }
        catch (err) {
            console.error("Failed to restore wine from history", err);
            this._statusMsg = "Failed to restore wine";
        }
    }
    _formatReason(reason) {
        const map = {
            drank: "Drank", gifted: "Gifted", sold: "Sold",
            broken: "Broken", spoiled: "Spoiled", other: "Other",
        };
        return map[reason] || reason;
    }
    _formatDate(iso) {
        if (!iso)
            return "";
        try {
            return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        }
        catch {
            return iso;
        }
    }
    _renderHistory() {
        if (this._historyLoading) {
            return b `<div class="inv-empty">Loading history...</div>`;
        }
        if (this._historyItems.length === 0) {
            return b `
        ${this._renderStorageInfo()}
        <div class="inv-empty">No removal history yet</div>
        <div class="inv-footer">
          <span class="inv-count">0 wines removed</span>
        </div>
      `;
        }
        return b `
      ${this._renderStorageInfo()}
      <div class="inv-list">
        ${this._historyItems.map(item => b `
          <div class="inv-history-item">
            ${item.image_url
            ? b `<img class="inv-thumb" src="${item.image_url}" alt="" loading="lazy" />`
            : b `<div class="inv-dot" style="background:${WINE_TYPE_COLORS[item.type] || "#999"}"></div>`}
            <div class="inv-info">
              <div class="inv-name">${item.name}</div>
              <div class="inv-meta">
                ${item.winery}${item.vintage ? ` · ${item.vintage}` : ""}
                · <span class="inv-reason-badge">${this._formatReason(item.reason)}</span>
              </div>
            </div>
            <div class="inv-right">
              ${item.price ? b `<div class="inv-price">${this.currency} ${item.price.toFixed(0)}</div>` : A}
              <div class="inv-location">${this._formatDate(item.removed_at)}</div>
              <button class="inv-btn" style="margin-top:4px" @click=${() => this._restoreFromHistory(item.id)}>Restore</button>
            </div>
          </div>
        `)}
      </div>
      <div class="inv-footer">
        <span class="inv-count">${this._historyItems.length} wines removed</span>
        ${this._statusMsg
            ? b `<div class="inv-status">${this._statusMsg}</div>`
            : A}
        <div class="inv-footer-btns">
          <button class="inv-btn" @click=${this._clearHistory}>Clear History</button>
        </div>
      </div>
    `;
    }
    // Sits under the list: how many bottles are still missing data, and the two
    // actions that can fill it. Each source is labelled with what it actually
    // supplies, so nobody runs AI hoping for food pairings.
    _renderEnrichRow(source, wines, retry, text, label) {
        if (!wines.length)
            return A;
        if (source === "ai" && !this.hasGemini)
            return A;
        const busy = !!this._enriching;
        return b `
      <div class="inv-enrich-row ${retry ? "retry" : ""}">
        <span class="inv-enrich-text">${text}</span>
        <button
          class="inv-btn"
          ?disabled=${busy}
          @click=${() => {
            this._confirmEnrich = source;
            this._confirmEnrichRetry = retry;
        }}
        >
          ${this._enriching === source ? "Working…" : `${label} (${wines.length})`}
        </button>
      </div>
    `;
    }
    _renderEnrichBar() {
        const needVivino = this._winesNeedingVivino();
        const needAI = this._winesNeedingAI();
        const missVivino = this._winesVivinoNotFound();
        const missAI = this._winesAINotFound();
        if (!needVivino.length && !needAI.length && !missVivino.length && !missAI.length) {
            return A;
        }
        return b `
      <div class="inv-enrich">
        ${this._renderEnrichRow("vivino", needVivino, false, b `<strong>${needVivino.length}</strong> missing pairings or description, never
            checked against Vivino`, "Fill from Vivino")}
        ${this._renderEnrichRow("ai", needAI, false, b `<strong>${needAI.length}</strong> missing a drink window or verdict, never
            analyzed by AI`, "Analyze with AI")}
        ${this._renderEnrichRow("vivino", missVivino, true, b `<strong>${missVivino.length}</strong> checked against Vivino, still nothing —
            Vivino does add bottles over time`, "Retry Vivino")}
        ${this._renderEnrichRow("ai", missAI, true, b `<strong>${missAI.length}</strong> analyzed by AI, still without a verdict`, "Retry AI")}
      </div>
    `;
    }
    _renderEnrichConfirm() {
        if (!this._confirmEnrich)
            return A;
        const source = this._confirmEnrich;
        const retry = this._confirmEnrichRetry;
        const count = retry
            ? source === "vivino"
                ? this._winesVivinoNotFound().length
                : this._winesAINotFound().length
            : source === "vivino"
                ? this._winesNeedingVivino().length
                : this._winesNeedingAI().length;
        return b `
      <div class="inv-confirm-overlay" @click=${() => (this._confirmEnrich = "")}>
        <div class="inv-confirm-box" @click=${(e) => e.stopPropagation()}>
          <h3>
            ${source === "vivino"
            ? retry
                ? "🍇 Retry Vivino?"
                : "🍇 Fill from Vivino?"
            : retry
                ? "🤖 Retry AI analysis?"
                : "🤖 Analyze with AI?"}
          </h3>
          <p>
            ${count} wine${count > 1 ? "s" : ""} will be looked up one at a time. This is a
            slow, rate-limited network call — expect it to run for a while, and leave the
            dialog open until it finishes.
          </p>
          <div class="inv-confirm-stats">
            ${retry
            ? b `These were already checked and came back empty. The check date is
                  updated either way, so you can always see when the last attempt was.`
            : b `Some will come back with nothing new — not every bottle exists in
                  ${source === "vivino" ? "Vivino's catalogue" : "what the AI can infer"}.
                  Those move to the retry line below rather than staying here.`}
          </div>
          <div class="inv-confirm-stats">
            ${source === "vivino"
            ? "Fills food pairings, description, rating and the label photo where Vivino has them. Existing values are kept."
            : "Fills the drinking verdict, drink window and critic scores where the AI can infer them. Existing values are kept."}
          </div>
          <div class="inv-confirm-btns">
            <button class="inv-confirm-cancel" @click=${() => (this._confirmEnrich = "")}>
              Cancel
            </button>
            <button class="inv-confirm-go" @click=${() => this._runEnrich(source, retry)}>
              Start
            </button>
          </div>
        </div>
      </div>
    `;
    }
    _renderStorageInfo() {
        const info = this._storageInfo;
        if (!info)
            return A;
        const share = info.total_bytes
            ? Math.round((info.history_bytes / info.total_bytes) * 100)
            : 0;
        const heavy = info.history_bytes > 512 * 1024;
        return b `
      <div class="inv-storage-info ${heavy ? "heavy" : ""}">
        Database ${this._formatBytes(info.total_bytes)} ·
        history ${this._formatBytes(info.history_bytes)} (${share}%) ·
        ${info.wines_count} wines, ${info.history_count} archived
        ${heavy
            ? b `<br /><small
              >Home Assistant rewrites this whole file on every change —
              clearing old history speeds up every edit.</small
            >`
            : A}
      </div>
    `;
    }
    // ── Export CSV ─────────────────────────────────────────────────
    _exportCSV() {
        const wines = this._getFilteredAndSortedWines();
        const headers = [
            "ID",
            "Name", "Winery", "Vintage", "Type", "Region", "Country",
            "Grape Variety", "Rating", "Ratings Count", "Purchase Price",
            "Retail Price", "Purchase Date", "Drink By", "Drink Window",
            "Disposition", "Notes", "Description", "Food Pairings",
            "Alcohol", "Cabinet", "Row", "Col", "Zone", "Depth",
            "User Rating", "Added At",
        ];
        const escapeCSV = (val) => {
            if (val === null || val === undefined)
                return "";
            const str = String(val);
            if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
        const rows = wines.map((w) => [
            w.id,
            w.name, w.winery, w.vintage, w.type, w.region, w.country,
            w.grape_variety, w.rating, w.ratings_count, w.price,
            w.retail_price, w.purchase_date, w.drink_by, w.drink_window,
            w.disposition, w.notes, w.description, w.food_pairings,
            w.alcohol,
            this.cabinets.find((c) => c.id === w.cabinet_id)?.name || "",
            w.row !== null ? w.row + 1 : "",
            w.col !== null ? w.col + 1 : "",
            w.zone, w.depth, w.user_rating, w.added_at,
        ]
            .map(escapeCSV)
            .join(","));
        // Excel only recognizes a CSV as UTF-8 when it starts with a BOM;
        // without it every accented wine name comes back mangled.
        const csv = "\ufeff" + [headers.join(","), ...rows].join("\n");
        this._downloadFile(csv, `wine-cellar-inventory-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
    }
    // ── Backup JSON ───────────────────────────────────────────────
    async _backupJSON() {
        this._backingUp = true;
        this._statusMsg = "";
        try {
            const result = await this.hass.callWS({ type: "wine_cellar/get_backup" });
            const json = JSON.stringify(result, null, 2);
            this._downloadFile(json, `wine-cellar-backup-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
            this._statusMsg = `Backup saved — ${result.wines?.length || 0} wines, ${result.cabinets?.length || 0} racks, ${result.buy_list?.length || 0} buy list`;
        }
        catch (err) {
            this._statusMsg = `Backup failed: ${err.message || err}`;
        }
        this._backingUp = false;
    }
    // ── Import CSV ────────────────────────────────────────────────
    _triggerImportCSV() {
        const input = this.shadowRoot?.querySelector("#inv-csv-input");
        if (input) {
            input.value = "";
            input.click();
        }
    }
    async _handleImportCSV(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        this._statusMsg = "";
        let wines;
        try {
            wines = this._parseCSV(await file.text());
        }
        catch (err) {
            this._statusMsg = `Import failed: ${err.message || err}`;
            return;
        }
        if (wines.length === 0) {
            this._statusMsg = "No wines found in CSV file.";
            return;
        }
        // A CSV exported from here carries each bottle's ID. When those IDs match
        // wines already in the cellar the user almost certainly edited an export
        // (bulk price or drinking-window changes) and wants those bottles
        // updated, not duplicated — so ask instead of silently doubling the cellar.
        const knownIds = new Set(this.wines.map((w) => w.id));
        this._importMatches = wines.filter((w) => w.id && knownIds.has(w.id)).length;
        if (this._importMatches > 0) {
            this._pendingImport = wines;
            this._confirmImport = true;
            return;
        }
        await this._runImport(wines, "add");
    }
    async _runImport(wines, mode) {
        this._confirmImport = false;
        this._pendingImport = null;
        this._importing = true;
        this._statusMsg = "";
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/import_wines",
                wines,
                mode,
            });
            const added = result.imported || 0;
            const updated = result.updated || 0;
            const skipped = result.location_skipped || 0;
            const base = updated
                ? `Updated ${updated} wines${added ? `, added ${added} new` : ""}.`
                : `Imported ${added} wines successfully!`;
            this._statusMsg = skipped
                ? `${base} ${skipped} row${skipped > 1 ? "s" : ""} kept their previous spot — the location given was unknown, out of range or already taken.`
                : base;
            this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
        }
        catch (err) {
            this._statusMsg = `Import failed: ${err.message || err}`;
        }
        this._importing = false;
    }
    _parseCSV(text) {
        const rows = this._parseCSVRows(text.replace(/^\ufeff/, ""));
        if (rows.length < 2)
            return [];
        // Parse header row
        const headers = rows[0].map((h) => h.trim().toLowerCase());
        // Map CSV headers to wine fields
        const fieldMap = {
            name: "name",
            winery: "winery",
            vintage: "vintage",
            type: "type",
            region: "region",
            country: "country",
            "grape variety": "grape_variety",
            grape_variety: "grape_variety",
            rating: "rating",
            "ratings count": "ratings_count",
            ratings_count: "ratings_count",
            "purchase price": "price",
            price: "price",
            "retail price": "retail_price",
            retail_price: "retail_price",
            "purchase date": "purchase_date",
            purchase_date: "purchase_date",
            "drink by": "drink_by",
            drink_by: "drink_by",
            "drink window": "drink_window",
            drink_window: "drink_window",
            disposition: "disposition",
            notes: "notes",
            description: "description",
            "food pairings": "food_pairings",
            food_pairings: "food_pairings",
            alcohol: "alcohol",
            zone: "zone",
            "user rating": "user_rating",
            user_rating: "user_rating",
            barcode: "barcode",
            id: "id",
            depth: "depth",
            cabinet: "cabinet",
            row: "row",
            col: "col",
            "added at": "added_at",
            added_at: "added_at",
        };
        const numericFields = new Set([
            "vintage", "rating", "ratings_count", "price",
            "retail_price", "user_rating", "depth", "row", "col",
        ]);
        const wines = [];
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i];
            if (values.length === 0)
                continue;
            const wine = {};
            for (let j = 0; j < headers.length && j < values.length; j++) {
                const field = fieldMap[headers[j]];
                if (!field)
                    continue;
                let val = values[j].trim();
                if (!val)
                    continue;
                if (numericFields.has(field)) {
                    const num = parseFloat(val);
                    if (!isNaN(num))
                        val = num;
                    else
                        continue;
                }
                wine[field] = val;
            }
            // Validate wine type
            if (wine.type) {
                const validTypes = ["red", "white", "rosé", "sparkling", "dessert"];
                const lt = wine.type.toLowerCase();
                if (validTypes.includes(lt)) {
                    wine.type = lt;
                }
                else {
                    wine.type = "red";
                }
            }
            if (wine.name) {
                wines.push(wine);
            }
        }
        return wines;
    }
    // Quote-aware: a comma or newline inside a quoted field (as produced by
    // escapeCSV for multi-line Notes/Description) does not end the field/row.
    _parseCSVRows(text) {
        const rows = [];
        let row = [];
        let field = "";
        let inQuotes = false;
        const endField = () => {
            row.push(field);
            field = "";
        };
        const endRow = () => {
            endField();
            if (row.some((v) => v.trim() !== ""))
                rows.push(row);
            row = [];
        };
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (inQuotes) {
                if (ch === '"') {
                    if (text[i + 1] === '"') {
                        field += '"';
                        i++;
                    }
                    else {
                        inQuotes = false;
                    }
                }
                else {
                    field += ch;
                }
            }
            else if (ch === '"') {
                inQuotes = true;
            }
            else if (ch === ",") {
                endField();
            }
            else if (ch === "\r") ;
            else if (ch === "\n") {
                endRow();
            }
            else {
                field += ch;
            }
        }
        if (field !== "" || row.length > 0)
            endRow();
        return rows;
    }
    // ── Restore JSON ──────────────────────────────────────────────
    _triggerRestore() {
        const input = this.shadowRoot?.querySelector("#inv-json-input");
        if (input) {
            input.value = "";
            input.click();
        }
    }
    async _handleRestoreFile(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!data.wines || !Array.isArray(data.wines)) {
                this._statusMsg = "Invalid backup file: missing wines array.";
                return;
            }
            if (!data.cabinets || !Array.isArray(data.cabinets)) {
                this._statusMsg = "Invalid backup file: missing cabinets array.";
                return;
            }
            this._restoreData = data;
            this._confirmRestore = true;
        }
        catch (err) {
            this._statusMsg = `Invalid JSON file: ${err.message || err}`;
        }
    }
    async _executeRestore() {
        if (!this._restoreData)
            return;
        this._confirmRestore = false;
        this._restoring = true;
        this._statusMsg = "";
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/restore_backup",
                backup: this._restoreData,
            });
            if (result.error) {
                this._statusMsg = `Restore failed: ${result.error}`;
            }
            else {
                this._statusMsg = `Restored ${result.wines} wines, ${result.cabinets} racks, ${result.buy_list} buy list items!`;
                this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
            }
        }
        catch (err) {
            this._statusMsg = `Restore failed: ${err.message || err}`;
        }
        this._restoring = false;
        this._restoreData = null;
    }
    // ── Cloud Sync (Google Drive / file system) ──────────────────
    async _serverBackupSave() {
        this._serverBackingUp = true;
        this._serverBackupLabel = "Saving…";
        this._statusMsg = "";
        try {
            const result = await this.hass.callWS({ type: "wine_cellar/server_backup_save" });
            if (result && result.error) {
                this._statusMsg = `Server backup failed: ${result.error}`;
                this._serverBackupLabel = "";
            }
            else {
                this._statusMsg = `Saved ${result?.wines ?? "?"} wines, ${result?.cabinets ?? "?"} racks to server`;
                this._serverBackupLabel = "✅ Saved!";
                setTimeout(() => { this._serverBackupLabel = ""; }, 4000);
            }
        }
        catch (err) {
            this._statusMsg = `Server backup failed: ${err.message || err}`;
            this._serverBackupLabel = "";
        }
        this._serverBackingUp = false;
    }
    async _serverBackupShowRestore() {
        this._showServerRestore = true;
        this._statusMsg = "";
        try {
            const result = await this.hass.callWS({ type: "wine_cellar/server_backup_list" });
            this._serverBackups = result?.backups || [];
            if (typeof result?.keep === "number")
                this._backupKeep = result.keep;
            if (Array.isArray(result?.keep_choices))
                this._backupKeepChoices = result.keep_choices;
        }
        catch (err) {
            this._statusMsg = `Failed to list backups: ${err.message || err}`;
            this._serverBackups = [];
        }
    }
    _formatBytes(bytes) {
        if (!bytes)
            return "0 KB";
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${Math.round(bytes / 1024)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    async _setBackupKeep(keep) {
        this._backupKeep = keep;
        try {
            await this.hass.callWS({
                type: "wine_cellar/update_settings",
                updates: { server_backup_keep: keep },
            });
            this._statusMsg =
                keep === 0
                    ? "Keeping every server backup."
                    : `Keeping the ${keep} most recent server backups.`;
        }
        catch (err) {
            this._statusMsg = `Could not save retention: ${err.message || err}`;
        }
    }
    async _serverBackupDelete(filename) {
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/server_backup_delete",
                filename,
            });
            if (result?.error) {
                this._statusMsg = `Delete failed: ${result.error}`;
                return;
            }
            this._serverBackups = this._serverBackups.filter((b) => b.filename !== filename);
            this._statusMsg = `Deleted ${filename}`;
        }
        catch (err) {
            this._statusMsg = `Delete failed: ${err.message || err}`;
        }
    }
    async _loadStorageInfo() {
        try {
            this._storageInfo = await this.hass.callWS({ type: "wine_cellar/get_storage_info" });
        }
        catch {
            this._storageInfo = null;
        }
    }
    async _serverBackupRestore(filename) {
        this._showServerRestore = false;
        this._serverRestoring = true;
        this._statusMsg = "";
        try {
            const result = await this.hass.callWS({ type: "wine_cellar/server_backup_restore", filename });
            if (result.error) {
                this._statusMsg = `Restore failed: ${result.error}`;
            }
            else {
                this._statusMsg = `Restored ${result.wines} wines, ${result.cabinets} racks from ${filename}`;
                this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
            }
        }
        catch (err) {
            this._statusMsg = `Restore failed: ${err.message || err}`;
        }
        this._serverRestoring = false;
    }
    // ── Helpers ───────────────────────────────────────────────────
    _downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    _showWineDetail(wine) {
        this._detailWine = wine;
        this._showDetail = true;
    }
    // Parses a number input back to `null` when emptied, so clearing a bound
    // actually removes the filter instead of turning it into 0.
    _numberOrNull(e) {
        const raw = e.target.value.trim();
        if (!raw)
            return null;
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : null;
    }
    _renderFilterPanel(missingPairings) {
        const foodOptions = this._foodOptions();
        const countryOptions = this._countryOptions();
        const grapeOptions = this._grapeOptions();
        return b `
      <div class="inv-filter-panel">
        <label class="inv-filter-field">
          <span>Ready to drink</span>
          <select
            @change=${(e) => {
            this._dispositionFilter = e.target.value;
            this._savePrefs();
        }}
          >
            <option value="all" ?selected=${this._dispositionFilter === "all"}>Any</option>
            <option value="D" ?selected=${this._dispositionFilter === "D"}>Drink now</option>
            <option value="H" ?selected=${this._dispositionFilter === "H"}>Hold</option>
            <option value="P" ?selected=${this._dispositionFilter === "P"}>Past peak</option>
            <option value="none" ?selected=${this._dispositionFilter === "none"}>
              Not analyzed
            </option>
          </select>
        </label>

        <label class="inv-filter-field">
          <span>Pairs with</span>
          <select
            @change=${(e) => {
            this._foodFilter = e.target.value;
            this._savePrefs();
        }}
          >
            <option value="all" ?selected=${this._foodFilter === "all"}>Any food</option>
            ${foodOptions.map((f) => b `<option value=${f} ?selected=${this._foodFilter === f}>${f}</option>`)}
          </select>
          ${missingPairings
            ? b `<small class="inv-filter-hint"
                >${missingPairings} wine${missingPairings > 1 ? "s have" : " has"} no pairing
                data. Only Vivino supplies pairings — use “Fill from Vivino” below the
                list.</small
              >`
            : A}
        </label>

        <label class="inv-filter-field">
          <span>Country</span>
          <select
            @change=${(e) => {
            this._countryFilter = e.target.value;
            this._savePrefs();
        }}
          >
            <option value="all" ?selected=${this._countryFilter === "all"}>Any</option>
            ${countryOptions.map((c) => b `<option value=${c} ?selected=${this._countryFilter === c}>${c}</option>`)}
          </select>
        </label>

        <label class="inv-filter-field">
          <span>Grape</span>
          <select
            @change=${(e) => {
            this._grapeFilter = e.target.value;
            this._savePrefs();
        }}
          >
            <option value="all" ?selected=${this._grapeFilter === "all"}>Any</option>
            ${grapeOptions.map((g) => b `<option value=${g} ?selected=${this._grapeFilter === g}>${g}</option>`)}
          </select>
        </label>

        <label class="inv-filter-field">
          <span>Cabinet</span>
          <select
            @change=${(e) => {
            this._cabinetFilter = e.target.value;
            this._savePrefs();
        }}
          >
            <option value="all" ?selected=${this._cabinetFilter === "all"}>Any</option>
            ${this.cabinets.map((c) => b `<option value=${c.id} ?selected=${this._cabinetFilter === c.id}>
                  ${c.name}
                </option>`)}
            <option value="unassigned" ?selected=${this._cabinetFilter === "unassigned"}>
              Unassigned
            </option>
          </select>
        </label>

        <label class="inv-filter-field">
          <span>Min rating</span>
          <select
            @change=${(e) => {
            this._minRating = Number(e.target.value);
            this._savePrefs();
        }}
          >
            ${[0, 3, 3.5, 4, 4.5].map((r) => b `<option value=${r} ?selected=${this._minRating === r}>
                  ${r === 0 ? "Any" : `★ ${r}+`}
                </option>`)}
          </select>
        </label>

        <label class="inv-filter-field">
          <span>Max price</span>
          <input
            type="number"
            min="0"
            placeholder="Any"
            .value=${this._maxPrice === null ? "" : String(this._maxPrice)}
            @change=${(e) => {
            this._maxPrice = this._numberOrNull(e);
            this._savePrefs();
        }}
          />
          <small class="inv-filter-hint">Priced wines only.</small>
        </label>

        <label class="inv-filter-field">
          <span>Vintage</span>
          <div class="inv-filter-range">
            <input
              type="number"
              placeholder="From"
              .value=${this._vintageMin === null ? "" : String(this._vintageMin)}
              @change=${(e) => {
            this._vintageMin = this._numberOrNull(e);
            this._savePrefs();
        }}
            />
            <input
              type="number"
              placeholder="To"
              .value=${this._vintageMax === null ? "" : String(this._vintageMax)}
              @change=${(e) => {
            this._vintageMax = this._numberOrNull(e);
            this._savePrefs();
        }}
            />
          </div>
        </label>
      </div>
    `;
    }
    _renderWineItem(wine) {
        const typeColor = WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red;
        const location = getWineLocation(wine, this.cabinets).text;
        // Sorting by drink-by is useless if the value stays invisible.
        const drinkBy = drinkByYear(wine);
        const displayPrice = wine.retail_price || wine.price;
        // A retail_price keeps the currency it was actually captured in — show
        // that instead of the globally selected one, or a stale price ends up
        // mislabeled as if it were in the new currency.
        const displayCurrency = wine.retail_price ? (wine.retail_price_currency || this.currency) : this.currency;
        return b `
      <div class="inv-item" @click=${() => this._showWineDetail(wine)}>
        ${wine.image_url
            ? b `<img class="inv-thumb" src="${wine.image_url}" alt="" loading="lazy" />`
            : b `<div class="inv-dot" style="background: ${typeColor}"></div>`}
        <div class="inv-info">
          <div class="inv-name">${wine.name}</div>
          <div class="inv-meta">
            ${wine.winery}${wine.vintage ? ` · ${wine.vintage}` : ""}${wine.rating
            ? ` · ★${wine.rating.toFixed(1)}`
            : ""}${wine.disposition
            ? b ` ·
                  <span
                    style="color: ${wine.disposition === "D"
                ? "#2e7d32"
                : wine.disposition === "H"
                    ? "#1565c0"
                    : wine.disposition === "P"
                        ? "#c62828"
                        : "inherit"}"
                    >${wine.disposition === "D"
                ? "Drink"
                : wine.disposition === "H"
                    ? "Hold"
                    : wine.disposition === "P"
                        ? "Past Peak"
                        : ""}</span
                  >`
            : A}${drinkBy
            ? b ` · <span class="inv-drink-by">by ${drinkBy}</span>`
            : A}
          </div>
        </div>
        <div class="inv-right">
          ${displayPrice ? b `<div class="inv-price">${displayCurrency} ${displayPrice.toFixed(0)}</div>` : A}
          <div class="inv-location">${location}</div>
        </div>
      </div>
    `;
    }
    render() {
        if (!this.open)
            return A;
        const filteredWines = this._getFilteredAndSortedWines();
        const activeFilters = this._activeFilterCount();
        const narrowed = activeFilters > 0 || !!this._searchQuery;
        // With a filter on, cellar-wide totals are the wrong answer: the point of
        // narrowing is to know what the *selection* holds and what it is worth.
        const allStats = this._computeStats(narrowed ? filteredWines : this.wines);
        const missingPairings = this._winesWithoutPairings();
        const sortOptions = [
            { value: "name", label: "Name" },
            { value: "winery", label: "Winery" },
            { value: "vintage", label: "Vintage" },
            { value: "type", label: "Type" },
            { value: "rating", label: "Rating" },
            { value: "user_rating", label: "My Rating" },
            { value: "price", label: "Price" },
            { value: "drink_by", label: "Drink By" },
            { value: "urgency", label: "Urgency" },
            { value: "purchase_date", label: "Purchase Date" },
            { value: "added_at", label: "Date Added" },
            { value: "cabinet", label: "Cabinet" },
        ];
        const presets = [
            { id: "all", label: "All", hint: "Every wine in the cellar" },
            {
                id: "drink_this_year",
                label: "Drink this year",
                hint: `Drink-by year ${new Date().getFullYear()} or earlier, or marked "Drink now" with no year. Excludes past peak.`,
            },
            { id: "past_peak", label: "Past peak", hint: 'Marked "Past peak" by the AI analysis' },
            { id: "unrated", label: "Not rated", hint: "You have not given these a personal star rating" },
            {
                id: "incomplete",
                label: "Missing data",
                hint: "Missing at least one of: food pairings, description, drink window, label photo",
            },
            { id: "recent", label: "Added recently", hint: "Added to the cellar in the last 30 days" },
        ];
        const filters = [
            { id: "all", label: "All" },
            { id: "red", label: "Red" },
            { id: "white", label: "White" },
            { id: "rosé", label: "Rosé" },
            { id: "sparkling", label: "Sparkling" },
            { id: "dessert", label: "Dessert" },
        ];
        const busy = this._importing || this._restoring || this._backingUp || this._serverBackingUp || this._serverRestoring;
        return b `
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" style="max-width:800px;position:relative" @click=${(e) => e.stopPropagation()}>
          <!-- Header -->
          <div class="inv-header">
            <span class="inv-header-title">📦 Inventory</span>
            <button class="inv-close" @click=${this._close}>✕</button>
          </div>

          <!-- Inventory / History Toggle -->
          <div class="inv-toggle">
            <button
              class="${this._viewMode === "inventory" ? "active" : ""}"
              @click=${() => { this._viewMode = "inventory"; }}
            >Inventory</button>
            <button
              class="${this._viewMode === "history" ? "active" : ""}"
              @click=${() => this._switchToHistory()}
            >History</button>
          </div>

          ${this._viewMode === "history" ? this._renderHistory() : b `
          <!-- Summary Stats -->
          <div class="inv-stats">
            <div class="stat">
              <span class="stat-value">${allStats.count}</span>
              ${narrowed ? `of ${this.wines.length} bottles` : "bottles"}
            </div>
            ${allStats.totalValue
            ? b `
                  <div class="stat">
                    <span class="stat-value"
                      >${this.currency} ${allStats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span
                    >
                    est. value
                  </div>
                `
            : A}
            ${Object.entries(allStats.byType).map(([type, count]) => b `
                <div class="stat">
                  <span
                    class="inv-type-dot-sm"
                    style="background:${WINE_TYPE_COLORS[type] || "#999"}"
                  ></span>
                  <span class="stat-value">${count}</span>
                  ${WINE_TYPE_LABELS[type] || type}
                </div>
              `)}
          </div>

          <!-- Search + Sort -->
          <div class="inv-controls">
            <div class="inv-search-wrapper">
              <span class="inv-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search wines..."
                .value=${this._searchQuery}
                @input=${(e) => {
            this._searchQuery = e.target.value;
        }}
              />
            </div>
            <div class="inv-sort">
              <select
                @change=${(e) => {
            this._sortField = e.target.value;
            this._savePrefs();
        }}
              >
                ${sortOptions.map((o) => b `<option value=${o.value} ?selected=${this._sortField === o.value}>
                      ${o.label}
                    </option>`)}
              </select>
              <button
                class="inv-sort-dir"
                @click=${() => {
            this._sortDir = this._sortDir === "asc" ? "desc" : "asc";
            this._savePrefs();
        }}
                title="${this._sortDir === "asc" ? "Ascending" : "Descending"}"
              >
                ${this._sortDir === "asc" ? "↑" : "↓"}
              </button>
              <button
                class="inv-filter-toggle ${activeFilters ? "active" : ""}"
                @click=${() => {
            this._showFilters = !this._showFilters;
        }}
                title="More filters"
              >
                ⚙︎ Filters${activeFilters
            ? b `<span class="inv-filter-badge">${activeFilters}</span>`
            : A}
              </button>
            </div>
          </div>

          <!-- Quick views -->
          <div class="inv-chips">
            ${presets.map((p) => b `
                <button
                  class="inv-chip preset ${this._preset === p.id ? "active" : ""}"
                  title=${p.hint}
                  @click=${() => {
            this._preset = p.id;
            this._savePrefs();
        }}
                >
                  ${p.label}
                </button>
              `)}
          </div>

          <!-- Type Filter Chips -->
          <div class="inv-chips">
            ${filters.map((f) => b `
                <button
                  class="inv-chip ${this._typeFilter === f.id ? "active" : ""}"
                  @click=${() => {
            this._typeFilter = f.id;
            this._savePrefs();
        }}
                >
                  ${f.label}
                </button>
              `)}
          </div>

          ${this._showFilters ? this._renderFilterPanel(missingPairings) : A}

          ${narrowed
            ? b `
                <div class="inv-active-filters">
                  <span
                    >${filteredWines.length} of ${this.wines.length} wines shown${activeFilters
                ? ` · ${activeFilters} filter${activeFilters > 1 ? "s" : ""} active`
                : ""}</span
                  >
                  <button class="inv-clear-filters" @click=${this._clearFilters}>
                    Clear all
                  </button>
                </div>
              `
            : A}

          ${this._renderEnrichBar()}

          <!-- Wine List -->
          <div class="inv-list">
            ${filteredWines.length === 0
            ? b `<div class="inv-empty">No wines match your search</div>`
            : filteredWines.map((w) => this._renderWineItem(w))}
          </div>

          <!-- Footer -->
          <div class="inv-footer">
            <span class="inv-count">
              ${filteredWines.length === this.wines.length
            ? `${filteredWines.length} wines`
            : `${filteredWines.length} of ${this.wines.length} wines`}
            </span>
            ${this._statusMsg
            ? b `<div class="inv-status">${this._statusMsg}</div>`
            : A}
            <div class="inv-footer-btns">
              <button
                class="inv-btn"
                @click=${this._serverBackupSave}
                ?disabled=${busy}
                title="Save timestamped backup to HA server"
              >
                ${this._serverBackupLabel || "Server Backup"}
              </button>
              <button
                class="inv-btn"
                @click=${this._serverBackupShowRestore}
                ?disabled=${busy}
                title="Restore from a server backup"
              >
                ${this._serverRestoring ? "Restoring…" : "Server Restore"}
              </button>
              <button
                class="inv-btn"
                @click=${this._backupJSON}
                ?disabled=${busy}
                title="Download full cellar backup as JSON"
              >
                ${this._backingUp ? "Saving…" : "Download"}
              </button>
              <button
                class="inv-btn"
                @click=${this._triggerRestore}
                ?disabled=${busy}
                title="Restore cellar from a JSON backup file"
              >
                ${this._restoring ? "Restoring…" : "Upload"}
              </button>
              <button
                class="inv-btn"
                @click=${this._triggerImportCSV}
                ?disabled=${busy}
                title="Import wines from a CSV file"
              >
                ${this._importing ? "Importing…" : "Import CSV"}
              </button>
              <button
                class="inv-btn"
                @click=${this._exportCSV}
                ?disabled=${busy}
                title="Export wines as CSV"
              >
                Export CSV
              </button>
            </div>
          </div>

          `}

          <!-- Hidden file inputs -->
          <input
            type="file"
            id="inv-csv-input"
            accept=".csv"
            style="display:none"
            @change=${this._handleImportCSV}
          />
          <input
            type="file"
            id="inv-json-input"
            accept=".json"
            style="display:none"
            @change=${this._handleRestoreFile}
          />

          <!-- Server Restore Picker Overlay -->
          ${this._showServerRestore
            ? b `
                <div class="inv-confirm-overlay" @click=${() => (this._showServerRestore = false)}>
                  <div class="inv-confirm-box" style="max-width:420px" @click=${(e) => e.stopPropagation()}>
                    <h3>Server Backups</h3>
                    <label class="inv-keep-row">
                      <span>Keep the last</span>
                      <select
                        @change=${(e) => this._setBackupKeep(Number(e.target.value))}
                      >
                        ${this._backupKeepChoices.map((n) => b `<option value=${n} ?selected=${this._backupKeep === n}>
                            ${n === 0 ? "All (never delete)" : `${n} backups`}
                          </option>`)}
                      </select>
                    </label>
                    ${this._serverBackups.length === 0
                ? b `<p>No server backups found. Use "Server Backup" to create one.</p>`
                : b `
                        <p>
                          Select a backup to restore — this will <strong>replace</strong> all
                          current data. ${this._serverBackups.length} stored,
                          ${this._formatBytes(this._serverBackups.reduce((t, b) => t + (b.size || 0), 0))} on disk.
                        </p>
                        <div class="inv-backup-list">
                          ${this._serverBackups.map((b$1) => b `
                              <div class="inv-backup-row">
                                <button
                                  class="inv-btn inv-backup-pick"
                                  @click=${() => this._serverBackupRestore(b$1.filename)}
                                >
                                  <div>${b$1.timestamp ? new Date(b$1.timestamp).toLocaleString() : b$1.filename}</div>
                                  <div class="inv-backup-meta">
                                    ${b$1.error
                    ? "unreadable file"
                    : `${b$1.wines} wines, ${b$1.cabinets} racks · ${this._formatBytes(b$1.size || 0)}`}
                                  </div>
                                </button>
                                <button
                                  class="inv-backup-del"
                                  title="Delete this backup"
                                  @click=${() => this._serverBackupDelete(b$1.filename)}
                                >
                                  🗑
                                </button>
                              </div>
                            `)}
                        </div>
                      `}
                    <div class="inv-confirm-btns">
                      <button class="inv-confirm-cancel" @click=${() => (this._showServerRestore = false)}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              `
            : A}

          ${this._renderEnrichConfirm()}

          <!-- CSV Import Mode Overlay -->
          ${this._confirmImport && this._pendingImport
            ? b `
                <div class="inv-confirm-overlay" @click=${() => (this._confirmImport = false)}>
                  <div class="inv-confirm-box" @click=${(e) => e.stopPropagation()}>
                    <h3>📄 Update existing wines?</h3>
                    <p>
                      This CSV looks like an edited export — some rows carry the ID of a
                      wine already in your cellar.
                    </p>
                    <div class="inv-confirm-stats">
                      <strong>${this._importMatches}</strong> row${this._importMatches > 1 ? "s" : ""}
                      match existing wines ·
                      <strong>${this._pendingImport.length - this._importMatches}</strong> new
                      <br />
                      <small>
                        Updating only touches the columns present in the file; blank cells
                        leave the stored value alone.
                      </small>
                    </div>
                    <div class="inv-confirm-btns">
                      <button
                        class="inv-confirm-cancel"
                        @click=${() => this._runImport(this._pendingImport, "add")}
                      >
                        Add all as new
                      </button>
                      <button
                        class="inv-confirm-go"
                        @click=${() => this._runImport(this._pendingImport, "update")}
                      >
                        Update ${this._importMatches} wine${this._importMatches > 1 ? "s" : ""}
                      </button>
                    </div>
                  </div>
                </div>
              `
            : A}

          <!-- Restore Confirmation Overlay -->
          ${this._confirmRestore && this._restoreData
            ? b `
                <div class="inv-confirm-overlay" @click=${() => (this._confirmRestore = false)}>
                  <div class="inv-confirm-box" @click=${(e) => e.stopPropagation()}>
                    <h3>🔄 Restore Backup?</h3>
                    <p>
                      This will <strong>replace</strong> all your current cellar data with the backup.
                      This action cannot be undone.
                    </p>
                    <div class="inv-confirm-stats">
                      Backup contains:<br />
                      <strong>${this._restoreData.wines?.length || 0}</strong> wines ·
                      <strong>${this._restoreData.cabinets?.length || 0}</strong> racks ·
                      <strong>${this._restoreData.buy_list?.length || 0}</strong> buy list items
                      ${this._restoreData.timestamp
                ? b `<br /><small>Created: ${new Date(this._restoreData.timestamp).toLocaleString()}</small>`
                : A}
                    </div>
                    <div class="inv-confirm-btns">
                      <button class="inv-confirm-cancel" @click=${() => (this._confirmRestore = false)}>
                        Cancel
                      </button>
                      <button class="inv-confirm-go" @click=${this._executeRestore}>
                        Restore Now
                      </button>
                    </div>
                  </div>
                </div>
              `
            : A}
        </div>
      </div>

      <!-- Sub-dialog: Wine Detail -->
      <wine-detail-dialog
        .wine=${this._detailWine}
        .hass=${this.hass}
        .cabinets=${this.cabinets}
        .open=${this._showDetail}
        .hasGemini=${this.hasGemini}
        .mode=${"cellar"}
        @close=${() => (this._showDetail = false)}
        @wine-updated=${() => {
            this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
        }}
        @locate-wine=${(e) => {
            this._showDetail = false;
            this.dispatchEvent(new CustomEvent("locate-wine", { detail: e.detail, bubbles: true, composed: true }));
        }}
        @copy-wine=${(e) => {
            this._showDetail = false;
            this.dispatchEvent(new CustomEvent("copy-wine", { detail: e.detail, bubbles: true, composed: true }));
        }}
        @move-wine=${(e) => {
            this._showDetail = false;
            this.dispatchEvent(new CustomEvent("move-wine", { detail: e.detail, bubbles: true, composed: true }));
        }}
        @remove-wine=${(e) => {
            this._showDetail = false;
            this.dispatchEvent(new CustomEvent("remove-wine", { detail: e.detail, bubbles: true, composed: true }));
        }}
      ></wine-detail-dialog>
    `;
    }
};
InventoryDialog.styles = [
    sharedStyles,
    i$3 `
      .inv-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px 8px;
      }

      .inv-header-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--wc-text);
      }

      .inv-close {
        background: none;
        border: none;
        font-size: 1.3em;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 8px;
        color: var(--wc-text-secondary);
      }

      .inv-close:hover {
        background: var(--wc-hover);
      }

      .inv-stats {
        display: flex;
        gap: 16px;
        padding: 4px 20px 10px;
        flex-wrap: wrap;
        font-size: 0.82em;
        color: var(--wc-text-secondary);
      }

      .inv-stats .stat {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .inv-stats .stat-value {
        font-weight: 600;
        color: var(--wc-text);
      }

      .inv-type-dot-sm {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 2px;
      }

      .inv-controls {
        display: flex;
        gap: 8px;
        padding: 0 16px 8px;
        align-items: center;
        flex-wrap: wrap;
      }

      .inv-search-wrapper {
        flex: 1;
        min-width: 140px;
        position: relative;
      }

      .inv-search-wrapper input {
        width: 100%;
        padding: 8px 12px 8px 30px;
        border: 1px solid var(--wc-border);
        border-radius: 20px;
        font-size: 0.88em;
        background: var(--wc-bg);
        color: var(--wc-text);
        box-sizing: border-box;
      }

      .inv-search-wrapper input:focus {
        outline: none;
        border-color: var(--wc-primary);
      }

      .inv-search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.85em;
        pointer-events: none;
      }

      .inv-sort {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .inv-sort select {
        padding: 6px 10px;
        border: 1px solid var(--wc-border);
        border-radius: 14px;
        background: var(--wc-bg);
        color: var(--wc-text);
        font-size: 0.8em;
        cursor: pointer;
      }

      .inv-sort-dir {
        background: none;
        border: 1px solid var(--wc-border);
        border-radius: 14px;
        padding: 5px 9px;
        cursor: pointer;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        line-height: 1;
      }

      .inv-sort-dir:hover {
        background: var(--wc-hover);
      }

      .inv-filter-toggle {
        background: none;
        border: 1px solid var(--wc-border);
        border-radius: 14px;
        padding: 5px 10px;
        cursor: pointer;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        line-height: 1;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
      }

      .inv-filter-toggle:hover {
        background: var(--wc-hover);
      }

      .inv-filter-toggle.active {
        border-color: var(--wc-primary);
        color: var(--wc-primary);
      }

      .inv-filter-badge {
        background: var(--wc-primary);
        color: #fff;
        border-radius: 9px;
        padding: 1px 6px;
        font-size: 0.85em;
        font-weight: 600;
      }

      .inv-filter-panel {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px 12px;
        padding: 12px 16px;
        margin: 0 16px 10px;
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        background: var(--wc-bg);
      }

      .inv-filter-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.75em;
        color: var(--wc-text-secondary);
      }

      .inv-filter-field select,
      .inv-filter-field input {
        padding: 6px 8px;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        background: var(--wc-card-bg, var(--wc-bg));
        color: var(--wc-text);
        font-size: 1.05em;
        width: 100%;
        box-sizing: border-box;
      }

      .inv-filter-field select:focus,
      .inv-filter-field input:focus {
        outline: none;
        border-color: var(--wc-primary);
      }

      .inv-filter-range {
        display: flex;
        gap: 6px;
      }

      .inv-filter-hint {
        font-size: 0.9em;
        opacity: 0.75;
        line-height: 1.3;
      }

      .inv-active-filters {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 0 16px 10px;
        padding: 6px 10px;
        border-radius: 8px;
        background: rgba(114, 47, 55, 0.08);
        font-size: 0.75em;
        color: var(--wc-text-secondary);
      }

      .inv-clear-filters {
        background: none;
        border: none;
        color: var(--wc-primary);
        cursor: pointer;
        font-size: 1em;
        font-weight: 600;
        padding: 2px 4px;
        white-space: nowrap;
      }

      .inv-clear-filters:hover {
        text-decoration: underline;
      }

      .inv-drink-by {
        opacity: 0.8;
      }

      .inv-enrich {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin: 0 16px 10px;
        padding: 8px 10px;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        font-size: 0.75em;
        color: var(--wc-text-secondary);
      }

      .inv-enrich-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }

      .inv-enrich-row.retry {
        opacity: 0.75;
        border-top: 1px solid var(--wc-border);
        padding-top: 6px;
      }

      .inv-enrich-text {
        line-height: 1.4;
      }

      .inv-enrich-text strong {
        color: var(--wc-text);
      }

      .inv-enrich-btns {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .inv-storage-info {
        margin: 0 16px 8px;
        padding: 6px 10px;
        border-radius: 8px;
        background: var(--wc-bg);
        border: 1px solid var(--wc-border);
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        line-height: 1.4;
      }

      .inv-storage-info.heavy {
        border-color: #c98a00;
      }

      .inv-keep-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        margin-bottom: 8px;
      }

      .inv-keep-row select {
        padding: 5px 8px;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        background: var(--wc-bg);
        color: var(--wc-text);
        font-size: 1em;
        cursor: pointer;
      }

      .inv-backup-list {
        max-height: 250px;
        overflow-y: auto;
        margin: 8px 0;
      }

      .inv-backup-row {
        display: flex;
        gap: 4px;
        margin-bottom: 4px;
      }

      .inv-backup-pick {
        flex: 1;
        text-align: left;
        font-size: 0.82em;
        padding: 8px 12px;
      }

      .inv-backup-meta {
        font-size: 0.85em;
        color: var(--wc-text-secondary);
      }

      .inv-backup-del {
        background: none;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        color: var(--wc-text-secondary);
        cursor: pointer;
        padding: 0 10px;
        font-size: 0.9em;
      }

      .inv-backup-del:hover {
        border-color: #c62828;
        color: #c62828;
      }

      .inv-chips {
        display: flex;
        gap: 4px;
        padding: 0 16px 10px;
        flex-wrap: wrap;
      }

      .inv-chip.preset.active {
        background: var(--wc-text-secondary);
        border-color: var(--wc-text-secondary);
      }

      .inv-chip {
        padding: 4px 10px;
        border-radius: 14px;
        border: 1px solid var(--wc-border);
        background: transparent;
        color: var(--wc-text-secondary);
        cursor: pointer;
        font-size: 0.75em;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .inv-chip:hover {
        background: rgba(114, 47, 55, 0.08);
      }

      .inv-chip.active {
        background: var(--wc-primary);
        color: #fff;
        border-color: var(--wc-primary);
      }

      .inv-list {
        max-height: 55vh;
        overflow-y: auto;
        padding: 0 16px 8px;
      }

      .inv-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-bottom: 1px solid var(--wc-border);
        cursor: pointer;
        transition: background 0.15s;
      }

      .inv-item:hover {
        background: var(--wc-hover);
      }

      .inv-item:last-child {
        border-bottom: none;
      }

      .inv-thumb {
        width: 48px;
        height: 66px;
        border-radius: 4px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .inv-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .inv-info {
        flex: 1;
        min-width: 0;
      }

      .inv-name {
        font-weight: 600;
        font-size: 0.88em;
        color: var(--wc-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .inv-meta {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-top: 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .inv-right {
        text-align: right;
        flex-shrink: 0;
        min-width: 60px;
      }

      .inv-price {
        font-weight: 600;
        font-size: 0.85em;
        color: var(--wc-text);
      }

      .inv-location {
        font-size: 0.72em;
        color: var(--wc-text-secondary);
      }

      .inv-empty {
        text-align: center;
        padding: 40px 20px;
        color: var(--wc-text-secondary);
        font-size: 0.9em;
      }

      .inv-footer {
        display: flex;
        gap: 8px;
        padding: 10px 16px 16px;
        border-top: 1px solid var(--wc-border);
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
      }

      .inv-count {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }

      .inv-footer-btns {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .inv-btn {
        font-size: 0.76em;
        padding: 5px 12px;
        border-radius: 16px;
        border: 1px solid var(--wc-border);
        background: transparent;
        color: var(--wc-text-secondary);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s;
      }

      .inv-btn:hover {
        background: var(--wc-hover);
        border-color: var(--wc-text-secondary);
      }

      .inv-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .inv-status {
        width: 100%;
        text-align: center;
        font-size: 0.78em;
        padding: 4px 0 0;
        color: #2e7d32;
        font-weight: 500;
      }

      /* Restore confirm overlay */
      .inv-confirm-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        border-radius: 16px;
      }

      .inv-confirm-box {
        background: var(--wc-bg);
        border-radius: 12px;
        padding: 24px;
        max-width: 380px;
        width: 90%;
        text-align: center;
      }

      .inv-confirm-box h3 {
        margin: 0 0 8px;
        font-size: 1em;
        color: var(--wc-text);
      }

      .inv-confirm-box p {
        margin: 0 0 16px;
        font-size: 0.85em;
        color: var(--wc-text-secondary);
        line-height: 1.4;
      }

      .inv-confirm-stats {
        font-size: 0.82em;
        color: var(--wc-text);
        margin: 0 0 16px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;
      }

      .inv-confirm-btns {
        display: flex;
        gap: 8px;
        justify-content: center;
      }

      .inv-confirm-btns button {
        padding: 8px 20px;
        border-radius: 20px;
        border: none;
        font-size: 0.85em;
        cursor: pointer;
        font-weight: 500;
      }

      .inv-confirm-cancel {
        background: var(--wc-hover);
        color: var(--wc-text);
      }

      .inv-confirm-go {
        background: #e65100;
        color: #fff;
      }

      .inv-toggle {
        display: flex;
        margin: 0 16px 8px;
        border: 1px solid var(--wc-border);
        border-radius: 20px;
        overflow: hidden;
      }

      .inv-toggle button {
        flex: 1;
        padding: 6px 0;
        border: none;
        background: transparent;
        color: var(--wc-text-secondary);
        font-size: 0.82em;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .inv-toggle button.active {
        background: var(--wc-primary);
        color: #fff;
      }

      .inv-history-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-bottom: 1px solid var(--wc-border);
      }

      .inv-history-item:last-child {
        border-bottom: none;
      }

      .inv-reason-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.72em;
        font-weight: 500;
        background: rgba(114, 47, 55, 0.12);
        color: var(--wc-primary);
      }

      @media (max-width: 599px) {
        .inv-controls {
          flex-direction: column;
          gap: 6px;
        }
        .inv-search-wrapper {
          width: 100%;
        }
        .inv-stats {
          gap: 8px;
          font-size: 0.78em;
          padding: 4px 16px 8px;
        }
        .inv-list {
          max-height: 60vh;
        }
        .inv-footer {
          justify-content: center;
        }
        .inv-footer-btns {
          justify-content: center;
        }
      }
    `,
];
__decorate([
    n({ type: Boolean })
], InventoryDialog.prototype, "open", void 0);
__decorate([
    n({ attribute: false })
], InventoryDialog.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], InventoryDialog.prototype, "wines", void 0);
__decorate([
    n({ attribute: false })
], InventoryDialog.prototype, "cabinets", void 0);
__decorate([
    n({ type: Boolean })
], InventoryDialog.prototype, "hasGemini", void 0);
__decorate([
    n({ type: String })
], InventoryDialog.prototype, "currency", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_searchQuery", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_typeFilter", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_dispositionFilter", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_countryFilter", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_grapeFilter", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_foodFilter", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_cabinetFilter", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_minRating", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_maxPrice", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_vintageMin", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_vintageMax", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_preset", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_showFilters", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_sortField", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_sortDir", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_detailWine", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_showDetail", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_backingUp", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_importing", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_restoring", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_confirmRestore", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_restoreData", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_confirmImport", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_pendingImport", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_importMatches", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_statusMsg", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_serverBackingUp", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_serverBackupLabel", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_showServerRestore", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_serverBackups", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_serverRestoring", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_backupKeep", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_backupKeepChoices", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_storageInfo", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_enriching", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_confirmEnrich", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_confirmEnrichRetry", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_viewMode", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_historyItems", void 0);
__decorate([
    r()
], InventoryDialog.prototype, "_historyLoading", void 0);
InventoryDialog = __decorate([
    t("inventory-dialog")
], InventoryDialog);

let VivinoAiSettingsDialog = class VivinoAiSettingsDialog extends i {
    constructor() {
        super(...arguments);
        this.open = false;
        this.aiFallbackAlways = false;
        this.metadataLanguage = "en";
        this.supportedLanguages = ["en", "fr", "de"];
        this.metadataCurrency = "USD";
        this.supportedCurrencies = ["USD", "EUR", "GBP", "CHF"];
    }
    _close() {
        this.dispatchEvent(new CustomEvent("close"));
    }
    _setFallback(value) {
        this.dispatchEvent(new CustomEvent("set-ai-fallback-always", { detail: { value } }));
    }
    _setLanguage(lang) {
        this.dispatchEvent(new CustomEvent("set-metadata-language", { detail: { value: lang } }));
    }
    _setCurrency(currency) {
        this.dispatchEvent(new CustomEvent("set-metadata-currency", { detail: { value: currency } }));
    }
    render() {
        if (!this.open)
            return A;
        return b `
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" style="max-width:420px;padding:20px 24px" @click=${(e) => e.stopPropagation()}>
          <div class="dialog-top-bar" style="justify-content:space-between;padding:0 0 8px">
            <span style="font-weight:600;color:var(--wc-text)">Vivino / AI Settings</span>
            <button class="icon-btn close-btn" title="Close" @click=${this._close}>✕</button>
          </div>

          <div class="settings-row">
            <label class="fallback-label">
              <input
                type="checkbox"
                .checked=${this.aiFallbackAlways}
                @change=${(e) => this._setFallback(e.target.checked)}
              />
              Always try AI when Vivino finds no match
            </label>
          </div>

          <div class="settings-row">
            <span class="settings-label">Vivino/AI language</span>
            <div class="pill-group">
              ${this.supportedLanguages.map((lang) => b `
                <button
                  class="pill ${this.metadataLanguage === lang ? "active" : ""}"
                  @click=${() => this._setLanguage(lang)}
                >${lang.toUpperCase()}</button>
              `)}
            </div>
          </div>

          <div class="settings-row">
            <span class="settings-label">Currency</span>
            <div class="pill-group">
              ${this.supportedCurrencies.map((cur) => b `
                <button
                  class="pill ${this.metadataCurrency === cur ? "active" : ""}"
                  @click=${() => this._setCurrency(cur)}
                >${cur}</button>
              `)}
            </div>
          </div>

          <div class="info-section">
            <h3 class="info-title">🍇 Vivino vs 🤖 AI — What Each Provides</h3>

            <div class="info-block">
              <div class="info-block-title">🍇 Vivino provides:</div>
              <ul>
                <li>Bottle photo</li>
                <li>Community rating (★) and number of ratings</li>
                <li>Market price</li>
                <li>Food pairings</li>
                <li>Alcohol %</li>
                <li>Grape variety, region, country, type (when found)</li>
              </ul>
            </div>

            <div class="info-block">
              <div class="info-block-title">🤖 AI provides:</div>
              <ul>
                <li>Estimated price (only fills in when Vivino has none)</li>
                <li>Tasting description</li>
                <li>Critic scores (Wine Spectator, Robert Parker, Jeb Dunnuck, Antonio Galloni)</li>
                <li>Drink Now / Hold / Past Peak + drinking window</li>
                <li>Grape variety, region, country, type — only when scanning a label photo, not on a refresh</li>
              </ul>
            </div>

            <p class="info-note">
              AI never provides a photo, a Vivino community rating, or food pairings — when Vivino can't find a confident match, AI fills in what it can (mainly price, description, and critic scores), not everything Vivino would have.
            </p>
          </div>
        </div>
      </div>
    `;
    }
};
VivinoAiSettingsDialog.styles = [
    sharedStyles,
    i$3 `
      .settings-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--wc-border);
        font-size: 0.85em;
      }

      .settings-row:last-of-type {
        border-bottom: none;
      }

      .settings-label {
        color: var(--wc-text);
      }

      .pill-group {
        display: flex;
        gap: 4px;
      }

      .pill {
        padding: 3px 10px;
        border-radius: 12px;
        border: 1px solid var(--wc-border);
        cursor: pointer;
        background: transparent;
        color: var(--wc-text-secondary);
        font-size: 0.9em;
      }

      .pill.active {
        background: var(--wc-primary-text);
        color: #fff;
        border-color: var(--wc-primary-text);
      }

      .fallback-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        color: var(--wc-text);
      }

      .info-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--wc-border);
      }

      .info-title {
        margin: 0 0 12px;
        font-size: 0.95em;
        color: var(--wc-text);
      }

      .info-block {
        margin-bottom: 16px;
      }

      .info-block-title {
        font-weight: 600;
        font-size: 0.85em;
        color: var(--wc-text);
        margin-bottom: 6px;
      }

      .info-block ul {
        margin: 0;
        padding-left: 20px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        line-height: 1.7;
      }

      .info-note {
        margin: 0;
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        font-style: italic;
      }
    `,
];
__decorate([
    n({ type: Boolean })
], VivinoAiSettingsDialog.prototype, "open", void 0);
__decorate([
    n({ type: Boolean })
], VivinoAiSettingsDialog.prototype, "aiFallbackAlways", void 0);
__decorate([
    n({ type: String })
], VivinoAiSettingsDialog.prototype, "metadataLanguage", void 0);
__decorate([
    n({ attribute: false })
], VivinoAiSettingsDialog.prototype, "supportedLanguages", void 0);
__decorate([
    n({ type: String })
], VivinoAiSettingsDialog.prototype, "metadataCurrency", void 0);
__decorate([
    n({ attribute: false })
], VivinoAiSettingsDialog.prototype, "supportedCurrencies", void 0);
VivinoAiSettingsDialog = __decorate([
    t("vivino-ai-settings-dialog")
], VivinoAiSettingsDialog);

// How long an incoming change waits before the card re-fetches, and the floor
// on how often it may do so at all.
const REFRESH_DEBOUNCE_MS = 400;
const REFRESH_MIN_INTERVAL_MS = 3000;
let WineCellarCard = class WineCellarCard extends i {
    constructor() {
        super(...arguments);
        this._wines = [];
        this._cabinets = [];
        this._stats = null;
        this._activeTab = "all";
        this._searchQuery = "";
        this._searchFilter = "all";
        this._selectedWine = null;
        this._showDetail = false;
        this._detailMode = "cellar";
        this._showAddDialog = false;
        this._addPreselect = { cabinet: "", row: null, col: null, zone: "", depth: 0 };
        this._loading = true;
        this._showRackSettings = false;
        this._copiedWine = null;
        this._movingWine = null;
        this._analyzing = false;
        this._batchVivino = false;
        this._vivinoSyncing = false;
        this._showBatchVivinoConfirm = false;
        this._showBatchAiConfirm = false;
        this._batchAiFallback = false;
        this._toast = "";
        this._hasGemini = false;
        this._hasVivinoAccount = false;
        this._vivinoMode = "import";
        this._metadataLanguage = "en";
        this._supportedLanguages = ["en", "fr", "de"];
        this._metadataCurrency = "USD";
        this._supportedCurrencies = ["USD", "EUR", "GBP", "CHF"];
        this._aiFallbackAlways = false;
        this._showVivinoAiSettings = false;
        this._showWineList = false;
        this._showInventory = false;
        this._findingsCache = null;
        this._unsubscribe = null;
        this._subscribing = false;
        this._connectionGeneration = 0;
        this._refreshTimer = 0;
        this._lastRefresh = 0;
        this._toastTimer = 0;
        this._showArrangement = false;
        this._dismissedArrangements = [];
        this._buyList = [];
        this._addToBuyListMode = false;
        this._movingBuyListItem = null;
        // Depth side panel
        this._depthPanelOpen = false;
        this._depthPanelCabinet = null;
        this._depthPanelRow = null;
        this._depthPanelCol = null;
        this._depthPanelWines = [];
        this._depthPanelMaxDepth = 1;
        // Zone side panel (boxes, bulk bins)
        this._zonePanelOpen = false;
        this._zonePanelCabinet = null;
        this._zonePanelZone = "";
        this._zonePanelType = "bulk";
        this._zonePanelCapacity = 20;
        this._zonePanelName = "";
        this._zonePanelWines = [];
        this._zonePanelStorageRow = null;
        this._zonePanelDragWineId = null;
        this._zonePanelDragOverKey = null;
        this._zonePanelNewBoxSize = 6;
        // Rack panel (grid-slot cabinets: list + reorder)
        this._rackPanelOpen = false;
        this._rackPanelCabinet = null;
        this._rackPanelWines = [];
        this._rackPanelDragWineId = null;
        this._rackPanelDragOverKey = null;
        // Briefly highlights a wine's slot after "locate" is used from the detail dialog.
        this._highlightWineId = null;
        this._confirmZoneSort = false;
        this._zoneSorting = false;
    }
    setConfig(config) {
        this._config = config;
    }
    static getConfigElement() {
        return document.createElement("wine-cellar-card-editor");
    }
    static getStubConfig() {
        return { type: "custom:wine-cellar-card" };
    }
    connectedCallback() {
        super.connectedCallback();
        this._loadData();
        this._subscribeToUpdates();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        // Invalidates any subscription still being set up.
        this._connectionGeneration++;
        this._unsubscribe?.();
        this._unsubscribe = null;
        if (this._refreshTimer) {
            clearTimeout(this._refreshTimer);
            this._refreshTimer = 0;
        }
        if (this._toastTimer) {
            clearTimeout(this._toastTimer);
            this._toastTimer = 0;
        }
    }
    // The backend announces every change it makes on the event bus, and nobody
    // was listening. Work it does on its own — the Vivino lookup fired after a
    // wine is added, most visibly — landed in storage and stayed invisible
    // until the user happened to do something that reloaded the card. That is
    // why an added bottle could look like Vivino had never been consulted.
    async _subscribeToUpdates() {
        if (!this.hass?.connection || this._unsubscribe || this._subscribing) {
            if (!this.hass)
                setTimeout(() => this._subscribeToUpdates(), 500);
            return;
        }
        this._subscribing = true;
        const generation = this._connectionGeneration;
        try {
            const unsubscribe = await this.hass.connection.subscribeEvents(() => this._scheduleRefresh(), "wine_cellar_updated");
            // Home Assistant detaches and reattaches a dashboard view when the user
            // switches tabs, which can happen while this is still in flight. Storing
            // the handle now would leave a subscription nothing can ever cancel,
            // reloading a card that is no longer on screen — once per tab switch.
            //
            // Keyed on a counter the detach bumps rather than on isConnected, so it
            // holds however the element was taken down.
            if (generation !== this._connectionGeneration) {
                unsubscribe();
                return;
            }
            this._unsubscribe = unsubscribe;
        }
        catch (err) {
            // Without this the card still works, it just will not notice background
            // work. Not worth an error the user has to dismiss.
            console.warn("Wine Cellar: could not subscribe to updates", err);
        }
        finally {
            this._subscribing = false;
        }
    }
    // Batch operations fire one event per bottle, and they pace themselves with
    // a sleep of half a second to a second between wines. A plain debounce is
    // the wrong shape for that: the gaps are longer than any sensible debounce,
    // so every event would still get its own full reload. What is needed is a
    // floor on how often the cellar is re-fetched.
    //
    // An already-pending refresh absorbs anything that arrives before it fires,
    // so a tight burst still costs one reload. An isolated change still shows up
    // within REFRESH_DEBOUNCE_MS.
    _scheduleRefresh() {
        if (this._refreshTimer)
            return;
        const since = Date.now() - this._lastRefresh;
        const wait = Math.max(REFRESH_DEBOUNCE_MS, REFRESH_MIN_INTERVAL_MS - since);
        this._refreshTimer = window.setTimeout(() => {
            this._refreshTimer = 0;
            this._loadData();
        }, wait);
    }
    async _loadData() {
        if (!this.hass) {
            // Retry after hass is set
            setTimeout(() => this._loadData(), 500);
            return;
        }
        // Counts against the refresh floor: the card's own actions already reload,
        // and the event they cause must not reload a second time straight after.
        this._lastRefresh = Date.now();
        const isInitialLoad = this._wines.length === 0 && this._cabinets.length === 0;
        if (isInitialLoad)
            this._loading = true;
        try {
            const [winesResult, cabinetsResult, statsResult, capResult, buyListResult] = await Promise.all([
                this.hass.callWS({ type: "wine_cellar/get_wines" }),
                this.hass.callWS({ type: "wine_cellar/get_cabinets" }),
                this.hass.callWS({ type: "wine_cellar/get_stats" }),
                this.hass.callWS({ type: "wine_cellar/get_capabilities" }).catch(() => ({ has_gemini: false })),
                this.hass.callWS({ type: "wine_cellar/get_buy_list" }).catch(() => ({ buy_list: [] })),
            ]);
            this._wines = winesResult.wines || [];
            this._cabinets = (cabinetsResult.cabinets || []).sort((a, b) => a.order - b.order);
            this._stats = statsResult;
            this._hasGemini = capResult?.has_gemini || false;
            this._hasVivinoAccount = capResult?.has_vivino_account || false;
            this._vivinoMode = capResult?.vivino_mode || "import";
            this._metadataLanguage = capResult?.metadata_language || "en";
            this._supportedLanguages = capResult?.supported_languages || ["en", "fr", "de"];
            this._metadataCurrency = capResult?.metadata_currency || "USD";
            this._supportedCurrencies = capResult?.supported_currencies || ["USD", "EUR", "GBP", "CHF"];
            this._aiFallbackAlways = capResult?.ai_fallback_always || false;
            this._dismissedArrangements = capResult?.dismissed_arrangements || [];
            this._buyList = buyListResult?.buy_list || [];
            // Refresh selected wine if detail dialog is open
            if (this._selectedWine) {
                const updated = this._wines.find((w) => w.id === this._selectedWine.id);
                if (updated)
                    this._selectedWine = updated;
            }
            // Refresh depth panel if open
            this._refreshDepthPanel();
            // Refresh zone panel if open
            this._refreshZonePanel();
            // Refresh rack panel if open
            this._refreshRackPanel();
        }
        catch (err) {
            console.error("Cork Dork: Failed to load data", err);
        }
        this._loading = false;
    }
    _getFilteredWines() {
        let wines = [...this._wines];
        // Filter by active tab (cabinet)
        if (this._activeTab !== "all") {
            wines = wines.filter((w) => w.cabinet_id === this._activeTab);
        }
        // Filter by wine type
        if (this._searchFilter !== "all") {
            wines = wines.filter((w) => w.type === this._searchFilter);
        }
        // Filter by search query — same matcher as the inventory dialog, so a
        // query never gives different results depending on which screen it was
        // typed into.
        if (this._searchQuery) {
            wines = wines.filter((w) => matchesQuery(w, this._searchQuery, this._cabinets));
        }
        return wines;
    }
    _showToast(message) {
        this._toast = message;
        // Each toast gets its own full 2.5s: the previous timer would otherwise
        // still be running and cut the new message short.
        if (this._toastTimer)
            clearTimeout(this._toastTimer);
        this._toastTimer = window.setTimeout(() => {
            this._toastTimer = 0;
            this._toast = "";
        }, 2500);
    }
    // --- Copy/Paste wine ---
    _onCellClick(e) {
        const { wine, wines = [], cabinet, row, col, wineCount = 0, cabinetDepth = 1 } = e.detail;
        const hasRoom = wineCount < cabinetDepth;
        const nextDepth = wineCount;
        // If we have a copied wine and cell has room, paste it
        if (this._copiedWine && hasRoom) {
            this._pasteWine(cabinet.id, row, col, nextDepth);
            return;
        }
        // If we're moving a wine and cell has room, place it here
        if (this._movingWine && hasRoom) {
            this._executeMoveWine(cabinet.id, row, col, "", nextDepth);
            return;
        }
        // If we're placing a buy list item and cell has room, move it to cellar
        if (this._movingBuyListItem && hasRoom) {
            this._executeMoveTocellar(cabinet.id, row, col, "", nextDepth);
            return;
        }
        // For deep cabinets (depth >= 2), open side panel instead of detail
        if (cabinetDepth >= 2) {
            this._openDepthPanel(cabinet, row, col, wines, cabinetDepth);
            return;
        }
        if (wine) {
            this._selectedWine = wine;
            this._detailMode = "cellar";
            this._showDetail = true;
        }
        else {
            this._addPreselect = { cabinet: cabinet.id, row, col, zone: "", depth: 0 };
            this._showAddDialog = true;
        }
    }
    // --- Depth side panel ---
    _openDepthPanel(cabinet, row, col, wines, maxDepth) {
        this._depthPanelCabinet = cabinet;
        this._depthPanelRow = row;
        this._depthPanelCol = col;
        this._depthPanelWines = [...wines].sort((a, b) => (a.depth || 0) - (b.depth || 0));
        this._depthPanelMaxDepth = maxDepth;
        this._depthPanelOpen = true;
    }
    _closeDepthPanel() {
        this._depthPanelOpen = false;
    }
    _refreshDepthPanel() {
        if (!this._depthPanelOpen || !this._depthPanelCabinet || this._depthPanelRow === null || this._depthPanelCol === null)
            return;
        const wines = this._wines.filter((w) => w.cabinet_id === this._depthPanelCabinet.id && w.row === this._depthPanelRow && w.col === this._depthPanelCol);
        this._depthPanelWines = [...wines].sort((a, b) => (a.depth || 0) - (b.depth || 0));
    }
    _onDepthSlotClick(depthIndex, wine) {
        if (wine) {
            this._selectedWine = wine;
            this._detailMode = "cellar";
            this._showDetail = true;
        }
        else {
            this._addPreselect = {
                cabinet: this._depthPanelCabinet.id,
                row: this._depthPanelRow,
                col: this._depthPanelCol,
                zone: "",
                depth: depthIndex,
            };
            this._showAddDialog = true;
        }
    }
    _getDepthLabel(index) {
        const labels = ["Front", "2nd", "3rd", "4th", "5th", "6th"];
        return labels[index] || `${index + 1}th`;
    }
    _onZoneClick(e) {
        const { wine, cabinet, zone } = e.detail;
        // If we have a copied wine and clicked empty zone space, paste it here
        if (this._copiedWine && !wine) {
            const nextDepth = this._wines.filter((w) => w.cabinet_id === cabinet.id && w.zone === (zone || "bottom")).length;
            this._pasteWine(cabinet.id, null, null, nextDepth, zone || "bottom");
            return;
        }
        // If we're moving a wine, place it in this zone
        if (this._movingWine && !wine) {
            this._executeMoveWine(cabinet.id, null, null, zone || "bottom");
            return;
        }
        // If we're placing a buy list item, move it to cellar
        if (this._movingBuyListItem && !wine) {
            this._executeMoveTocellar(cabinet.id, null, null, zone || "bottom");
            return;
        }
        if (wine) {
            this._selectedWine = wine;
            this._detailMode = "cellar";
            this._showDetail = true;
        }
        else {
            this._addPreselect = { cabinet: cabinet.id, row: null, col: null, zone: zone || "bottom", depth: 0 };
            this._showAddDialog = true;
        }
    }
    // The slot a new bottle takes in a bin: the first free one, so a gap left
    // by a removed bottle is reused rather than skipped. Every path into a bin
    // — add dialog, click-to-place, drag-and-drop — must agree, or two bottles
    // end up sharing a depth and the order becomes undefined.
    _firstFreeDepth(cabinetId, zone, excludeWineId) {
        const occupied = new Set(this._wines
            .filter((w) => w.cabinet_id === cabinetId && w.zone === zone && w.id !== excludeWineId)
            .map((w) => w.depth || 0));
        let depth = 0;
        while (occupied.has(depth))
            depth++;
        return depth;
    }
    // Renumber a bin's slots in a single backend call. Looping a move per
    // bottle rewrote the whole store each time, which made shifting a full bin
    // far too slow to do on every add.
    async _reorderZone(cabinetId, zone, wineIds) {
        await this.hass.callWS({
            type: "wine_cellar/reorder_zone",
            cabinet_id: cabinetId,
            zone,
            wine_ids: wineIds,
        });
    }
    // A bottle put into a bin lands on top of the pile, so slot 1 holds the one
    // added last — slot 1 being the most accessible position, the same
    // convention as depth 0 on a grid cell. Only the new bottles are listed:
    // the backend appends every other bottle in the bin in its current order,
    // which keeps this correct even when the card's copy of the cellar is a
    // moment out of date.
    async _placeOnTopOfBin(cabinetId, zone, newWineIds) {
        if (!zone || !newWineIds.length)
            return;
        await this._reorderZone(cabinetId, zone, newWineIds);
    }
    // --- Zone side panel (boxes, bulk bins) ---
    _onZoneContainerClick(e) {
        const { cabinet, zone, storageRow } = e.detail;
        const occupantCount = this._wines.filter((w) => w.cabinet_id === cabinet.id && w.zone === zone).length;
        const nextDepth = this._firstFreeDepth(cabinet.id, zone);
        const capacity = storageRow.capacity || 20;
        const hasRoom = occupantCount < capacity && nextDepth < capacity;
        // If we have a copied wine, paste it in this zone instead of opening panel
        if (this._copiedWine) {
            if (!hasRoom) {
                this._showToast(`"${storageRow.name || "Zone"}" is full — cannot paste here.`);
                return;
            }
            this._pasteWine(cabinet.id, null, null, nextDepth, zone);
            return;
        }
        // If moving wine, drop it in this zone instead of opening panel
        if (this._movingWine) {
            if (!hasRoom) {
                this._showToast(`"${storageRow.name || "Zone"}" is full — cannot move here.`);
                return;
            }
            this._executeMoveWine(cabinet.id, null, null, zone);
            return;
        }
        if (this._movingBuyListItem) {
            if (!hasRoom) {
                this._showToast(`"${storageRow.name || "Zone"}" is full — cannot move here.`);
                return;
            }
            this._executeMoveTocellar(cabinet.id, null, null, zone);
            return;
        }
        this._openZonePanel(cabinet, zone, storageRow);
    }
    _openZonePanel(cabinet, zone, storageRow) {
        this._zonePanelCabinet = cabinet;
        this._zonePanelZone = zone;
        this._zonePanelType = storageRow.type || "bulk";
        this._zonePanelCapacity = storageRow.capacity || 20;
        this._zonePanelName = storageRow.name || "Storage";
        this._zonePanelStorageRow = storageRow;
        this._zonePanelWines = this._wines
            .filter((w) => w.cabinet_id === cabinet.id && w.zone === zone)
            .sort((a, b) => (a.depth || 0) - (b.depth || 0));
        this._zonePanelOpen = true;
    }
    _closeZonePanel() {
        this._zonePanelOpen = false;
    }
    _refreshZonePanel() {
        if (!this._zonePanelOpen || !this._zonePanelCabinet)
            return;
        // Re-derive from the freshly loaded cabinet so capacity/box changes show up.
        const freshCabinet = this._cabinets.find((c) => c.id === this._zonePanelCabinet.id);
        if (freshCabinet) {
            this._zonePanelCabinet = freshCabinet;
            const rowIdx = parseInt(this._zonePanelZone.replace("storage-", ""), 10);
            const sr = (freshCabinet.storage_rows || []).find((s) => s.row === rowIdx);
            if (sr) {
                this._zonePanelType = sr.type || "bulk";
                this._zonePanelCapacity = sr.capacity || 20;
                this._zonePanelName = sr.name || "Storage";
                this._zonePanelStorageRow = sr;
            }
        }
        this._zonePanelWines = this._wines
            .filter((w) => w.cabinet_id === this._zonePanelCabinet.id && w.zone === this._zonePanelZone)
            .sort((a, b) => (a.depth || 0) - (b.depth || 0));
    }
    // Grow a bulk/box zone's capacity by editing its StorageRow entry.
    async _updateStorageRow(updates) {
        if (!this._zonePanelCabinet || !this._zonePanelStorageRow)
            return;
        const newStorageRows = (this._zonePanelCabinet.storage_rows || []).map((sr) => sr.row === this._zonePanelStorageRow.row ? { ...sr, ...updates } : sr);
        try {
            await this.hass.callWS({
                type: "wine_cellar/update_cabinet",
                cabinet_id: this._zonePanelCabinet.id,
                updates: { storage_rows: newStorageRows },
            });
            await this._loadData();
        }
        catch (err) {
            console.error("Failed to resize zone:", err);
            this._showToast("Failed to resize zone");
        }
    }
    _addBulkSlot() {
        if (!this._zonePanelStorageRow)
            return;
        this._updateStorageRow({ capacity: (this._zonePanelStorageRow.capacity || 0) + 1 });
    }
    _addBoxSlot() {
        if (!this._zonePanelStorageRow)
            return;
        // Append a whole new box of the chosen preset size, so box sizes always
        // stay one of BOX_SIZES (1/3/6/12/24) — the Manage Racks dialog's size
        // dropdown can only display values from that list.
        const boxes = [...(this._zonePanelStorageRow.boxes || [this._zonePanelStorageRow.capacity || 0]), this._zonePanelNewBoxSize];
        this._updateStorageRow({ boxes, capacity: boxes.reduce((sum, b) => sum + b, 0) });
    }
    // Delete a single bulk/box slot: unassign its wine (if any) rather than
    // deleting it, shift every later slot down to close the gap, and shrink
    // the zone's capacity (or the specific box, for box mode) by one.
    async _deleteZoneSlot(slotIndex) {
        if (!this._zonePanelCabinet || !this._zonePanelStorageRow)
            return;
        const wineAtSlot = this._zonePanelWines[slotIndex];
        const warning = wineAtSlot
            ? `Delete Slot ${slotIndex + 1}? "${wineAtSlot.name}" will be moved to Unassigned.`
            : `Delete Slot ${slotIndex + 1}?`;
        if (!window.confirm(warning))
            return;
        try {
            if (wineAtSlot) {
                await this.hass.callWS({
                    type: "wine_cellar/update_wine",
                    wine_id: wineAtSlot.id,
                    updates: { cabinet_id: "", row: null, col: null, zone: "", depth: 0 },
                });
            }
            // Closing the gap is one renumbering of the zone, not one round trip per
            // bottle behind the deleted slot — emptying slot 1 of a full 20-bottle
            // bin used to mean nineteen calls, each with its own disk write.
            const remaining = this._zonePanelWines
                .filter((_, i) => i !== slotIndex)
                .map((w) => w.id);
            if (remaining.length) {
                await this.hass.callWS({
                    type: "wine_cellar/reorder_zone",
                    cabinet_id: this._zonePanelCabinet.id,
                    zone: this._zonePanelZone,
                    wine_ids: remaining,
                });
            }
            if (this._zonePanelType === "box") {
                const boxes = [...(this._zonePanelStorageRow.boxes || [this._zonePanelStorageRow.capacity || 0])];
                let offset = 0;
                for (let i = 0; i < boxes.length; i++) {
                    if (slotIndex < offset + boxes[i]) {
                        boxes[i] -= 1;
                        if (boxes[i] <= 0)
                            boxes.splice(i, 1);
                        break;
                    }
                    offset += boxes[i];
                }
                await this._updateStorageRow({ boxes, capacity: boxes.reduce((sum, b) => sum + b, 0) });
            }
            else {
                await this._updateStorageRow({ capacity: Math.max(0, (this._zonePanelStorageRow.capacity || 1) - 1) });
            }
            this._showToast(wineAtSlot ? "Slot deleted, wine unassigned" : "Slot deleted");
        }
        catch (err) {
            console.error("Failed to delete slot:", err);
            this._showToast("Failed to delete slot");
        }
    }
    _onZonePanelSlotClick(slotIndex, wine) {
        if (wine) {
            this._selectedWine = wine;
            this._detailMode = "cellar";
            this._showDetail = true;
            return;
        }
        if (this._copiedWine) {
            this._pasteWine(this._zonePanelCabinet.id, null, null, slotIndex, this._zonePanelZone);
            return;
        }
        if (this._movingWine) {
            this._executeMoveWine(this._zonePanelCabinet.id, null, null, this._zonePanelZone, slotIndex);
            return;
        }
        this._addPreselect = {
            cabinet: this._zonePanelCabinet.id,
            row: null,
            col: null,
            zone: this._zonePanelZone,
            depth: slotIndex,
        };
        this._showAddDialog = true;
    }
    // --- Zone side panel: drag-to-reorder ---
    _onZonePanelDragStart(e, wine) {
        this._zonePanelDragWineId = wine.id;
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            // Same payload shape cabinet-grid's _onDrop expects, so dragging out
            // of the panel onto any rack/zone in the main grid works too.
            e.dataTransfer.setData("text/plain", JSON.stringify({
                wineId: wine.id,
                cabinetId: wine.cabinet_id,
                row: wine.row ?? null,
                col: wine.col ?? null,
                zone: wine.zone || "",
            }));
        }
    }
    _onZonePanelDragEnd() {
        this._zonePanelDragWineId = null;
        this._zonePanelDragOverKey = null;
    }
    _onZonePanelDragOver(e, key) {
        e.preventDefault();
        if (e.dataTransfer)
            e.dataTransfer.dropEffect = "move";
        this._zonePanelDragOverKey = key;
    }
    // Bulk mode: reflow to sequential depths matching the new visual order.
    async _onZonePanelBulkReorder(e, targetIndex) {
        e.preventDefault();
        this._zonePanelDragOverKey = null;
        const draggedId = this._zonePanelDragWineId;
        this._zonePanelDragWineId = null;
        if (!draggedId || !this._zonePanelCabinet)
            return;
        const wines = [...this._zonePanelWines];
        const fromIndex = wines.findIndex((w) => w.id === draggedId);
        if (fromIndex === -1 || fromIndex === targetIndex)
            return;
        const [moved] = wines.splice(fromIndex, 1);
        wines.splice(targetIndex, 0, moved);
        try {
            await this._reorderZone(this._zonePanelCabinet.id, this._zonePanelZone, wines.map((w) => w.id));
            this._showToast("Wine reordered");
            await this._loadData();
        }
        catch (err) {
            console.error("Failed to reorder wine:", err);
            this._showToast("Failed to reorder wine");
        }
    }
    // Box mode: move/swap into a specific slot depth.
    async _onZonePanelBoxReorder(e, targetDepth, targetWine) {
        e.preventDefault();
        this._zonePanelDragOverKey = null;
        const draggedId = this._zonePanelDragWineId;
        this._zonePanelDragWineId = null;
        if (!draggedId || !this._zonePanelCabinet || draggedId === targetWine?.id)
            return;
        const draggedWine = this._zonePanelWines.find((w) => w.id === draggedId);
        if (!draggedWine)
            return;
        try {
            await this.hass.callWS({
                type: "wine_cellar/move_wine",
                wine_id: draggedWine.id,
                cabinet_id: this._zonePanelCabinet.id,
                zone: this._zonePanelZone,
                depth: targetDepth,
            });
            if (targetWine) {
                await this.hass.callWS({
                    type: "wine_cellar/move_wine",
                    wine_id: targetWine.id,
                    cabinet_id: this._zonePanelCabinet.id,
                    zone: this._zonePanelZone,
                    depth: draggedWine.depth || 0,
                });
            }
            this._showToast("Wine reordered");
            await this._loadData();
        }
        catch (err) {
            console.error("Failed to reorder wine:", err);
            this._showToast("Failed to reorder wine");
        }
    }
    // Renumber the bin's slots to match when bottles were added.
    //
    // Direction matters physically. Slot 1 is the most accessible position —
    // the same convention as depth 0 being the front bottle of a grid cell —
    // so "newest first" matches dropping each new bottle on top of the pile,
    // and "oldest first" matches lining bottles up in a row from one end.
    // Only the user knows which of the two their bin really is.
    //
    // `added_at` is the only entry timestamp stored; bottles without one keep
    // their relative position at the end in *both* directions rather than
    // sorting to the front, which is what an empty string would otherwise do.
    async _sortZoneByDateAdded(direction) {
        this._confirmZoneSort = false;
        if (!this._zonePanelCabinet)
            return;
        const ordered = [...this._zonePanelWines].sort((a, b) => {
            const aDate = a.added_at || "";
            const bDate = b.added_at || "";
            if (!aDate && !bDate)
                return (a.depth || 0) - (b.depth || 0);
            if (!aDate)
                return 1;
            if (!bDate)
                return -1;
            return direction === "newest" ? bDate.localeCompare(aDate) : aDate.localeCompare(bDate);
        });
        this._zoneSorting = true;
        try {
            await this._reorderZone(this._zonePanelCabinet.id, this._zonePanelZone, ordered.map((w) => w.id));
            this._showToast(direction === "newest" ? "Newest bottles first" : "Oldest bottles first");
            await this._loadData();
        }
        catch (err) {
            console.error("Failed to sort zone:", err);
            this._showToast("Failed to sort");
        }
        this._zoneSorting = false;
    }
    _getZoneSlotLabel(_type, index) {
        return `Slot ${index + 1}`;
    }
    // Opens the right side panel for a wine's location and highlights its slot,
    // both in the panel and on the rack drawing.
    _locateWine(wine) {
        const loc = getWineLocation(wine, this._cabinets);
        if (!loc.cabinet) {
            this._showToast("This wine is unassigned");
            return;
        }
        // An active search replaces the rack drawing with a flat result list, so
        // locating while searching would point at a rack that isn't on screen.
        // Locating means "show me where it is" — clear the search and open the
        // bottle's own rack.
        this._searchQuery = "";
        this._searchFilter = "all";
        this._activeTab = loc.cabinet.id;
        // Mark the bottle on the rack drawing regardless of whether a side panel
        // opens — for a plain bottom-zone bottle the drawing is the only place it
        // can be pointed at.
        this._highlightWineId = wine.id;
        if (wine.row !== null && wine.col !== null) {
            this._openRackPanel(loc.cabinet);
        }
        else if (loc.zone && loc.zone !== "bottom" && loc.storageRow) {
            this._openZonePanel(loc.cabinet, loc.zone, loc.storageRow);
        }
        else {
            this._showToast(`In ${loc.text}`);
        }
        this.updateComplete.then(async () => {
            // The panel slot and the rack cell live in different scroll containers,
            // so both can be brought into view without fighting each other.
            this.shadowRoot?.getElementById("highlight-slot")?.scrollIntoView({ behavior: "smooth", block: "center" });
            // Each cabinet-grid runs its own update cycle, so the marked cell does
            // not exist yet when this element's update resolves — wait for the
            // children before looking for it.
            const grids = [...(this.shadowRoot?.querySelectorAll("cabinet-grid") || [])];
            await Promise.all(grids.map((g) => g.updateComplete));
            for (const grid of grids) {
                const marked = grid.shadowRoot?.querySelector(".locate-highlight");
                if (marked) {
                    // Instant, not smooth: a smooth scroll is silently dropped in some
                    // environments (reduced-motion, embedded webviews), and landing on
                    // the bottle matters more than the animation.
                    marked.scrollIntoView({ block: "center" });
                    break;
                }
            }
        });
        setTimeout(() => {
            if (this._highlightWineId === wine.id)
                this._highlightWineId = null;
        }, 4000);
    }
    // --- Rack panel (grid-slot cabinets: list + reorder) ---
    _onRackClick(e) {
        this._openRackPanel(e.detail.cabinet);
    }
    _openRackPanel(cabinet) {
        this._rackPanelCabinet = cabinet;
        this._rackPanelWines = this._wines.filter((w) => w.cabinet_id === cabinet.id && w.row !== null && w.col !== null);
        this._rackPanelOpen = true;
    }
    _closeRackPanel() {
        this._rackPanelOpen = false;
    }
    _refreshRackPanel() {
        if (!this._rackPanelOpen || !this._rackPanelCabinet)
            return;
        const fresh = this._cabinets.find((c) => c.id === this._rackPanelCabinet.id);
        if (fresh)
            this._rackPanelCabinet = fresh;
        this._rackPanelWines = this._wines.filter((w) => w.cabinet_id === this._rackPanelCabinet.id && w.row !== null && w.col !== null);
    }
    // Every physical (row, col) slot in the rack, skipping bulk/box storage rows.
    _getRackSlots() {
        return this._rackPanelCabinet ? getRackSlots(this._rackPanelCabinet) : [];
    }
    // Adds exactly one new slot. A rack is a strict rows×cols rectangle, so
    // growing either axis by 1 adds that many slots (all of the other axis).
    // Grow whichever axis is smaller to add as few slots as possible — for the
    // common single-row rack (rows=1) this always adds exactly 1 slot.
    _addRackSlot() {
        if (!this._rackPanelCabinet)
            return;
        const { rows, cols } = this._rackPanelCabinet;
        if (rows <= cols) {
            this._resizeRack({ cols: cols + 1 });
        }
        else {
            this._resizeRack({ rows: rows + 1 });
        }
    }
    async _resizeRack(updates) {
        if (!this._rackPanelCabinet)
            return;
        try {
            await this.hass.callWS({
                type: "wine_cellar/update_cabinet",
                cabinet_id: this._rackPanelCabinet.id,
                updates,
            });
            await this._loadData();
        }
        catch (err) {
            console.error("Failed to resize rack:", err);
            this._showToast("Failed to resize rack");
        }
    }
    // A rack is a strict rows×cols rectangle, so only the trailing slot can be
    // removed without leaving a hole the grid can't represent.
    _isLastRackSlot(row, col) {
        const slots = this._getRackSlots();
        if (slots.length === 0)
            return false;
        const last = slots[slots.length - 1];
        return last.row === row && last.col === col;
    }
    async _deleteRackSlot(row, col) {
        if (!this._rackPanelCabinet)
            return;
        const { rows, cols } = this._rackPanelCabinet;
        if (rows <= 1 && cols <= 1) {
            this._showToast("Rack can't get any smaller");
            return;
        }
        const wine = this._rackPanelWines.find((w) => w.row === row && w.col === col);
        const warning = wine
            ? `Delete this slot? "${wine.name}" will be moved to Unassigned.`
            : "Delete this slot?";
        if (!window.confirm(warning))
            return;
        try {
            if (wine) {
                await this.hass.callWS({
                    type: "wine_cellar/update_wine",
                    wine_id: wine.id,
                    updates: { cabinet_id: "", row: null, col: null, zone: "", depth: 0 },
                });
            }
            if (cols >= rows && cols > 1) {
                await this._resizeRack({ cols: cols - 1 });
            }
            else {
                await this._resizeRack({ rows: rows - 1 });
            }
            this._showToast(wine ? "Slot deleted, wine unassigned" : "Slot deleted");
        }
        catch (err) {
            console.error("Failed to delete slot:", err);
            this._showToast("Failed to delete slot");
        }
    }
    _onRackPanelSlotClick(row, col, wine) {
        const cabinet = this._rackPanelCabinet;
        if (!cabinet)
            return;
        const cabinetDepth = cabinet.depth || 1;
        if (cabinetDepth >= 2) {
            // Multi-depth cells are handled by the existing depth panel.
            const wines = this._rackPanelWines.filter((w) => w.row === row && w.col === col);
            this._closeRackPanel();
            this._openDepthPanel(cabinet, row, col, wines, cabinetDepth);
            return;
        }
        if (wine) {
            this._selectedWine = wine;
            this._detailMode = "cellar";
            this._showDetail = true;
            return;
        }
        if (this._copiedWine) {
            this._pasteWine(cabinet.id, row, col, 0);
            return;
        }
        if (this._movingWine) {
            this._executeMoveWine(cabinet.id, row, col, "", 0);
            return;
        }
        if (this._movingBuyListItem) {
            this._executeMoveTocellar(cabinet.id, row, col, "", 0);
            return;
        }
        this._addPreselect = { cabinet: cabinet.id, row, col, zone: "", depth: 0 };
        this._showAddDialog = true;
    }
    _onRackPanelDragStart(e, wine) {
        this._rackPanelDragWineId = wine.id;
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", JSON.stringify({
                wineId: wine.id,
                cabinetId: wine.cabinet_id,
                row: wine.row ?? null,
                col: wine.col ?? null,
                zone: wine.zone || "",
            }));
        }
    }
    _onRackPanelDragEnd() {
        this._rackPanelDragWineId = null;
        this._rackPanelDragOverKey = null;
    }
    _onRackPanelDragOver(e, key) {
        e.preventDefault();
        if (e.dataTransfer)
            e.dataTransfer.dropEffect = "move";
        this._rackPanelDragOverKey = key;
    }
    // Swap/move the dragged wine into the target (row, col) slot.
    async _onRackPanelReorder(e, targetRow, targetCol, targetWine) {
        e.preventDefault();
        this._rackPanelDragOverKey = null;
        const draggedId = this._rackPanelDragWineId;
        this._rackPanelDragWineId = null;
        if (!draggedId || !this._rackPanelCabinet || draggedId === targetWine?.id)
            return;
        const draggedWine = this._rackPanelWines.find((w) => w.id === draggedId);
        if (!draggedWine || (draggedWine.row === targetRow && draggedWine.col === targetCol))
            return;
        try {
            await this.hass.callWS({
                type: "wine_cellar/move_wine",
                wine_id: draggedWine.id,
                cabinet_id: this._rackPanelCabinet.id,
                row: targetRow,
                col: targetCol,
                zone: "",
            });
            if (targetWine) {
                await this.hass.callWS({
                    type: "wine_cellar/move_wine",
                    wine_id: targetWine.id,
                    cabinet_id: this._rackPanelCabinet.id,
                    row: draggedWine.row,
                    col: draggedWine.col,
                    zone: "",
                });
            }
            this._showToast("Wine reordered");
            await this._loadData();
        }
        catch (err) {
            console.error("Failed to reorder wine:", err);
            this._showToast("Failed to reorder wine");
        }
    }
    async _executeMoveWine(cabinetId, row, col, zone, depth = 0) {
        if (!this._movingWine)
            return;
        try {
            await this.hass.callWS({
                type: "wine_cellar/move_wine",
                wine_id: this._movingWine.id,
                cabinet_id: cabinetId,
                zone,
                depth,
                // Bulk/zone moves have no X/Y; the backend schema rejects row/col
                // sent as null, so only include them when they're actually set.
                ...(row !== null ? { row } : {}),
                ...(col !== null ? { col } : {}),
            });
            if (zone)
                await this._placeOnTopOfBin(cabinetId, zone, [this._movingWine.id]);
            this._showToast(`Moved "${this._movingWine.name}"`);
            this._movingWine = null;
            await this._loadData();
        }
        catch (err) {
            console.error("Failed to move wine:", err);
            this._showToast("Failed to move wine");
        }
    }
    async _onWineDrop(e) {
        const d = e.detail;
        // Reordering within the same bulk zone: dropped on/near another bottle
        // there, so insert before/after it (whichever side the drop landed on)
        // and reflow the whole zone to sequential depths — a straight two-item
        // depth swap couldn't move a bottle to the front/back of a longer bin.
        if (d.targetWineId &&
            d.targetWineId !== d.wineId &&
            d.sourceCabinetId === d.targetCabinetId &&
            d.sourceZone &&
            d.sourceZone === d.targetZone) {
            try {
                const zoneWines = this._wines
                    .filter((w) => w.cabinet_id === d.targetCabinetId && w.zone === d.targetZone)
                    .sort((a, b) => (a.depth || 0) - (b.depth || 0));
                const fromIdx = zoneWines.findIndex((w) => w.id === d.wineId);
                if (fromIdx === -1)
                    return;
                const [moved] = zoneWines.splice(fromIdx, 1);
                const toIdx = zoneWines.findIndex((w) => w.id === d.targetWineId);
                if (toIdx === -1)
                    return;
                zoneWines.splice(d.insertBefore ? toIdx : toIdx + 1, 0, moved);
                // One renumbering rather than a move per bottle: dragging within a
                // full twenty-bottle bin used to fire up to twenty calls, each with
                // its own disk write on the other side.
                await this.hass.callWS({
                    type: "wine_cellar/reorder_zone",
                    cabinet_id: d.targetCabinetId,
                    zone: d.targetZone,
                    wine_ids: zoneWines.map((w) => w.id),
                });
                this._showToast("Wine reordered");
                await this._loadData();
            }
            catch (err) {
                console.error("Failed to reorder wine:", err);
                this._showToast("Failed to reorder wine");
            }
            return;
        }
        // Don't drop on same position. Only meaningful for grid slots — bulk/box
        // zones have no row/col (always null), so this would always match and
        // silently block reordering within the same zone.
        if (!d.targetZone && d.sourceCabinetId === d.targetCabinetId && d.sourceRow === d.targetRow && d.sourceCol === d.targetCol && d.sourceZone === d.targetZone)
            return;
        // Set once the first half of a swap has happened, so a failure in the
        // second half can be undone.
        let swappedBack = null;
        try {
            // Check if target cell has a wine (swap)
            let targetWine;
            if (d.targetRow !== null && d.targetCol !== null && !d.targetZone) {
                targetWine = this._wines.find((w) => w.cabinet_id === d.targetCabinetId && w.row === d.targetRow && w.col === d.targetCol);
            }
            if (targetWine) {
                // Swap: move target wine to source position first
                await this.hass.callWS({
                    type: "wine_cellar/move_wine",
                    wine_id: targetWine.id,
                    cabinet_id: d.sourceCabinetId,
                    zone: d.sourceZone || "",
                    // Slot targets carry real X/Y coordinates; Bulk/zone targets have
                    // none, and the backend schema rejects row/col sent as null, so
                    // only include them when they're actually set.
                    ...(d.sourceRow !== null && d.sourceRow !== undefined ? { row: d.sourceRow } : {}),
                    ...(d.sourceCol !== null && d.sourceCol !== undefined ? { col: d.sourceCol } : {}),
                });
                // Half of a swap is not a state the rack can be in: the target bottle
                // is now sitting where the dragged one still is. If the second half
                // fails, put it back before reporting the failure.
                swappedBack = () => this.hass.callWS({
                    type: "wine_cellar/move_wine",
                    wine_id: targetWine.id,
                    cabinet_id: d.targetCabinetId,
                    zone: d.targetZone || "",
                    ...(d.targetRow !== null && d.targetRow !== undefined ? { row: d.targetRow } : {}),
                    ...(d.targetCol !== null && d.targetCol !== undefined ? { col: d.targetCol } : {}),
                });
            }
            // Dropped into a bulk/box zone's general area (not swapped onto a
            // specific bottle above): land past the last occupied depth instead
            // of defaulting to 0, which would collide with whatever wine is
            // already at depth 0 and — since depth-sorting is stable — look like
            // the drop silently did nothing.
            let targetDepth;
            if (d.targetZone) {
                const occupants = this._wines.filter((w) => w.cabinet_id === d.targetCabinetId && w.zone === d.targetZone && w.id !== d.wineId);
                const targetCabinet = this._cabinets.find((c) => c.id === d.targetCabinetId);
                const rowIdx = parseInt(d.targetZone.replace("storage-", ""), 10);
                const storageRow = targetCabinet?.storage_rows?.find((s) => s.row === rowIdx);
                const capacity = storageRow?.capacity || 20;
                targetDepth = this._firstFreeDepth(d.targetCabinetId, d.targetZone, d.wineId);
                if (storageRow && (occupants.length >= capacity || targetDepth >= capacity)) {
                    this._showToast(`"${storageRow.name || "Zone"}" is full — cannot move here.`);
                    return;
                }
            }
            // Move dragged wine to target
            await this.hass.callWS({
                type: "wine_cellar/move_wine",
                wine_id: d.wineId,
                cabinet_id: d.targetCabinetId,
                zone: d.targetZone || "",
                ...(d.targetRow !== null && d.targetRow !== undefined ? { row: d.targetRow } : {}),
                ...(d.targetCol !== null && d.targetCol !== undefined ? { col: d.targetCol } : {}),
                ...(targetDepth !== undefined ? { depth: targetDepth } : {}),
            });
            // Dropped into a bin's open area rather than onto a specific bottle:
            // that is putting it on the pile, so it lands on top. A drop *onto* a
            // bottle is a deliberate position and is left exactly where it fell.
            if (d.targetZone && !targetWine) {
                await this._placeOnTopOfBin(d.targetCabinetId, d.targetZone, [d.wineId]);
            }
            // Same container (rack/bin/box) = reordering; a different one = an
            // actual move between containers.
            const sameContainer = d.sourceCabinetId === d.targetCabinetId;
            this._showToast(sameContainer ? "Wine reordered" : targetWine ? "Swapped wines" : "Wine moved");
            await this._loadData();
        }
        catch (err) {
            console.error("Failed to move wine:", err);
            if (swappedBack) {
                try {
                    await swappedBack();
                }
                catch (undoErr) {
                    console.error("Failed to undo half-completed swap:", undoErr);
                    this._showToast("Move failed and could not be undone — check both slots");
                    await this._loadData();
                    return;
                }
            }
            this._showToast("Failed to move wine");
            await this._loadData();
        }
    }
    _copyWine(wine) {
        this._copiedWine = wine;
        this._showToast(`Copied "${wine.name}" — tap empty cells or bulk/box zones to paste`);
        this._showDetail = false;
        // Close any open side panel and show every rack, so the whole cellar is reachable to paste into.
        this._zonePanelOpen = false;
        this._rackPanelOpen = false;
        this._depthPanelOpen = false;
        this._activeTab = "all";
    }
    async _pasteWine(cabinetId, row, col, depth = 0, zone = "") {
        if (!this._copiedWine)
            return;
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/add_wine",
                wine: {
                    barcode: this._copiedWine.barcode,
                    name: this._copiedWine.name,
                    winery: this._copiedWine.winery,
                    region: this._copiedWine.region,
                    country: this._copiedWine.country,
                    vintage: this._copiedWine.vintage,
                    type: this._copiedWine.type,
                    grape_variety: this._copiedWine.grape_variety,
                    rating: this._copiedWine.rating,
                    image_url: this._copiedWine.image_url,
                    back_image_url: this._copiedWine.back_image_url,
                    price: this._copiedWine.price,
                    retail_price: this._copiedWine.retail_price,
                    retail_price_currency: this._copiedWine.retail_price_currency,
                    purchase_date: this._copiedWine.purchase_date,
                    drink_by: this._copiedWine.drink_by,
                    notes: this._copiedWine.notes,
                    description: this._copiedWine.description,
                    food_pairings: this._copiedWine.food_pairings,
                    alcohol: this._copiedWine.alcohol,
                    ratings_count: this._copiedWine.ratings_count,
                    cabinet_id: cabinetId,
                    row,
                    col,
                    depth,
                    zone,
                    user_rating: this._copiedWine.user_rating,
                    tasting_notes: this._copiedWine.tasting_notes,
                    disposition: this._copiedWine.disposition,
                    drink_window: this._copiedWine.drink_window,
                    ai_ratings: this._copiedWine.ai_ratings,
                    vivino_updated_at: this._copiedWine.vivino_updated_at,
                    vivino_checked_at: this._copiedWine.vivino_checked_at,
                    ai_updated_at: this._copiedWine.ai_updated_at,
                    ai_checked_at: this._copiedWine.ai_checked_at,
                    vivino_id: this._copiedWine.vivino_id,
                },
            });
            const pasted = result?.wine?.id;
            if (zone && pasted)
                await this._placeOnTopOfBin(cabinetId, zone, [pasted]);
            this._showToast("Wine pasted! Tap more empty cells or click ✕ to stop.");
            await this._loadData();
        }
        catch {
            this._showToast("Failed to paste wine.");
        }
    }
    // --- Batch AI Analysis ---
    _batchAnalyzeWines() {
        if (this._wines.length > 5) {
            this._showBatchAiConfirm = true;
            return;
        }
        this._runBatchAnalyzeWines();
    }
    async _runBatchAnalyzeWines() {
        this._showBatchAiConfirm = false;
        this._analyzing = true;
        this._showToast("Running full AI analysis on all wines...");
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/batch_analyze_wines",
            });
            if (result.error) {
                this._showToast(`AI Batch failed: ${result.error}`);
            }
            else {
                const parts = [`AI Batch complete! ${result.updated}/${result.total} updated`];
                if (result.errors > 0)
                    parts.push(`(${result.errors} errors)`);
                this._showToast(parts.join(" "));
                await this._loadData();
            }
        }
        catch (err) {
            this._showToast("AI Batch analysis failed.");
        }
        this._analyzing = false;
    }
    // --- Arrangement ---
    // Recomputed on render rather than cached: it reads the same wines and
    // cabinets the card already holds, and a stale count would point at moves
    // that have since been made.
    get _arrangementFindings() {
        // Read from render(), so it ran on every keystroke in the search box even
        // though typing cannot change how the cellar is arranged. Cached against
        // the three things it actually depends on — all replaced wholesale rather
        // than mutated, so identity is a sound key.
        if (this._findingsCache &&
            this._findingsCache.wines === this._wines &&
            this._findingsCache.cabinets === this._cabinets &&
            this._findingsCache.dismissed === this._dismissedArrangements) {
            return this._findingsCache.findings;
        }
        const findings = analyzeArrangement(this._wines, this._cabinets, this._dismissedArrangements);
        this._findingsCache = {
            wines: this._wines,
            cabinets: this._cabinets,
            dismissed: this._dismissedArrangements,
            findings,
        };
        return findings;
    }
    // "Leave it as it is" has to stick, or the count becomes a badge people
    // learn to ignore. Applied locally first so the finding disappears at once.
    async _dismissArrangement(id) {
        if (this._dismissedArrangements.includes(id))
            return;
        const previous = this._dismissedArrangements;
        const next = [...previous, id];
        this._dismissedArrangements = next;
        try {
            await this.hass.callWS({
                type: "wine_cellar/update_settings",
                updates: { dismissed_arrangements: next },
            });
        }
        catch (err) {
            this._dismissedArrangements = previous;
            this._showToast("Failed to dismiss the suggestion");
        }
    }
    // --- Metadata language (Vivino/AI) ---
    async _setMetadataLanguage(lang) {
        if (lang === this._metadataLanguage)
            return;
        const previous = this._metadataLanguage;
        this._metadataLanguage = lang;
        try {
            await this.hass.callWS({
                type: "wine_cellar/update_settings",
                updates: { metadata_language: lang },
            });
        }
        catch (err) {
            this._metadataLanguage = previous;
            this._showToast("Failed to change language");
        }
    }
    async _setMetadataCurrency(currency) {
        if (currency === this._metadataCurrency)
            return;
        const previous = this._metadataCurrency;
        this._metadataCurrency = currency;
        try {
            await this.hass.callWS({
                type: "wine_cellar/update_settings",
                updates: { metadata_currency: currency },
            });
        }
        catch (err) {
            this._metadataCurrency = previous;
            this._showToast("Failed to change currency");
        }
    }
    async _setAiFallbackAlways(value) {
        if (value === this._aiFallbackAlways)
            return;
        const previous = this._aiFallbackAlways;
        this._aiFallbackAlways = value;
        try {
            await this.hass.callWS({
                type: "wine_cellar/update_settings",
                updates: { ai_fallback_always: value },
            });
        }
        catch (err) {
            this._aiFallbackAlways = previous;
            this._showToast("Failed to change AI fallback setting");
        }
    }
    // --- Batch Vivino Refresh ---
    _batchRefreshVivino() {
        this._batchAiFallback = this._aiFallbackAlways;
        this._showBatchVivinoConfirm = true;
    }
    async _runBatchVivino(photoMode) {
        this._showBatchVivinoConfirm = false;
        this._batchVivino = true;
        this._showToast("Refreshing all wines from Vivino...");
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/batch_refresh_vivino",
                photo_mode: photoMode,
                ai_fallback: this._batchAiFallback ? "use" : "skip",
            });
            if (result.error) {
                this._showToast(`Vivino Batch failed: ${result.error}`);
            }
            else {
                const parts = [`Vivino Batch complete! ${result.updated}/${result.total} updated`];
                if (result.photos_updated)
                    parts.push(`${result.photos_updated} photos updated`);
                if (result.photos_kept)
                    parts.push(`${result.photos_kept} kept`);
                if (result.ai_fallback_used)
                    parts.push(`${result.ai_fallback_used} used AI instead`);
                const unresolvedMismatch = (result.mismatched || 0) - (result.ai_fallback_used || 0);
                if (unresolvedMismatch > 0)
                    parts.push(`${unresolvedMismatch} no match at all`);
                if (result.errors > 0)
                    parts.push(`(${result.errors} errors)`);
                this._showToast(parts.join(", "));
                await this._loadData();
            }
        }
        catch (err) {
            this._showToast("Vivino Batch refresh failed.");
        }
        this._batchVivino = false;
    }
    // --- Vivino Account Sync ---
    get _vivinoSyncMode() {
        return this._vivinoMode === "sync";
    }
    async _syncVivino() {
        this._vivinoSyncing = true;
        const word = this._vivinoSyncMode ? "sync" : "import";
        this._showToast(this._vivinoSyncMode
            ? "Syncing your Vivino cellar & wishlist..."
            : "Importing your Vivino cellar & wishlist...");
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/sync_vivino",
            });
            if (result.error) {
                this._showToast(`Vivino ${word} failed: ${result.error}`);
            }
            else {
                const bottles = (result.cellar_imported || 0) + (result.my_wines_imported || 0);
                const parts = [
                    `Vivino ${word} complete! ${bottles} bottle${bottles === 1 ? "" : "s"} imported`,
                ];
                if (result.wishlist_imported > 0)
                    parts.push(`+ ${result.wishlist_imported} to buy list`);
                if (result.cellar_pushed > 0)
                    parts.push(`(${result.cellar_pushed} pushed to Vivino)`);
                if (result.errors?.length)
                    parts.push(`(${result.errors.length} errors)`);
                this._showToast(parts.join(" "));
                await this._loadData();
            }
        }
        catch (err) {
            this._showToast(`Vivino ${word} failed.`);
        }
        this._vivinoSyncing = false;
    }
    // --- Buy List ---
    _showBuyListDetail(item) {
        this._selectedWine = item;
        this._detailMode = "buylist";
        this._showDetail = true;
    }
    async _removeBuyListItem(itemId) {
        try {
            await this.hass.callWS({
                type: "wine_cellar/remove_from_buy_list",
                item_id: itemId,
            });
            this._showToast("Removed from buy list");
            await this._loadData();
        }
        catch (err) {
            console.error("Failed to remove from buy list", err);
            this._showToast("Failed to remove from buy list");
        }
    }
    _startMoveBuyListItem(item) {
        this._movingBuyListItem = item;
        this._activeTab = "all";
        this._showToast(`Tap a cell to place "${item.name}"`);
    }
    async _executeMoveTocellar(cabinetId, row, col, zone, depth = 0) {
        if (!this._movingBuyListItem)
            return;
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/move_to_cellar",
                item_id: this._movingBuyListItem.id,
                cabinet_id: cabinetId,
                row,
                col,
                zone,
                depth,
            });
            const moved = result?.wine?.id;
            if (zone && moved)
                await this._placeOnTopOfBin(cabinetId, zone, [moved]);
            this._showToast(`Moved "${this._movingBuyListItem.name}" to cellar`);
            this._movingBuyListItem = null;
            await this._loadData();
        }
        catch (err) {
            console.error("Failed to move to cellar:", err);
            this._showToast("Failed to move to cellar");
        }
    }
    async _onRemoveWine(e) {
        try {
            await this.hass.callWS({
                type: "wine_cellar/remove_wine",
                wine_id: e.detail.wine_id,
                reason: e.detail.reason || "other",
            });
            await this._loadData();
        }
        catch (err) {
            console.error("Failed to remove wine", err);
        }
    }
    async _onWineAdded() {
        await this._loadData();
    }
    _onSearch(e) {
        this._searchQuery = e.detail.query;
        this._searchFilter = e.detail.filter;
    }
    _getCabinetWines(cabinetId) {
        return this._wines.filter((w) => w.cabinet_id === cabinetId);
    }
    _getUnassignedWines() {
        const cabinetIds = new Set(this._cabinets.map((c) => c.id));
        return this._wines.filter((w) => !w.cabinet_id || !cabinetIds.has(w.cabinet_id));
    }
    render() {
        if (this._loading) {
            return b `
        <ha-card>
          <div class="loading">Loading wine cellar...</div>
        </ha-card>
      `;
        }
        const title = this._config?.title || "Cork Dork";
        const filteredWines = this._getFilteredWines();
        const isSearching = !!(this._searchQuery || this._searchFilter !== "all");
        const unassignedWines = this._getUnassignedWines();
        const showGrid = !isSearching && this._activeTab !== "buy-list" && this._activeTab !== "unassigned" && (this._activeTab === "all" || this._cabinets.some((c) => c.id === this._activeTab));
        const showBuyList = this._activeTab === "buy-list" && !isSearching;
        const showUnassigned = this._activeTab === "unassigned" && !isSearching;
        return b `
      <ha-card>
        <div class="header-row">
          <div class="title">
            <span class="title-icon">🍷</span>
            <div class="title-text">
              <div>${title}</div>
              <div class="title-credit">originally created by @BaconWappedBitcoin</div>
            </div>
          </div>
          <div class="header-actions">
            ${this._hasGemini ? b `
              <button
                class="btn btn-primary"
                style="font-size: 0.8em; padding: 5px 10px; background: #1565c0;"
                @click=${this._batchAnalyzeWines}
                title="Full AI analysis on all wines (disposition, ratings, price, description)"
                ?disabled=${this._analyzing || this._batchVivino}
              >
                ${this._analyzing ? "AI Scanning..." : "🤖 AI Batch Scan"}
              </button>
            ` : A}
            <button
              class="btn btn-primary"
              style="font-size: 0.8em; padding: 5px 10px; background: #8e24aa;"
              @click=${this._batchRefreshVivino}
              title="Refresh all wines from Vivino (ratings, price, description)"
              ?disabled=${this._batchVivino || this._analyzing}
            >
              ${this._batchVivino ? "Vivino Scanning..." : "🍇 Vivino Batch Scan"}
            </button>
            ${this._hasVivinoAccount ? b `
              <button
                class="btn btn-primary"
                style="font-size: 0.8em; padding: 5px 10px; background: #b71c1c;"
                @click=${this._syncVivino}
                title=${this._vivinoSyncMode
            ? "Two-way sync: import from Vivino and push your Cork Dork changes back"
            : "Import your Vivino cellar and wishlist into Cork Dork (never writes to Vivino)"}
                ?disabled=${this._vivinoSyncing || this._batchVivino || this._analyzing}
              >
                ${this._vivinoSyncing
            ? (this._vivinoSyncMode ? "Vivino Syncing..." : "Vivino Importing...")
            : (this._vivinoSyncMode ? "🔄 Vivino Sync" : "⬇️ Vivino Import")}
              </button>
            ` : A}
            ${this._hasGemini ? b `
              <button
                class="btn btn-primary"
                style="font-size: 0.8em; padding: 5px 10px; background: #00695c;"
                @click=${() => (this._showWineList = true)}
                title="Scan a wine list or receipt for ratings and value"
              >
                🍽️ Scan List
              </button>
            ` : A}
            <button
              class="btn btn-primary"
              style="font-size: 0.8em; padding: 5px 10px; background: #37474f;"
              @click=${() => (this._showInventory = true)}
              title="Browse full cellar inventory"
            >
              📦 Inventory
            </button>
            <button
              class="btn btn-primary"
              @click=${() => {
            this._addPreselect = { cabinet: "", row: null, col: null, zone: "", depth: 0 };
            this._showAddDialog = true;
        }}
            >
              + Add Wine
            </button>
          </div>
        </div>

        <!-- Copy mode banner -->
        ${this._copiedWine
            ? b `
              <div class="copy-banner">
                <span>📋 Copying "${this._copiedWine.name}" — tap empty cells or bulk/box zones to place copies</span>
                <button @click=${() => (this._copiedWine = null)}>✕ Done</button>
              </div>
            `
            : A}

        <!-- Move mode banner -->
        ${this._movingWine
            ? b `
              <div class="copy-banner">
                <span>📦 Moving "${this._movingWine.name}" — tap a cell to place it</span>
                <button @click=${() => (this._movingWine = null)}>✕ Cancel</button>
              </div>
            `
            : A}

        <!-- Buy list move mode banner -->
        ${this._movingBuyListItem
            ? b `
              <div class="buy-list-banner">
                <span>🛒 Placing "${this._movingBuyListItem.name}" — tap a cell in your cellar</span>
                <button @click=${() => (this._movingBuyListItem = null)}>✕ Cancel</button>
              </div>
            `
            : A}

        <!-- Stats bar -->
        ${this._stats
            ? b `
              <div class="stats-bar">
                <div class="stat">
                  <span class="stat-value">${this._stats.total_bottles}</span>
                  bottles
                </div>
                <div class="stat">
                  <span class="stat-value">${this._stats.total_capacity}</span>
                  capacity
                </div>
                <div class="stat">
                  <span class="stat-value">${this._stats.available_slots}</span>
                  available
                </div>
                ${this._arrangementFindings.length
                ? b `
                      <div
                        class="stat stat-action"
                        title="Suggestions read from where your bottles already are"
                        @click=${() => (this._showArrangement = true)}
                      >
                        <span class="stat-value">🧹 ${this._arrangementFindings.length}</span>
                        ${this._arrangementFindings.length === 1 ? "tidy-up" : "tidy-ups"}
                      </div>
                    `
                : A}
                ${this._stats.total_value
                ? b `
                      <div class="stat">
                        <span class="stat-value">${this._metadataCurrency} ${this._stats.total_value.toLocaleString()}</span>
                        value
                        ${this._stats.total_cost
                    ? b `<span style="font-size:0.75em;color:${this._stats.total_value - this._stats.total_cost >= 0 ? '#2e7d32' : '#c62828'}">${this._stats.total_value - this._stats.total_cost >= 0 ? '+' : ''}${this._metadataCurrency} ${(this._stats.total_value - this._stats.total_cost).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>`
                    : A}
                      </div>
                    `
                : A}
              </div>
            `
            : A}

        <!-- Tab bar -->
        <div class="tab-bar">
          <button
            class="tab ${this._activeTab === "all" ? "active" : ""}"
            @click=${() => (this._activeTab = "all")}
          >
            All Sections
          </button>
          ${this._cabinets.map((cab) => b `
              <button
                class="tab ${this._activeTab === cab.id ? "active" : ""}"
                @click=${() => (this._activeTab = cab.id)}
              >
                ${cab.name}
                (${this._getCabinetWines(cab.id).length})
              </button>
            `)}
          ${unassignedWines.length > 0
            ? b `
                <button
                  class="tab ${this._activeTab === "unassigned" ? "active" : ""}"
                  @click=${() => (this._activeTab = "unassigned")}
                  style="${this._activeTab !== "unassigned" ? "border-color: #e65100; color: #e65100;" : ""}"
                >
                  Unassigned (${unassignedWines.length})
                </button>
              `
            : A}
          <button
            class="tab ${this._activeTab === "buy-list" ? "active" : ""}"
            @click=${() => (this._activeTab = "buy-list")}
            style="${this._activeTab === "buy-list" ? "border-color: #e65100; color: #e65100;" : ""}"
          >
            Buy List (${this._buyList.length})
          </button>
          <button
            class="tab manage-racks-btn"
            @click=${() => (this._showRackSettings = true)}
          >
            Manage Racks
          </button>
          <button
            class="tab settings-tab-btn"
            @click=${() => (this._showVivinoAiSettings = true)}
          >
            ⚙️ Vivino/AI Settings
          </button>
        </div>

        <!-- Search bar -->
        <wine-search-bar
          .value=${this._searchQuery}
          .filter=${this._searchFilter}
          @search-change=${this._onSearch}
        ></wine-search-bar>

        <!-- Cabinet grids -->
        ${showGrid
            ? b `
              <div class="cabinets-row">
                ${this._activeTab === "all"
                ? this._cabinets.map((cab) => b `
                        <cabinet-grid
                          .cabinet=${cab}
                          .wines=${this._getCabinetWines(cab.id)}
                          .highlightWineId=${this._highlightWineId}
                          @cell-click=${this._onCellClick}
                          @zone-click=${this._onZoneClick}
                          @zone-container-click=${this._onZoneContainerClick}
                          @rack-click=${this._onRackClick}
                          @wine-drop=${this._onWineDrop}
                          @wine-longpress=${(e) => {
                    this._movingWine = e.detail.wine;
                    this._showToast(`Tap a cell to move "${e.detail.wine.name}"`);
                }}
                        ></cabinet-grid>
                      `)
                : this._cabinets
                    .filter((c) => c.id === this._activeTab)
                    .map((cab) => b `
                          <cabinet-grid
                            .cabinet=${cab}
                            .wines=${this._getCabinetWines(cab.id)}
                            .highlightWineId=${this._highlightWineId}
                            @cell-click=${this._onCellClick}
                            @zone-click=${this._onZoneClick}
                            @zone-container-click=${this._onZoneContainerClick}
                            @rack-click=${this._onRackClick}
                            @wine-drop=${this._onWineDrop}
                            @wine-longpress=${(e) => {
                    this._activeTab = "all";
                    this._movingWine = e.detail.wine;
                    this._showToast(`Tap a cell to move "${e.detail.wine.name}"`);
                }}
                          ></cabinet-grid>
                        `)}
              </div>
              ${this._activeTab === "all" && unassignedWines.length > 0
                ? b `
                    <div style="padding: 8px 16px 2px">
                      <div style="font-size: 0.9em; font-weight: 600; color: var(--wc-text-secondary); margin-bottom: 4px">
                        📦 Unassigned (${unassignedWines.length})
                      </div>
                    </div>
                    <div class="wine-list" style="border-top: 1px solid var(--wc-border)">
                      ${unassignedWines.map((wine) => {
                    const typeColor = WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red;
                    return b `
                            <div
                              class="wine-list-item"
                              @click=${() => {
                        this._selectedWine = wine;
                        this._detailMode = "cellar";
                        this._showDetail = true;
                    }}
                            >
                              ${wine.image_url
                        ? b `<img class="wine-list-thumb" src="${wine.image_url}" alt="" />`
                        : b `<div class="wine-list-dot" style="background: ${typeColor}"></div>`}
                              <div class="wine-list-info">
                                <div class="wine-list-name">${wine.name}</div>
                                <div class="wine-list-meta">
                                  ${wine.winery}${wine.vintage ? ` · ${wine.vintage}` : ""}
                                  ${wine.rating ? ` · ★${wine.rating}` : ""}
                                </div>
                              </div>
                              <div class="wine-list-location" style="color:#e65100">Unassigned</div>
                            </div>
                          `;
                })}
                    </div>
                  `
                : A}
            `
            : A}

        <!-- Buy List view -->
        ${showBuyList
            ? b `
              <div class="buy-list-view">
                ${this._buyList.length === 0
                ? b `
                      <div class="empty-state">
                        <div class="empty-state-icon">🛒</div>
                        <div style="font-weight: 500; margin-bottom: 4px">
                          Your buy list is empty
                        </div>
                        <div style="font-size: 0.9em">
                          Use 🛒 Buy List in Add Wine, or 🛒 Buy in the list scanner
                        </div>
                      </div>
                    `
                : this._buyList.map((item) => {
                    const typeColor = item.type === "red" ? "#722F37"
                        : item.type === "white" ? "#F5E6CA"
                            : item.type === "rosé" ? "#E8A0BF"
                                : item.type === "sparkling" ? "#D4E09B"
                                    : "#DAA520";
                    return b `
                        <div class="buy-list-card" @click=${() => this._showBuyListDetail(item)} style="cursor:pointer">
                          ${item.image_url
                        ? b `<img class="wine-list-thumb" src="${item.image_url}" alt="" />`
                        : b `<div class="wine-list-dot" style="background: ${typeColor}"></div>`}
                          <div class="bl-info">
                            <div class="bl-name">${item.name}</div>
                            <div class="bl-meta">
                              ${item.winery}${item.vintage ? ` · ${item.vintage}` : ""}
                              ${item.rating ? ` · ★${item.rating.toFixed(1)}` : ""}
                              ${item.retail_price ? ` · ${this._metadataCurrency} ${item.retail_price}` : ""}
                            </div>
                          </div>
                          <div class="bl-actions">
                            <button
                              class="bl-cellar-btn"
                              @click=${(e) => { e.stopPropagation(); this._startMoveBuyListItem(item); }}
                              title="Move to cellar"
                            >
                              + Cellar
                            </button>
                            <button
                              class="bl-remove-btn"
                              @click=${(e) => { e.stopPropagation(); this._removeBuyListItem(item.id); }}
                              title="Remove from buy list"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      `;
                })}
              </div>
            `
            : A}

        <!-- Unassigned wines view -->
        ${showUnassigned
            ? b `
              <div class="wine-list">
                <div style="padding: 12px 16px 4px; font-size: 0.85em; color: var(--wc-text-secondary)">
                  These wines are not assigned to any rack. Tap a wine to view details, then use Move to place it.
                </div>
                ${unassignedWines.map((wine) => {
                const typeColor = WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red;
                return b `
                      <div
                        class="wine-list-item"
                        @click=${() => {
                    if (this._movingBuyListItem)
                        return;
                    this._selectedWine = wine;
                    this._detailMode = "cellar";
                    this._showDetail = true;
                }}
                      >
                        ${wine.image_url
                    ? b `<img class="wine-list-thumb" src="${wine.image_url}" alt="" />`
                    : b `<div class="wine-list-dot" style="background: ${typeColor}"></div>`}
                        <div class="wine-list-info">
                          <div class="wine-list-name">${wine.name}</div>
                          <div class="wine-list-meta">
                            ${wine.winery}${wine.vintage ? ` · ${wine.vintage}` : ""}
                            ${wine.rating ? ` · ★${wine.rating}` : ""}
                            ${wine.disposition
                    ? b ` · <span style="color: ${wine.disposition === "D" ? "#2e7d32" :
                        wine.disposition === "H" ? "#1565c0" :
                            wine.disposition === "P" ? "#c62828" : "inherit"}">${wine.disposition === "D" ? "Drink" :
                        wine.disposition === "H" ? "Hold" :
                            wine.disposition === "P" ? "Past Peak" : ""}</span>`
                    : A}
                          </div>
                        </div>
                        <div class="wine-list-location">Unassigned</div>
                      </div>
                    `;
            })}
              </div>
            `
            : A}

        <!-- Filtered wine list (shown when searching or filtering) -->
        ${isSearching
            ? b `
              <div class="wine-list">
                ${filteredWines.length === 0
                ? b `
                      <div class="empty-state">
                        <div>No wines match your search</div>
                      </div>
                    `
                : filteredWines.map((wine) => {
                    const cabinetName = this._cabinets.find((c) => c.id === wine.cabinet_id)
                        ?.name || "Unassigned";
                    return b `
                        <div
                          class="wine-list-item"
                          @click=${() => {
                        this._selectedWine = wine;
                        this._detailMode = "cellar";
                        this._showDetail = true;
                    }}
                        >
                          ${wine.image_url
                        ? b `<img class="wine-list-thumb" src="${wine.image_url}" alt="" />`
                        : b `<div
                                class="wine-list-dot"
                                style="background: ${wine.type === "red"
                            ? "#722F37"
                            : wine.type === "white"
                                ? "#F5E6CA"
                                : wine.type === "rosé"
                                    ? "#E8A0BF"
                                    : wine.type === "sparkling"
                                        ? "#D4E09B"
                                        : "#DAA520"}"
                              ></div>`}
                          <div class="wine-list-info">
                            <div class="wine-list-name">${wine.name}</div>
                            <div class="wine-list-meta">
                              ${wine.winery}${wine.vintage ? ` · ${wine.vintage}` : ""}
                              ${wine.rating ? ` · ★${wine.rating}` : ""}
                              ${wine.disposition
                        ? b ` · <span style="color: ${wine.disposition === "D" ? "#2e7d32" :
                            wine.disposition === "H" ? "#1565c0" :
                                wine.disposition === "P" ? "#c62828" : "inherit"}">${wine.disposition === "D" ? "Drink" :
                            wine.disposition === "H" ? "Hold" :
                                wine.disposition === "P" ? "Past Peak" : ""}</span>`
                        : A}
                            </div>
                          </div>
                          <div class="wine-list-location">${cabinetName}</div>
                        </div>
                      `;
                })}
              </div>
            `
            : A}

        <!-- Empty state -->
        ${this._wines.length === 0
            ? b `
              <div class="empty-state">
                <div class="empty-state-icon">🍾</div>
                <div style="font-weight: 500; margin-bottom: 4px">
                  Your cellar is empty
                </div>
                <div style="font-size: 0.9em">
                  Tap "Add Wine" to start building your collection
                </div>
              </div>
            `
            : A}

        <!-- Batch Vivino Photo Mode Confirm -->
        ${this._showBatchVivinoConfirm ? b `
          <div class="dialog-overlay" @click=${() => (this._showBatchVivinoConfirm = false)}>
            <div class="dialog" style="max-width:340px;padding:24px;text-align:center" @click=${(e) => e.stopPropagation()}>
              <h3 style="margin:0 0 4px;font-size:1em;color:var(--wc-text)">Vivino Batch Scan</h3>
              <p style="margin:0 0 16px;font-size:0.85em;color:var(--wc-text-secondary)">
                Some wines already have a photo. What should happen to those photos?
              </p>
              ${this._hasGemini ? b `
                <label style="display:flex;align-items:center;gap:6px;justify-content:center;font-size:0.8em;color:var(--wc-text-secondary);margin-bottom:16px;cursor:pointer">
                  <input
                    type="checkbox"
                    .checked=${this._batchAiFallback}
                    @change=${(e) => (this._batchAiFallback = e.target.checked)}
                  />
                  Try AI for wines with no confident Vivino match
                </label>
              ` : A}
              <div style="display:flex;flex-direction:column;gap:8px">
                <button class="btn btn-primary" style="background:#8e24aa" @click=${() => this._runBatchVivino("keep")}>
                  Keep My Existing Photos
                </button>
                <button
                  style="padding:8px 16px;border-radius:20px;border:1px solid var(--wc-border);background:transparent;color:var(--wc-text);cursor:pointer;font-size:0.85em"
                  @click=${() => this._runBatchVivino("replace")}
                >Replace With Vivino Photos</button>
                <button
                  style="margin-top:4px;padding:6px 16px;border-radius:16px;border:none;background:var(--wc-hover);color:var(--wc-text-secondary);cursor:pointer;font-size:0.8em"
                  @click=${() => (this._showBatchVivinoConfirm = false)}
                >Cancel</button>
              </div>
            </div>
          </div>
        ` : A}

        <!-- Batch AI Analysis Confirm -->
        ${this._showBatchAiConfirm ? b `
          <div class="dialog-overlay" @click=${() => (this._showBatchAiConfirm = false)}>
            <div class="dialog" style="max-width:340px;padding:24px;text-align:center" @click=${(e) => e.stopPropagation()}>
              <h3 style="margin:0 0 4px;font-size:1em;color:var(--wc-text)">Run AI Batch Scan?</h3>
              <p style="margin:0 0 16px;font-size:0.85em;color:var(--wc-text-secondary)">
                This will run a full AI analysis on all ${this._wines.length} wines, one API call per bottle. It may take a while and use significant AI quota.
              </p>
              <div style="display:flex;flex-direction:column;gap:8px">
                <button class="btn btn-primary" style="background:#1565c0" @click=${this._runBatchAnalyzeWines}>
                  Run on ${this._wines.length} Wines
                </button>
                <button
                  style="margin-top:4px;padding:6px 16px;border-radius:16px;border:none;background:var(--wc-hover);color:var(--wc-text-secondary);cursor:pointer;font-size:0.8em"
                  @click=${() => (this._showBatchAiConfirm = false)}
                >Cancel</button>
              </div>
            </div>
          </div>
        ` : A}

        <!-- Wine Detail Dialog -->
        <wine-detail-dialog
          .wine=${this._selectedWine}
          .hass=${this.hass}
          .cabinets=${this._cabinets}
          .open=${this._showDetail}
          .hasGemini=${this._hasGemini}
          .aiFallbackAlways=${this._aiFallbackAlways}
          .currency=${this._metadataCurrency}
          .mode=${this._detailMode}
          @close=${() => (this._showDetail = false)}
          @remove-wine=${this._onRemoveWine}
          @remove-buy-list-item=${(e) => {
            this._removeBuyListItem(e.detail.item_id);
        }}
          @wine-updated=${() => this._loadData()}
          @buy-list-updated=${() => this._loadData()}
          @copy-wine=${(e) => this._copyWine(e.detail.wine)}
          @locate-wine=${(e) => this._locateWine(e.detail.wine)}
          @set-ai-fallback-always=${(e) => this._setAiFallbackAlways(e.detail.value)}
          @move-wine=${(e) => {
            this._showDetail = false;
            // Close any open side panel and show every rack, so any rack/zone in the cellar is reachable as a target.
            this._zonePanelOpen = false;
            this._rackPanelOpen = false;
            this._depthPanelOpen = false;
            this._activeTab = "all";
            this._movingWine = e.detail.wine;
            this._showToast(`Tap a cell to move "${e.detail.wine.name}"`);
        }}
        ></wine-detail-dialog>

        <!-- Add Wine Dialog -->
        <add-wine-dialog
          .open=${this._showAddDialog}
          .hass=${this.hass}
          .cabinets=${this._cabinets}
          .wines=${this._wines}
          .preselectedCabinet=${this._addPreselect.cabinet}
          .preselectedRow=${this._addPreselect.row}
          .preselectedCol=${this._addPreselect.col}
          .preselectedZone=${this._addPreselect.zone}
          .preselectedDepth=${this._addPreselect.depth || 0}
          .buyListMode=${this._addToBuyListMode}
          @close=${() => { this._showAddDialog = false; this._addToBuyListMode = false; }}
          @wine-added=${this._onWineAdded}
          @buy-list-updated=${() => this._loadData()}
        ></add-wine-dialog>

        <!-- Wine List Scanner Dialog -->
        <wine-list-dialog
          .open=${this._showWineList}
          .hass=${this.hass}
          .hasGemini=${this._hasGemini}
          .cellarWines=${this._wines}
          @close=${() => (this._showWineList = false)}
          @wine-added=${this._onWineAdded}
          @buy-list-updated=${() => this._loadData()}
        ></wine-list-dialog>

        <!-- Arrangement report -->
        <arrangement-dialog
          .open=${this._showArrangement}
          .hass=${this.hass}
          .wines=${this._wines}
          .cabinets=${this._cabinets}
          .dismissed=${this._dismissedArrangements}
          @close=${() => (this._showArrangement = false)}
          @moves-applied=${() => this._loadData()}
          @dismiss-finding=${(e) => this._dismissArrangement(e.detail.id)}
        ></arrangement-dialog>

        <!-- Inventory Dialog -->
        <inventory-dialog
          .open=${this._showInventory}
          .hass=${this.hass}
          .wines=${this._wines}
          .cabinets=${this._cabinets}
          .hasGemini=${this._hasGemini}
          .currency=${this._metadataCurrency}
          @close=${() => (this._showInventory = false)}
          @wine-updated=${() => this._loadData()}
          @locate-wine=${(e) => {
            this._showInventory = false;
            this._locateWine(e.detail.wine);
        }}
          @copy-wine=${(e) => {
            this._showInventory = false;
            this._copyWine(e.detail.wine);
        }}
          @move-wine=${(e) => {
            this._showInventory = false;
            this._zonePanelOpen = false;
            this._rackPanelOpen = false;
            this._depthPanelOpen = false;
            this._activeTab = "all";
            this._movingWine = e.detail.wine;
            this._showToast(`Tap a cell to move "${e.detail.wine.name}"`);
        }}
          @remove-wine=${this._onRemoveWine}
        ></inventory-dialog>

        <!-- Rack Settings Dialog -->
        <rack-settings-dialog
          .open=${this._showRackSettings}
          .hass=${this.hass}
          .cabinets=${this._cabinets}
          .wines=${this._wines}
          @close=${() => (this._showRackSettings = false)}
          @racks-updated=${() => this._loadData()}
        ></rack-settings-dialog>

        <vivino-ai-settings-dialog
          .open=${this._showVivinoAiSettings}
          .aiFallbackAlways=${this._aiFallbackAlways}
          .metadataLanguage=${this._metadataLanguage}
          .supportedLanguages=${this._supportedLanguages}
          .metadataCurrency=${this._metadataCurrency}
          .supportedCurrencies=${this._supportedCurrencies}
          @close=${() => (this._showVivinoAiSettings = false)}
          @set-ai-fallback-always=${(e) => this._setAiFallbackAlways(e.detail.value)}
          @set-metadata-language=${(e) => this._setMetadataLanguage(e.detail.value)}
          @set-metadata-currency=${(e) => this._setMetadataCurrency(e.detail.value)}
        ></vivino-ai-settings-dialog>

        <!-- Depth Side Panel -->
        ${this._depthPanelOpen
            ? b `
              <div class="depth-panel-backdrop" @click=${this._closeDepthPanel}></div>
              <div class="depth-panel open">
                <div class="depth-panel-header">
                  <span class="depth-panel-title">
                    Row ${(this._depthPanelRow ?? 0) + 1}, Col ${(this._depthPanelCol ?? 0) + 1}
                    <span class="depth-panel-subtitle">
                      ${this._depthPanelWines.length}/${this._depthPanelMaxDepth} deep
                    </span>
                  </span>
                  <button class="depth-panel-close" @click=${this._closeDepthPanel}>✕</button>
                </div>
                <div class="depth-panel-slots">
                  ${Array.from({ length: this._depthPanelMaxDepth }, (_, i) => {
                const wine = this._depthPanelWines.find((w) => (w.depth || 0) === i);
                const typeColor = wine ? WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red : "";
                const disp = wine?.disposition || "";
                const dispClass = disp === "D" ? "drink" : disp === "H" ? "hold" : disp === "P" ? "past" : "";
                return b `
                      <div
                        class="depth-slot ${wine ? "filled" : "empty"}"
                        @click=${() => this._onDepthSlotClick(i, wine)}
                      >
                        <div class="depth-slot-label">${this._getDepthLabel(i)}</div>
                        ${wine
                    ? b `
                              <div class="depth-slot-wine" style="border-left: 4px solid ${typeColor}">
                                <div class="depth-slot-avatar">
                                  ${wine.image_url
                        ? b `<img class="depth-slot-thumb" src="${wine.image_url}" alt="" />`
                        : b `<div class="depth-slot-dot" style="background: ${typeColor}"></div>`}
                                  ${dispClass ? b `<span class="depth-slot-disposition ${dispClass}">${disp}</span>` : A}
                                </div>
                                <div class="depth-slot-info">
                                  <div class="depth-slot-name">${wine.name}</div>
                                  <div class="depth-slot-meta">
                                    ${wine.vintage || "NV"}
                                    ${wine.rating ? b ` · ★${wine.rating}` : A}
                                    ${wine.price ? b ` · ${this._metadataCurrency} ${wine.price}` : A}
                                  </div>
                                </div>
                              </div>
                            `
                    : b `
                              <div class="depth-slot-empty">
                                <span class="depth-slot-plus">+</span>
                                <span>Empty</span>
                              </div>
                            `}
                      </div>
                    `;
            })}
                </div>
              </div>
            `
            : A}

        <!-- Zone Side Panel (Boxes, Bulk Bins) -->
        ${this._zonePanelOpen
            ? b `
              <div class="depth-panel-backdrop ${this._zonePanelDragWineId ? "drag-through" : ""}" @click=${this._closeZonePanel}></div>
              <div class="depth-panel open">
                <div class="depth-panel-header">
                  <span class="depth-panel-title">
                    ${this._zonePanelCabinet
                ? b `<span class="depth-panel-rack">${this._zonePanelCabinet.name}</span>`
                : A}
                    ${this._zonePanelName}
                    <span class="depth-panel-subtitle">
                      ${this._zonePanelWines.length}/${this._zonePanelCapacity}
                      ${this._zonePanelType === "box" ? "bottles" : "stored"}
                    </span>
                  </span>
                  <span class="depth-panel-actions">
                    ${this._zonePanelWines.length > 1
                ? b `<button
                          class="depth-panel-sort"
                          ?disabled=${this._zoneSorting}
                          title="Renumber the slots to match when bottles were added"
                          @click=${() => (this._confirmZoneSort = true)}
                        >
                          ${this._zoneSorting ? "Sorting…" : "↕ Sort by date"}
                        </button>`
                : A}
                    <button class="depth-panel-close" @click=${this._closeZonePanel}>✕</button>
                  </span>
                </div>
                ${this._confirmZoneSort
                ? b `
                      <div class="depth-panel-confirm">
                        <strong>Reorder by date added?</strong>
                        <span>
                          Every bottle in ${this._zonePanelName} moves to a slot matching when
                          it was added. Any order you arranged by hand is lost. Slot 1 is the
                          most accessible position.
                        </span>
                        <span class="depth-panel-confirm-btns">
                          <button @click=${() => (this._confirmZoneSort = false)}>Cancel</button>
                          <button
                            title="Slot 1 holds the bottle that has been in this bin longest — for a bin you fill in a row"
                            @click=${() => this._sortZoneByDateAdded("oldest")}
                          >
                            Oldest first
                          </button>
                          <button
                            class="primary"
                            title="Slot 1 holds the bottle you added last — for a bin you stack, where the newest sits on top"
                            @click=${() => this._sortZoneByDateAdded("newest")}
                          >
                            Newest first
                          </button>
                        </span>
                      </div>
                    `
                : A}
                <div class="depth-panel-slots">
                  ${this._zonePanelType === "bulk"
                ? b `
                        <!-- Bulk mode: numbered slots, harmonized with Box mode -->
                        ${Array.from({ length: this._zonePanelCapacity }, (_, slotIdx) => {
                    const wine = this._zonePanelWines[slotIdx];
                    const typeColor = wine ? WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red : "";
                    const disp = wine?.disposition || "";
                    const dispClass = disp === "D" ? "drink" : disp === "H" ? "hold" : disp === "P" ? "past" : "";
                    const dragKey = `bulk-${slotIdx}`;
                    const highlighted = wine?.id === this._highlightWineId;
                    return b `
                            <div
                              id=${highlighted ? "highlight-slot" : A}
                              class="depth-slot ${wine ? "filled" : "empty"} ${this._zonePanelDragOverKey === dragKey ? "drag-over" : ""} ${highlighted ? "highlight" : ""}"
                              draggable=${wine ? "true" : "false"}
                              @click=${() => this._onZonePanelSlotClick(slotIdx, wine)}
                              @dragstart=${wine ? (e) => this._onZonePanelDragStart(e, wine) : A}
                              @dragend=${wine ? () => this._onZonePanelDragEnd() : A}
                              @dragover=${(e) => this._onZonePanelDragOver(e, dragKey)}
                              @dragleave=${() => (this._zonePanelDragOverKey = null)}
                              @drop=${(e) => this._onZonePanelBulkReorder(e, slotIdx)}
                            >
                              <span
                                class="depth-slot-delete"
                                title="Delete this slot"
                                @click=${(e) => { e.stopPropagation(); this._deleteZoneSlot(slotIdx); }}
                              >✕</span>
                              <div class="depth-slot-label">Slot ${slotIdx + 1}</div>
                              ${wine
                        ? b `
                                    <div class="depth-slot-wine" style="border-left: 4px solid ${typeColor}">
                                      <div class="depth-slot-avatar">
                                        ${wine.image_url
                            ? b `<img class="depth-slot-thumb" src="${wine.image_url}" alt="" />`
                            : b `<div class="depth-slot-dot" style="background: ${typeColor}"></div>`}
                                        ${dispClass ? b `<span class="depth-slot-disposition ${dispClass}">${disp}</span>` : A}
                                      </div>
                                      <div class="depth-slot-info">
                                        <div class="depth-slot-name">${wine.name}</div>
                                        <div class="depth-slot-meta">
                                          ${wine.vintage || "NV"}
                                          ${wine.rating ? b ` · ★${wine.rating}` : A}
                                          ${wine.price ? b ` · ${this._metadataCurrency} ${wine.price}` : A}
                                        </div>
                                      </div>
                                    </div>
                                  `
                        : b `
                                    <div class="depth-slot-empty">
                                      <span class="depth-slot-plus">+</span>
                                      <span>Empty</span>
                                    </div>
                                  `}
                            </div>
                          `;
                })}
                        <div class="depth-panel-grow" @click=${this._addBulkSlot}>
                          <span class="depth-slot-plus">+</span> Add Slot
                        </div>
                      `
                : b `
                        <!-- Box mode: slots grouped by box -->
                        ${(() => {
                    const boxes = this._zonePanelStorageRow?.boxes || [this._zonePanelCapacity];
                    let offset = 0;
                    return boxes.map((boxSize, bi) => {
                        const start = offset;
                        offset += boxSize;
                        return b `
                              ${boxes.length > 1
                            ? b `<div style="font-size:0.75em;font-weight:600;color:var(--wc-text-secondary);padding:8px 0 2px;${bi > 0 ? "border-top:1px solid var(--wc-border);margin-top:4px;" : ""}">
                                    Box ${bi + 1} (${boxSize}-pack)
                                  </div>`
                            : A}
                              ${Array.from({ length: boxSize }, (_, slotInBox) => {
                            const depthIdx = start + slotInBox;
                            const wine = this._zonePanelWines.find((w) => (w.depth || 0) === depthIdx);
                            const typeColor = wine ? WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red : "";
                            const disp = wine?.disposition || "";
                            const dispClass = disp === "D" ? "drink" : disp === "H" ? "hold" : disp === "P" ? "past" : "";
                            const dragKey = `box-${depthIdx}`;
                            const highlighted = wine?.id === this._highlightWineId;
                            return b `
                                  <div
                                    id=${highlighted ? "highlight-slot" : A}
                                    class="depth-slot ${wine ? "filled" : "empty"} ${this._zonePanelDragOverKey === dragKey ? "drag-over" : ""} ${highlighted ? "highlight" : ""}"
                                    draggable=${wine ? "true" : "false"}
                                    @click=${() => this._onZonePanelSlotClick(depthIdx, wine)}
                                    @dragstart=${wine ? (e) => this._onZonePanelDragStart(e, wine) : A}
                                    @dragend=${wine ? () => this._onZonePanelDragEnd() : A}
                                    @dragover=${(e) => this._onZonePanelDragOver(e, dragKey)}
                                    @dragleave=${() => (this._zonePanelDragOverKey = null)}
                                    @drop=${(e) => this._onZonePanelBoxReorder(e, depthIdx, wine)}
                                  >
                                    <span
                                      class="depth-slot-delete"
                                      title="Delete this slot"
                                      @click=${(e) => { e.stopPropagation(); this._deleteZoneSlot(depthIdx); }}
                                    >✕</span>
                                    <div class="depth-slot-label">Slot ${slotInBox + 1}</div>
                                    ${wine
                                ? b `
                                          <div class="depth-slot-wine" style="border-left: 4px solid ${typeColor}">
                                            <div class="depth-slot-avatar">
                                              ${wine.image_url
                                    ? b `<img class="depth-slot-thumb" src="${wine.image_url}" alt="" />`
                                    : b `<div class="depth-slot-dot" style="background: ${typeColor}"></div>`}
                                              ${dispClass ? b `<span class="depth-slot-disposition ${dispClass}">${disp}</span>` : A}
                                            </div>
                                            <div class="depth-slot-info">
                                              <div class="depth-slot-name">${wine.name}</div>
                                              <div class="depth-slot-meta">
                                                ${wine.vintage || "NV"}
                                                ${wine.rating ? b ` · ★${wine.rating}` : A}
                                                ${wine.price ? b ` · ${this._metadataCurrency} ${wine.price}` : A}
                                              </div>
                                            </div>
                                          </div>
                                        `
                                : b `
                                          <div class="depth-slot-empty">
                                            <span class="depth-slot-plus">+</span>
                                            <span>Empty</span>
                                          </div>
                                        `}
                                  </div>
                                `;
                        })}
                            `;
                    });
                })()}
                        <div class="depth-panel-add-box">
                          <select
                            .value=${String(this._zonePanelNewBoxSize)}
                            @change=${(e) => (this._zonePanelNewBoxSize = parseInt(e.target.value, 10))}
                          >
                            ${BOX_SIZES.map((s) => b `<option value=${s} ?selected=${s === this._zonePanelNewBoxSize}>${s}-pk</option>`)}
                          </select>
                          <div class="depth-panel-grow" @click=${this._addBoxSlot}>
                            <span class="depth-slot-plus">+</span> Add Box
                          </div>
                        </div>
                      `}
                </div>
              </div>
            `
            : A}

        <!-- Rack Panel (grid-slot cabinets: list + reorder), harmonized with Bulk/Box -->
        ${this._rackPanelOpen
            ? b `
              <div class="depth-panel-backdrop ${this._rackPanelDragWineId ? "drag-through" : ""}" @click=${this._closeRackPanel}></div>
              <div class="depth-panel open">
                <div class="depth-panel-header">
                  <span class="depth-panel-title">
                    ${this._rackPanelCabinet?.name}
                    <span class="depth-panel-subtitle">
                      ${this._rackPanelWines.length}/${this._getRackSlots().length} bottles
                    </span>
                  </span>
                  <button class="depth-panel-close" @click=${this._closeRackPanel}>✕</button>
                </div>
                <div class="depth-panel-slots">
                  ${this._getRackSlots().map(({ row, col }, slotIdx) => {
                const wines = this._rackPanelWines.filter((w) => w.row === row && w.col === col);
                const wine = wines.length > 0 ? wines.sort((a, b) => (a.depth || 0) - (b.depth || 0))[0] : undefined;
                const typeColor = wine ? WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red : "";
                const disp = wine?.disposition || "";
                const dispClass = disp === "D" ? "drink" : disp === "H" ? "hold" : disp === "P" ? "past" : "";
                const dragKey = `rack-${row}-${col}`;
                const highlighted = wines.some((w) => w.id === this._highlightWineId);
                return b `
                      <div
                        id=${highlighted ? "highlight-slot" : A}
                        class="depth-slot ${wine ? "filled" : "empty"} ${this._rackPanelDragOverKey === dragKey ? "drag-over" : ""} ${highlighted ? "highlight" : ""}"
                        draggable=${wine ? "true" : "false"}
                        @click=${() => this._onRackPanelSlotClick(row, col, wine)}
                        @dragstart=${wine ? (e) => this._onRackPanelDragStart(e, wine) : A}
                        @dragend=${wine ? () => this._onRackPanelDragEnd() : A}
                        @dragover=${(e) => this._onRackPanelDragOver(e, dragKey)}
                        @dragleave=${() => (this._rackPanelDragOverKey = null)}
                        @drop=${(e) => this._onRackPanelReorder(e, row, col, wine)}
                      >
                        ${this._isLastRackSlot(row, col)
                    ? b `
                              <span
                                class="depth-slot-delete"
                                title="Delete this slot"
                                @click=${(e) => { e.stopPropagation(); this._deleteRackSlot(row, col); }}
                              >✕</span>
                            `
                    : A}
                        <div class="depth-slot-label">Slot ${slotIdx + 1}</div>
                        ${wine
                    ? b `
                              <div class="depth-slot-wine" style="border-left: 4px solid ${typeColor}">
                                <div class="depth-slot-avatar">
                                  ${wine.image_url
                        ? b `<img class="depth-slot-thumb" src="${wine.image_url}" alt="" />`
                        : b `<div class="depth-slot-dot" style="background: ${typeColor}"></div>`}
                                  ${dispClass ? b `<span class="depth-slot-disposition ${dispClass}">${disp}</span>` : A}
                                </div>
                                <div class="depth-slot-info">
                                  <div class="depth-slot-name">${wine.name}</div>
                                  <div class="depth-slot-meta">
                                    ${wine.vintage || "NV"}
                                    ${wine.rating ? b ` · ★${wine.rating}` : A}
                                    ${wines.length > 1 ? b ` · ${wines.length} deep` : A}
                                  </div>
                                </div>
                              </div>
                            `
                    : b `
                              <div class="depth-slot-empty">
                                <span class="depth-slot-plus">+</span>
                                <span>Empty</span>
                              </div>
                            `}
                      </div>
                    `;
            })}
                  <div class="depth-panel-grow" @click=${this._addRackSlot}>
                    <span class="depth-slot-plus">+</span> Add Slot
                  </div>
                </div>
              </div>
            `
            : A}

        <!-- Toast -->
        ${this._toast ? b `<div class="toast">${this._toast}</div>` : A}
      </ha-card>
    `;
    }
    getCardSize() {
        return 6;
    }
};
WineCellarCard.styles = [
    sharedStyles,
    i$3 `
      :host {
        display: block;
      }

      ha-card {
        overflow: hidden;
      }

      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 16px 8px;
      }

      .title {
        font-size: 1.3em;
        font-weight: 600;
        color: var(--wc-text);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .title-icon {
        font-size: 1.2em;
      }

      .title-text {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .title-credit {
        font-size: 0.45em;
        font-weight: 400;
        color: var(--wc-text-secondary);
      }

      .header-actions {
        display: flex;
        gap: 4px;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .cabinets-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
        padding: 12px 16px 16px;
      }

      .wine-list {
        padding: 0 16px 16px;
      }

      .wine-list-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .wine-list-item:hover {
        background: var(--wc-hover);
      }

      .wine-list-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .wine-list-thumb {
        width: 36px;
        height: 48px;
        border-radius: 4px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .wine-list-info {
        flex: 1;
        min-width: 0;
      }

      .wine-list-name {
        font-weight: 500;
        font-size: 0.95em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wine-list-meta {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }

      .wine-list-location {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        text-align: right;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--wc-text-secondary);
      }

      .empty-state-icon {
        font-size: 3em;
        margin-bottom: 8px;
      }

      .loading {
        text-align: center;
        padding: 40px;
        color: var(--wc-text-secondary);
      }

      .copy-banner {
        background: rgba(46, 125, 50, 0.1);
        border: 1px solid rgba(46, 125, 50, 0.3);
        color: #2e7d32;
        font-size: 0.85em;
        padding: 6px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .copy-banner button {
        background: transparent;
        border: 1px solid rgba(46, 125, 50, 0.4);
        color: #2e7d32;
        border-radius: 6px;
        padding: 2px 10px;
        cursor: pointer;
        font-size: 0.9em;
      }

      .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: #fff;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 0.9em;
        z-index: 1000;
        animation: fadeIn 0.2s;
        pointer-events: none;
      }

      .buy-list-view {
        padding: 0 16px 16px;
      }

      .buy-list-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        margin-bottom: 8px;
        transition: background 0.2s;
      }

      .buy-list-card:hover {
        background: rgba(255, 255, 255, 0.04);
      }

      .bl-info {
        flex: 1;
        min-width: 0;
      }

      .bl-name {
        font-weight: 600;
        font-size: 0.9em;
        color: var(--wc-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .bl-meta {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-top: 2px;
      }

      .bl-actions {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
      }

      .bl-cellar-btn {
        background: #2e7d32;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 0.75em;
        padding: 4px 8px;
        cursor: pointer;
        white-space: nowrap;
      }

      .bl-cellar-btn:hover { background: #1b5e20; }

      .bl-remove-btn {
        background: #c62828;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 0.75em;
        padding: 4px 8px;
        cursor: pointer;
        white-space: nowrap;
      }

      .bl-remove-btn:hover { background: #b71c1c; }

      .buy-list-banner {
        background: rgba(230, 81, 0, 0.1);
        border: 1px solid rgba(230, 81, 0, 0.3);
        color: #e65100;
        font-size: 0.85em;
        padding: 6px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .buy-list-banner button {
        background: transparent;
        border: 1px solid rgba(230, 81, 0, 0.4);
        color: #e65100;
        border-radius: 6px;
        padding: 2px 10px;
        cursor: pointer;
        font-size: 0.9em;
      }

      /* The arrangement count is the only stat you can act on, and it is only
         there at all when the cellar has something to say. */
      .stat-action {
        cursor: pointer;
        border-radius: 6px;
        padding: 2px 8px;
        margin: -2px 0;
        border: 1px solid var(--wc-border);
        transition: all 0.15s;
      }

      .stat-action:hover {
        border-color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.08);
      }

      /* Phone: stack cabinets vertically */
      @media (max-width: 599px) {
        .header-row {
          padding: 12px 12px 6px;
        }
        .title {
          font-size: 1.1em;
        }
        .stats-bar {
          flex-wrap: wrap;
          gap: 8px;
          padding: 6px 12px;
          font-size: 0.8em;
        }
        .cabinets-row {
          grid-template-columns: 1fr;
          gap: 10px;
          padding: 8px 12px 12px;
        }
        .wine-list-item {
          padding: 8px;
          gap: 8px;
        }
        .btn-primary {
          padding: 6px 12px;
          font-size: 0.85em;
        }
      }

      /* Tablet: 2 cabinets side by side */
      @media (min-width: 600px) and (max-width: 1023px) {
        .cabinets-row {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
      }

      /* Desktop: all cabinets side by side */
      @media (min-width: 1024px) {
        .cabinets-row {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
      }
    `,
];
__decorate([
    n({ attribute: false })
], WineCellarCard.prototype, "hass", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_config", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_wines", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_cabinets", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_stats", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_activeTab", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_searchQuery", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_searchFilter", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_selectedWine", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_showDetail", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_detailMode", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_showAddDialog", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_addPreselect", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_loading", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_showRackSettings", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_copiedWine", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_movingWine", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_analyzing", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_batchVivino", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_vivinoSyncing", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_showBatchVivinoConfirm", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_showBatchAiConfirm", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_batchAiFallback", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_toast", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_hasGemini", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_hasVivinoAccount", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_vivinoMode", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_metadataLanguage", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_supportedLanguages", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_metadataCurrency", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_supportedCurrencies", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_aiFallbackAlways", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_showVivinoAiSettings", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_showWineList", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_showInventory", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_showArrangement", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_dismissedArrangements", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_buyList", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_addToBuyListMode", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_movingBuyListItem", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_depthPanelOpen", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_depthPanelCabinet", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_depthPanelRow", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_depthPanelCol", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_depthPanelWines", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_depthPanelMaxDepth", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zonePanelOpen", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zonePanelCabinet", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zonePanelZone", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zonePanelType", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zonePanelCapacity", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zonePanelName", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zonePanelWines", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zonePanelStorageRow", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zonePanelDragWineId", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zonePanelDragOverKey", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zonePanelNewBoxSize", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_rackPanelOpen", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_rackPanelCabinet", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_rackPanelWines", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_rackPanelDragWineId", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_rackPanelDragOverKey", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_highlightWineId", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_confirmZoneSort", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_zoneSorting", void 0);
WineCellarCard = __decorate([
    t("wine-cellar-card")
], WineCellarCard);
// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
    type: "wine-cellar-card",
    name: "Cork Dork",
    description: "Track your wine collection with visual cabinet layout",
    preview: true,
});

export { WineCellarCard };
//# sourceMappingURL=wine-cellar-card.js.map
