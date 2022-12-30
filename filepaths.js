const path = require('path');
const fs = require('fs');

function getAppDir() {
    const appFilename = require.main.filename;
    const appDir = path.dirname(appFilename);
    return appDir;
}

function getSecurityDataDir() {
    const appDir = getAppDir();
    const securityDataDir = path.join(appDir, "security_data");
    return securityDataDir;
}

function getDirForSecurity(symbol) {
    const securityDataDir = getSecurityDataDir();
    const symbolDir = path.join(securityDataDir, symbol);
    createDirIfNotExists(symbolDir);
    return symbolDir;
}

function getOrdersFilepathForSecurity(symbol) {
    var fname = "orders.json";
    var dirname = getDirForSecurity(symbol);
    var fp = path.join(dirname, fname);
    createFileIfNotExists(fp, "{\"orders\": []}");
    return fp;
}

function getTradesFilepathForSecurity(symbol) {
    var fname = "trades.json";
    var dirname = getDirForSecurity(symbol);
    var fp = path.join(dirname, fname);
    createFileIfNotExists(fp, "{\"trades\": []}");
    return fp;
}

function getSecurityInfoFilepath() {
    const securityDataDir = getSecurityDataDir();
    var fname = "securities.json";
    var fp = path.join(securityDataDir, fname);
    createFileIfNotExists(fp, "{\"securities\": []}");
    return fp;
}

function getUserInfoFilepath() {
    const appDir = getAppDir();
    var fname = "users.json";
    var fp = path.join(appDir, fname);
    createFileIfNotExists(fp, "{\"users\": []}");
    return fp;
}

function createFileIfNotExists(fp, defaultContents) {
    if (!fs.existsSync(fp)) {
        fs.writeFileSync(fp, defaultContents);
    }
}

function createDirIfNotExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

module.exports = {
    getAppDir,
    getSecurityDataDir,
    getDirForSecurity,
    getOrdersFilepathForSecurity,
    getSecurityInfoFilepath,
    getUserInfoFilepath,
    getTradesFilepathForSecurity,
};
