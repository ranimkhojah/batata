import { MachineConfig, send, assign } from "xstate";
import {say, listen} from "./index";

const grammar: { [index: string]: { person?: string, day?: string, meeting_time?: string } } = {
    //names Charlie Spencer
    "John": { person: "John Appleseed" }, 
    "Charlie": { person: "Charlie Spencer" }, 
    "Angela": { person: "Angela Martin" }, 
    "Michael": { person: "Michael Scott" }, 
    "Pam": { person: "Pam Beesly" }, 
    "Jim": { person: "Jim Halpert" }, 
    "Dwight": { person: "Dwight Schrut" }, 
    "Creed": { person: "Creed Bratton" }, 
    "Toby": { person: "Toby Flenderson" }, 
    
    //day
    "on Saturday": { day: "Saturday" },
    "on Sunday": { day: "Sunday" },
    "on Monday": { day: "Monday" },
    "on Tuesday": { day: "Tuesday" },
    "on Wednesday": { day: "Wednesday" },
    "on Thursday": { day: "Thursday" },
    "on Friday": { day: "Friday" },
    "tomorrow": { day: "tomorrow" },

    //time
    "at 1": { meeting_time: "one" },
    "at 2": { meeting_time: "two" },
    "at 3": { meeting_time: "three" },
    "at 4": { meeting_time: "four" },
    "at 5": { meeting_time: "five" },
    "at 6": { meeting_time: "six" },
    "at 7": { meeting_time: "seven" },
    "at 8": { meeting_time: "eight" },
    "at 9": { meeting_time: "nine" },
    "at 10": { meeting_time: "ten" },
    "at 11": { meeting_time: "eleven" }
}

const boolGrammar: { [index: string]: { bool?: boolean}}={
    "yes": {bool: true},
    "sure": {bool: true},
    "of course": {bool: true},
    "that works": {bool: true},
    "yeah": {bool: true},
    "okay": {bool: true},
    "OK": {bool: true},
    "no problem": {bool: true},
    "absolutely": {bool: true},

    "nope": {bool: false},
    "no": {bool: false},
    "no way": {bool: false},
    "not at all": {bool: false},
    "impossible": {bool: false},
    "not really": {bool: false},
    "not sure": {bool: false},
    "I don't know": {bool: false}
}



export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'welcome',
    states: {
        init: {
            on: {
                CLICK: 'welcome'
            }
        },
        welcome: {
            initial: "prompt",
            on: { ENDSPEECH: "who" },
            states: {
                prompt: { entry: say("Let's create an appointment") }
            }
        },
        who: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "person" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { person: grammar[context.recResult].person } }),
                    target: "day"
                },
                { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: say("Who are you meeting with?"),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't know them"),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        day: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "day" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { day: grammar[context.recResult].day } }),
                    target: "whole_day"

                },
                { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `OK ${context.person}. what day is your meeting?`
                    })),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't understand"),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        whole_day: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => boolGrammar[context.recResult].bool === true,
                    actions: assign((context) => { return { bool: boolGrammar[context.recResult].bool } }),
                    target: "confirm_whole"
                },{
                    cond: (context) => boolGrammar[context.recResult].bool === false,
                    actions: assign((context) => { return { bool: boolGrammar[context.recResult].bool } }),
                    target: "time"
                },
                { target: ".nomatch" }]
            },
                states: {
                    prompt: {
                        entry: send((context) => ({
                            type: "SPEAK",
                            value: `OK. ${context.day}. Will it take the whole day?`
                        })),
                        on: { ENDSPEECH: "ask" }
                    },
                    ask: {
                        entry: listen()
                    },
                    nomatch: {
                        entry: say("Sorry I don't understand"),
                        on: { ENDSPEECH: "prompt" }
                    }
            }

        },
        time: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "meeting_time" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { meeting_time: grammar[context.recResult].meeting_time } }),
                    target: "confirm_time"

                },
                { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `OK. what time is your meeting?`
                    })),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `sorry i dont understand ${context.meeting_time}`
                    })),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        confirm_time:{
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => boolGrammar[context.recResult].bool == true,
                    actions: assign((context) => { return { bool: boolGrammar[context.recResult].bool } }),
                    target: "created"
                },{
                    cond: (context) => boolGrammar[context.recResult].bool == false,
                    actions: assign((context) => { return { bool: boolGrammar[context.recResult].bool } }),
                    target: "who"
                },
                { target: ".nomatch" }]
                },
                states: {
                    prompt: {
                        entry: send((context) => ({
                            type: "SPEAK",
                            value: `OK. do you want me to create an appointment with ${context.person} on ${context.day} at ${context.meeting_time}?`
                        })),
                        on: { ENDSPEECH: "ask" }
                    },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't understand"),
                    on: { ENDSPEECH: "prompt" }
                }
            }

        },
        confirm_whole: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => boolGrammar[context.recResult].bool === true,
                    actions: assign((context) => { return { bool: boolGrammar[context.recResult].bool } }),
                    target: "created"
                },{
                    cond: (context) => boolGrammar[context.recResult].bool === false,
                    actions: assign((context) => { return { bool: boolGrammar[context.recResult].bool } }),
                    target: "who"
                },
                { target: ".nomatch" }]
                },
                states: {
                    prompt: {
                        entry: send((context) => ({
                            type: "SPEAK",
                            value: `OK. do you want me to create an appointment with ${context.person} on ${context.day} for the whole day?`
                        })),
                        on: { ENDSPEECH: "ask" }
                    },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't understand"),
                    on: { ENDSPEECH: "prompt" }
                }
            }

        },
        created: {
            initial: "prompt",
            on: {ENDSPEECH: "welcome"},
            states: {
                prompt: { entry: say("Your appointment has been created") }
            }
        }
    }
})
