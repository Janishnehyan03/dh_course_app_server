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
const cors=require('cors')
const fs=require('fs')

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
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.get('/',(req,res)=>{
    res.render('index')
})
app.use('/api/v1/auth',authRoute)
app.use('/api/v1/course',courseRoute)
app.use('/api/v1/category',categoryRoute)
app.use('/api/v1/creator',creatorRoute)
app.use('/api/v1/booking',bookingRoute)
app.get('/stream', (req, res) => {

  // Path to the video file
  const videoPath = './uploads/video.mp4';

  // Get video file stats
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // If range header is present, perform partial content streaming
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // If range header is not present, stream the entire video file
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.use(errorController)
app.all("*", (req, res, next) => {
    next(new AppError(`Cant find ${req.originalUrl}  on the server`, 404));
  });

module.exports=app