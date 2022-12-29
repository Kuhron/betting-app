const Order = require('../classes/Order');
const { getAllOrders, writeOrders } = require("../orders");
const { getViewSecurityParams } = require('./viewSecurity');

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
    var orders = getAllOrders();
    orders.push(order);
    writeOrders(orders);
    var orderStatusMessage = "Order submitted.";

    var params = getViewSecurityParams(symbol);
    params.orderStatusMessage = orderStatusMessage;
    res.render('pages/security_information', params);
}

module.exports = {
    placeOrder,
};