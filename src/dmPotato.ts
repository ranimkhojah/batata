import { MachineConfig, send, Action, assign } from "xstate";


function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function _do(text: string): MachineConfig<SDSContext, any, SDSEvent>  { 
    return({
        entry: text,
        always: '#root.dm.nextStep'
    })
}


// RASA API
const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = "https://mr-batata.herokuapp.com/model/parse";
export const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: `{"text": "${text}"}`
    }))
        .then(data => data.json());


export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {
                CLICK: 'welcome'
            }
        },
        welcome: {
            initial: 'prompt',
            
            states: {
                prompt: { 
                    entry: [send((_context: SDSContext) => ({ type: "SPEAK", value: "Hey help me to find the kitchen keys" })), 'gameStart', send('MAXSPEECH', {delay: 60000 , id: 'timeout'})],
                    on: { ENDSPEECH: '#root.dm.nextStep' }
                }
            }
        },
        intent: {
            invoke: {
            id: 'nlu',
                    src: (context, _) => nluRequest(context.text_intent), 
                    onDone: {
                        target: 'classify_intent',
                        actions: [assign((_, event) => { return {intent: event.data.intent.name }}),
                      (_:SDSContext, event:any) => console.log(event.data),assign((_, event) => { return {confidence: event.data.intent.confidence }})]
                    },
                    onError: {
                        target: 'nextStep',
                        actions: (_,event) => console.log(event.data)
                    }
                }
        },
        classify_intent: {
            entry: send('ENDSPEECH'),
            on: {
                ENDSPEECH: [
                    // { target: 'confirm', cond: (context) => context.confidence < 0.725 },
                    { target: 'right', cond: (context) => context.intent === 'right' },
                    { target: 'left', cond: (context) => context.intent === 'left' },
                    { target: 'jump', cond: (context) => context.intent === 'jump' },
                    { target: 'take', cond: (context) => context.intent === 'take' },
                    { target: 'open', cond: (context) => context.intent === 'open' },
                    { target: 'close', cond: (context) => context.intent === 'close' },
                    
                    {target: 'nomatch'}] 
                }
        },
        right: {
            ..._do("goRight")
        },
        left: {
            ..._do("goLeft")
        },
        jump: {
            ..._do("jump")
        },
        open: {
            ..._do("open")
        },
        close: {
            ..._do("close")
        },
        take: {
            ..._do("take")
        },
        confirm: {
            initial: 'prompt',
            states: {
                prompt: {
                    entry: say("Where? Which direction?"),
                    on: { ENDSPEECH: '#root.dm.nextStep' }
                }
            }
        },
        nomatch: {
            initial: 'prompt',
            states: {
                prompt: {
                    entry: say("What?"),
                    on: { ENDSPEECH: '#root.dm.nextStep' }
                }
            }
        },
        nextStep: {
            initial: 'ask',
            on: {
                RECOGNISED:  [{ target: 'stop', cond: (context) => context.recResult === 'stop' },
                {
                target: 'intent',
                actions: assign((context) => { return { text_intent: context.recResult } }),
                }],
                MAXSPEECH: [{ 
                    target: 'maxspeech'
            }]
            },
            states: {
                ask: {
                    entry: send('LISTEN'),
                }
            }
        },
        maxspeech: {
            entry: 'lose',
            always: '#root.dm.init'
        },
        stop: {
            entry: say("Ok"),
            always: 'init'
        }
    }
})
