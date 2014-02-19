App.populator('home', function (page) {
      console.log('loading home');
      $anonSignIn = $(page).find('.anon-sign-in');
      $kikSignIn = $(page).find('.kik-sign-in');

      var firstTime=true;

      var randomId = 'Anonymous_'+Math.random().toString(36).substr(2, 5);




      page.addEventListener('appShow', function () {
        mixpanel.track("Landed on Home");
      });

      $anonSignIn.on('click', function(){
        //TODO make pic a silouette of a dude

        var userAnom = {'username':randomId, 'pic':null, 'isKik':false, 'invited':false, 'targetUser':null, 'firstTime':firstTime};
        App.load('session',userAnom);
        firstTime=false;
      });   

      $kikSignIn.on('click', function(){
        var kikId = 'Kik_'+Math.random().toString(36).substring(7);

        kik.getUser(function (user) {
            if ( !user ) {
            } else {

              if(firstTime){
                  mixpanel.alias(user.username);
                  mixpanel.people.set(user);
              }else{
                  mixpanel.identify(user.username);
              }

              App.load('session',{'username':user.username, 'pic':user.pic,'isKik':true, 'invited':false, 'targetSocket':null, 'firstTime':firstTime});
              firstTime=false;
            }
        });
      });      

  });