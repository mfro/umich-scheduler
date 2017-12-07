import * as messages from './messages';
import SchedulerWorker from 'worker-loader!./worker';

declare function require(path: string): any;

let currentWorker: SchedulerWorker | null;

function async<TReq, TRes>(type: string, request: TReq, p: (m: messages.Any) => boolean) {
    if (currentWorker == null)
        return Promise.reject(new Error('No active worker'));

    currentWorker.postMessage({
        type: type,
        payload: request
    });

    return new Promise<TRes>(resolve => {
        function handle(e: MessageEvent) {
            if (!p(e.data)) return;

            currentWorker!.removeEventListener('message', handle);
            resolve(e.data.payload);
        }

        currentWorker!.addEventListener('message', handle);
    });
}

export function generate(request: messages.GeneratePayload) {
    if (currentWorker != null) {
        currentWorker.terminate();
        currentWorker = null;
    }

    currentWorker = new SchedulerWorker();

    return async<messages.GeneratePayload, messages.SummaryPayload>('generate', request, m => {
        return m.type == 'summary';
    });
}

export function get(request: messages.GetResultPayload) {
    return async<messages.GetResultPayload, messages.ResultPayload>('get-result', request, m => {
        return m.type == 'result' && m.payload.index == request.index;
    }).then(p => p.schedule);
}
