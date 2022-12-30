const { usernameIsValid, getAccountFromOwner, createUserIfNotExists } = require("../users");

function viewAccountInformationPageBlank(req, res) {
    res.render('pages/accountInformation', {});
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
    }
    res.render('pages/accountInformation', params);
}

module.exports = {
    viewAccountInformationPageBlank,
    viewAccount,
};
