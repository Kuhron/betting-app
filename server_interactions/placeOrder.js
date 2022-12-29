const Order = require('../classes/Order.js');
const { getOrdersFromSymbol, writeOrders } = require("../orders.js");
const { getViewSecurityParams } = require('./viewSecurity.js');
const { matchOrders } = require('../matchingEngine.js');

function placeOrder(req, res) {
    var symbol = req.body.symbol.toUpperCase();
    var absSize = req.body.order_size;
    var price = req.body.order_price;
    var sign;
    var isBuy = "buy_button" in req.body;
    var isSell = "sell_button" in req.body;
    if (isBuy && isSell) {
        throw new Error("level has both buy and sell orders");
    }
    var sign = isBuy ? 1 : -1;
    var size = sign * absSize;
    var order = new Order(size, symbol, price);
    var existingOrders = getOrdersFromSymbol(symbol);
    var matchingResult = matchOrders(existingOrders, order);
    var remainingOrders = matchingResult.remainingOrders;
    console.log("matching result: " + JSON.stringify(matchingResult));
    var trades = matchingResult.trades;
    writeOrders(remainingOrders, symbol);

    var orderStatusMessage = "Order submitted.";
    for (var trade of trades) {
        orderStatusMessage += "\nTrade completed: " + trade.toString();
    }

    var params = getViewSecurityParams(symbol);
    params.orderStatusMessage = orderStatusMessage;
    res.render('pages/security_information', params);
}

module.exports = {
    placeOrder,
};
