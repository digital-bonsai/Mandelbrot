/*jslint browser:true*/
/*global console, document, alert, gMandelInitialX, gMandelInitialY, gInterval */


var digiBon = digiBon || {};

digiBon.MandelDefaults =  {
    X : -2.4,
    Y : 2.0,
    Delta : 0.01,
    ColourDepth : 255
};

digiBon.MandelValidParams = function (x, y, delta, colourDepth) {
    "use strict";
    var areValid = true;
    if (x === null || isNaN(x) || x < -4 || x > 4) {
        areValid = false;
    }
    if (y === null || isNaN(y) || y < -4 || y > 4) {
        areValid = false;
    }
    if (delta === null || isNaN(delta) || delta < Number.MIN_VALUE || delta >= 0.016) {
        areValid = false;
    }
    if (colourDepth === null || isNaN(colourDepth) || colourDepth < 4.0 || colourDepth > 255) {
        areValid = false;
    }

    return areValid;
};


digiBon.MandelParams = function (x, y, delta, colourDepth, imgInfo) {
    "use strict";
    this.X = digiBon.MandelDefaults.X;
    this.Y = digiBon.MandelDefaults.Y;
    this.Delta = digiBon.MandelDefaults.Delta;
    this.ColourDepth = digiBon.MandelDefaults.ColourDepth;
    if (typeof imgInfo === undefined) {
        this.ImgInfo = null;
    } else {
        this.ImgInfo = imgInfo;
    }
    this.AreDefaultValues = true;
    
    
    this.TryChange.call(this, x, y, delta, colourDepth);
    
};

digiBon.MandelParams.prototype = (function () {
    "use strict";
    var TryChange = function (newX, newY, newDelta, newColourDepth) {
            if (digiBon.MandelValidParams(newX, newY, newDelta, newColourDepth)) {
                this.X = newX;
                this.Y = newY;
                this.Delta = newDelta;
                this.ColourDepth = newColourDepth;
                this.AreDefaultValues = false;
            } else {
                this.Reset.call(this);
            }
            return !this.AreDefaultValues;
        },
        UseDefaultValues = function () {
            this.X = digiBon.MandelDefaults.X;
            this.Y = digiBon.MandelDefaults.Y;
            this.Delta = digiBon.MandelDefaults.Delta;
            this.ColourDepth = digiBon.MandelDefaults.ColourDepth;
            this.AreDefaultValues = true;
        };
    
        
    return {
        TryChange : TryChange,
        Reset : UseDefaultValues,
        
        
    };
}());
        