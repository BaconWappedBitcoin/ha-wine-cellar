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
    --wc-bg: var(--ha-card-background, var(--card-background-color, #fff));
    --wc-text: var(--primary-text-color, #212121);
    --wc-text-secondary: var(--secondary-text-color, #727272);
    --wc-border: var(--divider-color, #e0e0e0);
    --wc-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0, 0, 0, 0.1));
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
    background: rgba(114, 47, 55, 0.08);
  }

  .tab.active {
    background: var(--wc-primary);
    color: #fff;
    border-color: var(--wc-primary);
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
    color: var(--wc-primary);
    border: 1px solid var(--wc-primary);
  }

  .btn-outline:hover {
    background: rgba(114, 47, 55, 0.08);
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
    background: rgba(0, 0, 0, 0.06);
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
  }
`;

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

let CabinetGrid = class CabinetGrid extends i {
    constructor() {
        super(...arguments);
        this.wines = [];
    }
    _getWineAt(row, col) {
        return this.wines.find((w) => w.cabinet_id === this.cabinet.id && w.row === row && w.col === col);
    }
    _getStorageRowSet() {
        const rows = this.cabinet.storage_rows;
        return new Set((rows || []).map((sr) => sr.row));
    }
    _getStorageRowName(row) {
        const rows = this.cabinet.storage_rows;
        const sr = (rows || []).find((s) => s.row === row);
        return sr?.name || "Storage";
    }
    _getBottomZoneWines() {
        return this.wines.filter((w) => w.cabinet_id === this.cabinet.id && w.zone === "bottom");
    }
    _getStorageRowWines(row) {
        return this.wines.filter((w) => w.cabinet_id === this.cabinet.id && w.zone === `storage-${row}`);
    }
    _onCellClick(row, col, wine) {
        this.dispatchEvent(new CustomEvent("cell-click", {
            detail: {
                cabinet: this.cabinet,
                row,
                col,
                wine,
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
    _renderStorageZone(row) {
        const zoneName = this._getStorageRowName(row);
        const zoneId = `storage-${row}`;
        const wines = this._getStorageRowWines(row);
        return b `
      <div class="bottom-zone" @click=${() => this._onZoneClick(undefined, zoneId)}>
        <div class="bottom-zone-label">${zoneName}</div>
        ${wines.map((wine) => b `
            <div
              class="zone-bottle"
              style="background: ${WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red}"
              @click=${(e) => {
            e.stopPropagation();
            this._onZoneClick(wine, zoneId);
        }}
              title="${wine.name}"
            >
              ${(wine.vintage || "NV").toString().slice(-2)}
            </div>
          `)}
      </div>
    `;
    }
    _renderGridRow(row, cols) {
        return b `
      <div class="row">
        ${Array.from({ length: cols }, (_, col) => {
            const wine = this._getWineAt(row, col);
            const bgColor = wine
                ? WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red
                : "transparent";
            const disp = wine?.disposition || "";
            const dispClass = disp === "D" ? "drink" : disp === "H" ? "hold" : disp === "P" ? "past" : "";
            const ratingDisplay = wine?.rating ? wine.rating.toFixed(1) : "";
            return b `
            <div
              class="cell ${wine ? "filled" : "empty"}"
              style=${wine ? `background: ${bgColor}` : ""}
              @click=${() => this._onCellClick(row, col, wine)}
              title=${wine ? `${wine.name} (${wine.vintage || "NV"})${wine.rating ? ` ★${wine.rating}` : ""}` : `Empty - Row ${row + 1}, Col ${col + 1}`}
            >
              ${wine
                ? b `
                    ${wine.image_url ? b `<img class="wine-thumb" src="${wine.image_url}" alt="" />` : A}
                    <span class="bottle-label">${wine.vintage || "NV"}</span>
                    ${dispClass ? b `<span class="disposition ${dispClass}">${disp}</span>` : A}
                    ${ratingDisplay ? b `<span class="rating-badge">★${ratingDisplay}</span>` : A}
                  `
                : A}
            </div>
          `;
        })}
      </div>
    `;
    }
    render() {
        const { rows, cols } = this.cabinet;
        const storageRows = this._getStorageRowSet();
        return b `
      <div class="cabinet">
        <div class="cabinet-name">${this.cabinet.name}</div>
        <div class="grid-inner">
          ${Array.from({ length: rows }, (_, row) => storageRows.has(row)
            ? this._renderStorageZone(row)
            : this._renderGridRow(row, cols))}
        </div>
        ${this.cabinet.has_bottom_zone
            ? b `
              <div class="bottom-zone" @click=${() => this._onZoneClick()}>
                <div class="bottom-zone-label">
                  ${this.cabinet.bottom_zone_name}
                </div>
                ${this._getBottomZoneWines().map((wine) => b `
                    <div
                      class="zone-bottle"
                      style="background: ${WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red}"
                      @click=${(e) => {
                e.stopPropagation();
                this._onZoneClick(wine);
            }}
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
        border: 1px solid rgba(255, 255, 255, 0.1);
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

      .cell .disposition {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 11px;
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

      .cell .disposition.drink {
        background: #2e7d32;
      }

      .cell .disposition.hold {
        background: #1565c0;
      }

      .cell .disposition.past {
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

      .zone-bottle:hover {
        transform: scale(1.1);
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
CabinetGrid = __decorate([
    t("cabinet-grid")
], CabinetGrid);

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

let WineDetailDialog = class WineDetailDialog extends i {
    constructor() {
        super(...arguments);
        this.wine = null;
        this.open = false;
        this._editing = false;
        this._userRating = 0;
        this._tastingNotes = { aroma: "", taste: "", finish: "", overall: "" };
        this._saving = false;
    }
    updated(changedProps) {
        if (changedProps.has("wine") && this.wine) {
            this._userRating = this.wine.user_rating ?? 0;
            this._tastingNotes = this.wine.tasting_notes
                ? { ...this.wine.tasting_notes }
                : { aroma: "", taste: "", finish: "", overall: "" };
            this._editing = false;
        }
    }
    _close() {
        this.open = false;
        this._editing = false;
        this.dispatchEvent(new CustomEvent("close"));
    }
    _onRemove() {
        if (this.wine) {
            this.dispatchEvent(new CustomEvent("remove-wine", {
                detail: { wine_id: this.wine.id },
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
    async _save() {
        if (!this.wine || !this.hass)
            return;
        this._saving = true;
        try {
            const updates = {
                user_rating: this._userRating || null,
                tasting_notes: this._hasTastingNotes() ? this._tastingNotes : null,
            };
            await this.hass.callWS({
                type: "wine_cellar/update_wine",
                wine_id: this.wine.id,
                updates,
            });
            // Update local wine object
            this.wine = { ...this.wine, ...updates };
            this._editing = false;
            this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
        }
        catch (err) {
            console.error("Failed to save rating/notes", err);
        }
        this._saving = false;
    }
    _hasTastingNotes() {
        const n = this._tastingNotes;
        return !!(n.aroma || n.taste || n.finish || n.overall);
    }
    render() {
        if (!this.open || !this.wine)
            return A;
        const wine = this.wine;
        const typeColor = WINE_TYPE_COLORS[wine.type] || WINE_TYPE_COLORS.red;
        const typeLabel = WINE_TYPE_LABELS[wine.type] || wine.type;
        return b `
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" @click=${(e) => e.stopPropagation()}>
          <div class="wine-header">
            ${wine.image_url
            ? b `<img class="wine-image" src="${wine.image_url}" alt="${wine.name}" />`
            : b `
                  <div class="wine-image-placeholder" style="background: ${typeColor}">
                    🍷
                  </div>
                `}
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
            </div>
          </div>

          <!-- Drink by banner for disposition wines -->
          ${wine.disposition && wine.drink_by
            ? b `
                <div class="drink-by-banner ${wine.disposition === 'D' ? 'drink' : wine.disposition === 'H' ? 'hold' : wine.disposition === 'P' ? 'past' : ''}">
                  ${wine.disposition === "D" ? "Ready to drink" : wine.disposition === "H" ? "Hold until" : "Past peak since"}
                  ${wine.drink_by}
                </div>
              `
            : wine.disposition === "H" && !wine.drink_by
                ? b `<div class="drink-by-banner hold">Hold — no drink date set</div>`
                : A}

          <!-- Description -->
          ${wine.description
            ? b `<div class="wine-description">${wine.description}</div>`
            : A}

          <!-- Info chips (food, alcohol, etc.) -->
          ${wine.food_pairings || wine.alcohol
            ? b `
                <div class="info-chips">
                  ${wine.alcohol
                ? b `<span class="info-chip"><span class="info-chip-icon">%</span> ${wine.alcohol}</span>`
                : A}
                  ${wine.food_pairings
                ? wine.food_pairings.split(", ").map((food) => b `<span class="info-chip">${food}</span>`)
                : A}
                </div>
              `
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
            ? b `<div class="detail-item"><span class="detail-label">Price</span><span class="detail-value">$${wine.price.toFixed(2)}</span></div>`
            : A}
            ${wine.purchase_date
            ? b `<div class="detail-item"><span class="detail-label">Purchased</span><span class="detail-value">${wine.purchase_date}</span></div>`
            : A}
            ${wine.drink_by
            ? b `<div class="detail-item"><span class="detail-label">Drink By</span><span class="detail-value">${wine.drink_by}</span></div>`
            : A}
            ${wine.barcode
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

          <div class="divider"></div>

          <!-- My Rating section -->
          <div class="section">
            <div class="section-header">
              <span class="section-title">My Rating</span>
              <button class="edit-toggle" @click=${() => (this._editing = !this._editing)}>
                ${this._editing ? "Cancel" : "Edit"}
              </button>
            </div>
            <div class="rating-row">
              <star-rating
                .value=${this._userRating}
                .readonly=${!this._editing}
                .size=${28}
                @rating-change=${this._onRatingChange}
              ></star-rating>
              ${!this._editing && this._userRating === 0
            ? b `<span class="no-rating">Not rated</span>`
            : A}
            </div>
          </div>

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
                      @click=${this._save}
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

          <div class="actions">
            <button class="btn btn-outline" @click=${this._onCopy}>
              📋 Copy
            </button>
            <button class="btn btn-outline" @click=${this._onMove}>
              ↔ Move
            </button>
            <button
              class="btn btn-outline"
              style="color: #c62828; border-color: #c62828"
              @click=${this._onRemove}
            >
              ✕ Remove
            </button>
            <span style="flex:1"></span>
            <button class="btn btn-primary" @click=${this._close}>
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    }
};
WineDetailDialog.styles = [
    sharedStyles,
    i$3 `
      .wine-header {
        display: flex;
        gap: 16px;
        padding: 20px;
      }

      .wine-image {
        width: 90px;
        height: 130px;
        border-radius: 8px;
        object-fit: cover;
        background: #f0f0f0;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .wine-image-placeholder {
        width: 90px;
        height: 130px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2em;
        flex-shrink: 0;
        color: #fff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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
        background: rgba(0, 0, 0, 0.03);
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
        color: var(--wc-primary, #6d4c41);
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
        border-color: var(--wc-primary, #6d4c41);
      }

      .tasting-value {
        font-size: 0.85em;
        color: var(--wc-text);
        background: rgba(0, 0, 0, 0.03);
        padding: 8px;
        border-radius: 8px;
        min-height: 20px;
      }

      .divider {
        height: 1px;
        background: var(--wc-border, #e0e0e0);
        margin: 0 20px 16px;
      }

      .actions {
        display: flex;
        gap: 8px;
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
    n({ type: Boolean })
], WineDetailDialog.prototype, "open", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_editing", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_userRating", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_tastingNotes", void 0);
__decorate([
    r()
], WineDetailDialog.prototype, "_saving", void 0);
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
            const msg = err?.message || String(err);
            if (msg.includes("NotAllowed") || msg.includes("Permission")) {
                this._error = "Camera access denied. Please allow camera access in your browser settings.";
            }
            else if (msg.includes("NotFound") || msg.includes("no camera")) {
                this._error = "No camera found on this device.";
            }
            else {
                this._error = `Camera error: ${msg}`;
            }
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
            const msg = err?.message || String(err);
            if (msg.includes("NotAllowed") || msg.includes("Permission")) {
                this._error = "Camera access denied. Use the upload button below instead.";
            }
            else {
                this._error = "Could not access camera. Use the upload button below instead.";
            }
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
            ? b `<div class="error-message">${this._error}</div>`
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
          📁 Upload from gallery
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

let AddWineDialog = class AddWineDialog extends i {
    constructor() {
        super(...arguments);
        this.open = false;
        this.cabinets = [];
        this.preselectedCabinet = "";
        this.preselectedRow = null;
        this.preselectedCol = null;
        this.preselectedZone = "";
        this._step = "scan";
        this._scanMode = "idle";
        this._barcode = "";
        this._loading = false;
        this._lookupResult = null;
        this._wineData = {};
        this._error = "";
        this._hasGemini = false;
        this._labelLoading = false;
        this._steps = ["scan", "details", "location", "confirm"];
    }
    /** Resize a base64 JPEG to a small thumbnail for storage */
    _resizeImageForStorage(base64, maxDim = 200, quality = 0.6) {
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
    updated(changedProps) {
        if (changedProps.has("open")) {
            if (this.open) {
                this._step = "scan";
                this._scanMode = "idle";
                this._barcode = "";
                this._lookupResult = null;
                this._error = "";
                this._loading = false;
                this._labelLoading = false;
                this._wineData = {
                    name: "",
                    winery: "",
                    type: "red",
                    vintage: null,
                    region: "",
                    country: "",
                    grape_variety: "",
                    price: null,
                    notes: "",
                    user_rating: null,
                    tasting_notes: null,
                    cabinet_id: this.preselectedCabinet || "",
                    row: this.preselectedRow,
                    col: this.preselectedCol,
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
        this._loading = true;
        this._error = "";
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/lookup_barcode",
                barcode: this._barcode.trim(),
            });
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
                };
                this._step = "details";
            }
            else {
                this._error = "No results found. You can enter details manually.";
                this._wineData = { ...this._wineData, barcode: this._barcode.trim() };
            }
        }
        catch (err) {
            this._error = "Lookup failed. You can enter details manually.";
        }
        this._loading = false;
    }
    async _searchWine() {
        const input = this.shadowRoot?.querySelector(".search-input");
        if (!input?.value.trim())
            return;
        this._loading = true;
        this._error = "";
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/search_wine",
                query: input.value.trim(),
            });
            if (result.results && result.results.length > 0) {
                const first = result.results[0];
                this._lookupResult = first;
                this._wineData = {
                    ...this._wineData,
                    name: first.name || "",
                    winery: first.winery || "",
                    type: first.type || "red",
                    vintage: first.vintage,
                    region: first.region || "",
                    country: first.country || "",
                    grape_variety: first.grape_variety || "",
                    rating: first.rating,
                    ratings_count: first.ratings_count || null,
                    image_url: first.image_url || "",
                    description: first.description || "",
                    food_pairings: first.food_pairings || "",
                    alcohol: first.alcohol || "",
                };
                this._step = "details";
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
    _onBarcodeDetected(e) {
        this._barcode = e.detail.barcode;
        this._scanMode = "idle";
        this._lookupBarcode();
    }
    async _onPhotoCaptured(e) {
        this._labelLoading = true;
        this._error = "";
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/recognize_label",
                image: e.detail.image,
            });
            if (result.result) {
                // Resize captured photo to thumbnail for storage
                const thumbUrl = await this._resizeImageForStorage(e.detail.image);
                this._wineData = {
                    ...this._wineData,
                    name: result.result.name || "",
                    winery: result.result.winery || "",
                    type: result.result.type || "red",
                    vintage: result.result.vintage,
                    region: result.result.region || "",
                    country: result.result.country || "",
                    grape_variety: result.result.grape_variety || "",
                    drink_by: result.result.drink_by || "",
                    notes: result.result.notes || "",
                    image_url: thumbUrl,
                };
                this._scanMode = "idle";
                this._step = "details";
            }
            else {
                // Show specific error from backend if available
                const errorDetail = result.error || "Unknown error";
                this._error = `Label recognition failed: ${errorDetail}`;
                console.error("Wine Cellar: label recognition failed:", errorDetail);
            }
        }
        catch (err) {
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
    async _addWine() {
        this._loading = true;
        try {
            await this.hass.callWS({
                type: "wine_cellar/add_wine",
                wine: this._wineData,
            });
            this.dispatchEvent(new CustomEvent("wine-added", { bubbles: true, composed: true }));
            this._close();
        }
        catch (err) {
            this._error = "Failed to add wine.";
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
                : b `
                <label-camera
                  .active=${true}
                  @photo-captured=${this._onPhotoCaptured}
                ></label-camera>
              `}
          ${this._error ? b `<div class="error-msg">${this._error}</div>` : A}
          <div class="camera-actions">
            <button class="btn btn-outline" @click=${() => { this._scanMode = "idle"; this._error = ""; this._labelLoading = false; }}>Cancel</button>
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
            Search
          </button>
        </div>

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
              .value=${this._wineData.type || "red"}
              @change=${(e) => this._updateField("type", e.target.value)}
            >
              ${Object.entries(WINE_TYPE_LABELS).map(([value, label]) => b `<option value=${value}>${label}</option>`)}
            </select>
          </div>
          <div class="form-group">
            <label>Price</label>
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
            <label>Region</label>
            <input
              type="text"
              .value=${this._wineData.region || ""}
              @input=${(e) => this._updateField("region", e.target.value)}
            />
          </div>
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
        <button
          class="btn btn-primary"
          @click=${() => this._goToStep("location")}
          ?disabled=${!this._wineData.name}
        >
          Next →
        </button>
      </div>
    `;
    }
    _renderLocationStep() {
        return b `
      <div class="dialog-body">
        <div style="font-weight: 500; margin-bottom: 8px">Choose Location</div>
        <div style="font-size: 0.85em; color: var(--wc-text-secondary); margin-bottom: 12px">
          Select a cabinet and position for this bottle
        </div>

        <div class="location-grid">
          ${this.cabinets.map((cab) => b `
              <div
                class="location-cabinet ${this._wineData.cabinet_id === cab.id ? "selected" : ""}"
                @click=${() => this._updateField("cabinet_id", cab.id)}
              >
                <div class="cab-name">${cab.name}</div>
                <div class="cab-info">${cab.rows}×${cab.cols} slots</div>
              </div>
            `)}
        </div>

        ${this._wineData.cabinet_id
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
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => this._goToStep("details")}>
          ← Back
        </button>
        <button class="btn btn-primary" @click=${() => this._goToStep("confirm")}>
          Next →
        </button>
      </div>
    `;
    }
    _renderConfirmStep() {
        const cabinetName = this.cabinets.find((c) => c.id === this._wineData.cabinet_id)?.name ||
            "Unassigned";
        const posLabel = this._wineData.row != null && this._wineData.col != null
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
          <div class="summary-row">
            <span class="summary-label">Cabinet</span>
            <span class="summary-value">${cabinetName}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Position</span>
            <span class="summary-value">${posLabel}</span>
          </div>
          ${this._wineData.user_rating
            ? b `
                <div class="summary-row">
                  <span class="summary-label">My Rating</span>
                  <span class="summary-value">${this._wineData.user_rating}/5</span>
                </div>
              `
            : A}
        </div>

        ${this._error
            ? b `<div class="error-msg">${this._error}</div>`
            : A}
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => this._goToStep("location")}>
          ← Back
        </button>
        <button class="btn btn-primary" @click=${this._addWine}>
          ${this._loading
            ? b `<span class="loading-spinner"></span>`
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
          <div class="dialog-header">Add Wine</div>
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
        border: 2px solid var(--wc-border);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        background: transparent;
        color: var(--wc-text);
        text-align: left;
        font-size: 0.95em;
        width: 100%;
      }

      .scan-option:hover {
        border-color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.05);
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

      .confirm-summary {
        background: rgba(0, 0, 0, 0.03);
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
AddWineDialog = __decorate([
    t("add-wine-dialog")
], AddWineDialog);

let WineSearchBar = class WineSearchBar extends i {
    constructor() {
        super(...arguments);
        this.value = "";
        this._filter = "all";
    }
    _onInput(e) {
        const value = e.target.value;
        this.dispatchEvent(new CustomEvent("search-change", {
            detail: { query: value, filter: this._filter },
            bubbles: true,
            composed: true,
        }));
    }
    _onFilterChange(filter) {
        this._filter = filter;
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
            type="text"
            placeholder="Search wines..."
            .value=${this.value}
            @input=${this._onInput}
          />
        </div>
        <div class="filter-chips">
          ${filters.map((f) => b `
              <button
                class="chip ${this._filter === f.id ? "active" : ""}"
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

      .search-container {
        display: flex;
        gap: 8px;
        padding: 0 16px 8px;
        align-items: center;
      }

      .search-input-wrapper {
        flex: 1;
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
        padding: 8px 12px 8px 32px;
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

      .filter-chips {
        display: flex;
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
    r()
], WineSearchBar.prototype, "_filter", void 0);
WineSearchBar = __decorate([
    t("wine-search-bar")
], WineSearchBar);

let RackSettingsDialog = class RackSettingsDialog extends i {
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
    _winesOutOfBounds(cabinetId, newRows, newCols) {
        return this.wines.filter((w) => w.cabinet_id === cabinetId &&
            w.row != null &&
            w.col != null &&
            (w.row >= newRows || w.col >= newCols)).length;
    }
    _startAdd() {
        this._mode = "add";
        this._error = "";
        this._editCabinet = {
            name: "",
            rows: 8,
            cols: 8,
            has_bottom_zone: false,
            bottom_zone_name: "",
        };
        this._editStorageRows = [];
    }
    _startEdit(cabinet) {
        this._mode = "edit";
        this._error = "";
        this._editCabinet = { ...cabinet };
        // Initialize storage rows from cabinet data
        this._editStorageRows = [...(cabinet.storage_rows || [])];
    }
    _startDelete(cabinet) {
        this._mode = "delete-confirm";
        this._error = "";
        this._deleteCabinet = cabinet;
    }
    _toggleStorageRow(row) {
        const existing = this._editStorageRows.find((sr) => sr.row === row);
        if (existing) {
            this._editStorageRows = this._editStorageRows.filter((sr) => sr.row !== row);
        }
        else {
            this._editStorageRows = [...this._editStorageRows, { row, name: "Storage" }];
        }
    }
    _updateStorageRowName(row, name) {
        this._editStorageRows = this._editStorageRows.map((sr) => sr.row === row ? { ...sr, name } : sr);
    }
    _isStorageRow(row) {
        return this._editStorageRows.some((sr) => sr.row === row);
    }
    async _saveAdd() {
        this._loading = true;
        this._error = "";
        try {
            await this.hass.callWS({
                type: "wine_cellar/add_cabinet",
                cabinet: {
                    name: this._editCabinet.name || "New Rack",
                    rows: this._editCabinet.rows || 8,
                    cols: this._editCabinet.cols || 8,
                    has_bottom_zone: false,
                    bottom_zone_name: "",
                    storage_rows: this._editStorageRows,
                    order: this.cabinets.length,
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
            const newRows = this._editCabinet.rows || 8;
            const newCols = this._editCabinet.cols || 8;
            // Filter out storage rows beyond the new row count
            const validStorageRows = this._editStorageRows.filter((sr) => sr.row < newRows);
            await this.hass.callWS({
                type: "wine_cellar/update_cabinet",
                cabinet_id: cabinetId,
                updates: {
                    name: this._editCabinet.name,
                    rows: newRows,
                    cols: newCols,
                    has_bottom_zone: false,
                    bottom_zone_name: "",
                    storage_rows: validStorageRows,
                },
            });
            // Unassign wines that are out of bounds or on rows that became storage
            const outOfBounds = this.wines.filter((w) => w.cabinet_id === cabinetId &&
                w.row != null &&
                w.col != null &&
                (w.row >= newRows || w.col >= newCols || validStorageRows.some((sr) => sr.row === w.row)));
            for (const wine of outOfBounds) {
                await this.hass.callWS({
                    type: "wine_cellar/update_wine",
                    wine_id: wine.id,
                    updates: { cabinet_id: "", row: null, col: null, zone: "" },
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
    async _moveDown(cabinet) {
        const sorted = [...this.cabinets].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((c) => c.id === cabinet.id);
        if (idx < 0 || idx >= sorted.length - 1)
            return;
        const next = sorted[idx + 1];
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
    _renderList() {
        const sorted = [...this.cabinets].sort((a, b) => a.order - b.order);
        return b `
      <div class="dialog-body">
        <div class="rack-list">
          ${sorted.map((cab, idx) => {
            const storageCount = (cab.storage_rows || []).length;
            cab.rows - storageCount;
            return b `
                <div class="rack-item">
                  <div class="rack-info">
                    <div class="rack-name">${cab.name}</div>
                    <div class="rack-meta">
                      ${cab.rows} rows × ${cab.cols} cols
                      · ${this._winesInCabinet(cab.id)} bottles
                      ${storageCount > 0 ? ` · ${storageCount} storage row${storageCount > 1 ? "s" : ""}` : ""}
                      ${cab.has_bottom_zone ? " · + bottom zone" : ""}
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
        const numRows = this._editCabinet.rows || 8;
        // Calculate out-of-bounds warning for edits
        let oobCount = 0;
        if (isEdit && this._editCabinet.id) {
            const orig = this.cabinets.find((c) => c.id === this._editCabinet.id);
            if (orig) {
                const newRows = this._editCabinet.rows || orig.rows;
                const newCols = this._editCabinet.cols || orig.cols;
                if (newRows < orig.rows || newCols < orig.cols) {
                    oobCount = this._winesOutOfBounds(this._editCabinet.id, newRows, newCols);
                }
            }
        }
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

        <div class="form-row">
          <div class="form-group">
            <label>Rows</label>
            <input
              type="number"
              min="1"
              max="20"
              .value=${(this._editCabinet.rows || 8).toString()}
              @input=${(e) => {
            const newRows = parseInt(e.target.value) || 1;
            this._editCabinet = { ...this._editCabinet, rows: newRows };
            // Remove storage rows that are beyond the new row count
            this._editStorageRows = this._editStorageRows.filter((sr) => sr.row < newRows);
        }}
            />
          </div>
          <div class="form-group">
            <label>Columns</label>
            <input
              type="number"
              min="1"
              max="20"
              .value=${(this._editCabinet.cols || 8).toString()}
              @input=${(e) => (this._editCabinet = {
            ...this._editCabinet,
            cols: parseInt(e.target.value) || 1,
        })}
            />
          </div>
        </div>

        <!-- Row layout editor -->
        <div class="row-layout">
          <div class="row-layout-title">Row Layout</div>
          <div class="row-layout-hint">Tap a row to toggle between bottle slots and storage zone</div>
          <div class="row-layout-list">
            ${Array.from({ length: numRows }, (_, row) => {
            const isStorage = this._isStorageRow(row);
            const sr = this._editStorageRows.find((s) => s.row === row);
            return b `
                <div class="row-entry ${isStorage ? "storage" : ""}">
                  <span class="row-num">R${row + 1}</span>
                  <span class="row-type ${isStorage ? "is-storage" : ""}">
                    ${isStorage ? "Storage" : `${this._editCabinet.cols || 8} slots`}
                  </span>
                  ${isStorage
                ? b `
                        <input
                          type="text"
                          .value=${sr?.name || "Storage"}
                          @input=${(e) => this._updateStorageRowName(row, e.target.value)}
                          @click=${(e) => e.stopPropagation()}
                          placeholder="Zone name"
                        />
                      `
                : A}
                  <button
                    class="toggle-btn"
                    @click=${() => this._toggleStorageRow(row)}
                  >
                    ${isStorage ? "→ Slots" : "→ Storage"}
                  </button>
                </div>
              `;
        })}
          </div>
        </div>

        ${oobCount > 0
            ? b `
              <div class="warning-msg">
                Shrinking will unassign ${oobCount} wine${oobCount > 1 ? "s" : ""} that are outside the new grid bounds.
              </div>
            `
            : A}

        ${this._error
            ? b `<div class="error-msg" style="color:#c62828;margin-top:8px">${this._error}</div>`
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
            ? b `<div style="color:#c62828;font-size:0.85em">${this._error}</div>`
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
        background: rgba(0, 0, 0, 0.03);
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
        background: rgba(0, 0, 0, 0.06);
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

      /* Row layout editor */
      .row-layout {
        margin-top: 12px;
      }

      .row-layout-title {
        font-size: 0.85em;
        font-weight: 600;
        color: var(--wc-text);
        margin-bottom: 8px;
      }

      .row-layout-hint {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        margin-bottom: 8px;
      }

      .row-layout-list {
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
        background: rgba(0, 0, 0, 0.04);
      }

      .row-entry.storage {
        background: rgba(139, 105, 20, 0.1);
        border: 1px solid rgba(139, 105, 20, 0.3);
      }

      .row-entry .row-num {
        width: 32px;
        font-weight: 600;
        color: var(--wc-text-secondary);
        font-size: 0.85em;
      }

      .row-entry .row-type {
        flex: 1;
        font-size: 0.85em;
      }

      .row-entry .row-type.is-storage {
        color: #8b6914;
        font-weight: 600;
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

      .row-entry .toggle-btn {
        background: transparent;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 0.75em;
        cursor: pointer;
        color: var(--wc-text-secondary);
        transition: all 0.15s;
        white-space: nowrap;
      }

      .row-entry .toggle-btn:hover {
        background: rgba(0, 0, 0, 0.06);
      }

      .row-entry.storage .toggle-btn {
        color: #8b6914;
        border-color: rgba(139, 105, 20, 0.4);
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
RackSettingsDialog = __decorate([
    t("rack-settings-dialog")
], RackSettingsDialog);

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
        this._showAddDialog = false;
        this._addPreselect = { cabinet: "", row: null, col: null, zone: "" };
        this._loading = true;
        this._showRackSettings = false;
        this._copiedWine = null;
        this._analyzing = false;
        this._toast = "";
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
    }
    updated(changedProps) {
        if (changedProps.has("hass") && this.hass) ;
    }
    async _loadData() {
        if (!this.hass) {
            // Retry after hass is set
            setTimeout(() => this._loadData(), 500);
            return;
        }
        this._loading = true;
        try {
            const [winesResult, cabinetsResult, statsResult] = await Promise.all([
                this.hass.callWS({ type: "wine_cellar/get_wines" }),
                this.hass.callWS({ type: "wine_cellar/get_cabinets" }),
                this.hass.callWS({ type: "wine_cellar/get_stats" }),
            ]);
            this._wines = winesResult.wines || [];
            this._cabinets = (cabinetsResult.cabinets || []).sort((a, b) => a.order - b.order);
            this._stats = statsResult;
        }
        catch (err) {
            console.error("Wine Cellar: Failed to load data", err);
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
        // Filter by search query
        if (this._searchQuery) {
            const q = this._searchQuery.toLowerCase();
            wines = wines.filter((w) => w.name.toLowerCase().includes(q) ||
                w.winery.toLowerCase().includes(q) ||
                w.region.toLowerCase().includes(q) ||
                w.grape_variety.toLowerCase().includes(q));
        }
        return wines;
    }
    _showToast(message) {
        this._toast = message;
        setTimeout(() => (this._toast = ""), 2500);
    }
    // --- Copy/Paste wine ---
    _onCellClick(e) {
        const { wine, cabinet, row, col } = e.detail;
        // If we have a copied wine and clicked an empty cell, paste it
        if (this._copiedWine && !wine) {
            this._pasteWine(cabinet.id, row, col);
            return;
        }
        if (wine) {
            this._selectedWine = wine;
            this._showDetail = true;
        }
        else {
            this._addPreselect = { cabinet: cabinet.id, row, col, zone: "" };
            this._showAddDialog = true;
        }
    }
    _onZoneClick(e) {
        const { wine, cabinet, zone } = e.detail;
        if (wine) {
            this._selectedWine = wine;
            this._showDetail = true;
        }
        else {
            this._addPreselect = { cabinet: cabinet.id, row: null, col: null, zone: zone || "bottom" };
            this._showAddDialog = true;
        }
    }
    _copyWine(wine) {
        this._copiedWine = wine;
        this._showToast(`Copied "${wine.name}" — tap empty cells to paste`);
        this._showDetail = false;
    }
    async _pasteWine(cabinetId, row, col) {
        if (!this._copiedWine)
            return;
        try {
            await this.hass.callWS({
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
                    price: this._copiedWine.price,
                    drink_by: this._copiedWine.drink_by,
                    notes: this._copiedWine.notes,
                    description: this._copiedWine.description,
                    food_pairings: this._copiedWine.food_pairings,
                    alcohol: this._copiedWine.alcohol,
                    ratings_count: this._copiedWine.ratings_count,
                    cabinet_id: cabinetId,
                    row,
                    col,
                    zone: "",
                    user_rating: this._copiedWine.user_rating,
                    disposition: this._copiedWine.disposition,
                },
            });
            this._showToast("Wine pasted! Tap more empty cells or click ✕ to stop.");
            await this._loadData();
        }
        catch {
            this._showToast("Failed to paste wine.");
        }
    }
    // --- AI Analysis ---
    async _analyzeWines() {
        this._analyzing = true;
        this._showToast("Analyzing wines with AI...");
        try {
            const result = await this.hass.callWS({
                type: "wine_cellar/analyze_wines",
            });
            if (result.error) {
                this._showToast(`Analysis failed: ${result.error}`);
            }
            else {
                this._showToast(`Analysis complete! ${result.updated}/${result.total} wines updated.`);
                await this._loadData();
            }
        }
        catch (err) {
            this._showToast("Analysis failed.");
        }
        this._analyzing = false;
    }
    async _onRemoveWine(e) {
        try {
            await this.hass.callWS({
                type: "wine_cellar/remove_wine",
                wine_id: e.detail.wine_id,
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
    render() {
        if (this._loading) {
            return b `
        <ha-card>
          <div class="loading">Loading wine cellar...</div>
        </ha-card>
      `;
        }
        const title = this._config?.title || "Wine Cellar";
        const filteredWines = this._getFilteredWines();
        const isSearching = !!(this._searchQuery || this._searchFilter !== "all");
        const showGrid = !isSearching && (this._activeTab === "all" || this._cabinets.some((c) => c.id === this._activeTab));
        return b `
      <ha-card>
        <div class="header-row">
          <div class="title">
            <span class="title-icon">🍷</span>
            ${title}
          </div>
          <div class="header-actions">
            <button
              class="btn btn-primary"
              style="font-size: 0.85em; padding: 6px 14px; background: #1565c0;"
              @click=${this._analyzeWines}
              title="AI Drink/Hold Analysis"
              ?disabled=${this._analyzing}
            >
              ${this._analyzing ? "Analyzing..." : "AI Scan"}
            </button>
            <button
              class="btn btn-icon"
              @click=${() => (this._showRackSettings = true)}
              title="Manage Racks"
            >
              ⚙️
            </button>
            <button
              class="btn btn-primary"
              @click=${() => {
            this._addPreselect = { cabinet: "", row: null, col: null, zone: "" };
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
                <span>📋 Copying "${this._copiedWine.name}" — tap empty cells to place copies</span>
                <button @click=${() => (this._copiedWine = null)}>✕ Done</button>
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
                ${this._stats.total_value
                ? b `
                      <div class="stat">
                        <span class="stat-value">$${this._stats.total_value.toLocaleString()}</span>
                        value
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
        </div>

        <!-- Search bar -->
        <wine-search-bar @search-change=${this._onSearch}></wine-search-bar>

        <!-- Cabinet grids -->
        ${showGrid
            ? b `
              <div class="cabinets-row">
                ${this._activeTab === "all"
                ? this._cabinets.map((cab) => b `
                        <cabinet-grid
                          .cabinet=${cab}
                          .wines=${this._getCabinetWines(cab.id)}
                          @cell-click=${this._onCellClick}
                          @zone-click=${this._onZoneClick}
                        ></cabinet-grid>
                      `)
                : this._cabinets
                    .filter((c) => c.id === this._activeTab)
                    .map((cab) => b `
                          <cabinet-grid
                            .cabinet=${cab}
                            .wines=${this._getCabinetWines(cab.id)}
                            @cell-click=${this._onCellClick}
                            @zone-click=${this._onZoneClick}
                          ></cabinet-grid>
                        `)}
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

        <!-- Wine Detail Dialog -->
        <wine-detail-dialog
          .wine=${this._selectedWine}
          .hass=${this.hass}
          .open=${this._showDetail}
          @close=${() => (this._showDetail = false)}
          @remove-wine=${this._onRemoveWine}
          @wine-updated=${() => this._loadData()}
          @copy-wine=${(e) => this._copyWine(e.detail.wine)}
          @move-wine=${(e) => {
            this._showDetail = false;
            this._addPreselect = { cabinet: "", row: null, col: null, zone: "" };
            // TODO: implement move flow
        }}
        ></wine-detail-dialog>

        <!-- Add Wine Dialog -->
        <add-wine-dialog
          .open=${this._showAddDialog}
          .hass=${this.hass}
          .cabinets=${this._cabinets}
          .preselectedCabinet=${this._addPreselect.cabinet}
          .preselectedRow=${this._addPreselect.row}
          .preselectedCol=${this._addPreselect.col}
          .preselectedZone=${this._addPreselect.zone}
          @close=${() => (this._showAddDialog = false)}
          @wine-added=${this._onWineAdded}
        ></add-wine-dialog>

        <!-- Rack Settings Dialog -->
        <rack-settings-dialog
          .open=${this._showRackSettings}
          .hass=${this.hass}
          .cabinets=${this._cabinets}
          .wines=${this._wines}
          @close=${() => (this._showRackSettings = false)}
          @racks-updated=${() => this._loadData()}
        ></rack-settings-dialog>

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

      .header-actions {
        display: flex;
        gap: 4px;
        align-items: center;
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
        background: rgba(0, 0, 0, 0.04);
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
], WineCellarCard.prototype, "_analyzing", void 0);
__decorate([
    r()
], WineCellarCard.prototype, "_toast", void 0);
WineCellarCard = __decorate([
    t("wine-cellar-card")
], WineCellarCard);
// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
    type: "wine-cellar-card",
    name: "Wine Cellar",
    description: "Track your wine collection with visual cabinet layout",
    preview: true,
});

export { WineCellarCard };
//# sourceMappingURL=wine-cellar-card.js.map
