App.populator('session', function (page,user) {
      console.log('loading session');

      var $canvas = $(page).find('#draw');
      var canvas  = Canvas(page);
      var $status = $(page).find('.status');
      // var $friendpic = $(page).find('.friendpic');
      var $eraser   = $(page).find('.eraser');
      var $upload   = $(page).find('.upload');
      var $save     = $(page).find('.save');
      var $chat     = $(page).find('.chat');
      $chat.hide();
      var $back   = $(page).find('.back');

      // var url   = 'http://drawstuffz.herokuapp.com';
      var url = 'http://10.10.20.172:3000/';
      var TOUCHSTART = 'touchstart';

      //server connection
      var socket;

      if(!user.firstTime){
        socket = io.connect(url);
        socket.socket.reconnect();
      }else{
        socket = io.connect(url);
      }
  
      if(user.isKik && !user.invited){
        mixpanel.track("Started Friend Session");
        kik.send({
            title     : 'Draw stuff',
            text      : 'Come draw stuff with me!',
            pic       : '/img/kikfriend.png',
            noForward :  true,
            data      : {'targetUser':user.username}
        });
      }else{
          mixpanel.track("Started Anon Session");
      }


      //colours
      $(".color", page).bind(TOUCHSTART, function(){
          toggleVisibility($(".color_picker"),true);
      });

      $(".color_popup_color", page).bind(TOUCHSTART, function(){
        var color = rgb2hex($(this).css("background-color"));
        canvas.setColour(color);
        toggleVisibility($(".color_picker"),false);
        toggleHighlight($(".color"),$(".eraser"));
      });
      //exit colour picker
      $(".color_picker", page).bind(TOUCHSTART, function(e){
        e.preventDefault();
        e.stopPropagation();
        toggleVisibility($(".color_picker"),false);
      });

      function toggleHighlight(elemAdd,elemRemove){
        elemAdd.css("box-shadow","-2px 0 0 #000,2px 0 0 #000,0 -2px 0 #000,0 2px 0 #000");
        elemRemove.css("box-shadow","");
      }

      function toggleVisibility(elem,show) {
        if ( !show ) {
          elem.hide();
        }else {
          elem.show();
        }
      }
    
      socket.on('connect', function () {
          console.log('successfully connected to '+url);
          socket.emit('login', user);
      });

      socket.on('friend connect',function(friend){
        console.log('connected with '+friend.username);
        $status.text('Drawing with '+friend.username);
        // $friendpic.update(user.pic);

        if(friend.isKik){
          $chat.show();
        }
 
        $chat.on('click',function(){
          mixpanel.track("Chat Clicked");
          startChat(user, friend);
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

      $save.on('click',function(){
        mixpanel.track("Save Clicked");
        canvas.save();
      });

      $eraser.on('click',function(){
        canvas.setColour('ffffff');
        toggleHighlight($(".eraser"),$(".color"));
      });

      $(page).on('appShow', function () { 
        var uploadOffset = parseInt($upload.css("margin-right"))+parseInt($(".save").css("width"));
        $upload.css("margin-right",uploadOffset*2);        
      });

      $upload.on('click',function(){
        kik.photo.get(function (photos) {
          if ( !photos ) {
              // action cancelled by user
          } else {
            mixpanel.track("Upload Clicked",{'image':photos[0]});
            canvas.upload(photos[0]);
            socket.emit('push', { 'drawing': {'type':'image','image':photos[0]},'user':user.username });
          }
        });
      });

      socket.on('update', function (data) {
          console.log('update');
          if(data.drawing.type==='image'){
            console.log('we got an image')
            canvas.upload(data.drawing.image);
          }
          else{
              canvas.update(data.drawing)
          }
      });

      socket.on('clear',function(){
        canvas.clear();
      });

      socket.on('error friend', function (user) {
          $status.text('Drawing alone');
          App.dialog({
                title        : user.username+' may have left',
                text         : 'You can continue drawing alone, or find another buddy',
                okButton     : 'Leave',
                cancelButton : 'Stay'
              },function(ok){
              if(ok){
                leave();
              }
          });
      });

      socket.on('friend disconnected',function(user){
        $chat.hide();
        $status.text('Drawing alone');
          App.dialog({
                title        : user.username+' left',
                text         : 'You can continue drawing alone, or find another buddy',
                okButton     : 'Leave',
                cancelButton : 'Stay'
              },function(ok){
              if(ok){
                leave();
              }
          });
      });

      function leave(){
        console.log('leaving');
        mixpanel.track("Left Session");
        socket.disconnect();
        socket.removeAllListeners();
        socket.socket.removeAllListeners();
        if(user.invited){
          App.load('home');
        }else{
          App.back(function(){console.log('disconnected');});
        }
      }

      function startChat(user,friend){
        if( kik.hasPermission() && friend.isKik){
            kik.openConversation(friend.username);
          }else if( kik.hasPermission() && !friend.isKik){
            App.dialog({
                  title        : friend.username+' doesn\'t have kik :(',
                  text         : 'You can suggest that they get kik though',
                  okButton     : 'Yeah!',
                  cancelButton : 'Nah'
                },function(yeah){
                if(yeah){
                  //TODO socket.emit('get kik',user.username);
                }
            });          
          }else{
            App.dialog({
                  title        : 'Get Kik!',
                  text         : 'Install kik to chat, save pictures and moar!',
                  okButton     : 'Install',
                  cancelButton : 'Cancel'
                },function(install){
                if(install){
                  var os = kik.utils.platform.os;

                  if (os.ios) {
                    window.location.href = 'itms-apps://itunes.apple.com/app/kik-messenger/id357218860';
                  }
                  else if (os.android) {
                    window.location.href = 'market://details?id=kik.android';
                  }
                  else {
                    window.location.href = 'http://kik.com';
                  }
                }
            });
          }
      }

      function rgb2hex(rgb) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
          return ("0" + parseInt(x,0).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
      }
      
  });