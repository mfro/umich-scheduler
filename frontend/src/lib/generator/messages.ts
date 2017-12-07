import * as generator from './generator';

export interface Block {
    id: number;
    color: string;
    locked: boolean;
}

export interface Message<Type extends string, TPayload> {
    type: Type;
    payload: TPayload;
}

export type GeneratePayload = generator.GeneratorRequest;

export interface GetResultPayload {
    index: number;
}

export interface SummaryPayload {
    count: number;
    occurences: { [id: number]: number };
}

export interface ResultPayload {
    index: number;
    schedule: Block[];
}

export type GenerateMessage = Message<'generate', GeneratePayload>;

export type GetResultMessage = Message<'get-result', GetResultPayload>;

export type SummaryMessage = Message<'summary', SummaryPayload>;
export type ResultMessage = Message<'result', ResultPayload>;

export type Any = GenerateMessage | GetResultMessage | SummaryMessage | ResultMessage;