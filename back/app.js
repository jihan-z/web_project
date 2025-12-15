var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var imagesRouter = require('./routes/images');
var tagsRouter = require('./routes/tags');
var { authenticateToken } = require('./middleware/auth');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
// 添加认证中间件到需要保护的路由
app.use('/api/images', authenticateToken, imagesRouter);
app.use('/api/tags', authenticateToken, tagsRouter);

module.exports = app;
