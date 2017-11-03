import * as messages from '@/frontend-generator';

declare function require(path: string): any;

const workerUrl = require('!file-loader!@/frontend-generator');

let current: Worker | null;

function async<TReq, TRes>(type: string, request: TReq, p: (m: messages.Any) => boolean) {
    if (current == null)
        return Promise.reject(new Error('No active worker'));

    current.postMessage({
        type: type,
        payload: request
    });

    return new Promise<TRes>(resolve => {
        function handle(e: MessageEvent) {
            if (!p(e.data)) return;

            current!.removeEventListener('message', handle);
            resolve(e.data.payload);
        }

        current!.addEventListener('message', handle);
    });
}

function newWorker() {
    if (current != null) {
        current.terminate();
        current = null;
    }

    current = new Worker(workerUrl);
}

export function generate(request: messages.GeneratePayload) {
    newWorker();

    return async<messages.GeneratePayload, messages.SummaryPayload>('generate', request, m => {
        return m.type == 'summary';
    });
}

export function get(request: messages.GetResultPayload) {
    return async<messages.GetResultPayload, messages.ResultPayload>('get-result', request, m => {
        return m.type == 'result' && m.payload.index == request.index;
    }).then(p => p.schedule);
}
