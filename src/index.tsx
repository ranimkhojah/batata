import "./styles.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Action, Machine, assign, send, actions, State, MachineConfig } from "xstate";
import { useMachine, asEffect } from "@xstate/react";
import { inspect } from "@xstate/inspect";
import { dmMachine } from "./dmPotato";
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
// import { cancel } from "xstate/lib/actionTypes";
const {cancel} = actions
var firstTime = true

/* questions to ask:
- at position x (when img has a specific margins or whatever), limit the grammar/commands
- how to check the last sent entry
- how to access other files? it only accepts urls but not paths to files
*/


inspect({
    url: "https://statecharts.io/inspect",
    iframe: false
});

export function promptAndAsk(prompt: string): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
	initial: 'prompt',
	states: {
            prompt: {
                entry: say(prompt),
                on: { ENDSPEECH: 'ask' }
            },
            ask: {
		        entry: send('LISTEN'),
            }
	}})
}

export function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}



export function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}


const machine = Machine<SDSContext, any, SDSEvent>({
    id: 'root',
    type: 'parallel',
    states: {
        dm: {
            ...dmMachine
        },
        asrtts: {
            initial: 'idle',
            states: {
                idle: {
                    on: {
                        LISTEN: 'recognising',
                        SPEAK: {
                            target: 'speaking',
                            actions: assign((_context, event) => { return { ttsAgenda: event.value } })
                        }
                    }
                },
                recognising: {
		    initial: 'progress',
                    entry: 'recStart',
                    exit: 'recStop',
                    on: {
                        ASRRESULT: {
                            actions: ['recLogResult',
                                assign((_context, event) => { return { recResult: event.value } })],
                            target: '.match'
                        },
                        RECOGNISED: {target:'idle'}, // target idel and actions cancel
                        MAXSPEECH: 'idle'
                    },
                    states: {
		    	progress: {
			},	    					
                        match: {
                            entry: send('RECOGNISED'),
                        },
                    }
                },
                speaking: {
                    entry: 'ttsStart',
                    on: {
                        ENDSPEECH: 'idle',
                    }
                }
            }
        }
    },
},
    {
        actions: {
            recLogResult: (context: SDSContext) => {
                /* context.recResult = event.recResult; */
                console.log('<< ASR: ' + context.recResult);
            },
            test: () => {
                console.log('test')
            },
            logIntent: (context: SDSContext) => {
                /* context.nluData = event.data */
                console.log('<< NLU intent: ' + context.nluData.intent.name)
            }
        },
    });



interface Props extends React.HTMLAttributes<HTMLElement> {
    state: State<SDSContext, any, any, any>;
}
const ReactiveButton = (props: Props): JSX.Element => {
    switch (true) {
        case props.state.matches({ asrtts: 'recognising' }):
            return (
                <button type="button" className="glow-on-hover"
                    style={{ animation: "glowing 20s linear" }} {...props}>
                    Listening...
                </button>
            );
        case props.state.matches({ asrtts: 'speaking' }): //start moving the potato here
            return (
                <button type="button" className="glow-on-hover"
                    style={{ animation: "bordering 1s infinite" }} {...props}>
                    Speaking...
                </button>
            );
        default:
            return (
                <button type="button" className="glow-on-hover" {...props}>
                    Start Game
                </button >
            );
    }
}


