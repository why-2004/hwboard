var TurndownService=function(){"use strict";function e(e,n){return Array(n+1).join(e)}var n=["address","article","aside","audio","blockquote","body","canvas","center","dd","dir","div","dl","dt","fieldset","figcaption","figure","footer","form","frameset","h1","h2","h3","h4","h5","h6","header","hgroup","hr","html","isindex","li","main","menu","nav","noframes","noscript","ol","output","p","pre","section","table","tbody","td","tfoot","th","thead","tr","ul"];function t(e){return-1!==n.indexOf(e.nodeName.toLowerCase())}var r=["area","base","br","col","command","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"];function i(e){return-1!==r.indexOf(e.nodeName.toLowerCase())}var o=r.join();var a={};function l(e){this.options=e,this._keep=[],this._remove=[],this.blankRule={replacement:e.blankReplacement},this.keepReplacement=e.keepReplacement,this.defaultRule={replacement:e.defaultReplacement},this.array=[];for(var n in e.rules)this.array.push(e.rules[n])}function c(e,n,t){for(var r=0;r<e.length;r++){var i=e[r];if(u(i,n,t))return i}}function u(e,n,t){var r=e.filter;if("string"==typeof r){if(r===n.nodeName.toLowerCase())return!0}else if(Array.isArray(r)){if(r.indexOf(n.nodeName.toLowerCase())>-1)return!0}else{if("function"!=typeof r)throw new TypeError("`filter` needs to be a string, array, or function");if(r.call(e,n,t))return!0}}function s(e){var n=e.nextSibling||e.parentNode;return e.parentNode.removeChild(e),n}function f(e,n,t){return e&&e.parentNode===n||t(n)?n.nextSibling||n.parentNode:n.firstChild||n.nextSibling||n.parentNode}a.paragraph={filter:"p",replacement:function(e){return"\n\n"+e+"\n\n"}},a.lineBreak={filter:"br",replacement:function(e,n,t){return t.br+"\n"}},a.heading={filter:["h1","h2","h3","h4","h5","h6"],replacement:function(n,t,r){var i=Number(t.nodeName.charAt(1));return"setext"===r.headingStyle&&i<3?"\n\n"+n+"\n"+e(1===i?"=":"-",n.length)+"\n\n":"\n\n"+e("#",i)+" "+n+"\n\n"}},a.blockquote={filter:"blockquote",replacement:function(e){return"\n\n"+(e=(e=e.replace(/^\n+|\n+$/g,"")).replace(/^/gm,"> "))+"\n\n"}},a.list={filter:["ul","ol"],replacement:function(e,n){var t=n.parentNode;return"LI"===t.nodeName&&t.lastElementChild===n?"\n"+e:"\n\n"+e+"\n\n"}},a.listItem={filter:"li",replacement:function(e,n,t){e=e.replace(/^\n+/,"").replace(/\n+$/,"\n").replace(/\n/gm,"\n    ");var r=t.bulletListMarker+"   ",i=n.parentNode;if("OL"===i.nodeName){var o=i.getAttribute("start"),a=Array.prototype.indexOf.call(i.children,n);r=(o?Number(o)+a:a+1)+".  "}return r+e+(n.nextSibling&&!/\n$/.test(e)?"\n":"")}},a.indentedCodeBlock={filter:function(e,n){return"indented"===n.codeBlockStyle&&"PRE"===e.nodeName&&e.firstChild&&"CODE"===e.firstChild.nodeName},replacement:function(e,n,t){return"\n\n    "+n.firstChild.textContent.replace(/\n/g,"\n    ")+"\n\n"}},a.fencedCodeBlock={filter:function(e,n){return"fenced"===n.codeBlockStyle&&"PRE"===e.nodeName&&e.firstChild&&"CODE"===e.firstChild.nodeName},replacement:function(e,n,t){var r=((n.firstChild.className||"").match(/language-(\S+)/)||[null,""])[1];return"\n\n"+t.fence+r+"\n"+n.firstChild.textContent+"\n"+t.fence+"\n\n"}},a.horizontalRule={filter:"hr",replacement:function(e,n,t){return"\n\n"+t.hr+"\n\n"}},a.inlineLink={filter:function(e,n){return"inlined"===n.linkStyle&&"A"===e.nodeName&&e.getAttribute("href")},replacement:function(e,n){return"["+e+"]("+n.getAttribute("href")+(n.title?' "'+n.title+'"':"")+")"}},a.referenceLink={filter:function(e,n){return"referenced"===n.linkStyle&&"A"===e.nodeName&&e.getAttribute("href")},replacement:function(e,n,t){var r,i,o=n.getAttribute("href"),a=n.title?' "'+n.title+'"':"";switch(t.linkReferenceStyle){case"collapsed":r="["+e+"][]",i="["+e+"]: "+o+a;break;case"shortcut":r="["+e+"]",i="["+e+"]: "+o+a;break;default:var l=this.references.length+1;r="["+e+"]["+l+"]",i="["+l+"]: "+o+a}return this.references.push(i),r},references:[],append:function(e){var n="";return this.references.length&&(n="\n\n"+this.references.join("\n")+"\n\n",this.references=[]),n}},a.emphasis={filter:["em","i"],replacement:function(e,n,t){return e.trim()?t.emDelimiter+e+t.emDelimiter:""}},a.strong={filter:["strong","b"],replacement:function(e,n,t){return e.trim()?t.strongDelimiter+e+t.strongDelimiter:""}},a.code={filter:function(e){var n=e.previousSibling||e.nextSibling,t="PRE"===e.parentNode.nodeName&&!n;return"CODE"===e.nodeName&&!t},replacement:function(e){if(!e.trim())return"";var n="`",t="",r="",i=e.match(/`+/gm);if(i)for(/^`/.test(e)&&(t=" "),/`$/.test(e)&&(r=" ");-1!==i.indexOf(n);)n+="`";return n+t+e+r+n}},a.image={filter:"img",replacement:function(e,n){var t=n.alt||"",r=n.getAttribute("src")||"",i=n.title||"";return r?"!["+t+"]("+r+(i?' "'+i+'"':"")+")":""}},l.prototype={add:function(e,n){this.array.unshift(n)},keep:function(e){this._keep.unshift({filter:e,replacement:this.keepReplacement})},remove:function(e){this._remove.unshift({filter:e,replacement:function(){return""}})},forNode:function(e){return e.isBlank?this.blankRule:(n=c(this.array,e,this.options))?n:(n=c(this._keep,e,this.options))?n:(n=c(this._remove,e,this.options))?n:this.defaultRule;var n},forEach:function(e){for(var n=0;n<this.array.length;n++)e(this.array[n],n)}};var d="undefined"!=typeof window?window:{};var p,h,m=function(){var e=d.DOMParser,n=!1;try{(new e).parseFromString("","text/html")&&(n=!0)}catch(e){}return n}()?d.DOMParser:(p=function(){},function(){var e=!1;try{document.implementation.createHTMLDocument("").open()}catch(n){window.ActiveXObject&&(e=!0)}return e}()?p.prototype.parseFromString=function(e){var n=new window.ActiveXObject("htmlfile");return n.designMode="on",n.open(),n.write(e),n.close(),n}:p.prototype.parseFromString=function(e){var n=document.implementation.createHTMLDocument("");return n.open(),n.write(e),n.close(),n},p);function g(e){var n;"string"==typeof e?n=(h=h||new m).parseFromString('<x-turndown id="turndown-root">'+e+"</x-turndown>","text/html").getElementById("turndown-root"):n=e.cloneNode(!0);return function(e){var n=e.element,t=e.isBlock,r=e.isVoid,i=e.isPre||function(e){return"PRE"===e.nodeName};if(n.firstChild&&!i(n)){for(var o=null,a=!1,l=null,c=f(l,n,i);c!==n;){if(3===c.nodeType||4===c.nodeType){var u=c.data.replace(/[ \r\n\t]+/g," ");if(o&&!/ $/.test(o.data)||a||" "!==u[0]||(u=u.substr(1)),!u){c=s(c);continue}c.data=u,o=c}else{if(1!==c.nodeType){c=s(c);continue}t(c)||"BR"===c.nodeName?(o&&(o.data=o.data.replace(/ $/,"")),o=null,a=!1):r(c)&&(o=null,a=!0)}var d=f(l,c,i);l=c,c=d}o&&(o.data=o.data.replace(/ $/,""),o.data||s(o))}}({element:n,isBlock:t,isVoid:i}),n}function v(e){var n,r;return e.isBlock=t(e),e.isCode="code"===e.nodeName.toLowerCase()||e.parentNode.isCode,e.isBlank=-1===["A","TH","TD"].indexOf((n=e).nodeName)&&/^\s*$/i.test(n.textContent)&&!i(n)&&!((r=n).querySelector&&r.querySelector(o)),e.flankingWhitespace=function(e){var n="",t="";if(!e.isBlock){var r=/^[ \r\n\t]/.test(e.textContent),i=/[ \r\n\t]$/.test(e.textContent);r&&!y("left",e)&&(n=" "),i&&!y("right",e)&&(t=" ")}return{leading:n,trailing:t}}(e),e}function y(e,n){var r,i,o;return"left"===e?(r=n.previousSibling,i=/ $/):(r=n.nextSibling,i=/^ /),r&&(3===r.nodeType?o=i.test(r.nodeValue):1!==r.nodeType||t(r)||(o=i.test(r.textContent))),o}var k=Array.prototype.reduce,b=/^\n*/,w=/\n*$/;function N(e){if(!(this instanceof N))return new N(e);var n={rules:a,headingStyle:"setext",hr:"* * *",bulletListMarker:"*",codeBlockStyle:"indented",fence:"```",emDelimiter:"_",strongDelimiter:"**",linkStyle:"inlined",linkReferenceStyle:"full",br:"  ",blankReplacement:function(e,n){return n.isBlock?"\n\n":""},keepReplacement:function(e,n){return n.isBlock?"\n\n"+n.outerHTML+"\n\n":n.outerHTML},defaultReplacement:function(e,n){return n.isBlock?"\n\n"+e+"\n\n":e}};this.options=function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])}return e}({},n,e),this.rules=new l(this.options)}function C(e){var n=this;return k.call(e.childNodes,function(e,t){var r="";return 3===(t=new v(t)).nodeType?r=t.isCode?t.nodeValue:n.escape(t.nodeValue):1===t.nodeType&&(r=function(e){var n=this.rules.forNode(e),t=C.call(this,e),r=e.flankingWhitespace;(r.leading||r.trailing)&&(t=t.trim());return r.leading+n.replacement(t,e,this.options)+r.trailing}.call(n,t)),S(e,r)},"")}function S(e,n){var t,r,i,o=(t=n,r=[e.match(w)[0],t.match(b)[0]].sort(),(i=r[r.length-1]).length<2?i:"\n\n");return(e=e.replace(w,""))+o+(n=n.replace(b,""))}return N.prototype={turndown:function(e){if(null==(n=e)||"string"!=typeof n&&(!n.nodeType||1!==n.nodeType&&9!==n.nodeType&&11!==n.nodeType))throw new TypeError(e+" is not a string, or an element/document/fragment node.");var n;if(""===e)return"";var t=C.call(this,new g(e));return function(e){var n=this;return this.rules.forEach(function(t){"function"==typeof t.append&&(e=S(e,t.append(n.options)))}),e.replace(/^[\t\r\n]+/,"").replace(/[\t\r\n\s]+$/,"")}.call(this,t)},use:function(e){if(Array.isArray(e))for(var n=0;n<e.length;n++)this.use(e[n]);else{if("function"!=typeof e)throw new TypeError("plugin must be a Function or an Array of Functions");e(this)}return this},addRule:function(e,n){return this.rules.add(e,n),this},keep:function(e){return this.rules.keep(e),this},remove:function(e){return this.rules.remove(e),this},escape:function(e){return e.replace(/\\(\S)/g,"\\\\$1").replace(/^(#{1,6} )/gm,"\\$1").replace(/^([-*_] *){3,}$/gm,function(e,n){return e.split(n).join("\\"+n)}).replace(/^(\W* {0,3})(\d+)\. /gm,"$1$2\\. ").replace(/^([^\\\w]*)[*+-] /gm,function(e){return e.replace(/([*+-])/g,"\\$1")}).replace(/^(\W* {0,3})> /gm,"$1\\> ").replace(/\*+(?![*\s\W]).+?\*+/g,function(e){return e.replace(/\*/g,"\\*")}).replace(/_+(?![_\s\W]).+?_+/g,function(e){return e.replace(/_/g,"\\_")}).replace(/`+(?![`\s\W]).+?`+/g,function(e){return e.replace(/`/g,"\\`")}).replace(/[\[\]]/g,"\\$&")}},N}();