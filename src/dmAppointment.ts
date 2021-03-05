import { MachineConfig, send, assign, actions, Machine, interpret, createMachine } from "xstate";
import {say, listen} from "./index";

export function Prompt_Nomatch_Timeout(prompt: string, no_match:string, timeout=5000): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
	initial: 'prompt',
	states: {
            prompt: {
                entry: say(prompt),
                on: { ENDSPEECH: 'ask' }
            },
            ask: {
                entry: [send('LISTEN'), send('MAXSPEECH', {delay: timeout , id: 'timeout'})]
            },
            nomatch: {
                entry: say(no_match),
                on: { ENDSPEECH: "prompt" }
            }}})
}

export function prompt(prompt:string): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
        initial: 'prompt',
	    states: {
            prompt: {
                entry: say(prompt)
            }
        }})}
const tokenize = function (sentence: string) {
    return sentence.trim().split(" ");
};

const grammar: { [index: string]: { person?: string, day?: string, meeting_time?: string } } = {
    //names
    "John": { person: "John Appleseed" }, 
    "Bob": { person: "Bob Marley" }, 
    "Bill": { person: "Bill Gates" }, 
    "Charlie": { person: "Charlie Spencer" }, 
    "Angela": { person: "Angela Martin" }, 
    "Michael": { person: "Michael Scott" }, 
    "Pam": { person: "Pam Beesly" }, 
    "Jim": { person: "Jim Halpert" }, 
    "Dwight": { person: "Dwight Schrut" }, 
    "Creed": { person: "Creed Bratton" }, 
    "Toby": { person: "Toby Flenderson" }, 
    
    //day
    "Saturday": { day: "Saturday" },
    "Sunday": { day: "Sunday" },
    "Monday": { day: "Monday" },
    "Tuesday": { day: "Tuesday" },
    "Wednesday": { day: "Wednesday" },
    "Thursday": { day: "Thursday" },
    "Friday": { day: "Friday" },
    "on Saturday": { day: "Saturday" },
    "on Sunday": { day: "Sunday" },
    "on Monday": { day: "Monday" },
    "on Tuesday": { day: "Tuesday" },
    "on Wednesday": { day: "Wednesday" },
    "on Thursday": { day: "Thursday" },
    "on Friday": { day: "Friday" },

    //time
    "1": { meeting_time: "one" },
    "2": { meeting_time: "two" },
    "3": { meeting_time: "three" },
    "4": { meeting_time: "four" },
    "5": { meeting_time: "five" },
    "6": { meeting_time: "six" },
    "7": { meeting_time: "seven" },
    "8": { meeting_time: "eight" },
    "9": { meeting_time: "nine" },
    "10": { meeting_time: "ten" },
    "11": { meeting_time: "eleven" },
    "12": { meeting_time: "twelve" },
    "noon": { meeting_time: "twelve" },
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
    "at 11": { meeting_time: "eleven" },
    "at 12": { meeting_time: "twelve" },
    "at noon": { meeting_time: "twelve" }

}

const boolGrammar: { [index: string]: { string_bool?: string}}={
    "yes": {string_bool: 'yes'},
    "sure": {string_bool: 'yes'},
    "of course": {string_bool: 'yes'},
    "that works": {string_bool: 'yes'},
    "yeah": {string_bool: 'yes'},
    "okay": {string_bool: 'yes'},
    "OK": {string_bool: 'yes'},
    "no problem": {string_bool: 'yes'},
    "absolutely": {string_bool: 'yes'},

    "nope": {string_bool: 'no'},
    "no": {string_bool: 'no'},
    "no way": {string_bool: 'no'},
    "not at all": {string_bool: 'no'},
    "impossible": {string_bool: 'no'},
    "not really": {string_bool: 'no'},
    "not sure": {string_bool: 'no'},
}

