const express = require('express');

const { viewSecurity } = require('./serverInteractions/viewSecurity.js');
const { placeOrder } = require('./serverInteractions/placeOrder.js');
const { createSecurity, viewCreateSecurityPageBlank } = require('./serverInteractions/createSecurity.js');
const { viewAccount, viewAccountInformationPageBlank } = require('./serverInteractions/viewAccount.js');
const { administerSecurity } = require('./serverInteractions/administerSecurity.js');
const { getActiveSecuritySymbols } = require('./securities.js');

const router = express.Router();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
const port = 3000;

router.get('/', (req, res) => {
    res.render('pages/index', {activeSymbols: getActiveSecuritySymbols()});
});

router.post('/viewSecurity', viewSecurity);  // should be GET? unless it changes data

router.post('/createSecurity', createSecurity);
router.get('/viewCreateSecurityPage', viewCreateSecurityPageBlank);

router.post('/placeOrder', placeOrder);
router.post('/administerSecurity', administerSecurity);

router.post('/updateUsernameOnAccountPage', viewAccount);  // should be GET
router.get('/viewAccountInformationPage', viewAccountInformationPageBlank);

app.use('/', router);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
