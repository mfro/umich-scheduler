export const
    LEFT_ARROW = 37,
    RIGHT_ARROW = 39,
    Q = 81,
    W = 87,
    E = 69;

export type Handler = (repeats: number) => void;

const counters = new Map<number, number>();
const onPressMap = new Map<number, Handler[]>();
const onReleaseMap = new Map<number, Handler[]>();

window.addEventListener('keydown', e => {
    console.log(e.keyCode);
    
    let counts = counters.get(e.keyCode) || 0;
    counts++;
    counters.set(e.keyCode, counts);

    let list = onPressMap.get(e.keyCode);
    if (!list) return;

    for (let handler of list) {
        handler(counts);
    }
});

window.addEventListener('keyup', e => {
    let counts = counters.get(e.keyCode) || 0;
    counters.set(e.keyCode, 0);

    let list = onReleaseMap.get(e.keyCode);
    if (!list) return;

    for (let handler of list) {
        handler(counts);
    }
});

export function onPress(e: number, handler: Handler) {
    let list = onPressMap.get(e);
    if (!list) onPressMap.set(e, list = []);

    list.push(handler);

    return () => {
        let index = list!.indexOf(handler);
        if (index < 0) return;
        list!.splice(index, 1);
    };
}

export function onRelease(e: number, handler: Handler) {
    let list = onReleaseMap.get(e);
    if (!list) onReleaseMap.set(e, list = []);

    list.push(handler);
    
    return () => {
        let index = list!.indexOf(handler);
        if (index < 0) return;
        list!.splice(index, 1);
    };
}
