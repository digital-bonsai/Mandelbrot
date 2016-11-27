/* mandelArray.js */
/* uses: mandelAnimate.js */

/*jslint browser:true*/
/*global console, document, alert, gRefreshTime, gParams, mandelAddToStack, gInputEntry, gInputStack, gInputDrag */




var digiBon = digiBon || {};


digiBon.MandelArray = function (canvasElementName, thumbnailCanvasElementName, resetX, resetY, resetInterval, colourDepth) {
    "use strict";
    var originalThumbnail = new Image();
    originalThumbnail.src = "r/tb.png";
    
    // Parameter checking
    if (colourDepth !== null && !isNaN(colourDepth) && colourDepth > 4 && colourDepth < 256) {
        this.limit = Math.floor(colourDepth);
    } else {
        this.limit = 255;
    }
    
    this.params = new digiBon.MandelParams(resetX, resetY, resetInterval, this.limit, originalThumbnail);

    // if no canvas - then need to stop
    this.canvas = document.getElementById(canvasElementName);
    this.tbCv = document.getElementById(thumbnailCanvasElementName);
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
    this.fromInput = gInputEntry;
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
        if (!this.params.TryChange(startX, startY, delta, this.limit)) {
            startX = digiBon.MandelDefaults.X;
            startY = digiBon.MandelDefaults.Y;
            delta = digiBon.MandelDefaults.Delta;
        }
        this.params = new digiBon.MandelParams(startX, startY, delta, this.limit);
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
            // TODO make first time only
            this.drawThumbnail();
            if (this.allComplete === false) {
                this.incrementArray.call(this);
                if (this.allComplete === true && this.firstTimeDrawn === false) {
                    
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
            var tbCtx = this.tbCv.getContext('2d'),
                tbImg = new Image(),
                edge = 0,
                topLeft = this.mandelArray[0][0].coOrd(),
                bottomRight = this.mandelArray[digiBon.mandelbrotCanvas.rows - 1][digiBon.mandelbrotCanvas.cols - 1].coOrd(),
                centre = this.mandelArray[digiBon.mandelbrotCanvas.rows / 2][digiBon.mandelbrotCanvas.cols / 2].coOrd(),
                scaleFactor = 2.0,
                zoom = scaleFactor * digiBon.mandelbrotCanvas.params.Delta / digiBon.MandelDefaults.Delta,
                xSqOffset = (topLeft.x - digiBon.MandelDefaults.X) * 100,
                ySqOffset = (topLeft.y - digiBon.MandelDefaults.Y) * 100,
                xMiddleSpot = (digiBon.MandelDefaults.X  + (digiBon.MandelDefaults.X + (digiBon.MandelDefaults.Delta * digiBon.mandelbrotCanvas.cols))) / 2,
                xCentreOffset = 200 + ((centre.x - xMiddleSpot) * 100),
                yCentreOffset = 200 - (centre.y * 100),
                adjustmentFactor = 50;
            //this.tbImage = this.canvas.toDataURL();
            if (typeof this.tbImage !== "undefined" && typeof this.tbImage !== "null") {
                
                
                if (this.fromInput === gInputEntry) {
                    tbImg.onload = function () {
                        
                    };
                    tbImg.src = "r/tb.png";
                    tbCtx.drawImage(tbImg, 0, 0, this.tbCv.width, this.tbCv.height);
                    edge = digiBon.mandelbrotCanvas.params.Delta * digiBon.mandelbrotCanvas.cols / digiBon.MandelDefaults.Y / 2;
                    
                    if (zoom < 2.0) {
                        // resize background image
                        // draw red square
                        if (zoom > 0.25) {
                            tbCtx.clearRect(0, 0, 160, 160);
                            tbCtx.beginPath();
                            tbCtx.fillStyle = this.getColour(0);
                            tbCtx.fillRect(0, 0, 160, 160);
                            tbCtx.drawImage(tbImg, (-100 * zoom) + xSqOffset, (-100 * zoom) - ySqOffset,
                                            zoom * digiBon.mandelbrotCanvas.rows,
                                            zoom * digiBon.mandelbrotCanvas.cols,
                                            0, 0,
                                            160, 160);
                            tbCtx.strokeStyle = "#cc0000";
                            tbCtx.lineWidth = 3;
                            tbCtx.strokeRect(Math.abs(this.tbCv.width / 4), Math.abs(this.tbCv.height / 4),
                                             Math.abs(this.tbCv.width / 2), Math.abs(this.tbCv.height / 2));

                            
                        } else {
          
                            tbCtx.clearRect(0, 0, 160, 160);
                            tbCtx.beginPath();
                            tbCtx.fillStyle = "rgb(99, 99, 99)";
                            tbCtx.fillRect(0, 0, 160, 160);
                            tbCtx.drawImage(tbImg, (xCentreOffset - adjustmentFactor), (yCentreOffset - adjustmentFactor),
                                            0.25 * digiBon.mandelbrotCanvas.rows,
                                            0.25 * digiBon.mandelbrotCanvas.cols,
                                            0, 0,
                                            160, 160);
                                            
                            tbCtx.strokeStyle = "#cc0000";
                            tbCtx.lineWidth = 3;
                            tbCtx.closePath();
                            tbCtx.moveTo(80, 40);
                            tbCtx.lineTo(80, 72);
                            tbCtx.stroke();
                            tbCtx.moveTo(80, 88);
                            tbCtx.lineTo(80, 120);
                            tbCtx.stroke();
                            tbCtx.moveTo(40, 80);
                            tbCtx.lineTo(72, 80);
                            tbCtx.stroke();
                            tbCtx.moveTo(88, 80);
                            tbCtx.lineTo(120, 80);
                            tbCtx.stroke();
                            tbCtx.closePath();

                        }
                
                    } else {
                        //
                    }
                    this.tbImage = this.tbCv.toDataURL();
                } else if (this.fromInput === gInputDrag) {
                    this.tbImage = this.canvas.toDataURL();
                    tbImg.src = this.tbImage;
                    tbCtx.drawImage(tbImg, 0, 0, this.tbCv.width, this.tbCv.height);
                } else if (this.from === gInputStack) {
                    tbCtx.drawImage(this.tbImage, 0, 0, this.tbCv.width, this.tbCv.height);
                    this.tbImage = this.canvas.toDataURL();
                }
                
                
            }
            this.firstTimeDrawn = true;
            this.fromInput = gInputEntry;
        },
        mouseDown = function (evt) {
            if (this.isDragging === false) {
                this.isDragging = true;
                this.dragStart = new digiBon.Point(evt.clientX - this.canvas.offsetLeft, evt.clientY - this.canvas.offsetTop);
                this.dragEnd = new digiBon.Point(evt.clientX - this.canvas.offsetLeft, evt.clientY - this.canvas.offsetTop);
                // TODO get image and restart animation
                window.clearRequestTimeout(digiBon.gHandle);
                digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, gRefreshTime);
            }
        },
        mouseMove = function (evt) {
            var nwse = true;
            if (this.isDragging === true) {
                this.dragEnd = new digiBon.Point(evt.clientX - this.canvas.offsetLeft, evt.clientY - this.canvas.offsetTop);
                // TODO redraw image and add square
                this.drawArray.call(this);
                
                if (this.dragEnd.x < this.dragStart.x) {
                    if (this.dragEnd.y > this.dragStart.y) {
                        nwse = false;
                    }
                } else {
                    if (this.dragEnd.y < this.dragStart.y) {
                        nwse = false;
                    }
                }
                if (nwse) {
                    this.canvas.style.cursor = "nwse-resize";
                } else {
                    this.canvas.style.cursor = "nesw-resize";
                }
                
            }
        },
        mouseOut = function (evt) {
            if (this.isDragging === true) {
                this.fromInput = gInputDrag;
                this.params.ImgInfo = this.canvas.toDataURL();
                mandelAddToStack(digiBon.mandelbrotCanvas.getParams());
                this.isDragging = false;
                this.drawThumbnail.call(this);
                this.resetArray.call(this);
                this.canvas.style.cursor = "auto";

            }
        },
        mouseUp = function (evt) {
            this.fromInput = gInputDrag;
            this.params.ImgInfo = this.canvas.toDataURL();
            mandelAddToStack(digiBon.mandelbrotCanvas.getParams());
            this.drawDragSquare.call(this);
            this.drawArray.call(this);
            this.isDragging = false;
            this.drawThumbnail.call(this);
            this.dragEnd = new digiBon.Point(evt.clientX - this.canvas.offsetLeft, evt.clientY - this.canvas.offsetTop);
            this.resetArray.call(this);
            this.allComplete = false;
            this.canvas.style.cursor = "auto";

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
            digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, gRefreshTime);
        },
        resetMandel = function () {
            var statusElement = document.getElementById('drawMsg');
            statusElement.innerHTML = "resetting...";
            this.mandelArray = this.CreateDisplayArray.call(this, this.resetMandelX, this.resetMandelY, this.resetMandelInterval);
            this.firstTimeDrawn = false;
            window.clearRequestTimeout(digiBon.gHandle);
            digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, gRefreshTime);
            
        },
        updateArray = function (newX, newY, newInterval, newTbNail) {
            var newDimension = null,
                referencePoint = new digiBon.Point(parseFloat(newX), parseFloat(newY)),
                dragStartMandel = null,
                deltaDifference = parseFloat(newInterval),
                statusElement = document.getElementById('drawMsg'),
                topLeftXElement = document.getElementById('topLeftX'),
                topLeftYElement = document.getElementById('topLeftY'),
                intervalElement = document.getElementById('interval');
            statusElement.innerHTML = "updating... from values";
            topLeftXElement.value = newX.toString();
            topLeftYElement.value = newY.toString();
            intervalElement.value = newInterval.toString();
            this.drawThumbnail();
            this.mandelArray = this.CreateDisplayArray.call(this, referencePoint.x, referencePoint.y, deltaDifference);
            
            this.firstTimeDrawn = false;
            window.clearRequestTimeout(digiBon.gHandle);
            digiBon.gHandle = window.requestTimeout(function () { digiBon.mandelbrotCanvas.incrementDraw(); }, gRefreshTime);
           
        },
        getParams = function () {
            var retObj = {
                X : this.params.X,
                Y : this.params.Y,
                Delta : this.params.Delta,
                ImageInfo : this.tbImage
                
            };
            return retObj;
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
        drawDragSquare : drawDragSquare,
        getParams : getParams
        
    };

}());