const fs = require('fs');

const filepaths = require('./filepaths.js');

const Trade = require('./classes/Trade.js');
const { lookupOrder } = require('./orders.js');
const { getAccountFromOwner, updateAccountRecords } = require('./users.js');



function getTradesFromSymbol(symbol) {
    // if symbol is null, get all orders
    const fp = filepaths.getTradesFilepathForSecurity(symbol);
    var s = fs.readFileSync(fp);
    var tradeParamsList = JSON.parse(s)["trades"];
    var trades = [];
    for (var i = 0; i < tradeParamsList.length; i++) {
        var tradeParams = tradeParamsList[i];
        if ((symbol === null) || (tradeParams.symbol === symbol)) {
            var amount = parseInt(tradeParams.amount);
            var symbol = tradeParams.symbol;
            var price = parseInt(tradeParams.price);
            var buyOrderNumber = parseInt(tradeParams.buyOrderNumber);
            var sellOrderNumber = parseInt(tradeParams.sellOrderNumber);
            var timeTraded = tradeParams.timeTraded;  // keep it as ISO string instead of Date object
            var trade = new Trade(amount, symbol, price, buyOrderNumber, sellOrderNumber, timeTraded);
            trades.push(trade);
        }
    }
    return trades;
}

function writeTrades(trades, symbol) {
    var fp = filepaths.getTradesFilepathForSecurity(symbol);
    for (var trade of trades) {
        if (trade.symbol !== symbol) {
            throw new Error("got trade with wrong symbol");
        }
    }
    var d = {trades: trades};
    fs.writeFileSync(fp, JSON.stringify(d, null, 4));
}

function appendTrades(newTrades, symbol) {
    var existingTrades = getTradesFromSymbol(symbol).slice();
    var trades = existingTrades.concat(newTrades);
    writeTrades(trades, symbol);
}

function getLastTradedPrice(symbol) {
    var trades = getTradesFromSymbol(symbol);
    if (trades.length === 0) {
        return null;
    }
    // don't need to sort them all, just get the max time
    var mostRecentTrade = trades[0];  // initialize it
    for (var i = 1; i < trades.length; i++) {
        var trade = trades[i];
        var comp = compareTradesByTime(trade, mostRecentTrade);
        var tradeIsMoreRecent = comp === 1;
        if (tradeIsMoreRecent) {
            mostRecentTrade = trade;
        }
    }
    return mostRecentTrade.price;
}

function compareTradesByTime(t1, t2) {
    time1 = Date.parse(t1.timeTraded);
    time2 = Date.parse(t2.timeTraded);
    if (time1 < time2) return -1;
    else if (time1 > time2) return 1;
    return 0;
}

function processTradesInAccounts(trades) {
    for (var trade of trades) {
        processTradeInAccounts(trade);
    }
}

function processTradeInAccounts(trade) {
    var symbol = trade.symbol;
    var buyOrderNumber = trade.buyOrderNumber;
    var sellOrderNumber = trade.sellOrderNumber;
    var buyOrder = lookupOrder(symbol, buyOrderNumber);
    var sellOrder = lookupOrder(symbol, sellOrderNumber);
    var amount = trade.amount;
    var price = trade.price;
    var buyer = buyOrder.owner;
    var seller = sellOrder.owner;
    var buyingAccount = getAccountFromOwner(buyer);
    var sellingAccount = getAccountFromOwner(seller);
    buyingAccount.buy(amount, symbol, price);
    sellingAccount.sell(amount, symbol, price);
    updateAccountRecords([buyingAccount, sellingAccount]);
}

module.exports = {
    getTradesFromSymbol,
    writeTrades,
    appendTrades,
    getLastTradedPrice,
    processTradeInAccounts,
    processTradesInAccounts,
}