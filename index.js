var http        = require('http'),
    express     = require('express'),
    app         = express(),
    jade        = require('jade'),
    bodyParser  = require('body-parser'),
    AWS         = require('aws-sdk'),
    request     = require('request');


AWS.config.update({region:'us-east-1'});

//TODO: update endpoints and service URIs
var endpoint = '';
var TopicARN = '';

var sns = new AWS.SNS({params: {TopicArn:TopicARN}});

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.set('views', './public/views');

app.use(express.static(__dirname + './public'));
app.use(bodyParser.raw({extended:true}));
app.use(bodyParser.json({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));

/*app.use(function(req, res, next) {
    var data ='';
    req.setEncoding('utf8');

    req.on('data', function(chunk) {
        data += chunk;
    });

    req.on('end', function() {
        req.body = data;
        next();
    });
});*/


app.get('/', function(req,res){
  var locals = {
      messageTxt:"hello"
  };
  res.render('index',locals);
});

app.post('/notifications', function(req,res){
    var message = req.body;

    //publish to sns arn

    sns.publish({Message: message}, function (err, data) {
        if (err) console.log('Error: ', JSON.stringify(err));
        console.log("success: ", JSON.stringify(data));
    });

    /*var dfd = new Promise(function(fulfill, reject){
        var url = endpoint;
        var message = '';
        request(url, function(err, result){
            if(err) reject(JSON.stringify(err));
            result = JSON.parse(result.body);
            message = result.message;
            fulfill(message);
        });
    });

    dfd.then(function(message){
        sns.publish({Message: message}, function (err, data) {
            if (err) console.log('Error: ', JSON.stringify(err));
            console.log("success: ", JSON.stringify(data));
        });
    });*/

});

http.createServer(app).listen(app.get('port'), function(){
    console.log('app listening on port ' + app.get('port'));
});

