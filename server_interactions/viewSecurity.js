const { symbolIsValid, getSecurityFromSymbol } = require("../securities");
const orders = require('../orders');
const { getLastTradedPrice } = require("../trades");

function viewSecurity(req, res) {
    var symbol = req.body.input_security.toUpperCase();
    var valid = symbolIsValid(symbol);
    if (!valid) {
        var params = { errorMessage: 'invalid symbol given, please try again' };
        res.render('pages/index', params);
        return;
    }
    
    // if the security doesn't exist yet, user should be taken to a page to create it
    var sec = getSecurityFromSymbol(symbol);
    if (sec === null) {
        // this user can create the security and its admin password
        var params = {symbol: symbol};
        res.render('pages/create_security', params);
    } else {
        var params = getViewSecurityParams(symbol);
        res.render('pages/security_information', params);
    }
}

function getViewSecurityParams(symbol) {
    var sec = getSecurityFromSymbol(symbol);
    if (sec !== null) {
        var securityType = sec.securityType;
        var lastPrice = getLastTradedPrice(symbol);
        var activeOrdersThisSymbol = orders.getActiveOrdersFromSymbol(symbol);
        var orderBookLevels = orders.getOrderBookLevelsFromOrders(activeOrdersThisSymbol);
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
