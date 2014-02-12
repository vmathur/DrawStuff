var express = require('express')
  , routes = require('./routes/index')
  , http = require('http');
 
var app = express();
var server = app.listen(process.env.PORT || 3000);
var io = require('socket.io').listen(server);
var clients = [];
var sessions = [];

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});
 
app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', routes.index);

var totalClients =0;
var numberOfUsers = 0;
var sessionid = 0;
var session =[];
var kikWaitingRoom = [];

io.sockets.on('connection', function (socket) {
    console.log('connection has been made!');

    socket.on('login', function(user){
        console.log('user '+user.username+' logged in!');
        
        totalClients++;

        var client = {'user':user.username, 'pic':user.pic,'socketid':socket.id, 'sessionid':sessionid, 'isKik':user.isKik};
        clients.push(client);

        if(!user.isKik){
            console.log('user is not kik');
            numberOfUsers++;
            session.push(client);

            console.log('there are '+numberOfUsers+' users in the current session');
            if(numberOfUsers==1){
              console.log('only user in session...');
            }else if(numberOfUsers==2){
              sessions.push(session);
              socket.emit('friend connect',{username:session[0].user, pic:session[0].pic});
              sessionid++;
              session = [];
              numberOfUsers=0;
              io.sockets.socket(getSocketById(socket.id)).emit('clear');
              io.sockets.socket(getSocketById(socket.id)).emit('friend connect',{username:user.username});
            }else{
              console.log('this should never show');
            }

            console.log('current anon session:')
            console.log(session);

        }else{
            console.log('user is kik');
            if(!user.invited){
              kikWaitingRoom.push(client);
              console.log(user.username+ ' is waiting for a friend');
            }
            else{
                var host = getClientByUser(user.targetUser);
                if(host!==-1){
                  console.log('friend is here');

                  var kikSession = [];
                  kikSession.push(host);
                  kikSession.push(client);
                  sessions.push(kikSession);
                  sessionid++;
                  io.sockets.socket(getSocketById(socket.id)).emit('friend connect',{username:user.username});
                  io.sockets.socket(getSocketById(socket.id)).emit('clear');
                  socket.emit('friend connect',{username:host.user});
                }else{
                  socket.emit('error friend', {username:user.targetUser});
                }
            }

        }

        console.log(sessions.length +' sessions:')
        console.log(sessions);

        socket.on('push', function (data) {
            io.sockets.socket(getSocketById(socket.id)).emit("update", data);
        });

        socket.on('clear', function () {
            io.sockets.socket(getSocketById(socket.id)).emit('clear');
        });

        socket.on('disconnect', function() {
            console.log('user '+user.username+' disconnected!');
            io.sockets.socket(getSocketById(socket.id)).emit('friend disconnected', {username:user.username});
            if(session.length===1){
              numberOfUsers=0;
              session=[];
            }else{
              removeSessionById(socket.id);
            }
        });
    });

    function getSocketById(socketid){
      for(var i=0;i<sessions.length;i++){
        for(var j=0;j<2;j++){
          if(sessions[i][j].socketid===socketid){
            if(j==0){
              return sessions[i][1].socketid;
            }else{
              return sessions[i][0].socketid;
            }
          }
        }
      }
      return null;
    }

    function getClientByUser(user){
      for(var i=0;i<kikWaitingRoom.length;i++){
        if(kikWaitingRoom[i].user===user){
          return kikWaitingRoom[i];
        }
      }
      return -1;
    }

    function removeSessionById(socketid){
      var session;
      for(var i =0;i<sessions.length;i++){
        for(var j=0;j<2;j++){
          if(sessions[i][j].socketid===socketid){
            session=sessions[i];
          }
        }
      }
      var index = sessions.indexOf(session);
      if (index > -1) {
        sessions.splice(index, 1);
      }
    }

});
 
console.log("Express server listening on port 3000");