function App() {
    const { speak, cancel, speaking } = useSpeechSynthesis({
        onEnd: () => {
            send('ENDSPEECH');
        },
    });
    const { listen, listening, stop } = useSpeechRecognition({
        onResult: (result: any) => {
            send({ type: "ASRRESULT", value: result });
        },
    });
    const [current, send, service] = useMachine(machine, {
        devTools: true,
        actions: {
            recStart: asEffect(() => {
                console.log('Ready to receive a command.');
                listen({
                    interimResults: false,
                    continuous: true
                });
            }),
            recStop: asEffect(() => {
                console.log('Recognition stopped.');
                stop()
            }),
            gameStart: asEffect((context) => {
                var timer = document.getElementById("timer")
                        if(timer != null){
                            timer.remove();
                        }
                displayTimer()

            }),
            goRight: asEffect((context) => {
                console.log('moving the potato to the right...');
                var potato_el = document.getElementById('batata')
                if(potato_el!= null){
                        if (firstTime){
                            potato_el.style.marginLeft = "0px"; 
                            firstTime = false
                        }
                        if(context.recResult.includes("cabinet") || context.recResult.includes("cupboard") || context.recResult.includes("closet")){
                            potato_el.style.marginLeft = "210px"
                        }
                        else if(context.recResult.includes("chair")){
                            potato_el.style.marginLeft = "490px"
                        }
                        else if(context.recResult.includes("table")){
                            potato_el.style.marginLeft = "700px"
                        }
                        else if(context.recResult.includes("window") || context.recResult.includes("curtains")){
                            potato_el.style.marginLeft = "900px"
                        }else{
                        potato_el.style.marginLeft = (parseInt(potato_el.style.marginLeft.replace('px','')) + 70 ).toString() + "px"; 
                        }
                }
            }),
            goLeft: asEffect((context) => {
                console.log('moving the potato to the left...');
                var potato_el = document.getElementById('batata')
                if(potato_el!= null){
                        if (firstTime){
                            potato_el.style.marginLeft = "0px"; 
                            firstTime = false
                        }
                        if(context.recResult.includes("cabinet") || context.recResult.includes("cupboard") || context.recResult.includes("closet")){
                            potato_el.style.marginLeft = "210px"
                        }
                        else if(context.recResult.includes("chair")){
                            potato_el.style.marginLeft = "490px"
                        }
                        else if(context.recResult.includes("table")){
                            potato_el.style.marginLeft = "700px"
                        }
                        else if(context.recResult.includes("window") || context.recResult.includes("curtains")){
                            potato_el.style.marginLeft = "900px"
                        }else{
                            potato_el.style.marginLeft = (parseInt(potato_el.style.marginLeft.replace('px','')) - 70 ).toString() + "px"; 
                        }
                }
            }),
           
            open: asEffect((context) => {
                console.log('opening...');
                var potato_el = document.getElementById('batata')
                var bg_el = document.getElementById('bg');
                if (bg_el != null && potato_el!= null){
                    // if the potato is next to the cabinet
                    if(potato_el.style.marginLeft > "139px" && potato_el.style.marginLeft < "220px"){ 
                        bg_el.style.backgroundImage = "url('https://i.imgur.com/WQhVQYi.png')";}
                }
            }),
            lose: asEffect((context) => {
                console.log('Game Over');
                var potato_el = document.getElementById('batata')
                if (potato_el!= null && potato_el.src == "https://i.imgur.com/zCqQtnF.png"){
                
                        potato_el.src = "https://i.imgur.com/KmN8LvB.png";
                        potato_el.style.width = "206px"
                        // potato_el.style.height = "114px"
                    
                    }
            }),
            close: asEffect((context) => {
                console.log('closing...');
                var bg_el = document.getElementById('bg');
                if (bg_el != null){
                    bg_el.style.backgroundImage = "url('https://i.imgur.com/KmN8LvB.png')";
                }
                
            }),
            //sad potato: https://i.imgur.com/Mh1aRhA.png     -     https://i.imgur.com/KmN8LvB.png  
            take: asEffect((context) => {
                console.log('play video...');
                var potato_el = document.getElementById('batata');
                var bg_el = document.getElementById('bg');
                if(potato_el != null && bg_el != null){
                    console.log(potato_el.style.marginLeft);
                    console.log(bg_el.style.backgroundImage)
                      
                    //if the potato is infront of the cabinet and it is already open
                    if(potato_el.style.marginLeft > "139px" && potato_el.style.marginLeft < "220px" && bg_el.style.backgroundImage == 'url("https://i.imgur.com/WQhVQYi.png")'){
                        var timer = document.getElementById("timer")
                        if(timer != null){
                            timer.remove();
                        }
                        cancel('timeout')
                        potato_el.src = "http://pa1.narvii.com/7324/3ec4179c3653b974d7197b01fe372f1ec4e45b4er1-370-300_00.gif";
                        potato_el.style.width = "200px";
                        potato_el.style.height = "250px";
                        displayVid()
                    }
                }
                
            }),
            ttsStart: asEffect((context, effect) => {
                console.log('Speaking...');
                speak({ text: context.ttsAgenda })
            }),
            ttsCancel: asEffect((context, effect) => {
                console.log('TTS STOP...');
                cancel()
            })
            /* speak: asEffect((context) => {
	     * console.log('Speaking...');
             *     speak({text: context.ttsAgenda })
             * } */
        }
    });


    return (
        <div className="App" id="bg">
            <ReactiveButton state={current} onClick={() => send('CLICK')} />
        </div>
    )
};


function displayTimer() {
    const div = document.createElement('div');
  
    div.id = 'timer';
  
    div.innerHTML = `
    <img class = "timer_element" src="https://timertopia.files.wordpress.com/2017/04/1-minute.gif" width="110" ">
    `;
    var d_el = document.getElementById('bg');
    if(d_el != null){
        d_el.appendChild(div);
    }
}



function displayVid() {
    const div = document.createElement('div');
  
    div.className = 'row';
  
    div.innerHTML = `
    <iframe width="1020" height="900" src="https://www.youtube.com/embed/q7uyKYeGPdE?autoplay=1" allow="autoplay" allowfullscreen>
    </iframe>
    `;
    var d_el = document.getElementById('bg');
    if(d_el != null){
        d_el.appendChild(div);
    }
}
  

const rootElement = document.getElementById("root");
ReactDOM.render(
    <App />,
    rootElement);