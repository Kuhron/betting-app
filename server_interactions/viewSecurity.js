const { symbolIsValid, getSecurityFromSymbol } = require("../securities");
const orders = require('../orders');

function viewSecurity(req, res) {
    var symbol = req.body.input_security.toUpperCase();
    var valid = symbolIsValid(symbol);
    if (valid) {
        var params = getViewSecurityParams(symbol);
        res.render('pages/security_information', params);
    } else {
        var params = { errorMessage: 'invalid symbol given, please try again' };
        res.render('pages/index', params);
    }
}

function getViewSecurityParams(symbol) {
    var sec = getSecurityFromSymbol(symbol);
    if (sec !== null) {
        var securityType = sec.securityType;
        var lastPrice = "TODO";
        var ordersThisSymbol = orders.getOrdersFromSymbol(symbol);
        var orderBookLevels = orders.getOrderBookLevelsFromOrders(ordersThisSymbol);
        var nLevels = 3;
        orderBookLevels = orders.getTopLevels(orderBookLevels, nLevels);
        var params = {
            symbol: symbol,
            securityType: securityType,
            lastPrice: lastPrice,
            nLevels: nLevels,
            orderBookLevels: orderBookLevels
        };
    } else {
        var params = {
            symbol: symbol
        };
    }
    return params;
}

module.exports = {
    getViewSecurityParams,
    viewSecurity,
};
