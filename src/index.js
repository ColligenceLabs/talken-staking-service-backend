const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const health = require('./router/health');
const histories = require('./router/histories');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./lib/swaggerDoc');
const models = require("./models/index.js");
const crawler = require('./controller/blockchain/index');

const app = express();
const port = process.env.PORT || 6001;

app.use(
  cors({
    // origin: [
    //   "http://localhost:3000",
    // ],
    credentials: true,
  })
);
app.use(morgan('common'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// const maxAge = 1000 * 60 * 60 * 24;//EXPIRE_ACCESSTOKEN=1d same
// const maxAge = 1000 * 30;

// app.use('/api/nft', nftRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/histories', histories);
app.use('/health', health);

app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});
