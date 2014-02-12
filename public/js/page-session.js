App.populator('session', function (page,user) {
      console.log('loading session');

      var $canvas = $(page).find('#draw');
      var canvas = Canvas(page);
      var $status = $(page).find('.status');
      // var $friendpic = $(page).find('.friendpic');
      // var $upload   = $(page).find('.upload');
      // var $save     = $(page).find('.save');
      var $chat     = $(page).find('.chat');
      var $back   = $(page).find('.back');

      var url   = 'http://drawstuffz.herokuapp.com';
      //var url =  'http://10.22.213.59:3000';
      //var url = 'http://10.10.20.172:3000/';
      //var url = 'http://192.168.0.19:3000/';

      var socket;

      if(!user.firstTime){
        socket = io.connect(url);
        socket.socket.reconnect();
      }else{
        socket = io.connect(url);
      }
  
      if(user.isKik && !user.invited){
        kik.send({
            title : 'Draw stuff',
            text  : 'Come draw stuff with me!',
            //pic   : '/img/draw_stuff_send',
            data  : {'targetUser':user.username}
        });
      }

      console.log('username is '+user.username);

      socket.on('connect', function () {
          console.log('successfully connected to '+url);
          socket.emit('login', user);
      });

      socket.on('friend connect',function(user){
        console.log('connected with '+user.username);
        $status.text('Drawing with '+user.username);
        // $friendpic.update(user.pic);

        $chat.on('click',function(){
          kik.openConversation(user.username);
        });
      });

      $canvas.on('draw', function(event, data){
          socket.emit('push', { 'drawing': data.drawing,'user':user.username });
      });

      $canvas.on('clear', function(event, data){
          socket.emit('clear');
      });      

      $back.on('click',function(){
        leave();
      });

      socket.on('update', function (data) {
          console.log('update');
          canvas.update(data.drawing)
      });

      socket.on('clear',function(){
        canvas.clear();
      });

      socket.on('error friend', function (user) {
          $status.text('Drawing alone');
          App.dialog({
                title: user.username+' may have left',
                text: 'You can continue drawing alone, or find another buddy',
                okButton: 'Leave',
                cancelButton: 'Stay'
              },function(ok){
              if(ok){
                leave();
              }
          });
      });

      socket.on('friend disconnected',function(user){
        $status.text('Drawing alone');
          App.dialog({
                title: user.username+' left',
                text: 'You can continue drawing alone, or find another buddy',
                okButton: 'Leave',
                cancelButton: 'Stay'
              },function(ok){
              if(ok){
                leave();
              }
          });
      });

      function leave(){
        console.log('leaving');
        socket.disconnect();
        socket.removeAllListeners();
        socket.socket.removeAllListeners();
        if(user.invited){
          App.load('home');
        }else{
          App.back(function(){console.log('disconnected');});
        }
      }

      // $save.on('click',function(){
      //   canvas.save();
      // });

      // $upload.on('click',function(){
      //   kik.photo.get(function (photos) {
      //     if ( !photos ) {
      //         // action cancelled by user
      //     } else {
      //        canvas.upload(photos);
      //     }
      //   });
      // });
      
  });