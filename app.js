const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const authRoute=require('./routes/authRoute')
const courseRoute=require('./routes/courseRoute')
const categoryRoute=require('./routes/categoryRoute')
const creatorRoute=require('./routes/creatorRoute')
const bookingRoute=require('./routes/bookingRoute')
const bodyParser = require('body-parser');
const errorController = require('./controllers/errorController');
const cookieParser=require('cookie-parser');
const AppError = require('./utils/AppError');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URI,)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

// Create an instance of Express app
const app = express();

// Use Morgan to log HTTP requests
app.use(morgan('dev'));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
// Parse JSON request bodies
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.use(cookieParser())


app.get('/',(req,res)=>{
    res.render('index')
})
app.use('/api/v1/auth',authRoute)
app.use('/api/v1/course',courseRoute)
app.use('/api/v1/category',categoryRoute)
app.use('/api/v1/creator',creatorRoute)
app.use('/api/v1/booking',bookingRoute)
app.use(errorController)
app.all("*", (req, res, next) => {
    next(new AppError(`Cant find ${req.originalUrl}  on the server`, 404));
  });

module.exports=app