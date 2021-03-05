import { MachineConfig} from "xstate";

import {say} from "./index";


export const dmMachineTodo: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'welcome',
    states: {
        welcome: {
            initial: "prompt",
            states: {
                prompt: { 
                    entry: say("Welcome to your to do items. You have nothing to do. so, bye bye.") }
            }
        }
    }
})
