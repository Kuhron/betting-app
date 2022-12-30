class Account {
    constructor(owner) {
        this.owner = owner;
        this.cash = 0;
        this.positions = {};
    }

    buy(amount, symbol, price, multiplier) {
        var dCash = -1 * amount * price * multiplier;
        this.addCash(dCash);
        this.addShares(symbol, amount);
    }

    sell(amount, symbol, price, multiplier) {
        var dCash = amount * price * multiplier;
        this.addCash(dCash);
        this.addShares(symbol, -1 * amount);
    }

    addCash(amount) {
        this.cash += amount;
    }

    addShares(symbol, amount) {
        if (!(symbol in this.positions)) {
            this.positions[symbol] = 0;
        }
        this.positions[symbol] += amount;
    }
}

module.exports = Account;
