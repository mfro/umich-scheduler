enum Input {
    A,
    B,
    C,
}

namespace Input {
    export type Handler = (m: typeof mousePosition) => void;

    const keyCodes = new Map<number, Input>([
        [81, Input.A], // Q
        [87, Input.C], // W
        [69, Input.B], // E
    ]);

    const pressed = new Set<Input>();
    const onPressMap = new Map<Input, Handler[]>();
    const onReleaseMap = new Map<Input, Handler[]>();

    const onMouseList: Handler[] = [];
    let mousePosition: [number, number] | null = null;
    let event: Event | null = null;
    let consumed = false;

    let suppressContextMenu = false;

    function emit(e: 'press' | 'release', input: Input) {
        let map;
        if (e == 'release') {
            pressed.delete(input);
            map = onReleaseMap;
        }
        else if (pressed.has(input))
            return;
        else {
            pressed.add(input);
            map = onPressMap;
        }

        let list = map.get(input);
        if (!list) return;

        consumed = false;
        for (let handler of list) {
            handler(mousePosition);
            if (consumed) break;
        }
    }

    window.addEventListener('keydown', e => {
        event = e;
        console.log(e.keyCode);

        let input = keyCodes.get(e.keyCode);
        if (input == null)
            return;

        emit('press', input);
        event = null;
    });

    window.addEventListener('keyup', e => {
        event = e;
        let input = keyCodes.get(e.keyCode);
        if (input == null)
            return;

        emit('release', input);
        event = null;
    });

    window.addEventListener('mousedown', e => {
        event = e;
        mousePosition = [e.clientX, e.clientY];
        if (e.button == 0)
            emit('press', Input.A);
        if (e.button == 1)
            emit('press', Input.C);
        if (e.button == 2)
            emit('press', Input.B);
        event = null;
    });

    window.addEventListener('mouseup', e => {
        event = e;
        mousePosition = [e.clientX, e.clientY];
        if (e.button == 0)
            emit('release', Input.A);
        if (e.button == 1)
            emit('release', Input.C);
        if (e.button == 2)
            emit('release', Input.B);
        event = null;
    });

    window.addEventListener('mouseenter', e => {
        event = e;
        mousePosition = [e.clientX, e.clientY];
        consumed = false;
        for (let handler of onMouseList) {
            handler(mousePosition);
            if (consumed) break;
        }
        event = null;
    });

    window.addEventListener('mouseenter', e => {
        event = e;
        mousePosition = [e.clientX, e.clientY];
        consumed = false;
        for (let handler of onMouseList) {
            handler(mousePosition);
            if (consumed) break;
        }
        event = null;
    });

    window.addEventListener('mouseleave', e => {
        event = e;
        mousePosition = null;
        consumed = false;
        for (let handler of onMouseList) {
            handler(mousePosition);
            if (consumed) break;
        }
        event = null;
    });

    window.addEventListener('mousemove', e => {
        event = e;
        mousePosition = [e.clientX, e.clientY];
        consumed = false;
        for (let handler of onMouseList) {
            handler(mousePosition);
            if (consumed) break;
        }
        event = null;
    });

    window.addEventListener('contextmenu', e => {
        if (suppressContextMenu) {
            suppressContextMenu = false;
            e.preventDefault();
        } else {
            emit('release', Input.B);
        }
    })

    export function consume() {
        if (!event) return console.warn('preventDefault outside event handler');
        // console.log('consume', event);
        if (event.type == 'mousedown' && (event as MouseEvent).button == 2)
            suppressContextMenu = true;
        event.preventDefault();
        event = null;
        consumed = true;
    }

    export function mouse() {
        return mousePosition;
    }

    export function onMouse(handler: Handler) {
        onMouseList.unshift(handler);
        return () => onMouseList.splice(onMouseList.indexOf(handler), 1);
    }

    export function onPress(e: Input, handler: Handler) {
        let list = onPressMap.get(e);
        if (!list) onPressMap.set(e, list = []);

        list.unshift(handler);

        return () => list!.splice(list!.indexOf(handler), 1);
    }

    export function onRelease(e: Input, handler: Handler) {
        let list = onReleaseMap.get(e);
        if (!list) onReleaseMap.set(e, list = []);

        list.unshift(handler);

        return () => list!.splice(list!.indexOf(handler), 1);
    }
}

export default Input;
