const { usernameIsValid, getAccountFromOwner, createUserIfNotExists } = require("../users");

function viewAccountInformationPageBlank(req, res) {
    res.render('pages/account_information', {});
}

function viewAccount(req, res) {
    var username = req.body.username;
    var params;
    if (!usernameIsValid(username)) {
        params = {
            errorMessage: "Invalid username.",
        };
    } else {
        createUserIfNotExists(username);
        var account = getAccountFromOwner(username);
        var cashBalance = account.cash;
        var positions = account.positions;
        params = {
            username: username,
            cashBalance: cashBalance,
            positions: positions,
        }
        console.log(JSON.stringify(params));
    }
    res.render('pages/account_information', params);
}

module.exports = {
    viewAccountInformationPageBlank,
    viewAccount,
};
