const express = require('express');

const { viewSecurity } = require('./server_interactions/viewSecurity.js');
const { placeOrder } = require('./server_interactions/placeOrder.js');
const { createSecurity, viewCreateSecurityPageBlank } = require('./server_interactions/createSecurity.js');
const { viewAccount, viewAccountInformationPageBlank } = require('./server_interactions/viewAccount.js');

const router = express.Router();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
const port = 3000;

router.get('/', (req, res) => {
    res.render('pages/index', {});
});

router.post('/view_security', viewSecurity);

router.post('/create_security', createSecurity);
router.get('/view_create_security_page', viewCreateSecurityPageBlank);

router.post('/place_order', placeOrder);

router.get('/view_account_information_page', viewAccountInformationPageBlank);
router.post('/update_username_on_account_page', viewAccount);

app.use('/', router);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
