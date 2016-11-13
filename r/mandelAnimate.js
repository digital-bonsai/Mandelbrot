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
    var myElement = document.getElementById("debugInfo");
    digiBon.mandelbrotCanvas = new digiBon.MandelArray("mandelbrot", gMandelInitialX, gMandelInitialY, gInterval, 255);
    myElement.innerHTML = "started";
    updateValues();
    
    window.setInterval(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, 20);
};


var mandelImplement = function (topXElement, topYElement, intervalElement) {
    "use strict";
    var topX = parseFloat(document.getElementById(topXElement).value),
        topY = parseFloat(document.getElementById(topYElement).value),
        interval = parseFloat(document.getElementById(intervalElement).value),
        interval = parseFloat(document.getElementById(intervalElement).value),
        validParams = false,
        maxInterval = 1,
        maxCoOrd = 3;
    
    
    if (!Number.isNaN(topX) && !Number.isNaN(topY) && !Number.isNaN(interval)) {
        if (topX >= -1 * maxCoOrd &&
                topX <= maxCoOrd &&
                topY >= -1 * maxCoOrd &&
                topY <= maxCoOrd &&
                interval >= Number.MIN_VALUE &&
                interval < maxInterval) {
            validParams = true;
            

        }
    }
    
    if (typeof digiBon.mandelbrotCanvas !== typeof undefined && digiBon.mandelbrotCanvas !== null) {
        if (validParams === false) {
            alert("Please check your inputs.  X Start and Y Start both need to in the range -" + maxCoOrd +
             " to " + maxCoOrd + ".  The interval needs to below 1 and not too small. ");
        } else {
            window.clearInterval();
            digiBon.mandelbrotCanvas.updateArray(topX, topY, interval);
            window.setInterval(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, 20); 
        }
        
    }
    
};


var mandelReset = function () {
    "use strict";
    var myElement = document.getElementById("debugInfo");
    if (typeof digiBon.mandelbrotCanvas !== typeof undefined && digiBon.mandelbrotCanvas !== null) {
        digiBon.mandelbrotCanvas.resetMandel();
        myElement.innerHTML = "reset";
        updateValues();
        window.setInterval(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, 20);
    }
};