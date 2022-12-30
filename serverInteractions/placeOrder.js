const Order = require('../classes/Order.js');
const { getOrdersFromSymbol, writeOrders, getNextOrderNumber } = require("../orders.js");
const { appendTrades, processTradesInAccounts } = require('../trades.js');
const { getViewSecurityParams } = require('./viewSecurity.js');
const { matchOrders } = require('../matchingEngine.js');
const { usernameIsValid, createUserIfNotExists } = require('../users.js');
const { getSecurityFromSymbol } = require('../securities.js');

function placeOrder(req, res) {
    var errorMessages = [];
    var orderStatusMessages = [];

    var symbol = req.body.symbol.toUpperCase();
    var sec = getSecurityFromSymbol(symbol);
    var owner = req.body.owner;
    if (sec.status !== "active") {
        errorMessages.push(`This security's status is ${sec.status}, so it cannot be traded right now.`);
    } else {
        var amount = req.body.orderSize;
        var price = parseFloat(req.body.orderPrice);
        var isBuy = "buyButton" in req.body;
        var isSell = "sellButton" in req.body;
        if (isBuy && isSell) {
            throw new Error("shouldn't happen; should be either buy or sell");
        }
        var sign = isBuy ? 1 : -1;
        var size = sign * amount;
        var originalSize = size;

        if (!usernameIsValid(owner)) {
            errorMessages.push("Username invalid. Please try again.");
        } else {
            createUserIfNotExists(owner);
            var orderNumber = getNextOrderNumber();
            var timeReceived = new Date().toISOString();
            var status = "active";
            var order = new Order(size, originalSize, symbol, price, owner, orderNumber, timeReceived, status);
            var existingOrders = getOrdersFromSymbol(symbol);
            var matchingResult = matchOrders(existingOrders, order);
            var remainingOrders = matchingResult.remainingOrders;
            var cancelledOrders = matchingResult.cancelledOrders;
            var trades = matchingResult.trades;
            writeOrders(remainingOrders, symbol);
            appendTrades(trades, symbol);
            processTradesInAccounts(trades);

            orderStatusMessages.push("Order submitted.");
            for (var trade of trades) {
                var message = "Trade completed: " + trade.toString();
                orderStatusMessages.push(message);
            }
            for (var order of cancelledOrders) {
                var message = "Order cancelled: " + order.toString();
                orderStatusMessages.push(message);
            }
        }
    }

    var params = getViewSecurityParams(symbol);
    if (usernameIsValid(owner)) {
        params.username = owner;
    };
    params.errorMessages = errorMessages;
    params.orderStatusMessages = orderStatusMessages;
    res.render('pages/securityInformation', params);
}

module.exports = {
    placeOrder,
};
