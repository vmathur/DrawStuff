(function (App, Canvas) {
	if(cards.kik && cards.kik.message && cards.kik.message.targetUser){
		console.log('invited');
		kik.getUser(function (user) {
    		if ( !user ) {
    			App.load('home');
    		}else{
    			App.load('session',{username:user.username, isKik:true, invited:true, targetUser:cards.kik.message.targetUser});
    		}
    	});
	}else{
		App.load('home');
	}

})(App, Canvas);




