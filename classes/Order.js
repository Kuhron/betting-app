class Order {
    constructor(size, symbol, price, owner, orderNumber, timeReceived) {
        // for now, ignore more complicated stuff like time in force, icebergs (show size), etc.
        this.size = size;
        this.originalSize = size;
        this.symbol = symbol;
        this.price = price;
        this.owner = owner;
        this.orderNumber = orderNumber;
        this.timeReceived = timeReceived;
    }

    getDirection() {
        var direction = (this.size > 0) ? 1 : -1;
        return direction;
    }

    getAbsSize() {
        return Math.abs(this.size);
    }

    tradeSize(size) {
        if (size <= 0) {
            throw new Error("traded size must be positive")
        }
        // reduce the amount of this order when some is traded
        var absSize = this.getAbsSize();
        absSize -= size;
        var sign = this.getDirection();
        var newSize = sign * absSize;
        this.size = newSize;
    }

    isTradedOut() {
        return this.size === 0;
    }
}

module.exports = Order;
