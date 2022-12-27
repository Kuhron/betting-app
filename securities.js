const express = require('express');
const fs = require('fs');

const Security = require('./Security.js');

const fp = "securities.json";

function getSecurities() {
    var s = fs.readFileSync(fp);
    var d = JSON.parse(s);
    var secParamsList = d.securities;
    var secs = [];
    for (var i = 0; i < secParamsList.length; i++) {
        var secParams = secParamsList[i];
        var sec = new Security(...Object.values(secParams));
        secs.push(sec);
    }
    return secs;
}

function writeSecurities(secs) {
    var d = {securities: secs};
    fs.writeFileSync(d);
}

function symbolIsValid(symbol) {
    return /^[A-Z0-9]+$/g.test(symbol);
}

module.exports = {
    symbolIsValid
};


if (require.main === module) {
    var secs = getSecurities();
    console.log(secs);
    var newSec = new Security
}
