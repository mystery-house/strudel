"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});var t=require("react"),se=require("react-codemirror6"),C=require("@codemirror/view"),W=require("@codemirror/state"),ce=require("@codemirror/lang-javascript"),c=require("@codemirror/highlight"),le=require("react-hook-inview"),ie=require("@strudel.cycles/eval"),ue=require("@strudel.cycles/core/util.mjs"),b=require("@strudel.cycles/tone"),Q=require("@strudel.cycles/core"),y=require("@strudel.cycles/midi");function de(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var d=de(t);const fe="#abb2bf",ge="#7d8799",me="#ffffff",pe="#21252b",P="rgba(0, 0, 0, 0.5)",be="transparent",L="#353a42",he="rgba(128, 203, 196, 0.5)",U="#ffcc00",ve=C.EditorView.theme({"&":{color:"#ffffff",backgroundColor:be,fontSize:"15px","z-index":11},".cm-content":{caretColor:U,lineHeight:"22px"},".cm-line":{background:"#2C323699"},"&.cm-focused .cm-cursor":{backgroundColor:U,width:"3px"},"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":{backgroundColor:he},".cm-panels":{backgroundColor:pe,color:"#ffffff"},".cm-panels.cm-panels-top":{borderBottom:"2px solid black"},".cm-panels.cm-panels-bottom":{borderTop:"2px solid black"},".cm-searchMatch":{backgroundColor:"#72a1ff59",outline:"1px solid #457dff"},".cm-searchMatch.cm-searchMatch-selected":{backgroundColor:"#6199ff2f"},".cm-activeLine":{backgroundColor:P},".cm-selectionMatch":{backgroundColor:"#aafe661a"},"&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket":{backgroundColor:"#bad0f847",outline:"1px solid #515a6b"},".cm-gutters":{background:"transparent",color:"#676e95",border:"none"},".cm-activeLineGutter":{backgroundColor:P},".cm-foldPlaceholder":{backgroundColor:"transparent",border:"none",color:"#ddd"},".cm-tooltip":{border:"none",backgroundColor:L},".cm-tooltip .cm-tooltip-arrow:before":{borderTopColor:"transparent",borderBottomColor:"transparent"},".cm-tooltip .cm-tooltip-arrow:after":{borderTopColor:L,borderBottomColor:L},".cm-tooltip-autocomplete":{"& > ul > li[aria-selected]":{backgroundColor:P,color:fe}}},{dark:!0}),ye=c.HighlightStyle.define([{tag:c.tags.keyword,color:"#c792ea"},{tag:c.tags.operator,color:"#89ddff"},{tag:c.tags.special(c.tags.variableName),color:"#eeffff"},{tag:c.tags.typeName,color:"#f07178"},{tag:c.tags.atom,color:"#f78c6c"},{tag:c.tags.number,color:"#ff5370"},{tag:c.tags.definition(c.tags.variableName),color:"#82aaff"},{tag:c.tags.string,color:"#c3e88d"},{tag:c.tags.special(c.tags.string),color:"#f07178"},{tag:c.tags.comment,color:ge},{tag:c.tags.variableName,color:"#f07178"},{tag:c.tags.tagName,color:"#ff5370"},{tag:c.tags.bracket,color:"#a2a1a4"},{tag:c.tags.meta,color:"#ffcb6b"},{tag:c.tags.attributeName,color:"#c792ea"},{tag:c.tags.propertyName,color:"#c792ea"},{tag:c.tags.className,color:"#decb6b"},{tag:c.tags.invalid,color:me}]),Ce=[ve,ye],O=W.StateEffect.define(),ke=W.StateField.define({create(){return C.Decoration.none},update(e,o){try{for(let a of o.effects)if(a.is(O))if(a.value){const u=C.Decoration.mark({attributes:{style:"background-color: #FFCA2880"}});e=C.Decoration.set([u.range(0,o.newDoc.length)])}else e=C.Decoration.set([]);return e}catch(a){return console.warn("flash error",a),e}},provide:e=>C.EditorView.decorations.from(e)}),we=e=>{e.dispatch({effects:O.of(!0)}),setTimeout(()=>{e.dispatch({effects:O.of(!1)})},200)},F=W.StateEffect.define(),Me=W.StateField.define({create(){return C.Decoration.none},update(e,o){try{for(let a of o.effects)a.is(F)&&(e=C.Decoration.set(a.value.flatMap(u=>(u.context.locations||[]).map(({start:g,end:l})=>{const i=u.context.color||"#FFCA28";let m=o.newDoc.line(g.line).from+g.column,s=o.newDoc.line(l.line).from+l.column;const r=o.newDoc.length;return m>r||s>r?void 0:C.Decoration.mark({attributes:{style:`outline: 1px solid ${i}`}}).range(m,s)})).filter(Boolean),!0));return e}catch{return e}},provide:e=>C.EditorView.decorations.from(e)});function J({value:e,onChange:o,onViewChanged:a,onCursor:u,options:g,editorDidMount:l,theme:i}){return d.default.createElement(d.default.Fragment,null,d.default.createElement(se.CodeMirror,{onViewChange:a,style:{display:"flex",flexDirection:"column",flex:"1 0 auto"},value:e,onChange:o,extensions:[ce.javascript(),i||Ce,Me,ke]}))}function K(e){const{onEvent:o,onQuery:a,onSchedule:u,ready:g=!0,onDraw:l}=e,[i,m]=t.useState(!1),s=1,r=()=>Math.floor(b.Tone.getTransport().seconds/s),T=(h=r())=>{const S=new Q.TimeSpan(h,h+1),q=a?.(new Q.State(S))||[];u?.(q,h);const H=S.begin.valueOf();b.Tone.getTransport().cancel(H);const x=(h+1)*s-.5,R=Math.max(b.Tone.getTransport().seconds,x)+.1;b.Tone.getTransport().schedule(()=>{T(h+1)},R),q?.filter(p=>p.part.begin.equals(p.whole?.begin)).forEach(p=>{b.Tone.getTransport().schedule(v=>{o(v,p,b.Tone.getContext().currentTime),b.Tone.Draw.schedule(()=>{l?.(v,p)},v)},p.part.begin.valueOf())})};t.useEffect(()=>{g&&T()},[o,u,a,l,g]);const N=async()=>{m(!0),await b.Tone.start(),b.Tone.getTransport().start("+0.1")},k=(h=!1)=>{h?(b.Tone.getTransport().cancel(),b.Tone.getTransport().stop()):b.Tone.getTransport().pause(),m(!1)};return{start:N,stop:k,onEvent:o,started:i,setStarted:m,toggle:()=>i?k():N(),query:T,activeCycle:r}}function X(e){return t.useEffect(()=>(window.addEventListener("message",e),()=>window.removeEventListener("message",e)),[e]),t.useCallback(o=>window.postMessage(o,"*"),[])}let Ee=()=>Math.floor((1+Math.random())*65536).toString(16).substring(1);const Te=e=>encodeURIComponent(btoa(e));function Y({tune:e,defaultSynth:o,autolink:a=!0,onEvent:u,onDraw:g}){const l=t.useMemo(()=>Ee(),[]),[i,m]=t.useState(e),[s,r]=t.useState(),[T,N]=t.useState(""),[k,w]=t.useState(),[h,S]=t.useState(!1),[q,H]=t.useState(""),[x,R]=t.useState(),p=t.useMemo(()=>i!==s||k,[i,s,k]),v=t.useCallback(f=>N(n=>n+`${n?`

