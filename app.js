const express = require('express');

const { viewSecurity } = require('./server_interactions/viewSecurity');
const { placeOrder } = require('./server_interactions/placeOrder');

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

router.post('/view_security', viewSecurity);
router.post('/place_order', placeOrder);

app.use('/', router);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})


