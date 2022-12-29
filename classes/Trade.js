class Trade {
    constructor(size, symbol, price, buyOrderNumber, sellOrderNumber, timeTraded) {
        this.size = size;
        this.symbol = symbol;
        this.price = price;
        this.buyOrderNumber = buyOrderNumber;
        this.sellOrderNumber = sellOrderNumber;
        this.timeTraded = timeTraded;
    }

    toString() {
        return `traded ${this.size} ${this.symbol} at price of ${this.price}`;
    }
}

module.exports = Trade;
