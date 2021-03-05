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
                        RECOGNISED: {target:'idle',actions: [cancel('timeout'),  assign((context)=>{return {count: Number(0)}})]}, // target idel and actions cancel
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
            changeColour: asEffect((context) => {
                console.log('moving the potato...');
                var potato_el = document.getElementById('batata')
                if(potato_el!= null){
                    if(context.recResult  == "go right"){
                        console.log(context.recResult)
                        if (firstTime){
                            potato_el.style.marginLeft = "0px"; 
                            firstTime = false
                        }
                        potato_el.style.marginLeft = (parseInt(potato_el.style.marginLeft.replace('px','')) + 70 ).toString() + "px"; 
                    }
                    else if(context.recResult  == "go left"){
                        console.log(context.recResult)
                        if (firstTime){
                            potato_el.style.marginLeft = "0px"; 
                            firstTime = false
                        }
                        potato_el.style.marginLeft = (parseInt(potato_el.style.marginLeft.replace('px','')) - 70 ).toString() + "px"; 
                    }
                    else if(context.recResult  == "open"){
                        console.log(context.recResult)
                        var bg_el = document.getElementById('bg');
                        if (bg_el != null){
                            bg_el.style.backgroundImage = "url('https://i.imgur.com/xlJEVfm.png')";
                        }
                    } 
                    else if(context.recResult  == "close"){
                        console.log(context.recResult)
                        var bg_el = document.getElementById('bg');
                        if (bg_el != null){
                            bg_el.style.backgroundImage = "url('https://i.imgur.com/5e1tAMP.png')";
                        }
                    }
                    else if(context.recResult  == "be cool"){
                        console.log(context.recResult)
                        potato_el.src = "https://i.imgur.com/LJTndGV.png";
                        potato_el.style.width = "120px";
                        // potato_el.style.height = "135px";
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


const rootElement = document.getElementById("root");
ReactDOM.render(
    <App />,
    rootElement);