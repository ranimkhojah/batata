import { MachineConfig, send, assign } from "xstate";
import {nluRequest} from "./dmMain";
import {promptAndAsk} from "./index";


export const dmMachineTimer: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'welcome',
    states: {
        welcome: {
            on: {
            RECOGNISED: {
                target: 'duration',
                actions: assign((context) => { return { duration: context.recResult } }),
                    }
                },
            ...promptAndAsk("For how long do you want to set the timer?")
        },
        duration: {
            invoke: {
            id: 'timer',
                    src: (context, _) => nluRequest(context.duration), 
                    onDone: {
                        target: 'set',
                        actions: [assign((_, event) => { return {intent: event.data.intent.name }}),
                      (_:SDSContext, event:any) => console.log(event.data)]
                    },
            onError: {
                        target: 'welcome',
                        actions: (_,event) => console.log(event.data)
                    }
                }
        },
        set: {
            entry: send('ENDSPEECH'),
            on: {
                ENDSPEECH: [
                    { target: 'confirmation', cond: (context) => context.intent === 'time' },
                    { target: 'nomatch' }]
                }
        },
        confirmation:{
            entry: send((context) => ({
                type: "SPEAK",
                value: `OK. time set ${context.duration}`
            }))
        },
        nomatch:{
            entry: send((context) => ({
                type: "SPEAK",
                value: `I don't understand. ${context.duration} doesn't seem like a time duration`
            })),
            on: { ENDSPEECH: "welcome" }
        }
    }
})
