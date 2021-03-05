import { MachineConfig, send, assign } from "xstate";
import {say, listen} from "./index";
import { promptAndAsk } from "./index";


import { loadGrammar } from './runparser'
import { parse } from './chartparser'
import { grammar } from './grammars/homeGrammar'

/* funnyGrammar test */
// const gram = loadGrammar(grammar)
// const input = "to do is to be"
// const prs = parse(input.split(/\s+/), gram)
// const result = prs.resultsForRule(gram.$root)[0]
// console.log(result) //accessed in the machine via ${result.quote.source} 

export const getRuleObj = (input: string) => {
    const gram = loadGrammar(grammar);
    const prs = parse(input.split(/\s+/), gram);
    const result = prs.resultsForRule(gram.$root)[0]
    const reply = "action to perform is, "+result.command.action+". on object, " + result.command.object;
    return reply
}

export const dmMachineHome: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'welcome',
    states: {
        welcome: {
            initial: "prompt",
            on: { ENDSPEECH: "task" },
            states: {
                prompt: { entry: say("Welcome to Smart Home") }
            }
        },
        task: {
            initial: "prompt",
            on: {
                RECOGNISED: {
                    target: 'perform',
                    actions: assign((context) => {return { rule: getRuleObj(context.recResult) } })
                        }
                    },
            ...promptAndAsk("What would you like me to do?")
        },
        perform: {
            initial: "prompt",
            states: {
                prompt: { 
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `OK ${context.rule}.`
                    }))
                }
            }
        }
    }
})
