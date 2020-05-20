/**
 * ORIGINAL CODE CREATED BY Elisee MAURER for Superpowers
 * https://github.com/superpowers/superpowers-game/tree/master/SupEngine/src
 */

// Require Node.js Dependencies
import EventEmitter from "./EventEmitter.js";

// Require Third-party Dependencies
// import THREE from "three";

export default class Input extends EventEmitter {
    constructor(canvas, options = {}) {
        super();

        // Init default values
        this.mouseButtons = [];
        this.mouseButtonsDown = [];
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };
        this.newMouseDelta = { x: 0, y: 0 };
        this.touches = [];
        this.touchesDown = [];
        this.keyboardButtons = new Map();
        this.keyboardButtonsDown = new Set();
        this.autoRepeatedKey = null;
        this.textEntered = "";
        this.newTextEntered = "";
        this.gamepadsButtons = [];
        this.gamepadsAxes = [];
        this.gamepadsAutoRepeats = [];
        this.gamepadAxisDeadZone = 0.25;
        this.gamepadAxisAutoRepeatDelayMs = 500;
        this.gamepadAxisAutoRepeatRateMs = 33;
        this.exited = false;
        this.wantsPointerLock = false;
        this.wantsFullscreen = false;
        this.wasPointerLocked = false;
        this.wasFullscreen = false;
        this.canvas = canvas;

        this.canvas.requestPointerLock = this.canvas.requestPointerLock ||
            this.canvas.mozRequestPointerLock ||
            this.canvas.webkitRequestPointerLock;

        // Mouse
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("mousedown", this.onMouseDown.bind(this));
        document.addEventListener("dblclick", this.onMouseDblClick.bind(this));
        document.addEventListener("mouseup", this.onMouseUp.bind(this));
        document.addEventListener("contextmenu", this.onContextMenu.bind(this));
        document.addEventListener("DOMMouseScroll", this.onMouseWheel.bind(this));
        document.addEventListener("mousewheel", this.onMouseWheel.bind(this));

        if ("onpointerlockchange" in document) {
            document.addEventListener("pointerlockchange", this.onPointerLockChange.bind(this), false);
        }
        else if ("onmozpointerlockchange" in document) {
            document.addEventListener("mozpointerlockchange", this.onPointerLockChange.bind(this), false);
        }
        else if ("onwebkitpointerlockchange" in document) {
            document.addEventListener("webkitpointerlockchange", this.onPointerLockChange.bind(this), false);
        }

        if ("onpointerlockerror" in document) {
            document.addEventListener("pointerlockerror", this.onPointerLockError.bind(this), false);
        }
        else if ("onmozpointerlockerror" in document) {
            document.addEventListener("mozpointerlockerror", this.onPointerLockError.bind(this), false);
        }
        else if ("onwebkitpointerlockerror" in document) {
            document.addEventListener("webkitpointerlockerror", this.onPointerLockError.bind(this), false);
        }

        if ("onfullscreenchange" in document) {
            document.addEventListener("fullscreenchange", this.onFullscreenChange.bind(this), false);
        }
        else if ("onmozfullscreenchange" in document) {
            document.addEventListener("mozfullscreenchange", this.onFullscreenChange.bind(this), false);
        }
        else if ("onwebkitfullscreenchange" in document) {
            document.addEventListener("webkitfullscreenchange", this.onFullscreenChange.bind(this), false);
        }

        if ("onfullscreenerror" in document) {
            document.addEventListener("fullscreenerror", this.onFullscreenError.bind(this), false);
        }
        else if ("onmozfullscreenerror" in document) {
            document.addEventListener("mozfullscreenerror", this.onFullscreenError.bind(this), false);
        }
        else if ("onwebkitfullscreenerror" in document) {
            document.addEventListener("webkitfullscreenerror", this.onFullscreenError.bind(this), false);
        }

