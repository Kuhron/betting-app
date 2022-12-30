const Security = require("../classes/Security");
const { writeNewSecurity, symbolIsValid } = require("../securities");
const { getViewSecurityParams } = require("./viewSecurity");



function viewCreateSecurityPageBlank(req, res) {
    res.render('pages/create_security', {});
}

function createSecurity(req, res) {
    var symbol = req.body.symbol.toUpperCase();
    var valid = symbolIsValid(symbol);
    if (!valid) {
        var params = { errorMessage: 'invalid symbol given, please try again' };
        res.render('pages/index', params);
        return;
    }
    var securityType = req.body.securityType;  // this gets the value attribute of the select option
    console.log("security type: " + JSON.stringify(securityType));
    var passcode = req.body.passcode;
    var sec = new Security(symbol, passcode, securityType);
    writeNewSecurity(sec);

    var params = getViewSecurityParams(symbol);
    res.render('pages/security_information', params);
}

module.exports = {
    viewCreateSecurityPageBlank,
    createSecurity,
}