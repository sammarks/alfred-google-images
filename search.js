var phantom = require('phantom');
var util = require('util');

var GenerateURL = function (query) {
	var url = "https://www.google.com/images?q=%s";
	return util.format(url, query);
};

var GetImages = function (page, callback) {
	page.evaluate(function () {
		var imagesMax = 5;
		var images = [];
		jQuery('.ivg-i[data-ved]').each(function (index, element) {
			var ved = $(element).attr('data-ved');
			if (!jQuery('.irc_c[data-ved=' + ved + ']').length) {
				jQuery(element).click();
			}
			setTimeout(function () {
				var info = $('.irc_c[data-ved=' + ved + ']');
				var image = {};
				image.url = info.find('img.irc_mi').first().attr('src');
				image.thumbnail = info.find('img.irc_rli').first().attr('src');
				image.title = info.find('.irc_asc .irc_su').first().text();
				images.push(image);
				if (images.length >= imagesMax) {
					callback(images);
				}
			}, 100);
			if (images.length + 1 >= imagesMax) {
				return false;
			}
		});
	});
};

var ImageSearch = function (query, callback) {
	phantom.create(function (ph) {

		/**
		 * (From the PhantomJS examples)
		 * 
		 * Wait until the test condition is true or a timeout occurs. Useful for waiting
		 * on a server response or for a ui change (fadeIn, etc.) to occur.
		 *
		 * @param testFx javascript condition that evaluates to a boolean,
		 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
		 * as a callback function.
		 * @param onReady what to do when testFx condition is fulfilled,
		 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
		 * as a callback function.
		 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
		 */
		var waitFor = function (testFx, onReady, timeOutMillis) {
		    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
		        start = new Date().getTime(),
		        condition = false,
		        interval = setInterval(function() {
		            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
		                // If not time-out yet and condition not yet fulfilled
		                testFx(function (result) {
		                	condition = result;
		                });
		            } else {
		                if(!condition) {
		                    // If condition still not fulfilled (timeout but condition is 'false')
		                    console.log("'waitFor()' timeout");
		                    ph.exit(1);
		                } else {
		                    // Condition fulfilled (timeout and/or condition is 'true')
		                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
		                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
		                    clearInterval(interval); //< Stop this interval
		                }
		            }
		        }, 250); //< repeat check every 250ms
		};

		ph.createPage(function (page) {
			page.set('settings.userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A');
			page.open(GenerateURL(query), function (status) {
				if (status !== 'success') {
					callback([]);
				} else {
					page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function () {
						waitFor(function (callback) {
							page.evaluate(function () {
								// return jQuery('body').html();
								return jQuery('#rg_s a.rg_l').length > 0;
							}, function (result) {
								console.log(result);
								callback(result);
							});
						}, function () {
							GetImages(page, callback);
						});
					});
				}
			});
		});
	});
};

module.exports = ImageSearch;
