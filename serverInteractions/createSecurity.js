const Security = require("../classes/Security");
const { writeNewSecurity, symbolIsValid, getSecurityFromSymbol } = require("../securities");
const { getViewSecurityParams } = require("./viewSecurity");



function viewCreateSecurityPageBlank(req, res) {
    res.render('pages/createSecurity', {});
}

function createSecurity(req, res) {
    var symbol = req.body.symbol.toUpperCase();
    var valid = symbolIsValid(symbol);
    if (!valid) {
        var params = { errorMessage: 'Invalid symbol given, please try again' };
        res.render('pages/index', params);
        return;
    }
    var sec = getSecurityFromSymbol(symbol);
    if (sec !== null) {
        var params = { errorMessage: `Security with symbol ${symbol} already exists.` };
        res.render('pages/index', params);
        return;
    }
    var securityType = req.body.securityType;  // this gets the value attribute of the select option (not the displayed text from the dropdown)
    var passcode = req.body.passcode;
    var tickSize = parseFloat(req.body.tickSize);
    var multiplier = parseFloat(req.body.multiplier);
    var status = "active";
    var settlementPrice = null;
    var sec = new Security(symbol, passcode, securityType, tickSize, multiplier, status, settlementPrice);
    writeNewSecurity(sec);

    var params = getViewSecurityParams(symbol);
    res.render('pages/securityInformation', params);
}

module.exports = {
    viewCreateSecurityPageBlank,
    createSecurity,
}