/*jslint browser:true*/
/*global console, document, alert*/

var digiBon = digiBon || {},
    mandelbrotCanvas = null,
    gMandelInitialX = -2.4,
    gMandelInitialY = 2.0,
    gInterval = 0.01,
    gColourDepth = 255,//,
    gHandle,
    gRefreshTime = 1000 / 20,
    gParams = [],
    gInputEntry = 0,
    gInputStack = 1,
    gInputDrag = 2;

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

window.clearRequestTimeout = function (handle) {
    "use strict";
    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) : window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) : window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) : window.msCancelRequestAnimationFrame ? msCancelRequestAnimationFrame(handle.value) : clearTimeout(handle);
};

//TODO stop and restart annimation based on animation and click and drag

window.onload = function () {
    "use strict";
    var myElement = document.getElementById("debugInfo");
    digiBon.mandelbrotCanvas = new digiBon.MandelArray("mandelbrot", "cvThumbnail", gMandelInitialX, gMandelInitialY, gInterval, gColourDepth);
    myElement.innerHTML = "started";
    updateValues();
    
    digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, gRefreshTime);

    
};

var mandelPrevious = function () {
    "use strict";
    var item =  null,
        xElement = document.getElementById("topLeftX"),
        yElement = document.getElementById("topLeftY"),
        intervalElement = document.getElementById("interval"),
        previousButton = document.getElementById('previousButton');


    if (Array.isArray(gParams) && gParams.length >= 1) {
        item = gParams.pop();
        xElement.value = item.X.toString();
        yElement.value = item.Y.toString();
        intervalElement.value = item.Delta.toString();
        
        digiBon.mandelbrotCanvas.updateArray(item.X, item.Y, item.Delta, item.ImageInfo);
        digiBon.mandelbrotCanvas.drawThumbnail();
        digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, gRefreshTime);
    }
    
    if (Array.isArray(gParams) && gParams.length >= 1) {
        previousButton.disabled = false;
    } else {
        previousButton.disabled = true;
    }
    
};

var mandelAddToStack = function (paramSet) {
    "use strict";
    
    var previousButton = document.getElementById('previousButton');
    previousButton.disabled = false;
    gParams.push(paramSet);


};

var mandelResetStack = function () {
    "use strict";
    var previousButton = document.getElementById('previousButton');
    gParams = [];
    previousButton.disabled = false;
};
var mandelImplement = function (topXElement, topYElement, intervalElement) {
    "use strict";
    var topX = parseFloat(document.getElementById(topXElement).value),
        topY = parseFloat(document.getElementById(topYElement).value),
        interval = parseFloat(document.getElementById(intervalElement).value),
        validParams = digiBon.MandelValidParams(topX, topY, interval, gColourDepth),
        maxInterval = 1,
        maxCoOrd = 3,
        thumbnailImage = document.getElementById('thumbnail');

    if (typeof digiBon.mandelbrotCanvas !== typeof undefined && digiBon.mandelbrotCanvas !== null) {
        if (validParams === false) {
            alert("Please check your inputs.  X Start and Y Start both need to in the range -" + maxCoOrd +
                " to " + maxCoOrd + ".  The interval needs to be a positive number below 1.6 and not too small.");
        } else {
            window.clearInterval();
            mandelAddToStack(digiBon.mandelbrotCanvas.getParams());
            digiBon.mandelbrotCanvas.fromInput = gInputEntry;
            digiBon.mandelbrotCanvas.updateArray(topX, topY, interval);
            digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, gRefreshTime);
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
        mandelResetStack();
        digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, gRefreshTime);
    }
};