const help_commands = ["help", "I don't know", "I don't understand", "help me", "I need help", "what does this mean", "wait what", "no wait", "what do you mean", "what the hell"]

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'welcome',
    id: 'appointment',
    states: {
        init: {
            on: {
                CLICK: {
                    target:'welcome',
                }
            }
        },
        welcome: {
            ...prompt("Let's create an appointment"),
            on: { ENDSPEECH: "fill_appointment_info" }
        },
        fill_appointment_info:{
            initial: 'who',
            on: { 
                RECOGNISED: {
                    target: 'help',
                    cond: (context) => help_commands.includes(context.recResult)
                },
                MAXSPEECH: [{ 
                    cond: (context) => context.count < 3,
                    target: 'maxspeech'
            },{
                cond: (context) => context.count == null,
                actions: assign((context)=>{return {count: Number(0)}}),
                target: 'maxspeech'
            }],
            },
            states:{
                hist: {type: 'history'},
                who: {
                    ...Prompt_Nomatch_Timeout("Who are you meeting with?", "Sorry I don't know them", 7000), //more delay because it takes some extra time to say everything at once
                    on: {
                        RECOGNISED: [{
                            cond: (context) =>  context.recResult.includes("at") && context.recResult.includes("on") && tokenize(context.recResult).indexOf("at") == 1 && tokenize(context.recResult).indexOf("on") == 3 && "person" in (grammar[tokenize(context.recResult)[0]] || {}) &&  "meeting_time" in (grammar[tokenize(context.recResult)[2]] || {}) && "day" in (grammar[tokenize(context.recResult)[4]] || {}),
                            actions: [assign((context) => { return { person: tokenize(context.recResult)[0] }}),assign((context) => { return { day: tokenize(context.recResult)[4] }}),assign((context) => { return { meeting_time: tokenize(context.recResult)[2] }})],
                            target: "confirm_time"
                        },{
                            cond: (context) =>  context.recResult.includes("at") && context.recResult.includes("on") && "person" in (grammar[tokenize(context.recResult)[0]] || {}) &&  "meeting_time" in (grammar[tokenize(context.recResult)[4]] || {}) && "day" in (grammar[tokenize(context.recResult)[2]] || {}),
                            actions: [assign((context) => { return { person: tokenize(context.recResult)[0] }}),assign((context) => { return { day: tokenize(context.recResult)[2] }}),assign((context) => { return { meeting_time: tokenize(context.recResult)[4] }})],
                            target: "confirm_time"
                        },{
                            cond: (context) => context.recResult.includes("on") && "person" in (grammar[tokenize(context.recResult)[0]] || {})  && "day" in (grammar[tokenize(context.recResult)[2]] || {}),
                            actions: [assign((context) => { return { person: tokenize(context.recResult)[0] }}),assign((context) => { return { day: tokenize(context.recResult)[2] }})],
                            target: "whole_day"
                        },{
                            cond: (context) => context.recResult.includes("at") && "person" in (grammar[tokenize(context.recResult)[0]] || {})  && "meeting_time" in (grammar[tokenize(context.recResult)[2]] || {}),
                            actions: [assign((context) => { return { person: tokenize(context.recResult)[0] }}),assign((context) => { return { meeting_time: tokenize(context.recResult)[2] }})],
                            target: "day"
                        },{
                            cond: (context) => "person" in (grammar[context.recResult] || {}),
                            actions: assign((context) => { return { person: grammar[context.recResult].person } }),
                            target: "day"
                        },{
                            cond: (context) => !(help_commands.includes(context.recResult)),
                            target: ".nomatch" }]
                    },
                    
                },
                day: {
                    ...Prompt_Nomatch_Timeout(`OK . what day is your meeting?`, "Sorry I don't understand"),
                    on: {
                        RECOGNISED: [{
                            cond: (context) =>  context.recResult.includes("at") && context.recResult.includes("on") && tokenize(context.recResult).indexOf("at") == 2 &&  "meeting_time" in (grammar[tokenize(context.recResult)[3]] || {}) && "day" in (grammar[tokenize(context.recResult)[1]] || {}),
                            actions: [assign((context) => { return { person: tokenize(context.recResult)[0] }}),assign((context) => { return { day: tokenize(context.recResult)[4] }}),assign((context) => { return { meeting_time: tokenize(context.recResult)[2] }})],
                            target: "confirm_time"
                        },{
                            cond: (context) => context.meeting_time != null && "day" in (grammar[context.recResult] || {}),
                            actions: [assign((context) => { return { day: context.recResult } })],
                            target: "confirm_time"
                        },{
                            cond: (context) => "day" in (grammar[tokenize(context.recResult)[1]] || {}) && "whole" in tokenize(context.recResult) && "day" in tokenize(context.recResult),
                            actions: assign((context) => { return { day: grammar[context.recResult].day } }),
                            target: "confirm_whole"

                        },{
                            cond: (context) => "day" in (grammar[context.recResult] || {}),
                            actions: assign((context) => { return { day: grammar[context.recResult].day } }),
                            target: "whole_day"

                        },
                        { cond: (context) => !(help_commands.includes(context.recResult)),
                            target: ".nomatch" }]
                    },
                },
                whole_day: {
                    ...Prompt_Nomatch_Timeout("OK. Will it take the whole day?", "Sorry I don't understand"),
                    on: {
                        RECOGNISED: [{
                            cond: (context) => "string_bool" in (boolGrammar[context.recResult] || {}) && boolGrammar[context.recResult].string_bool === 'yes',
                            actions: assign((context) => { return { string_bool: boolGrammar[context.recResult].string_bool } }),
                            target: "confirm_whole"
                        },{
                            cond: (context) => "string_bool" in (boolGrammar[context.recResult] || {}) && boolGrammar[context.recResult].string_bool === 'no',
                            actions: assign((context) => { return { string_bool: boolGrammar[context.recResult].string_bool } }),
                            target: "time"
                        },{
                            cond: (context) => !(help_commands.includes(context.recResult)),
                            target: ".nomatch" }]
                    },
                },
                time: {
                    ...Prompt_Nomatch_Timeout("OK. what time is your meeting?","sorry i dont understand"),
                    on: {
                        RECOGNISED: [{
                            cond: (context) => "meeting_time" in (grammar[context.recResult] || {}),
                            actions: assign((context) => { return { meeting_time: grammar[context.recResult].meeting_time } }),
                            target: "confirm_time"
                        },{ 
                            cond: (context) => !(help_commands.includes(context.recResult)),
                            target: ".nomatch" }]
                    },
                },
                confirm_time:{
                    initial: "prompt",
                    on: {
                        RECOGNISED: [{
                            cond: (context) => "string_bool" in (boolGrammar[context.recResult] || {}) && boolGrammar[context.recResult].string_bool === 'yes',
                            actions: assign((context) => { return { string_bool: boolGrammar[context.recResult].string_bool } }),
                            target: "created"
                        },{
                            cond: (context) => "string_bool" in (boolGrammar[context.recResult] || {}) && boolGrammar[context.recResult].string_bool === 'no',
                            actions: assign((context) => { return { string_bool: boolGrammar[context.recResult].string_bool } }),
                            target: "who"
                        },
                        { 
                            cond: (context) => !(help_commands.includes(context.recResult)),
                            target: ".nomatch" }]
                        },
                        states: {
                            prompt: {
                                entry: send((context) => ({
                                    type: "SPEAK",
                                    value: `OK. do you want me to create an appointment with ${context.person} on ${context.day} at ${context.meeting_time}?`})),
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
                            cond: (context) => "string_bool" in (boolGrammar[context.recResult] || {}) && boolGrammar[context.recResult].string_bool === 'yes',
                            actions: assign((context) => { return { string_bool: boolGrammar[context.recResult].string_bool } }),
                            target: "created"
                        },{
                            cond: (context) => "string_bool" in (boolGrammar[context.recResult] || {}) && boolGrammar[context.recResult].string_bool === 'no',
                            actions: assign((context) => { return { string_bool: boolGrammar[context.recResult].string_bool } }),
                            target: "who"
                        },
                        { 
                            cond: (context) => !(help_commands.includes(context.recResult)),
                            target: ".nomatch" }]
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
            ...prompt("Your appointment has been created"),
            on: {ENDSPEECH: "#root.dm.welcome"}, //goes back to the main menu
        }
    }},
    maxspeech:{
        ...prompt("I will repeat"),

        on: {
            'ENDSPEECH': {
                actions: assign((context)=> { return {count: context.count + 1 }}),
                target: 'fill_appointment_info.hist'
            }
        }
  
    },
    help:{
        ...prompt("You are a big boy, you need no help"),
        on: {'ENDSPEECH': 'fill_appointment_info.hist'}
    },
    guards:{
        
    }
    }})
