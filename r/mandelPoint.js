/*
Point for mandelbrot
*/


/*jslint browser:true*/
/*global console, document, alert*/




var digiBon = digiBon || {};

digiBon.Point = function (newX, newY) {
    "use strict";
    this.x = newX;
    this.y = newY;
};

digiBon.Mandelpoint = function (x, y, newLimit) {
    "use strict";
    // constructor
    this.startPoint = new digiBon.Point(x, y);
    this.limit = newLimit;
    this.count = 0;
    this.lastPoint = new digiBon.Point(0.00, 0.00);
    this.max = 2.0;
    this.completed = false;

};
        
digiBon.Mandelpoint.prototype = (function () {
    "use strict";
    var calculateIteration = function () {

        var tempX = this.lastPoint.x,
            tempY = this.lastPoint.y,
            xCalc = 0.00;
        if (this.completed === false) {
            this.count += 1;
            xCalc = (this.lastPoint.x * this.lastPoint.x) - (this.lastPoint.y * this.lastPoint.y) + this.startPoint.x;
            tempY = 2 * tempX * tempY + this.startPoint.y;
            this.lastPoint.x = xCalc;
            this.lastPoint.y = tempY;
            if ((this.count >= this.limit) || ((this.lastPoint.x * this.lastPoint.x) + (this.lastPoint.y * this.lastPoint.y)) > (this.max * this.max)) {
                this.completed = true;
            }
        }
    },
        isCompleted = function () {
            return this.completed;
        },
        getIterationCount = function () {
            if (this.completed === true && this.count >= this.limit) {
                return 0;
            }
            return this.count;
        },
        coOrd = function () {
          return this.startPoint;  
        },
        iterateToEnd = function () {

            var tempX = 0.00,
                tempY = 0.00,
                xCalc = 0,
                yCalc = this.startPoint.y;
            this.count = 0;
            while ((this.count < this.limit) && ((tempX * tempX) + (tempY * tempY)) < (this.max * this.max)) {
                xCalc = (tempX * tempX) - (tempY * tempY) + this.startPoint.x;
                tempY = 2 * tempX * tempY + yCalc;
                tempX = xCalc;
                this.count += 1;
                
            }
            this.completed = true;

        };
    
    return {
        get : getIterationCount,
        nextIter : calculateIteration,
        finishIter : iterateToEnd,
        isCompleted : isCompleted,
        coOrd : coOrd
        
    };
}());