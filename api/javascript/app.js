require('dotenv').config();
// require('./passport');

const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
// const passport = require('passport');
const mongoose = require('mongoose');
const nconf = require('./config');
const routers = require('./routers');
const { writeError, writeResponse } = require('./helpers/response');

const app = express();

// setting ejs as view engine

app.set('view engine','ejs');

//for serving static files
app.use(express.static(__dirname + '/public'));

// app.use(nconf.get('app_path'));

const swaggerDefinition = {
  info: {
    title: 'OneStop Admin',
    version: '1.0.0',
    description: 'Node apps for the admin panel of OneStop application',
  },
  host: 'localhost:3000',
  basePath: '/',
};

// connect to mongodb

mongoose.connect(process.env.DATABASE_URI,(err,res) => {
  console.log(err,res);
  console.log('connected to mongodb');
});

// options for the swagger docs
const options = {
  // import swaggerDefinitions
  swaggerDefinition,
  // path to the app docs
  apis: ['./controllers/*.js'],
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// app.set('port', nconf.get('PORT'));
//app.use(bodyParser.json());
app.use(helmet());
app.use(methodOverride());
app.use(cookieParser());
app.use(bodyParser.urlencoded({limit: '10mb', extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(
  session({
    secret: 'a very dark secret indeed',
    resave: true,
    saveUninitialized: false,
  }),
);

// app.use(passport.initialize());
// app.use(passport.session());

// enable CORS
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

const BASEURL = process.env.BASE_URL || "/v1/"
console.log(BASEURL)

// app routes
app.use(BASEURL,routers.userRouter.userRouter);
app.use(BASEURL,routers.authRouter.authRouter);
app.use(BASEURL,routers.contactRouter.contactRouter);
app.use(BASEURL,routers.timingRouter.timingRouter);
app.use(BASEURL,routers.emailRouter.emailRouter);
app.use(BASEURL,routers.roleRouter.roleRouter);
app.use(BASEURL,routers.fileRouter.fileRouter);
app.use(BASEURL,routers.foodOutletsRouter.foodOutletsRouter);
app.use(BASEURL,routers.foodItemsRouter.foodItemsRouter);
app.use(BASEURL,routers.messMenuRouter.messMenuRouter);
app.use(BASEURL,routers.LostAndFoundRouters.LostAndFoundRouter);

// For demo auth purposes only
app.get(`${BASEURL}user-info`, (req, res) => {
  console.log("user info");
  const response = { message: 'User not authenticated' };
  writeResponse(res, response);
});

// app error handler
app.use((err, _req, res, next) => {
  if (err && err.status) {
    writeError(res, err);
  } else next(err);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Express server listening on port ${PORT} see docs at /docs`);
});


// "eslint": "^8.7.0",
// "eslint-config-airbnb-base": "^15.0.0",
// "eslint-config-google": "^0.14.0",
// "eslint-config-prettier": "^8.3.0",
// "eslint-config-standard": "^16.0.3",
// "eslint-plugin-import": "^2.25.4",
// "eslint-plugin-node": "^11.1.0",
// "eslint-plugin-prettier": "^4.0.0",
// "eslint-plugin-promise": "^5.2.0",
