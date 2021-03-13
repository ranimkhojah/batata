(this["webpackJsonppotatos-way-to-kitchen-xstate"]=this["webpackJsonppotatos-way-to-kitchen-xstate"]||[]).push([[0],{29:function(t,e,n){},40:function(t,e,n){"use strict";n.r(e),n.d(e,"promptAndAsk",(function(){return h})),n.d(e,"say",(function(){return E})),n.d(e,"listen",(function(){return j}));var a=n(26),o=n(8),c=(n(29),n(7),n(23)),s=n(12),i=n(2),r=n(20),l=n(44),u=n(43);function g(t){return Object(i.q)((e=>({type:"SPEAK",value:t})))}function m(t){return{entry:t,always:"#root.dm.nextStep"}}const p={initial:"init",states:{init:{on:{CLICK:"welcome"}},welcome:{initial:"prompt",states:{prompt:{entry:[Object(i.q)((t=>({type:"SPEAK",value:"Hey help me to find the kitchen keys"}))),"gameStart",Object(i.q)("MAXSPEECH",{delay:6e4,id:"timeout"})],on:{ENDSPEECH:"#root.dm.nextStep"}}}},intent:{invoke:{id:"nlu",src:(t,e)=>{return n=t.text_intent,fetch(new Request("https://cors-anywhere.herokuapp.com/https://mr-batata.herokuapp.com/model/parse",{method:"POST",headers:{Origin:"http://maraev.me"},body:'{"text": "'.concat(n,'"}')})).then((t=>t.json()));var n},onDone:{target:"classify_intent",actions:[Object(i.b)(((t,e)=>({intent:e.data.intent.name}))),(t,e)=>console.log(e.data),Object(i.b)(((t,e)=>({confidence:e.data.intent.confidence})))]},onError:{target:"nextStep",actions:(t,e)=>console.log(e.data)}}},classify_intent:{entry:Object(i.q)("ENDSPEECH"),on:{ENDSPEECH:[{target:"right",cond:t=>"right"===t.intent},{target:"left",cond:t=>"left"===t.intent},{target:"jump",cond:t=>"jump"===t.intent},{target:"take",cond:t=>"take"===t.intent},{target:"open",cond:t=>"open"===t.intent},{target:"close",cond:t=>"close"===t.intent},{target:"nomatch"}]}},right:Object(o.a)({},m("goRight")),left:Object(o.a)({},m("goLeft")),jump:Object(o.a)({},m("jump")),open:Object(o.a)({},m("open")),close:Object(o.a)({},m("close")),take:Object(o.a)({},m("take")),confirm:{initial:"prompt",states:{prompt:{entry:g("Where? Which direction?"),on:{ENDSPEECH:"#root.dm.nextStep"}}}},nomatch:{initial:"prompt",states:{prompt:{entry:g("What?"),on:{ENDSPEECH:"#root.dm.nextStep"}}}},nextStep:{initial:"ask",on:{RECOGNISED:[{target:"stop",cond:t=>"stop"===t.recResult},{target:"intent",actions:Object(i.b)((t=>({text_intent:t.recResult})))}],MAXSPEECH:[{target:"maxspeech"}]},states:{ask:{entry:Object(i.q)("LISTEN")}}},maxspeech:{entry:"lose",always:"#root.dm.init"},stop:{entry:g("Ok"),always:"init"}}};var d=n(21),b=n(13);s.a.cancel;var y=!0;function h(t){return{initial:"prompt",states:{prompt:{entry:E(t),on:{ENDSPEECH:"ask"}},ask:{entry:Object(i.q)("LISTEN")}}}}function E(t){return Object(i.q)((e=>({type:"SPEAK",value:t})))}function j(){return Object(i.q)("LISTEN")}Object(u.a)({url:"https://statecharts.io/inspect",iframe:!1});const O=Object(r.a)({id:"root",type:"parallel",states:{dm:Object(o.a)({},p),asrtts:{initial:"idle",states:{idle:{on:{LISTEN:"recognising",SPEAK:{target:"speaking",actions:Object(i.b)(((t,e)=>({ttsAgenda:e.value})))}}},recognising:{initial:"progress",entry:"recStart",exit:"recStop",on:{ASRRESULT:{actions:["recLogResult",Object(i.b)(((t,e)=>({recResult:e.value})))],target:".match"},RECOGNISED:{target:"idle"},MAXSPEECH:"idle"},states:{progress:{},match:{entry:Object(i.q)("RECOGNISED")}}},speaking:{entry:"ttsStart",on:{ENDSPEECH:"idle"}}}}}},{actions:{recLogResult:t=>{console.log("<< ASR: "+t.recResult)},test:()=>{console.log("test")},logIntent:t=>{console.log("<< NLU intent: "+t.nluData.intent.name)}}}),f=t=>{switch(!0){case t.state.matches({asrtts:"recognising"}):return Object(b.jsx)("button",Object(o.a)(Object(o.a)({type:"button",className:"glow-on-hover",style:{animation:"glowing 20s linear"}},t),{},{children:"Listening..."}));case t.state.matches({asrtts:"speaking"}):return Object(b.jsx)("button",Object(o.a)(Object(o.a)({type:"button",className:"glow-on-hover",style:{animation:"bordering 1s infinite"}},t),{},{children:"Speaking..."}));default:return Object(b.jsx)("button",Object(o.a)(Object(o.a)({type:"button",className:"glow-on-hover"},t),{},{children:"Start Game"}))}};function S(){const t=Object(d.useSpeechSynthesis)({onEnd:()=>{g("ENDSPEECH")}}),e=t.speak,n=t.cancel,o=(t.speaking,Object(d.useSpeechRecognition)({onResult:t=>{g({type:"ASRRESULT",value:t})}})),c=o.listen,s=(o.listening,o.stop),i=Object(l.b)(O,{devTools:!0,actions:{recStart:Object(l.a)((()=>{console.log("Ready to receive a command."),c({interimResults:!1,continuous:!0})})),recStop:Object(l.a)((()=>{console.log("Recognition stopped."),s()})),gameStart:Object(l.a)((t=>{var e=document.getElementById("timer");null!=e&&e.remove(),function(){const t=document.createElement("div");t.id="timer",t.innerHTML='\n    <img class = "timer_element" src="https://timertopia.files.wordpress.com/2017/04/1-minute.gif" width="110" ">\n    ';var e=document.getElementById("bg");null!=e&&e.appendChild(t)}()})),goRight:Object(l.a)((t=>{console.log("moving the potato to the right...");var e=document.getElementById("batata");null!=e&&(y&&(e.style.marginLeft="0px",y=!1),t.recResult.includes("cabinet")||t.recResult.includes("cupboard")||t.recResult.includes("closet")?e.style.marginLeft="210px":t.recResult.includes("chair")?e.style.marginLeft="490px":t.recResult.includes("table")?e.style.marginLeft="700px":t.recResult.includes("window")||t.recResult.includes("curtains")?e.style.marginLeft="900px":e.style.marginLeft=(parseInt(e.style.marginLeft.replace("px",""))+70).toString()+"px")})),goLeft:Object(l.a)((t=>{console.log("moving the potato to the left...");var e=document.getElementById("batata");null!=e&&(y&&(e.style.marginLeft="0px",y=!1),t.recResult.includes("cabinet")||t.recResult.includes("cupboard")||t.recResult.includes("closet")?e.style.marginLeft="210px":t.recResult.includes("chair")?e.style.marginLeft="490px":t.recResult.includes("table")?e.style.marginLeft="700px":t.recResult.includes("window")||t.recResult.includes("curtains")?e.style.marginLeft="900px":e.style.marginLeft=(parseInt(e.style.marginLeft.replace("px",""))-70).toString()+"px")})),open:Object(l.a)((t=>{console.log("opening...");var e=document.getElementById("batata"),n=document.getElementById("bg");null!=n&&null!=e&&e.style.marginLeft>"139px"&&e.style.marginLeft<"220px"&&(n.style.backgroundImage="url('https://i.imgur.com/WQhVQYi.png')")})),lose:Object(l.a)((t=>{console.log("Game Over");var e=document.getElementById("batata");null!=e&&"https://i.imgur.com/zCqQtnF.png"==e.src&&(e.src="https://i.imgur.com/KmN8LvB.png",e.style.width="206px")})),close:Object(l.a)((t=>{console.log("closing...");var e=document.getElementById("bg");null!=e&&(e.style.backgroundImage="url('https://i.imgur.com/KmN8LvB.png')")})),take:Object(l.a)((t=>{console.log("play video...");var e=document.getElementById("batata"),a=document.getElementById("bg");if(null!=e&&null!=a&&(console.log(e.style.marginLeft),console.log(a.style.backgroundImage),e.style.marginLeft>"139px"&&e.style.marginLeft<"220px"&&'url("https://i.imgur.com/WQhVQYi.png")'==a.style.backgroundImage)){var o=document.getElementById("timer");null!=o&&o.remove(),n("timeout"),e.src="http://pa1.narvii.com/7324/3ec4179c3653b974d7197b01fe372f1ec4e45b4er1-370-300_00.gif",e.style.width="200px",e.style.height="250px",function(){const t=document.createElement("div");t.className="row",t.innerHTML='\n    <iframe width="1020" height="900" src="https://www.youtube.com/embed/q7uyKYeGPdE?autoplay=1" allow="autoplay" allowfullscreen>\n    </iframe>\n    ';var e=document.getElementById("bg");null!=e&&e.appendChild(t)}()}})),ttsStart:Object(l.a)(((t,n)=>{console.log("Speaking..."),e({text:t.ttsAgenda})})),ttsCancel:Object(l.a)(((t,e)=>{console.log("TTS STOP..."),n()}))}}),r=Object(a.a)(i,3),u=r[0],g=r[1];r[2];return Object(b.jsx)("div",{className:"App",id:"bg",children:Object(b.jsx)(f,{state:u,onClick:()=>g("CLICK")})})}const x=document.getElementById("root");c.render(Object(b.jsx)(S,{}),x)}},[[40,1,2]]]);
//# sourceMappingURL=main.3afb6f52.chunk.js.map