var http        = require('http'),
    express     = require('express'),
    app         = express(),
    jade        = require('jade'),
    bodyParser  = require('body-parser'),
    AWS         = require('aws-sdk'),
    request     = require('request');
    

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
    var msg = req.body;
    console.log(req.body);
    var dirTxt = 'entered';
    var deviceID = msg.notification.event.deviceId;
    if(msg.notification.event.eventType === 'rule-leave'){
        dirTxt = 'left';
    }

    var dfd = new Promise(function(fulfill, reject){
        var endpoint = 'https://92b3312e-101a-4ca5-b8c8-8fd1c3b04b53:HbJ9HYA7kO8ShYjSV2Kj@platform.vin.li/api/v1/devices/' + deviceID + '/vehicles/_latest';
        var message = '';
        request(endpoint, function(err, result){
            if(err) reject(JSON.stringify(err));
            result = JSON.parse(result.body);
            if(result.hasOwnProperty('vehicle')){
                var vehicle = result.vehicle;
                if(vehicle.hasOwnProperty('vin')){

                    var dir = dirTxt === 'left' ? ' out of' : ' entered';
                    message =  vehicle.vin + ' ' + vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model + ' http://lotmgmt.coxconnectedcar.com/vehicle/?vin=' + vehicle.vin + dir + ' geofence at ' + Date.now()
                }
            }
            fulfill(message);
        });
    });

    dfd.then(function(message){
        console.log(message);
        AWS.config.update({region:'us-east-1'});
        var sns = new AWS.SNS({params: {TopicArn:'arn:aws:sns:us-east-1:629760438439:vinli-geofence'}});

        sns.publish({Message: message}, function (err, data) {
            if (err) console.log('Error: ', JSON.stringify(err));

            console.log("success: ", JSON.stringify(data));
        });
    });

    var muleSloth = new Promise(function(fulfill, reject){
       var muleEndpoint = 'http://connectcar-autonation.cloudhub.io/api/notifications';
        request.post(muleEndpoint,{
            json:true,
            body:msg
        }, function(err, result){
            if(err) reject(JSON.stringify(err));
            fulfill(result);
        })
    });

    muleSloth.then(function(result){
        res.status(200);
        res.send(deviceID);
        res.end();
    });

});

http.createServer(app).listen(app.get('port'), function(){
    console.log('app listening on port ' + app.get('port'));
});

