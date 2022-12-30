const fs = require('fs');

const { getUserInfoFilepath } = require('./filepaths.js');

const User = require('./classes/User.js');
const Account = require('./classes/Account.js');

const fp = getUserInfoFilepath();


function getAllUsers() {
    var s = fs.readFileSync(fp);
    var d = JSON.parse(s);
    var userParamsList = d.users;
    var users = [];
    for (var i = 0; i < userParamsList.length; i++) {
        var userParams = userParamsList[i];
        var username = userParams.username;
        var account = getAccountFromParams(userParams.account);
        var user = new User(username, account);
        users.push(user);
    }
    return users;
}

function getAllUsersByUsername() {
    var users = getAllUsers();
    var result = {};
    for (var user of users) {
        result[user.username] = user;
    }
    return result;
}

function getAccountFromParams(params) {
    var owner = params.owner;
    var account = new Account(owner);
    var cash = params.cash;
    account.addCash(cash);
    var positions = getPositionsFromParams(params.positions);
    for (var symbol in positions) {
        var amount = positions[symbol];
        account.addShares(symbol, amount);
    }
    return account;
}

function getAccountFromOwner(username) {
    var user = getUserFromUsername(username);
    return user.account;
}

function getPositionsFromParams(params) {
    // just an object of symbol to amount as int
    var positions = {};
    for (var symbol in params) {
        var amount = parseInt(params[symbol]);
        positions[symbol] = amount;
    }
    return positions;
}

function writeUsers(users) {
    var d = {users: users};
    fs.writeFileSync(fp, JSON.stringify(d, null, 4));
}

function updateAccountRecords(accounts) {
    var users = getAllUsersByUsername();
    for (var account of accounts) {
        var owner = account.owner;
        users[owner].account = account;
    }
    var users = Object.values(users);
    writeUsers(users);
}

function writeNewUser(user) {
    var users = getAllUsers().slice();
    users.push(user);
    writeUsers(users);
}

function usernameIsValid(username) {
    return /^[A-Za-z0-9_.]+$/g.test(username);
}

function getNewUserFromUsername(username) {
    var account = new Account(username);
    var user = new User(username, account);
    return user;
}

function getUserFromUsername(username) {
    var users = getAllUsers();
    var matchingUsers = [];
    for (var user of users) {
        if (user.username === username) {
            matchingUsers.push(user);
        }
    }
    if (matchingUsers.length === 0) {
        return null;
    } else if (matchingUsers.length === 1) {
        return matchingUsers[0];
    } else {
        throw new Error("more than one user with same name");
    }
}

function createUserIfNotExists(username) {
    var exists = getUserFromUsername(username) !== null;
    if (!exists) {
        var user = getNewUserFromUsername(username);
        writeNewUser(user);
    }
}

module.exports = {
    getAllUsers,
    writeUsers,
    usernameIsValid,
    getUserFromUsername,
    getAccountFromOwner,
    createUserIfNotExists,
    updateAccountRecords,
};
