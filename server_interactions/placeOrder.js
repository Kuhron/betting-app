const Order = require('../classes/Order.js');
const { getOrdersFromSymbol, writeOrders, getNextOrderNumber } = require("../orders.js");
const { appendTrades, getLastTradedPrice, processTradesInAccounts } = require('../trades.js');
const { getViewSecurityParams } = require('./viewSecurity.js');
const { matchOrders } = require('../matchingEngine.js');
const { usernameIsValid, writeAllUsers, createUserIfNotExists } = require('../users.js');

function placeOrder(req, res) {
    var symbol = req.body.symbol.toUpperCase();
    var amount = req.body.order_size;
    var price = parseInt(req.body.order_price);
    var owner = req.body.owner;
    var isBuy = "buy_button" in req.body;
    var isSell = "sell_button" in req.body;
    if (isBuy && isSell) {
        throw new Error("level has both buy and sell orders");
    }
    var sign = isBuy ? 1 : -1;
    var size = sign * amount;
    var originalSize = size;

    if (!usernameIsValid(owner)) {
        var orderStatusMessages = ["Username invalid. Please try again."];
    } else {
        createUserIfNotExists(owner);
        var orderNumber = getNextOrderNumber();
        var timeReceived = new Date().toISOString();
        var order = new Order(size, originalSize, symbol, price, owner, orderNumber, timeReceived);
        var existingOrders = getOrdersFromSymbol(symbol);
        var matchingResult = matchOrders(existingOrders, order);
        var remainingOrders = matchingResult.remainingOrders;
        var trades = matchingResult.trades;
        writeOrders(remainingOrders, symbol);
        appendTrades(trades, symbol);
        processTradesInAccounts(trades);

        var orderStatusMessages = ["Order submitted."];
        for (var trade of trades) {
            var message = "Trade completed: " + trade.toString();
            orderStatusMessages.push(message);
        }
    }

    var params = getViewSecurityParams(symbol);
    if (usernameIsValid(owner)) {
        params.username = owner;
    };
    params.orderStatusMessages = orderStatusMessages;
    res.render('pages/security_information', params);
}

module.exports = {
    placeOrder,
};
