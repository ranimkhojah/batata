/// <reference types="react-scripts" />

declare module 'react-speech-kit';

interface SDSContext {
    recResult: string;
    count: number;
    nluData: any;
    ttsAgenda: string;
    person: string;
    bool: boolean;
    string_bool: string;
    confirm: boolean;
    name: string;
    meeting_time: string;
    day: string;
    statement: string;
    intent: string;
    duration: string;
    rule: string;
}

type SDSEvent =
    | { type: 'CLICK' }
    | { type: 'MAXSPEECH' }
    | { type: 'RECOGNISED' }
    | { type: 'ASRRESULT', value: string }
    | { type: 'ENDSPEECH' }
    | { type: 'LISTEN' }
    | { type: 'SPEAK', value: string };
