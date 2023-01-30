var express = require('express');
var app = express();

app.get('/', function (req, res) {
    console.log('欢迎访问')
    res.send('hello world'); //发送一个请求
})

app.listen(3050, function () { //在3000端口启动
    console.log('Example app listening on port 3000');
})