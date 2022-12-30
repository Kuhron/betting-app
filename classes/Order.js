class Order {
    constructor(size, originalSize, symbol, price, owner, orderNumber, timeReceived) {
        // for now, ignore more complicated stuff like time in force, icebergs (show size), etc.
        this.size = size;
        this.originalSize = originalSize;
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

    getAmount() {
        return Math.abs(this.size);
    }

    tradeSize(size) {
        if (size <= 0) {
            throw new Error("traded size must be positive")
        }
        // reduce the amount of this order when some is traded
        var amount = this.getAmount();
        amount -= size;
        if (amount < 0) {
            throw new Error("traded more than available size");
        }
        var sign = this.getDirection();
        var newSize = sign * amount;
        this.size = newSize;
    }

    isTradedOut() {
        return this.size === 0;
    }
}

module.exports = Order;