        // Touch
        this.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
        this.canvas.addEventListener("touchend", this.onTouchEnd.bind(this));
        this.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));

        // Keyboard
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keypress", this.onKeyPress.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));

        // Gamepad
        for (let i = 0; i < 4; i++) {
            this.gamepadsButtons[i] = [];
            this.gamepadsAxes[i] = [];
            this.gamepadsAutoRepeats[i] = null;
        }

        // On exit
        if (options.enableOnExit) {
            window.onbeforeunload = this.doExitCallback;
        }

        window.addEventListener("blur", this.onBlur.bind(this));
        this.reset();
    }

    _getKeyboardButton(code) {
        let button = this.keyboardButtons.get(code);
        if (!button) {
            button = {
                isDown: false,
                wasJustPressed: false,
                wasJustAutoRepeated: false,
                wasJustReleased: false
            };
            this.keyboardButtons.set(code, button);
        }

        return button;
    }

    getMouseVisible() {
        return this.canvas.style.cursor !== "none";
    }

    setMouseVisible(visible = false) {
        this.canvas.style.cursor = visible ? "auto" : "none";
    }

    getMousePosition() {
        return new THREE.Vector2(
            (this.mousePosition.x / this.canvas.clientWidth) * 2 - 1,
            ((this.mousePosition.y / this.canvas.clientHeight) * 2 - 1) * -1
        );
    }

    getMouseDelta() {
        return new THREE.Vector2(
            (this.mouseDelta.x / this.canvas.clientWidth) * 2,
            (this.mouseDelta.y / this.canvas.clientHeight) * -2
        );
    }

    _checkKeyboard(keyName, type = "isDown") {
        if (keyName === "ANY") {
            for (const key of this.keyboardButtons.values()) {
                if (key[type]) {
                    return true;
                }
            }

            return false;
        }
        if (keyName === "NONE") {
            for (const key of this.keyboardButtons.values()) {
                if (key[type]) {
                    return false;
                }
            }

            return true;
        }

        return this._getKeyboardButton(keyName);
    }

    isKeyDown(keyName) {
        const keyboardButton = this._checkKeyboard(keyName, "isDown");

        return keyboardButton.isDown;
    }

    wasKeyJustPressed(keyName, options = {}) {
        const keyboardButton = this._checkKeyboard(keyName, "wasJustPressed");

        return keyboardButton.wasJustPressed || (options.autoRepeat && keyboardButton.wasJustAutoRepeated);
    }

    wasKeyJustReleased(keyName) {
        const keyboardButton = this._checkKeyboard(keyName, "wasJustReleased");

        return keyboardButton.wasJustReleased;
    }

    isMouseButtonDown(button) {
        if (this.mouseButtons[button] === null) {
            throw new Error("Invalid button index");
        }

        return this.mouseButtons[button].isDown;
    }

    wasMouseButtonJustPressed(button) {
        if (this.mouseButtons[button] === null) {
            throw new Error("Invalid button index");
        }

        return this.mouseButtons[button].wasJustPressed;
    }

    wasMouseButtonJustReleased(button) {
        if (this.mouseButtons[button] === null) {
            throw new Error("Invalid button index");
        }

        return this.mouseButtons[button].wasJustReleased;
    }

    destroy() {
        this.removeAllListeners();

        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mousedown", this.onMouseDown);
        document.removeEventListener("mouseup", this.onMouseUp);
        document.removeEventListener("contextmenu", this.onContextMenu);
        document.removeEventListener("DOMMouseScroll", this.onMouseWheel);
        document.removeEventListener("mousewheel", this.onMouseWheel);

        if ("onpointerlockchange" in document)
            document.removeEventListener("pointerlockchange", this.onPointerLockChange, false);
        else if ("onmozpointerlockchange" in document)
            document.removeEventListener("mozpointerlockchange", this.onPointerLockChange, false);
        else if ("onwebkitpointerlockchange" in document)
            document.removeEventListener("webkitpointerlockchange", this.onPointerLockChange, false);

        if ("onpointerlockerror" in document)
            document.removeEventListener("pointerlockerror", this.onPointerLockError, false);
        else if ("onmozpointerlockerror" in document)
            document.removeEventListener("mozpointerlockerror", this.onPointerLockError, false);
        else if ("onwebkitpointerlockerror" in document)
            document.removeEventListener("webkitpointerlockerror", this.onPointerLockError, false);

        if ("onfullscreenchange" in document)
            document.removeEventListener("fullscreenchange", this.onFullscreenChange, false);
        else if ("onmozfullscreenchange" in document)
            document.removeEventListener("mozfullscreenchange", this.onFullscreenChange, false);
        else if ("onwebkitfullscreenchange" in document)
            document.removeEventListener("webkitfullscreenchange", this.onFullscreenChange, false);

        if ("onfullscreenerror" in document) document.removeEventListener("fullscreenerror", this.onFullscreenError, false);
        else if ("onmozfullscreenerror" in document)
            document.removeEventListener("mozfullscreenerror", this.onFullscreenError, false);
        else if ("onwebkitfullscreenerror" in document)
            document.removeEventListener("webkitfullscreenerror", this.onFullscreenError, false);

        this.canvas.removeEventListener("touchstart", this.onTouchStart);
        this.canvas.removeEventListener("touchend", this.onTouchEnd);
        this.canvas.removeEventListener("touchmove", this.onTouchMove);

        document.removeEventListener("keydown", this.onKeyDown);
        document.removeEventListener("keypress", this.onKeyPress);
        document.removeEventListener("keyup", this.onKeyUp);

        window.removeEventListener("blur", this.onBlur);
    }

    reset() {
        // Mouse
        this.newScrollDelta = 0;
        for (let i = 0; i <= 6; i++) {
            this.mouseButtons[i] = {
                isDown: false,
                doubleClicked: false,
                wasJustPressed: false,
                wasJustReleased: false
            };
            this.mouseButtonsDown[i] = false;
        }

        this.mousePosition.x = 0;
        this.mousePosition.y = 0;
        this.newMousePosition = null;

        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
        this.newMouseDelta.x = 0;
        this.newMouseDelta.y = 0;

        // Touch
        for (let i = 0; i < Input.maxTouches; i++) {
            this.touches[i] = {
                isDown: false,
                wasStarted: false,
                wasEnded: false,
                position: { x: 0, y: 0 }
            };
            this.touchesDown[i] = false;
        }

        // Keyboard
        this.keyboardButtons.clear();
        this.keyboardButtonsDown.clear();

        this.textEntered = "";
        this.newTextEntered = "";

        // Gamepads
        for (let i = 0; i < 4; i++) {
            for (let button = 0; button < 16; button++) {
                this.gamepadsButtons[i][button] = {
                    isDown: false,
                    wasJustPressed: false,
                    wasJustReleased: false,
                    value: 0
                };
            }
            for (let axes = 0; axes < 4; axes++) {
                this.gamepadsAxes[i][axes] = {
                    wasPositiveJustPressed: false,
                    wasPositiveJustAutoRepeated: false,
                    wasPositiveJustReleased: false,
                    wasNegativeJustPressed: false,
                    wasNegativeJustAutoRepeated: false,
                    wasNegativeJustReleased: false,
                    value: 0
                };
            }
        }
    }

    lockMouse() {
        this.wantsPointerLock = true;
        // this.newMouseDelta.x = 0;
        // this.newMouseDelta.y = 0;
        this._doPointerLock();
    }

    unlockMouse() {
        this.wantsPointerLock = false;
        this.wasPointerLocked = false;
        if (!this._isPointerLocked()) {
            return;
        }

        if (document.exitPointerLock) document.exitPointerLock();
        else if (document.webkitExitPointerLock) document.webkitExitPointerLock();
        else if (document.mozExitPointerLock) document.mozExitPointerLock();
    }

    _isPointerLocked() {
        return (
            document.pointerLockElement === this.canvas ||
            document.webkitPointerLockElement === this.canvas ||
            document.mozPointerLockElement === this.canvas
        );
    }

    _doPointerLock() {
        if (this.canvas.requestPointerLock) {
            this.canvas.requestPointerLock();
        }
        else if (this.canvas.webkitRequestPointerLock) {
            this.canvas.webkitRequestPointerLock();
        }
        else if (this.canvas.mozRequestPointerLock) {
            this.canvas.mozRequestPointerLock();
        }
    }

    onPointerLockChange() {
        console.log("onPointerLockChange");
        const isPointerLocked = this._isPointerLocked();
        if (this.wasPointerLocked !== isPointerLocked) {
            this.emit("mouseLockStateChange", isPointerLocked ? "active" : "suspended");
            this.wasPointerLocked = isPointerLocked;
        }
    }

    onPointerLockError() {
        if (this.wasPointerLocked) {
            this.emit("mouseLockStateChange", "suspended");
            this.wasPointerLocked = false;
        }
    }

    goFullscreen() {
        this.wantsFullscreen = true;
    }

    exitFullscreen() {
        this.wantsFullscreen = false;
        this.wasFullscreen = false;
        if (!this.isFullscreen()) {
            return;
        }

        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    }

    isFullscreen() {
        return (
            document.fullscreenElement === this.canvas ||
            document.webkitFullscreenElement === this.canvas ||
            document.mozFullScreenElement === this.canvas
        );
    }

    _doGoFullscreen() {
        if (this.canvas.requestFullscreen) {
            this.canvas.requestFullscreen();
        }
        else if (this.canvas.webkitRequestFullscreen) {
            this.canvas.webkitRequestFullscreen();
        }
        else if (this.canvas.mozRequestFullScreen) {
            this.canvas.mozRequestFullScreen();
        }
    }

    onFullscreenChange() {
        const isFullscreen = this.isFullscreen();
        if (this.wasFullscreen !== isFullscreen) {
            this.emit("fullscreenStateChange", isFullscreen ? "active" : "suspended");
            this.wasFullscreen = isFullscreen;
        }
    }

    onFullscreenError() {
        if (this.wasFullscreen) {
            this.emit("fullscreenStateChange", "suspended");
            this.wasFullscreen = false;
        }
    }

    onBlur() {
        this.reset();
    }

    onMouseMove(event) {
        event.preventDefault();

        if (this.wantsPointerLock) {
            if (this.wasPointerLocked) {
                const delta = { x: 0, y: 0 };
                if (event.movementX !== null) {
                    delta.x = event.movementX;
                    delta.y = event.movementY;
                }
                else if (event.webkitMovementX !== null) {
                    delta.x = event.webkitMovementX;
                    delta.y = event.webkitMovementY;
                }
                else if (event.mozMovementX === null) {
                    delta.x = event.mozMovementX;
                    delta.y = event.mozMovementY;
                }

                this.newMouseDelta.x += delta.x;
                this.newMouseDelta.y += delta.y;
            }
        }
        else {
            const rect = event.target.getBoundingClientRect();
            this.newMousePosition = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }
    }

    onMouseDown(event) {
        event.preventDefault();
        this.canvas.focus();
        this.mouseButtonsDown[event.button] = true;

        if (this.wantsFullscreen && !this.wasFullscreen) {
            this._doGoFullscreen();
        }
        // if (this.wantsPointerLock && !this.wasPointerLocked) {
        //     this._doPointerLock();
        // }
    }

    onMouseUp(event) {
        if (this.mouseButtonsDown[event.button]) {
            event.preventDefault();
        }
        this.mouseButtonsDown[event.button] = false;

        if (this.wantsFullscreen && !this.wasFullscreen) {
            this._doGoFullscreen();
        }
        // if (this.wantsPointerLock && !this.wasPointerLocked) {
        //     this._doPointerLock();
        // }
    }

    onMouseDblClick(event) {
        event.preventDefault();
        this.mouseButtons[event.button].doubleClicked = true;
    }

    onContextMenu(event) {
        event.preventDefault();
    }

    onMouseWheel(event) {
        this.newScrollDelta = event.wheelDelta > 0 || event.detail < 0 ? 1 : -1;

        return false;
    }

    onTouchStart(event) {
        event.preventDefault();

        const rect = event.target.getBoundingClientRect();
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            this.touches[touch.identifier].position.x = touch.clientX - rect.left;
            this.touches[touch.identifier].position.y = touch.clientY - rect.top;
            this.touchesDown[touch.identifier] = true;

            if (touch.identifier === 0) {
                this.newMousePosition = {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                };
                this.mouseButtonsDown[0] = true;
            }
        }
    }

    onTouchEnd(event) {
        event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            this.touchesDown[touch.identifier] = false;
            if (touch.identifier === 0) {
                this.mouseButtonsDown[0] = false;
            }
        }
    }

    onTouchMove(event) {
        event.preventDefault();
        const rect = event.target.getBoundingClientRect();

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            this.touches[touch.identifier].position.x = touch.clientX - rect.left;
            this.touches[touch.identifier].position.y = touch.clientY - rect.top;

            if (touch.identifier === 0) {
                this.newMousePosition = {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                };
            }
        }
    }

    onKeyDown(event) {
        // NOTE: Key codes in range 33-47 are Page Up/Down, Home/End, arrow keys, Insert/Delete, etc.
        const isControlKey = event.keyCode < 48 && event.keyCode !== 32;
        if (isControlKey) {
            event.preventDefault();
        }

        if (this.keyboardButtonsDown.has(event.code)) {
            this.autoRepeatedKey = event.code;
        }
        else {
            this.keyboardButtonsDown.add(event.code);
        }

        return !isControlKey;
    }

    onKeyPress(event) {
        if (event.keyCode > 0 && event.keyCode < 32) {
            return;
        }

        if (event.char !== null) {
            this.newTextEntered += event.char;
        }
        else if (event.charCode !== 0) {
            this.newTextEntered += String.fromCharCode(event.charCode);
        }
        else {
            this.newTextEntered += String.fromCharCode(event.keyCode);
        }
    }

    onKeyUp(event) {
        this.keyboardButtonsDown.delete(event.code);
    }

    doExitCallback() {
        // NOTE: It seems window.onbeforeunload might be called twice
        // in some circumstances so we check if the callback was cleared already
        // http://stackoverflow.com/questions/8711393/onbeforeunload-fires-twice
        if (!this.exited) {
            this.emit("exit");
        }
        this.exited = true;
    }

    update() {
        this.mouseButtonsDown[5] = this.newScrollDelta > 0;
        this.mouseButtonsDown[6] = this.newScrollDelta < 0;
        if (this.newScrollDelta !== 0) {
            this.newScrollDelta = 0;
        }

        // if (this.wantsPointerLock) {
        //     this.mouseDelta.x = this.newMouseDelta.x;
        //     this.mouseDelta.y = this.newMouseDelta.y;
        //     this.newMouseDelta.x = 0;
        //     this.newMouseDelta.y = 0;
        // }
        // else if (this.newMousePosition !== null) {
        //     this.mouseDelta.x = this.newMousePosition.x - this.mousePosition.x;
        //     this.mouseDelta.y = this.newMousePosition.y - this.mousePosition.y;

        //     this.mousePosition.x = this.newMousePosition.x;
        //     this.mousePosition.y = this.newMousePosition.y;
        //     this.newMousePosition = null;
        // }
        // else {
        //     this.mouseDelta.x = 0;
        //     this.mouseDelta.y = 0;
        // }

        if (this.newMousePosition === null) {
            this.mouseDelta.x = this.newMouseDelta.x;
            this.mouseDelta.y = this.newMouseDelta.y;
            this.newMouseDelta.x = 0;
            this.newMouseDelta.y = 0;
        }
        else {
            this.mouseDelta.x = this.newMousePosition.x - this.mousePosition.x;
            this.mouseDelta.y = this.newMousePosition.y - this.mousePosition.y;

            this.mousePosition.x = this.newMousePosition.x;
            this.mousePosition.y = this.newMousePosition.y;
            this.newMousePosition = null;
        }


        for (let i = 0; i < this.mouseButtons.length; i++) {
            const mouseButton = this.mouseButtons[i];
            const wasDown = mouseButton.isDown;
            mouseButton.isDown = this.mouseButtonsDown[i];

            mouseButton.wasJustPressed = !wasDown && mouseButton.isDown;
            mouseButton.wasJustReleased = wasDown && !mouseButton.isDown;
        }

        for (let i = 0; i < this.touches.length; i++) {
            const touch = this.touches[i];
            const wasDown = touch.isDown;
            touch.isDown = this.touchesDown[i];

            touch.wasStarted = !wasDown && touch.isDown;
            touch.wasEnded = wasDown && !touch.isDown;
        }

        for (const buttonDown of this.keyboardButtonsDown) {
            const button = this._getKeyboardButton(buttonDown);
            button.isDown = true;
        }

        for (const [code, keyboardButton] of this.keyboardButtons) {
            const wasDown = keyboardButton.isDown;
            keyboardButton.isDown = this.keyboardButtonsDown.has(code);

            keyboardButton.wasJustPressed = !wasDown && keyboardButton.isDown;
            keyboardButton.wasJustAutoRepeated = false;
            keyboardButton.wasJustReleased = wasDown && !keyboardButton.isDown;
        }

        if (this.autoRepeatedKey !== null) {
            this._getKeyboardButton(this.autoRepeatedKey).wasJustAutoRepeated = true;
            this.autoRepeatedKey = null;
        }

        this.textEntered = this.newTextEntered;
        this.newTextEntered = "";

        const gamepads = navigator.getGamepads === null ? null : navigator.getGamepads();
        if (gamepads === null) {
            return;
        }

        for (let index = 0; index < 4; index++) {
            const gamepad = gamepads[index];
            if (gamepad === null) {
                continue;
            }

            for (let i = 0; i < this.gamepadsButtons[index].length; i++) {
                if (!Reflect.has(gamepad.buttons, i) || gamepad.buttons[i] === null) {
                    continue;
                }

                const button = this.gamepadsButtons[index][i];
                const wasDown = button.isDown;
                button.isDown = gamepad.buttons[i].pressed;
                button.value = gamepad.buttons[i].value;

                button.wasJustPressed = !wasDown && button.isDown;
                button.wasJustReleased = wasDown && !button.isDown;
            }

            const pressedValue = 0.5;
            const now = Date.now();

            for (let stick = 0; stick < 2; stick++) {
                if (gamepad.axes[2 * stick] === null || gamepad.axes[2 * stick + 1] === null) {
                    continue;
                }

                const axisLength = Math.sqrt(
                    Math.pow(Math.abs(gamepad.axes[2 * stick]), 2) + Math.pow(Math.abs(gamepad.axes[2 * stick + 1]), 2)
                );

                const axes = [this.gamepadsAxes[index][2 * stick], this.gamepadsAxes[index][2 * stick + 1]];

                const wasAxisDown = [
                    { positive: axes[0].value > pressedValue, negative: axes[0].value < -pressedValue },
                    { positive: axes[1].value > pressedValue, negative: axes[1].value < -pressedValue }
                ];

                if (axisLength < this.gamepadAxisDeadZone) {
                    axes[0].value = 0;
                    axes[1].value = 0;
                }
                else {
                    axes[0].value = gamepad.axes[2 * stick];
                    axes[1].value = gamepad.axes[2 * stick + 1];
                }

                const isAxisDown = [
                    { positive: axes[0].value > pressedValue, negative: axes[0].value < -pressedValue },
                    { positive: axes[1].value > pressedValue, negative: axes[1].value < -pressedValue }
                ];

                axes[0].wasPositiveJustPressed = !wasAxisDown[0].positive && isAxisDown[0].positive;
                axes[0].wasPositiveJustReleased = wasAxisDown[0].positive && !isAxisDown[0].positive;
                axes[0].wasPositiveJustAutoRepeated = false;

                axes[0].wasNegativeJustPressed = !wasAxisDown[0].negative && isAxisDown[0].negative;
                axes[0].wasNegativeJustReleased = wasAxisDown[0].negative && !isAxisDown[0].negative;
                axes[0].wasNegativeJustAutoRepeated = false;

                axes[1].wasPositiveJustPressed = !wasAxisDown[1].positive && isAxisDown[1].positive;
                axes[1].wasPositiveJustReleased = wasAxisDown[1].positive && !isAxisDown[1].positive;
                axes[1].wasPositiveJustAutoRepeated = false;

                axes[1].wasNegativeJustPressed = !wasAxisDown[1].negative && isAxisDown[1].negative;
                axes[1].wasNegativeJustReleased = wasAxisDown[1].negative && !isAxisDown[1].negative;
                axes[1].wasNegativeJustAutoRepeated = false;

                let currentAutoRepeat = this.gamepadsAutoRepeats[index];
                if (currentAutoRepeat !== null) {
                    const axisIndex = currentAutoRepeat.axis - stick * 2;
                    if (axisIndex === 0 || axisIndex === 1) {
                        const autoRepeatedAxis = axes[axisIndex];
                        if (
                            (currentAutoRepeat.positive && !isAxisDown[axisIndex].positive) ||
                            (!currentAutoRepeat.positive && !isAxisDown[axisIndex].negative)
                        ) {
                            // Auto-repeated axis has been released
                            currentAutoRepeat = null;
                            this.gamepadsAutoRepeats[index] = null;
                        }
                        else {
                            // Check for auto-repeat deadline
                            if (currentAutoRepeat.time <= now) {
                                if (currentAutoRepeat.positive) autoRepeatedAxis.wasPositiveJustAutoRepeated = true;
                                else autoRepeatedAxis.wasNegativeJustAutoRepeated = true;
                                currentAutoRepeat.time = now + this.gamepadAxisAutoRepeatRateMs;
                            }
                        }
                    }
                }

                let newAutoRepeat;
                if (axes[0].wasPositiveJustPressed || axes[0].wasNegativeJustPressed) {
                    newAutoRepeat = {
                        axis: stick * 2,
                        positive: axes[0].wasPositiveJustPressed,
                        time: now + this.gamepadAxisAutoRepeatDelayMs
                    };
                }
                else if (axes[1].wasPositiveJustPressed || axes[1].wasNegativeJustPressed) {
                    newAutoRepeat = {
                        axis: stick * 2 + 1,
                        positive: axes[1].wasPositiveJustPressed,
                        time: now + this.gamepadAxisAutoRepeatDelayMs
                    };
                }

                if (newAutoRepeat !== null) {
                    if (
                        currentAutoRepeat === null ||
                        currentAutoRepeat.axis !== newAutoRepeat.axis ||
                        currentAutoRepeat.positive !== newAutoRepeat.positive
                    ) {
                        this.gamepadsAutoRepeats[index] = newAutoRepeat;
                    }
                }
            }
        }
    }
}
Input.maxTouches = 10;
