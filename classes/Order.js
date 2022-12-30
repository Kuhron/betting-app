class Order {
    constructor(size, originalSize, symbol, price, owner, orderNumber, timeReceived, status) {
        // for now, ignore more complicated stuff like time in force, icebergs (show size), etc.
        this.size = size;
        this.originalSize = originalSize;
        this.symbol = symbol;
        this.price = price;
        this.owner = owner;
        this.orderNumber = orderNumber;
        this.timeReceived = timeReceived;
        this.status = status;
    }

    toString() {
        var sideStr = this.getDirection() === 1 ? "buy" : "sell";
        var amount = this.getAmount();
        return `Order to ${sideStr} ${amount} shares of ${this.symbol} at ${this.price}`;
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

    cancel() {
        this.status = "cancelled";
    }

    markCompleted() {
        this.status = "completed";
    }
}

module.exports = Order;
