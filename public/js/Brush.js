export default class Brush {
    constructor(size, options = Object.create(null)) {
        this.size = size;
    }

    changeSize(value) {
        if (typeof value !== "number") {
            throw new TypeError("newSize param must be a <number>");
        }

        if (value < 0.5) {
            this.size = 0.5;

            return;
        }
        this.size = value;
    }
}
