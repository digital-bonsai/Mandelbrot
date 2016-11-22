/* mandelArray.js */
/* uses mandelpoint.js */

/*jslint browser:true*/
/*global console, document, alert*/




var digiBon = digiBon || {};

digiBon.MandelArray = function (canvasElementName, resetX, resetY, resetInterval, colourDepth) {
    "use strict";
    this.resetMandelX = -2.4;
    this.resetMandelY = 2.0;
    this.resetMandelInterval = 0.01;
    
    
    // Parameter checking
    if (colourDepth !== null && !isNaN(colourDepth) && colourDepth > 4 && colourDepth < 256) {
        this.limit = Math.floor(colourDepth);
    } else {
        this.limit = 255;
    }

    // if no canvas - then need to stop
    this.canvas = document.getElementById(canvasElementName);
    document.getElementById('drawMsg').innerHTML = "started";
    this.canvas.addEventListener("mousedown",  (function (callerInstance) { return callerInstance.mouseDown; }(this)).bind(this));
    this.canvas.addEventListener("mousemove", (function (callerInstance) { return callerInstance.mouseMove; }(this)).bind(this));
    this.canvas.addEventListener("mouseup",  (function (callerInstance) { return callerInstance.mouseUp; }(this)).bind(this));
    this.canvas.addEventListener("mouseout", (function (callerInstance) { return callerInstance.mouseOut; }(this)).bind(this));
    this.isDragging = false;
    this.rows = this.canvas.width;
    this.cols = this.canvas.height;
    this.dragStart = new digiBon.Point(Math.floor(this.cols / 2), Math.floor(this.rows / 2));
    this.dragEnd = new digiBon.Point(Math.floor(this.cols / 2), Math.floor(this.rows / 2));
    this.ctx = this.canvas.getContext('2d');
    this.tbImage = this.ctx.createImageData(this.rows, this.cols);

    this.allComplete = false;
    this.firstTimeDrawn = false;
    this.ctx.beginPath();
    this.ctx.fillStyle = '#222222';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.mandelArray = this.CreateDisplayArray.call(this, resetX, resetY, resetInterval);
};

