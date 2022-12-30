class Security {
    constructor(symbol, password, securityType, tickSize, multiplier, status, settlementPrice) {
        this.symbol = symbol;
        this.password = password;
        this.securityType = securityType;
        this.tickSize = tickSize;
        this.multiplier = multiplier;
        this.status = status;
        this.settlementPrice = settlementPrice;
    }

    halt() {
        this.status = "halted";
    }

    activate() {
        this.status = "active";
    }

    settle(settlementPrice) {
        this.status = "settled";
        this.settlementPrice = settlementPrice;
    }

    settlementPriceIsValid(price) {
        if (isNaN(price)) return false;
        if (this.securityType === 'Boolean') {
            return (price === 0 || price === 100);
        } else {
            return true;
        }
    }
}

module.exports = Security;
