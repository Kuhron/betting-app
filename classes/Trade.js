class Trade {
    constructor(size, symbol, price, buyOrder, sellOrder) {
        this.size = size;
        this.symbol = symbol;
        this.price = price;
        this.buyOrder = buyOrder;
        this.sellOrder = sellOrder;
    }

    toString() {
        return `traded ${this.size} ${this.symbol} at price of ${this.price}`;
    }
}

module.exports = Trade;
