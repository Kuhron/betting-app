const Account = require("./Account");

class User {
    constructor(username, account) {
        this.username = username;
        this.account = account;
    }
}

module.exports = User;
