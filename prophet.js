function noop(){};
var IS_ERROR = {};

function Prophet(fn){
	this.value = null;
	this.deferred = null;
	this.state = 0;
	this.deferredState = 0;
	if ( fn === noop ) {return;}
	haveDream(fn , this);
}
Prophet.prototype.dream = function(onReality , onDrowsy) {
	if ( this.constructor !== Prophet) {
		return safeDream(this , onReality , onDrowsy);
	}
	var prophet = new Prophet(noop);
	handle(this , new Handler(onReality , onDrowsy , prophet));
	return prophet;
};
function safeDream(self , onReality , onDrowsy){
	return new self.constructor(function(reality , onDrowsy){
		var prophet = new Prophet(noop);
		prophet.dream(reality , drowsy);
		handle(this , new Handler(onReality , onDrowsy , prophet));
	});
}
function handle(self , deferred){
	while(self.state === 3 ){
		self = self.value;
	}
	if (self.state === 0 ) {
		if (self.deferredState === 0 ) {
			self.deferredState = 1;
			self.deferred = deferred;
			return;
		}else if( self.deferredState === 1 ){
			self.deferredState = 2;
			self.deferred = [self.deferred , deferred];
			return;
		}
		self.deferred.push(deferred);
	}
	handleRun(self , deferred);
};
function handleRun(self , deferred){
	asap(function() {
	    var cb = self.state === 1 ? deferred.onReality : deferred.onDrowsy;
	    if (cb === null) {
	        if (self.state === 1) {
	       		reality(deferred.prophet, self.value);
	        } else {
	        	drowsy(deferred.prophet, self.value);
	      	}
	      	return;
	    }
	    var ret = cb(self.value);
	    if (ret === IS_ERROR ) {
	    	drowsy(deferred.prophet, null);
	    } else {
	    	reality(deferred.prophet, ret);
	    }
	});
};
function reality(self , newValue){
	if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
		if ( newValue.dream === self.dream && newValue instanceof Prophet) {
			self.state = 3;
			self.value = newValue;
			finale(self);
			return;
		}else if(typeof newValue.dream === 'function'){
			haveDream(newValue.dream.bind(newValue) , self);
			return;
		}
	}
	self.state = 1;
	self.value = newValue;
	finale(self);
};
function drowsy(self , newValue){
	self.state = 2;
	self.value = newValue;
	finale(self);
};
function finale(self){
	if (self.deferredState === 1 ) {
		handle(self , self.deferred);
		self.deferred = null;
	}
	if (self.deferredState === 2 ) {
		for (var i = 0; i < self.deferred.length; i++) {
			handle(self , self.deferred[i]);
		}
		self.deferred = null;
	}
};

function Handler(reality , drowsy , prophet){
	this.onReality = typeof reality === 'function' ? reality : null;
	this.onDrowsy = typeof drowsy === 'function' ? drowsy : null;
	this.prophet = prophet;
};
function haveDream(fn , prophet){
	fn(function(value) {
		reality(prophet , value);
	} , function(reason){
		drowsy(prophet , reason);
	});
}