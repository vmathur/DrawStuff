(function (App, Canvas) {


	if (cards.browser && cards.browser.setOrientationLock) {
		cards.browser.setOrientationLock('portrait');
	}
	
	if(cards.kik && cards.kik.message && cards.kik.message.targetUser){
		console.log('invited');
        mixpanel.track('Launched Draw Stuff',{'page':'invite'});
        mixpanel.track('Invited by Friend');

		var hadPermission = kik.hasPermission();

		kik.getUser(function (user) {
    		if ( !user ) {
    			mixpanel.track('Decline Link to Kik',{'page':'invite'});
    			App.load('home');
    		}else{
    			App.load('session',{username:user.username, isKik:true, invited:true, targetUser:cards.kik.message.targetUser});
    			if(hadPermission){
    				mixpanel.people.identify(user.username);
    			}else{
    				mixpanel.track('Accept Link to Kik',{'page':'invite'});
    				mixpanel.alias(user.username);
					mixpanel.people.set(user);
    			}
    		}
    	});
	}else{
        mixpanel.track('Launched Draw Stuff',{'page':'home'});
		App.load('home');
	}

})(App, Canvas);




