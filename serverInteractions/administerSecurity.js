const { getActiveOrdersFromSymbol, cancelOrders, writeOrders } = require("../orders");
const { getSecurityFromSymbol, updateSecurityRecord, settleSecurityInAccounts } = require("../securities");
const { getViewSecurityParams } = require("./viewSecurity");

function administerSecurity(req, res) {
    var symbol = req.body.symbol;
    var sec = getSecurityFromSymbol(symbol);
    var passcodeNeeded = sec.password;
    var passcodeSubmitted = req.body.passcode;
    if (passcodeNeeded !== passcodeSubmitted) {
        var params = getViewSecurityParams(symbol);
        params.errorMessages = ["Incorrect administrator passcode."];
    } else if ("haltTradingButton" in req.body) {
        var params = haltTrading(symbol);
    } else if ("resumeTradingButton" in req.body) {
        var params = resumeTrading(symbol);
    } else if ("settleButton" in req.body) {
        var settlementPrice = parseFloat(req.body.settlementPrice);
        var params = settleSecurity(symbol, settlementPrice);
    } else {
        var params = getViewSecurityParams(symbol);
        params.errorMessages = ["Invalid submission for security administration form."];
    }
    res.render('pages/securityInformation', params);
}

function haltTrading(symbol) {
    // disallow new orders from being submitted, but leave existing orders on the book
    sec = getSecurityFromSymbol(symbol);
    sec.halt();
    updateSecurityRecord(sec);
    var params = getViewSecurityParams(symbol);
    return params;
}

function resumeTrading(symbol) {
    sec = getSecurityFromSymbol(symbol);
    sec.activate();
    updateSecurityRecord(sec);
    var params = getViewSecurityParams(symbol);
    return params;
}

function settleSecurity(symbol, settlementPrice) {
    // if future is cash settled, convert 1 contract 
    //   into multiplier of cash-unit (number of dollars equal to settlement price) 
    //   at settlement price
    // if option is cash settled, convert 1 contract 
    //   into multiplier of cash-unit (number of dollars equal to settlement price) 
    //   at strike price if favorable given settlement price, 
    //   otherwise expire worthless
    // if future settles into another security, convert 1 contract 
    //   into multiplier of the other security at settlement price
    // if option settles into another security, convert 1 contract 
    //   into multiplier of the other security at strike price if favorable given settlement price, 
    //   otherwise expire worthless
    // a boolean contract is the same as a future but can only settle at 0 or 100
    var sec = getSecurityFromSymbol(symbol);
    var priceIsValid = sec.settlementPriceIsValid(settlementPrice);
    var errorMessages = [];
    if (!priceIsValid) {
        errorMessages.push(`Price ${settlementPrice} is not valid for this security.`);
    } else if (sec.securityType === 'Future' || sec.securityType === "Boolean") {
        // a Boolean is just a Future that has to settle at 0 or 100, 
        // so they behave the same as long as the price was checked for validity
        sec.settle(settlementPrice);  // mark it as settled and record the price
        updateSecurityRecord(sec);
        // cancel all active orders
        var activeOrders = getActiveOrdersFromSymbol(symbol);
        cancelOrders(activeOrders);
        // make the exchange between this asset and what it settles to in the user's account
        settleSecurityInAccounts(symbol, settlementPrice);
    } else {
        errorMessages.push("Settlement is not implemented for this security type.");
    }
    var params = getViewSecurityParams(symbol);
    params.errorMessages = errorMessages;
    return params;
}

module.exports = {
    administerSecurity,
    haltTrading,
    resumeTrading,
    settleSecurity,
}