digiBon.MandelArray.prototype = (function () {
    "use strict";
    var CreateDisplayArray = function (startX, startY, delta) {
        var arr = [],
            color = 0,
            i = 0,
            j = 0;
        // Parameter check
        if (startX === null || isNaN(startX) || startX < -4 || startX > 4) {
            startX = this.resetMandelX;
        }
        if (startY === null || isNaN(startY) || startY < -4 || startY > 4) {
            startY = this.resetMandelY;
        }
        if (delta === null || isNaN(delta) || delta < -1 || delta > 1) {
            delta = this.resetMandelInterval;
        }
        for (i = 0; i < this.rows; i += 1) {
            arr[i] = [];
            for (j = 0; j < this.cols; j += 1) {
                arr[i][j] = new digiBon.Mandelpoint(startX + (i * delta), startY  - (j * delta), this.limit);
            }
        }
        this.allComplete = false;
        this.dragStart = new digiBon.Point(Math.floor(this.cols / 2), Math.floor(this.rows / 2));
        this.dragEnd = new digiBon.Point(Math.floor(this.cols / 2), Math.floor(this.rows / 2));
        this.isDragging = false;
        return arr;

    
    },
        incrementArray = function () {
            var i = 0,
                j = 0;
            this.allComplete = true;
            for (i = 0; i < this.mandelArray.length; i += 1) {
                for (j = 0; j < this.mandelArray[i].length; j += 1) {
                    if (this.mandelArray[i][j].isCompleted() === false) {
                        this.mandelArray[i][j].nextIter();
                        this.allComplete = false;
                    }
                }
            }
        },
        incrementDraw = function () {
            var i = 0,
                statusElement = document.getElementById('drawMsg'),
                infoElement = document.getElementById('debugInfo');
            if (this.allComplete === false) {
                this.incrementArray.call(this);
                if (this.allComplete === true && this.firstTimeDrawn === false) {
                    this.tbImage = this.canvas.toDataURL();
                    this.drawThumbnail.call(this);
                    this.firstTimeDrawn = true;
                    window.clearRequestTimeout(digiBon.gHandle);
                } else {
                    this.drawArray.call(this);
                }
            } else {
                statusElement.innerHTML = "";
            }
            infoElement.innerHTML = new Date().getSeconds();
 
        },
        getColour = function (colourIndex, colourLimit, colourComplete) {
            var red = 0,
                green = 0,
                blue = 0,
                alpha = 0.5,
                colourString = null,
                spectrumIndex = colourIndex % 256,
                colourSwatch  = {"r" : 0x30, "g" : 0x30, "b" : 0x30, "a" : 0.5};
 
            // Colours could be -1 or 256.  Therefore perform calcs at the end to set bounds
            if (colourIndex >= colourLimit) {
                colourSwatch  = {"r" : 0x00, "g" : 0x00, "b" : 0x00, "a" : 1};
            } else if (spectrumIndex < 0x20) { // go to green
                red = 0x00;
                green = (spectrumIndex * 8) - 1;
                blue = 0x00;
            } else if (spectrumIndex < 0x40) {  // go to yellow
                red = ((spectrumIndex - 0x20) * 8) - 1;
                green = 0xff;
                blue = 0x00;
            } else if (spectrumIndex < 0x60) { // yellow to red
                red = 0xff;
                green = 0xff - ((spectrumIndex - 0x40) * 8);
                blue = 0x00;
            } else if (spectrumIndex < 0x80) { // fade the red, bring in blue
                red = 0xff; //- ((spectrumIndex - 0x60) * 4);
                green = 0x00;
                blue = ((spectrumIndex - 0x60) * 8);
            } else if (spectrumIndex < 0x80) { // go back to purple
                red = (spectrumIndex - 0x60) * 8;
                green = 0x00;
                blue = (spectrumIndex - 0x60) * 8;
            } else if (spectrumIndex < 0x90) { // go to blue
                red = 0xff - ((spectrumIndex - 0x80) * 8);
                green = 0x00;
                blue = 0xff;
            } else if (spectrumIndex < 0xb0) {
                red = 0xff - ((spectrumIndex - 0x80) * 8);
                green = ((spectrumIndex - 0x90) * 8);
                blue = 0xff - ((spectrumIndex - 0x90) * 2);
            } else if (spectrumIndex < 0xc0) { // go to ?
                red = 0x00;
                green = 0xff;
                blue = 0xbf + ((spectrumIndex - 0xb0) * 4);
            } else if (spectrumIndex < 0xd0) { // go to turquiose
                red = ((spectrumIndex - 0xc0) * 8);
                green = 0xff - ((spectrumIndex - 0xc0) * 4);
                blue = 0xff - ((spectrumIndex - 0xc0) * 4);
            } else if (spectrumIndex < 0xe0) { // 
                red = ((spectrumIndex - 0xc0) * 8);
                green = 0xc0;
                blue = 0xff - ((spectrumIndex - 0xc0) * 4);
            } else if (spectrumIndex < 0xf0) { // go to green
                red = 0xff - ((spectrumIndex - 0xe0) * 16);
                green = 0xc0 - ((spectrumIndex - 0xe0) * 4);
                blue = 0xff - ((spectrumIndex - 0xd0) * 8);
            } else if (spectrumIndex < 0xff) { // fade to black
                red = 0x00;
                green = 0xff - ((spectrumIndex - 0xe0) * 8);
                blue = 0x00;
            }
           
            
            red = Math.max(0, red);
            red = Math.min(255, red);
            colourSwatch.r = red;
           
            green = Math.max(0, green);
            green = Math.min(255, green);
            colourSwatch.g = green;
           
            blue = Math.max(0, blue);
            blue = Math.min(255, blue);
            colourSwatch.b = blue;
   
            if (colourComplete === false) {
                colourSwatch.r = Math.floor(colourSwatch.r / 4);
                colourSwatch.g = Math.floor(colourSwatch.g / 4);
                colourSwatch.b = Math.floor(colourSwatch.b / 4);
                colourSwatch.a = 0.1;
            } else {
                colourSwatch.a = 1.0;
            }
           
            colourString = "rgba(" + colourSwatch.r + "," + colourSwatch.g  + "," + colourSwatch.b  + "," + colourSwatch.a  + ")";
            return colourString;
 
        },
        drawArray = function () {
            var i = 0,
                j = 0;
            for (i = 0; i < this.mandelArray.length; i += 1) {
                for (j = 0; j < this.mandelArray[i].length; j += 1) {
                    this.ctx.beginPath();
                    this.ctx.fillStyle = this.getColour(this.mandelArray[i][j].get(), this.limit, this.mandelArray[i][j].completed);
                    this.ctx.fillRect(i, j, 1, 1);
                }
            }
            if (this.isDragging === true) {
                this.drawDragSquare.call(this);
            }
        },
        drawDragSquare = function () {
            var newDimension = Math.max(Math.abs(this.dragEnd.x - this.dragStart.x), Math.abs(this.dragEnd.y - this.dragStart.y)),
                signX = 1,
                signY = 1;
            if (this.dragEnd.x - this.dragStart.x < 0) {
                signX = -1;
            } else {
                signX = 1;
            }
            if (this.dragEnd.y - this.dragStart.y < 0) {
                signY = -1;
            } else {
                signY = 1;
            }

            this.ctx.beginPath();
            this.ctx.strokeStyle = "rgba(224,0,0,1)";
            this.ctx.lineWidth = 4;
            newDimension = Math.max(1, newDimension);
            this.ctx.strokeRect(this.dragStart.x, this.dragStart.y, signX * newDimension, signY * newDimension);
        },
        drawThumbnail = function () {
            var thumbnailImage = document.getElementById('thumbnail');
            if (this.tbImage !== undefined && this.tbImage !== null) {
                thumbnailImage.src = this.tbImage;
            }
            this.firstTimeDrawn = true;
        },
        mouseDown = function (evt) {
            if (this.isDragging === false) {
                this.isDragging = true;
                this.dragStart = new digiBon.Point(evt.clientX - this.canvas.offsetLeft, evt.clientY - this.canvas.offsetTop);
                this.dragEnd = new digiBon.Point(evt.clientX - this.canvas.offsetLeft, evt.clientY - this.canvas.offsetTop);
                // TODO get image and restart animation
                window.clearRequestTimeout(digiBon.gHandle);
                digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, 1000 / 16);
            }
        },
        mouseMove = function (evt) {
            if (this.isDragging === true) {
                this.dragEnd = new digiBon.Point(evt.clientX - this.canvas.offsetLeft, evt.clientY - this.canvas.offsetTop);
                // TODO redraw image and add square
                this.drawArray.call(this);

            }
        },
        mouseOut = function (evt) {
            if (this.isDragging === true) {
                this.tbImage = this.canvas.toDataURL();
                this.isDragging = false;
                this.drawThumbnail.call(this);
                this.resetArray.call(this);

            }
        },
        mouseUp = function (evt) {
            this.drawArray.call(this);
            this.drawDragSquare.call(this);
            this.tbImage = this.canvas.toDataURL();
            this.isDragging = false;
            this.drawThumbnail.call(this);
            this.dragEnd = new digiBon.Point(evt.clientX - this.canvas.offsetLeft, evt.clientY - this.canvas.offsetTop);
            this.resetArray.call(this);
            this.allComplete = false;

        },
        resetArray = function () {
            var newDimension = null,
                referencePoint = new digiBon.Point(this.dragStart.x, this.dragStart.y),
                dragStartMandel = null,
                previousDifference = 0.1,
                deltaDifference = 0.1,
                statusElement = document.getElementById('drawMsg'),
                topLeftXElement = document.getElementById('topLeftX'),
                topLeftYElement = document.getElementById('topLeftY'),
                intervalElement = document.getElementById('interval');
            
            dragStartMandel = new digiBon.Point(this.mandelArray[this.dragStart.x][this.dragStart.y].startPoint.x, this.mandelArray[this.dragStart.x][this.dragStart.y]);
            
            newDimension = Math.max(Math.abs(this.dragEnd.x - this.dragStart.x), Math.abs(this.dragEnd.y - this.dragStart.y));
            previousDifference = ((this.mandelArray[this.rows - 1][0].startPoint.x - this.mandelArray[0][0].startPoint.x) / this.rows);
            
            if (this.dragEnd.x - this.dragStart.x >= 0) {
                referencePoint.x = this.mandelArray[this.dragStart.x][this.dragStart.y].startPoint.x;
            } else {
                referencePoint.x = this.mandelArray[this.dragStart.x][this.dragStart.y].startPoint.x - (newDimension * previousDifference);
            }
            
            if (this.dragEnd.y - this.dragStart.y >= 0) {
                referencePoint.y = this.mandelArray[this.dragStart.x][this.dragStart.y].startPoint.y;
            } else {
                referencePoint.y = this.mandelArray[this.dragStart.x][this.dragStart.y].startPoint.y - (newDimension * previousDifference);
                
            }
             

            statusElement.innerHTML = "updating...";
            deltaDifference = (newDimension * previousDifference) / this.rows;
            topLeftXElement.value = referencePoint.x.toString();
            topLeftYElement.value = referencePoint.y.toString();
            intervalElement.value = deltaDifference.toString();
            this.mandelArray = this.CreateDisplayArray.call(this, referencePoint.x, referencePoint.y, deltaDifference);
            this.isDragging = false;
            this.dragStart = new digiBon.Point(Math.floor(this.cols / 2), Math.floor(this.rows / 2));
            this.dragEnd = new digiBon.Point(Math.floor(this.cols / 2), Math.floor(this.rows / 2));
            this.drawArray.call(this);
            window.clearRequestTimeout(digiBon.gHandle);
            digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, 1000 / 16);
        },
        resetMandel = function () {
            var statusElement = document.getElementById('drawMsg');
            statusElement.innerHTML = "resetting...";
            this.mandelArray = this.CreateDisplayArray.call(this, this.resetMandelX, this.resetMandelY, this.resetMandelInterval);
            this.firstTimeDrawn = false;
            window.clearRequestTimeout(digiBon.gHandle);
            digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, 1000 / 16);
            
        },
        updateArray = function (newX, newY, newInterval) {
            var newDimension = null,
                referencePoint = new digiBon.Point(newX, newY),
                dragStartMandel = null,
                deltaDifference = newInterval,
                statusElement = document.getElementById('drawMsg'),
                topLeftXElement = document.getElementById('topLeftX'),
                topLeftYElement = document.getElementById('topLeftY'),
                intervalElement = document.getElementById('interval');

            statusElement.innerHTML = "updating... from values";

            topLeftXElement.value = newX.toString();
            topLeftYElement.value = newY.toString();
            intervalElement.value = newInterval.toString();
            this.mandelArray = this.CreateDisplayArray.call(this, referencePoint.x, referencePoint.y, deltaDifference);
            this.firstTimeDrawn = false;
            window.clearRequestTimeout(digiBon.gHandle);
            digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, 1000 / 16);
           
        };
    
    return {
        CreateDisplayArray : CreateDisplayArray,
        drawArray : drawArray,
        incrementArray : incrementArray,
        incrementDraw : incrementDraw,
        getColour : getColour,
        mouseUp : mouseUp,
        mouseDown : mouseDown,
        mouseOut : mouseOut,
        mouseMove : mouseMove,
        resetArray : resetArray,
        resetMandel : resetMandel,
        updateArray : updateArray,
        drawThumbnail :  drawThumbnail,
        drawDragSquare : drawDragSquare
        
    };

}());