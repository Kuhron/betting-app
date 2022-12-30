const express = require('express');
const fs = require('fs');

const filepaths = require('./filepaths.js');
const fp = filepaths.getSecurityInfoFilepath();

const Security = require('./classes/Security.js');
const { getAllUsers, updateAccountRecords, getAllAccounts } = require('./users.js');

function getAllSecurities() {
    var s = fs.readFileSync(fp);
    var d = JSON.parse(s);
    var secParamsList = d.securities;
    var secs = [];
    for (var i = 0; i < secParamsList.length; i++) {
        var secParams = secParamsList[i];
        var symbol = secParams.symbol;
        var password = secParams.password;
        var securityType = secParams.securityType;
        var tickSize = parseFloat(secParams.tickSize);
        var multiplier = parseFloat(secParams.multiplier);
        var status = secParams.status;
        var settlementPrice = parseFloat(secParams.settlementPrice);
        var sec = new Security(symbol, password, securityType, tickSize, multiplier, status, settlementPrice);
        secs.push(sec);
    }
    return secs;
}

function getAllSecuritiesBySymbol() {
    var secs = getAllSecurities();
    var result = {};
    for (var sec of secs) {
        result[sec.symbol] = sec;
    }
    return result;
}

function writeSecurities(secs) {
    var d = {securities: secs};
    fs.writeFileSync(fp, JSON.stringify(d, null, 4));
}

function writeNewSecurity(sec) {
    var secs = getAllSecurities().slice();
    secs.push(sec);
    writeSecurities(secs);
}

function updateSecurityRecord(sec) {
    var secs = getAllSecuritiesBySymbol();
    secs[sec.symbol] = sec;
    console.log("updating security: " + JSON.stringify(sec));
    var secs = Object.values(secs);
    writeSecurities(secs);
}

function symbolIsValid(symbol) {
    if (symbol.length === 0) return false;
    return /^[A-Z0-9]+$/g.test(symbol);
}

function getSecurityFromSymbol(symbol) {
    var secs = getAllSecurities();
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

function settleSecurityInAccounts(symbol, settlementPrice) {
    // convert between the security and what it settles into
    var sec = getSecurityFromSymbol(symbol);
    var accounts = getAllAccounts();
    for (var account of accounts) {
        if (symbol in account.positions) {
            var position = account.positions[symbol];
        } else {
            continue;
        }
        if (position === 0) continue;
        var isLong = position > 0;
        var amount = Math.abs(position);
        if (isLong) {
            // sell the security to nobody at the settlement price
            account.sell(amount, symbol, settlementPrice, sec.multiplier);
        } else {
            account.buy(amount, symbol, settlementPrice, sec.multiplier);
        }
    }
    updateAccountRecords(accounts);
}

module.exports = {
    getAllSecurities,
    symbolIsValid,
    getSecurityFromSymbol,
    writeNewSecurity,
    updateSecurityRecord,
    settleSecurityInAccounts,
};


if (require.main === module) {
    var secs = getAllSecurities();
    console.log(secs);
}
