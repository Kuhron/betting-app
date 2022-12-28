const express = require('express');

const securities = require('./securities');
const orders = require('./orders');

const router = express.Router();
const app = express();

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
const port = 3000;

router.get('/', (req, res) => {
    res.render('pages/index', {});
});

router.post('/view_security', (req, res) => {
    var symbol = req.body.input_security.toUpperCase();
    var valid = securities.symbolIsValid(symbol);
    if (valid) {
        var sec = securities.getSecurityFromSymbol(symbol);
        if (sec !== null) {
            var securityType = sec.securityType;
            var lastPrice = "TODO";
            var ordersThisSymbol = orders.getOrdersFromSymbol(symbol);
            var orderBookLevels = orders.getOrderBookLevelsFromOrders(ordersThisSymbol);
            var nLevels = 3;
            orderBookLevels = orders.getTopLevels(orderBookLevels, nLevels);
            var params = {
                symbol: symbol,
                securityType: securityType,
                lastPrice: lastPrice,
                nLevels: nLevels,
                orderBookLevels: orderBookLevels
            };
        } else {
            var params = {
                symbol: symbol
            };
        }
        res.render('pages/security_information', params);
    } else {
        var params = { errorMessage: 'invalid symbol given, please try again' };
        res.render('pages/index', params);
    }
});

app.use('/', router);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})


