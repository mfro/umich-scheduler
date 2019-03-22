export const
    LEFT_ARROW = 37,
    RIGHT_ARROW = 39,
    Q = 81,
    W = 87,
    E = 69,
    A = 65,
    D = 68;

export type Handler = (repeats: number) => void;

const counters = new Map<number, number>();
const onPressMap = new Map<number, Set<Handler>>();
const onReleaseMap = new Map<number, Set<Handler>>();

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
    let set = onPressMap.get(e);
    if (!set) onPressMap.set(e, set = new Set);

    set.add(handler);

    return () => set!.delete(handler);
}

export function onRelease(e: number, handler: Handler) {
    let set = onReleaseMap.get(e);
    if (!set) onReleaseMap.set(e, set = new Set);

    set.add(handler);
    
    return () => set!.delete(handler);
}
