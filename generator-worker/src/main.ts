import Section from '@mfro/umich-scheduler-common/section';

import * as messages from './messages';
import * as generator from './generator';

export * from './messages';

declare function postMessage(arg: any): void;

addEventListener('message', e => {
    const msg = e.data as messages.Message<any, any>;

    const handler = handlers[msg.type];

    if (handler == null) {
        console.error('Unknown message type:', e.data);
        return;
    }

    handler(msg);
});

function send<T extends messages.Message<any, any>>(m: T) {
    postMessage(m);
}

let summary: messages.SummaryPayload | null = null;
let results = new Array<messages.Block[]>();

const handlers: { [type: string]: (m: messages.Message<any, any>) => void } = {
    generate(m: messages.GenerateMessage) {
        if (summary != null)
            return console.error('Reusing worker');

        let request = m.payload;
        request.courses = request.courses.map(l => l.map(s => Section.deserialize(s)));

        let result = generator.generate(m.payload);

        results = result.schedules.map(b => b.map(b => ({
            id: b.section.id,
            color: b.color,
            locked: b.locked,
        })));

        send<messages.SummaryMessage>({
            type: 'summary',
            payload: {
                count: results.length,
                occurences: result.occurences,
            },
        });
    },

    'get-result'(m: messages.GetResultMessage) {
        if (results == null)
            return console.error('Getting non generated worker');

        send<messages.ResultMessage>({
            type: 'result',
            payload: {
                index: m.payload.index,
                schedule: results[m.payload.index],
            },
        });
    }
};