`:""}${f}`),[]),z=t.useMemo(()=>{if(s&&!s.includes("strudel disable-highlighting"))return(f,n)=>g?.(f,n,s)},[s,g]),ee=t.useMemo(()=>s&&s.includes("strudel hide-header"),[s]),_=K({onDraw:z,onEvent:t.useCallback((f,n,M)=>{try{u?.(f,n,M),n.context.logs?.length&&n.context.logs.forEach(v);const{onTrigger:D,velocity:re}=n.context;if(D)D(f,n,M,1);else if(o){const ne=ue.getPlayableNoteValue(n);o.triggerAttackRelease(ne,n.duration.valueOf(),f,re)}else if(!u)throw new Error("no defaultSynth nor onEvent passed to useRepl + event has no onTrigger. nothing happens")}catch(D){console.warn(D),D.message="unplayable event: "+D?.message,v(D.message)}},[u,v,o]),onQuery:t.useCallback(f=>{try{return x?.query(f)||[]}catch(n){return console.warn(n),n.message="query error: "+n.message,w(n),[]}},[x]),onSchedule:t.useCallback((f,n)=>te(f,n),[]),ready:!!x&&!!s}),I=X(({data:{from:f,type:n}})=>{n==="start"&&f!==l&&(_.setStarted(!1),r(void 0))}),A=t.useCallback(async(f=i,n=!1)=>{if(s&&!p){w(void 0),!n&&_.start();return}try{S(!0);const M=await ie.evaluate(f);!n&&_.start(),I({type:"start",from:l}),R(()=>M.pattern),a&&(window.location.hash="#"+encodeURIComponent(btoa(i))),H(Te(i)),w(void 0),r(f),S(!1)}catch(M){M.message="evaluation error: "+M.message,console.warn(M),w(M)}},[s,p,i,_,a,l,I]),te=(f,n)=>{f.length},oe=()=>{_.started?_.stop():A()},$=()=>{_.stop(!0),r(void 0)},ae=()=>{A(i,!0)};return t.useEffect(()=>()=>$(),[]),{hideHeader:ee,pending:h,code:i,setCode:m,pattern:x,error:k,cycle:_,setPattern:R,dirty:p,log:T,togglePlay:oe,stop:$,setActiveCode:r,activateCode:A,evaluateOnly:ae,activeCode:s,pushLog:v,hash:q}}function V(...e){return e.filter(Boolean).join(" ")}let B=[],G;function Z({view:e,pattern:o,active:a}){t.useEffect(()=>{if(e)if(o&&a){let g=function(){try{const l=b.Tone.getTransport().seconds,m=[Math.max(G||l,l-1/10),l+1/60];G=l+1/60,B=B.filter(r=>r.whole.end>l);const s=o.queryArc(...m).filter(r=>r.hasOnset());B=B.concat(s),e.dispatch({effects:F.of(B)})}catch{e.dispatch({effects:F.of([])})}u=requestAnimationFrame(g)},u=requestAnimationFrame(g);return()=>{cancelAnimationFrame(u)}}else B=[],e.dispatch({effects:F.of([])})},[o,a,e])}const xe="_container_10e1g_1",_e="_header_10e1g_5",Se="_buttons_10e1g_9",De="_button_10e1g_9",Ne="_buttonDisabled_10e1g_17",qe="_error_10e1g_21",Re="_body_10e1g_25";var E={container:xe,header:_e,buttons:Se,button:De,buttonDisabled:Ne,error:qe,body:Re};function j({type:e}){return d.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",className:"sc-h-5 sc-w-5",viewBox:"0 0 20 20",fill:"currentColor"},{refresh:d.default.createElement("path",{fillRule:"evenodd",d:"M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z",clipRule:"evenodd"}),play:d.default.createElement("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z",clipRule:"evenodd"}),pause:d.default.createElement("path",{fillRule:"evenodd",d:"M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z",clipRule:"evenodd"}),stop:d.default.createElement("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z",clipRule:"evenodd"})}[e])}function Be({tune:e,defaultSynth:o,hideOutsideView:a=!1,theme:u,init:g,onEvent:l}){const{code:i,setCode:m,pattern:s,activeCode:r,activateCode:T,evaluateOnly:N,error:k,cycle:w,dirty:h,togglePlay:S,stop:q}=Y({tune:e,defaultSynth:o,autolink:!1,onEvent:l});t.useEffect(()=>{g&&N()},[e,g]);const[H,x]=t.useState(),[R,p]=le.useInView({threshold:.01}),v=t.useRef(),z=t.useMemo(()=>((p||!a)&&(v.current=!0),p||v.current),[p,a]);return Z({view:H,pattern:s,active:w.started&&!r?.includes("strudel disable-highlighting")}),d.default.createElement("div",{className:E.container,ref:R},d.default.createElement("div",{className:E.header},d.default.createElement("div",{className:E.buttons},d.default.createElement("button",{className:V(E.button,w.started?"sc-animate-pulse":""),onClick:()=>S()},d.default.createElement(j,{type:w.started?"pause":"play"})),d.default.createElement("button",{className:V(h?E.button:E.buttonDisabled),onClick:()=>T()},d.default.createElement(j,{type:"refresh"})),d.default.createElement("button",{className:V(E.button),onClick:()=>q(!0)},d.default.createElement(j,{type:"stop"}))),k&&d.default.createElement("div",{className:E.error},k.message)),d.default.createElement("div",{className:E.body},z&&d.default.createElement(J,{theme:u,value:i,onChange:m,onViewChanged:x})))}function He(e){const{ready:o,connected:a,disconnected:u}=e,[g,l]=t.useState(!0),[i,m]=t.useState(y.WebMidi?.outputs||[]);return t.useEffect(()=>{y.enableWebMidi().then(()=>{y.WebMidi.addListener("connected",r=>{m([...y.WebMidi.outputs]),a?.(y.WebMidi,r)}),y.WebMidi.addListener("disconnected",r=>{m([...y.WebMidi.outputs]),u?.(y.WebMidi,r)}),o?.(y.WebMidi),l(!1)}).catch(r=>{if(r){console.error(r),console.warn("Web Midi could not be enabled..");return}})},[o,a,u,i]),{loading:g,outputs:i,outputByName:r=>y.WebMidi.getOutputByName(r)}}exports.CodeMirror=J;exports.MiniRepl=Be;exports.cx=V;exports.flash=we;exports.useCycle=K;exports.useHighlighting=Z;exports.usePostMessage=X;exports.useRepl=Y;exports.useWebMidi=He;
