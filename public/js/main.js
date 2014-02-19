(function (App, Canvas) {

	if (cards.browser && cards.browser.setOrientationLock) {
		cards.browser.setOrientationLock('portrait');
	}
	
	if(cards.kik && cards.kik.message && cards.kik.message.targetUser){
		console.log('invited');
        mixpanel.track('Invited by Friend');

		var hadPermission = kik.hasPermission();

		kik.getUser(function (user) {
    		if ( !user ) {
    			mixpanel.track('Decline Link to Kik',{'page':'invite'});
    			App.load('home');
    		}else{
    			mixpanel.track('Accept Link to Kik',{'page':'invite'});
    			App.load('session',{username:user.username, isKik:true, invited:true, targetUser:cards.kik.message.targetUser});
    			if(hadPermission){
    				mixpanel.people.identify(user.username);
    			}else{
    				mixpanel.alias(user.username);
					mixpanel.people.set(user);
    			}
    		}
    	});
	}else{
		App.load('home');
	}

})(App, Canvas);




