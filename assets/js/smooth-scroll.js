(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define('smoothScroll', factory(root));
	} else if ( typeof exports === 'object' ) {
		module.smoothScroll = factory(root);
	} else {
		root.smoothScroll = factory(root);
	}
})(this, function (root) {

	'use strict';

	

	var exports = {}; 
	var supports = !!document.querySelector && !!root.addEventListener; 
	var settings;

	
	var defaults = {
		speed: 500,
		easing: 'easeInOutCubic',
		offset: 0,
		updateURL: false,
		callbackBefore: function () {},
		callbackAfter: function () {}
	};


	
	var forEach = function (collection, callback, scope) {
		if (Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection);
				}
			}
		} else {
			for (var i = 0, len = collection.length; i < len; i++) {
				callback.call(scope, collection[i], i, collection);
			}
		}
	};

	
	var extend = function ( defaults, options ) {
		var extended = {};
		forEach(defaults, function (value, prop) {
			extended[prop] = defaults[prop];
		});
		forEach(options, function (value, prop) {
			extended[prop] = options[prop];
		});
		return extended;
	};

	
	var easingPattern = function ( type, time ) {
		var pattern;
		if ( type === 'easeInQuad' ) pattern = time * time; 
		if ( type === 'easeOutQuad' ) pattern = time * (2 - time); 
		if ( type === 'easeInOutQuad' ) pattern = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; 
		if ( type === 'easeInCubic' ) pattern = time * time * time; 
		if ( type === 'easeOutCubic' ) pattern = (--time) * time * time + 1; 
		if ( type === 'easeInOutCubic' ) pattern = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; 
		if ( type === 'easeInQuart' ) pattern = time * time * time * time; 
		if ( type === 'easeOutQuart' ) pattern = 1 - (--time) * time * time * time; 
		if ( type === 'easeInOutQuart' ) pattern = time < 0.5 ? 8 * time * time * time * time : 1 - 8 * (--time) * time * time * time; 
		if ( type === 'easeInQuint' ) pattern = time * time * time * time * time; 
		if ( type === 'easeOutQuint' ) pattern = 1 + (--time) * time * time * time * time; 
		if ( type === 'easeInOutQuint' ) pattern = time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * (--time) * time * time * time * time; 
		return pattern || time; 
	};

	
	var getEndLocation = function ( anchor, headerHeight, offset ) {
		var location = 0;
		if (anchor.offsetParent) {
			do {
				location += anchor.offsetTop;
				anchor = anchor.offsetParent;
			} while (anchor);
		}
		location = location - headerHeight - offset;
		return location >= 0 ? location : 0;
	};

	
	var getDocumentHeight = function () {
		return Math.max(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.body.clientHeight, document.documentElement.clientHeight
		);
	};

	
	var trim = function ( string ) {
		return string.replace(/^\s+|\s+$/g, '');
	};

	
	var getDataOptions = function ( options ) {
		var settings = {};
		
		if ( options ) {
			options = options.split(';');
			options.forEach( function(option) {
				option = trim(option);
				if ( option !== '' ) {
					option = option.split(':');
					settings[option[0]] = trim(option[1]);
				}
			});
		}
		return settings;
	};

	
	var updateUrl = function ( anchor, url ) {
		if ( history.pushState && (url || url === 'true') ) {
			history.pushState( {
				pos: anchor.id
			}, '', anchor );
		}
	};

	
	exports.animateScroll = function ( toggle, anchor, options, event ) {

		
		var settings = extend( settings || defaults, options || {} );  
		var overrides = getDataOptions( toggle ? toggle.getAttribute('data-options') : null );
		settings = extend( settings, overrides );

		
		var fixedHeader = document.querySelector('[data-scroll-header]'); 
		var headerHeight = fixedHeader === null ? 0 : (fixedHeader.offsetHeight + fixedHeader.offsetTop); 
		var startLocation = root.pageYOffset; 
		var endLocation = getEndLocation( document.querySelector(anchor), headerHeight, parseInt(settings.offset, 10) ); 
		var animationInterval; 
		var distance = endLocation - startLocation; 
		var documentHeight = getDocumentHeight();
		var timeLapsed = 0;
		var percentage, position;

		
		if ( toggle && toggle.tagName.toLowerCase() === 'a' && event ) {
			event.preventDefault();
		}

		
		updateUrl(anchor, settings.updateURL);

		
		var stopAnimateScroll = function (position, endLocation, animationInterval) {
			var currentLocation = root.pageYOffset;
			if ( position == endLocation || currentLocation == endLocation || ( (root.innerHeight + currentLocation) >= documentHeight ) ) {
				clearInterval(animationInterval);
				settings.callbackAfter( toggle, anchor ); 
			}
		};

		
		var loopAnimateScroll = function () {
			timeLapsed += 16;
			percentage = ( timeLapsed / parseInt(settings.speed, 10) );
			percentage = ( percentage > 1 ) ? 1 : percentage;
			position = startLocation + ( distance * easingPattern(settings.easing, percentage) );
			root.scrollTo( 0, Math.floor(position) );
			stopAnimateScroll(position, endLocation, animationInterval);
		};

		
		var startAnimateScroll = function () {
			settings.callbackBefore( toggle, anchor ); 
			animationInterval = setInterval(loopAnimateScroll, 16);
		};

		
		if ( root.pageYOffset === 0 ) {
			root.scrollTo( 0, 0 );
		}

		
		startAnimateScroll();

	};

	
	exports.init = function ( options ) {

		
		if ( !supports ) return;

		
		settings = extend( defaults, options || {} ); 
		var toggles = document.querySelectorAll('[data-scroll]'); 

		
		forEach(toggles, function (toggle) {
			toggle.addEventListener('click', exports.animateScroll.bind( null, toggle, toggle.hash, settings ), false);
		});

	};


	

	return exports;

});
