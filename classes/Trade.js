class Trade {
    constructor(amount, symbol, price, buyOrderNumber, sellOrderNumber, timeTraded) {
        this.amount = amount;
        this.symbol = symbol;
        this.price = price;
        this.buyOrderNumber = buyOrderNumber;
        this.sellOrderNumber = sellOrderNumber;
        this.timeTraded = timeTraded;
    }

    toString() {
        return `traded ${this.amount} ${this.symbol} at price of ${this.price}`;
    }
}

module.exports = Trade;
