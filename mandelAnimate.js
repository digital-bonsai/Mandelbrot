/*jslint browser:true*/
/*global console, document, alert*/

var digiBon = digiBon || {},
    mandelbrotCanvas = null,
    gMandelInitialX = -2.4,
    gMandelInitialY = 2.0,
    gInterval = 0.01;

var updateValues = function () {
    "use strict";
    var xElement = document.getElementById("topLeftX"),
        yElement = document.getElementById("topLeftY"),
        intervalElement = document.getElementById("interval");
    xElement.value = gMandelInitialX;
    yElement.value = gMandelInitialY;
    intervalElement.value = gInterval;

};




window.requestAnimFrame = (function () {
    "use strict";
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
            window.setInterval(callback, 10);
        };
}());

/**
 * Behaves the same as setInterval except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 */
window.requestTimeout = function (fn, delay) {
    "use strict";
	if (!window.requestAnimationFrame       &&
            !window.webkitRequestAnimationFrame &&
            !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) &&
            // Firefox 5 ships without cancel support
            !window.oRequestAnimationFrame      &&
            !window.msRequestAnimationFrame) {
        return window.requestTimeout(fn, delay);
    }
        
			
	var start = new Date().getTime(),
		handle = {};
		
	function loop() {
		var current = new Date().getTime(),
			delta = current - start;
			
		if (delta >= delay) {
			fn.call();
			start = new Date().getTime();
		}

		handle.value = window.requestAnimFrame(loop);
    }
    
	handle.value = window.requestAnimFrame(loop);
	return handle;
};

//TODO stop and restart annimation based on animation and click and drag

window.onload = function () {
    "use strict";
    var myElement = document.getElementById("debugInfo"),
        mandelbrotCanvas = new digiBon.MandelArray("mandelbrot", gMandelInitialX, gMandelInitialY, gInterval, 255);
    myElement.innerHTML = "started";
    updateValues();
    
    window.setInterval(function () { mandelbrotCanvas.incrementDraw(); }, 20);
};





var mandelReset = function () {
    "use strict";
    var myElement = document.getElementById("debugInfo");
    if (mandelbrotCanvas !== undefined && mandelbrotCanvas !== null) {
        mandelbrotCanvas.resetMandel();
        myElement.innerHTML = "reset";
        updateValues();
        window.setInterval(function () { mandelbrotCanvas.incrementDraw(); }, 20);
    }
};