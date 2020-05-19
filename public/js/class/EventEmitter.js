export default class EventEmitter {
    constructor() {
        this.target = new EventTarget();
    }

    on(eventName, listener) {
        return this.target.addEventListener(eventName, listener);
    }

    once(eventName, listener) {
        return this.target.addEventListener(eventName, listener, { once: true });
    }

    off(eventName, listener) {
        return this.target.removeEventListener(eventName, listener);
    }

    emit(eventName, detail) {
        return this.target.dispatchEvent(
            new CustomEvent(eventName, { detail, cancelable: true })
        );
    }
}
