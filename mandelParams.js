/*jslint browser:true*/
/*global console, document, alert*/


var digiBon = digiBon || {};

digiBon.MandelDefaults =  {
    X : -2.4,
    Y : 2.0,
    Delta : 0.01,
    ColourDepth : 32
};

digiBon.MandelParams = function (x, y, delta, colourDepth) {
    "use strict";
    this.X = digiBon.MandelDefaults.X;
    this.Y = digiBon.MandelDefaults.Y;
    this.Delta = digiBon.MandelDefaults.Delta;
    this.ColourDepth = digiBon.MandelDefaults.ColourDepth;
    this.AreDefaultValues = true;
    
    
    this.TryChange.call(this, x, y, delta, colourDepth);
    
};

digiBon.MandelParams.prototype = (function () {
    "use strict";
    var AreValidParams = function (newX, newY, newDelta, newColourDepth) {
            var areValid = true;
            if (newX === null || isNaN(newX) || newX < -4 || newX > 4) {
                areValid = false;
            }
            if (newY === null || isNaN(newY) || newY < -4 || newY > 4) {
                areValid = false;
            }
            if (newDelta === null || isNaN(newDelta) || newDelta < -1.0 || newDelta > 1.0) {
                areValid = false;
            }
            if (newColourDepth === null || isNaN(newColourDepth) || newColourDepth < 4.0 || newColourDepth > 255) {
                areValid = false;
            }
        
            return areValid;
        },
        TryChange = function (newX, newY, newDelta, newColourDepth) {
            if (this.AreValidParams.call(this, newX, newY, newDelta, newColourDepth)) {
                this.X = newX;
                this.Y = newY;
                this.Delta = newDelta;
                this.ColourDepth = newColourDepth;
                this.AreDefaultValues = false;
            } else {
                this.UseDefaultValues.call(this);
            }
        },
        UseDefaultValues = function () {
            this.X = digiBon.MandelDefaults.X;
            this.Y = digiBon.MandelDefaults.Y;
            this.Delta = digiBon.MandelDefaults.Delta;
            this.ColourDepth = digiBon.MandelDefaults.ColourDepth;
            this.AreDefaultValues = true;
        };
    
        
    return {
        AreValidParams : AreValidParams,
        TryChange : TryChange,
        Reset : UseDefaultValues
        
    };
}());
        