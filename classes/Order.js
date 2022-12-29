class Order {
    constructor(size, symbol, price) {
        // for now, ignore more complicate stuff like time in force, icebergs (show size), etc.
        this.size = size;
        this.symbol = symbol;
        this.price = price;
    }

    getDirection() {
        var direction = (this.size > 0) ? 1 : -1;
        return direction;
    }
}

module.exports = Order;

