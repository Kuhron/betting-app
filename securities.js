const express = require('express');
const fs = require('fs');

const filepaths = require('./filepaths.js');
const fp = filepaths.getSecurityInfoFilepath();

const Security = require('./classes/Security.js');

function getSecurities() {
    var s = fs.readFileSync(fp);
    var d = JSON.parse(s);
    var secParamsList = d.securities;
    var secs = [];
    for (var i = 0; i < secParamsList.length; i++) {
        var secParams = secParamsList[i];
        var symbol = secParams.symbol;
        var password = secParams.password;
        var securityType = secParams.securityType;
        var sec = new Security(symbol, password, securityType);
        secs.push(sec);
    }
    return secs;
}

function writeSecurities(secs) {
    var d = {securities: secs};
    fs.writeFileSync(fp, JSON.stringify(d));
}

function symbolIsValid(symbol) {
    return /^[A-Z0-9]+$/g.test(symbol);
}

function getSecurityFromSymbol(symbol) {
    var secs = getSecurities();
    var matchingSecs = [];
    for (var i = 0; i < secs.length; i++) {
        var sec = secs[i];
        if (sec.symbol === symbol) {
            matchingSecs.push(sec);
        }
    }
    if (matchingSecs.length === 0) {
        return null;
    } else if (matchingSecs.length === 1) {
        return matchingSecs[0];
    } else {
        throw new Error(`Multiple securities found with symbol ${symbol}. Please contact the site administrator.`);
    }
}

module.exports = {
    symbolIsValid,
    getSecurityFromSymbol,
};


if (require.main === module) {
    var secs = getSecurities();
    console.log(secs);
}
