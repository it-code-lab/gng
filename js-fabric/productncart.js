var canvas;
var customItems = new Array(); //prototype: [{style:'x',color:'white',front:'a',back:'b',price:{tshirt:'12.95',frontPrint:'4.99',backPrint:'4.99',total:'22.47'}}]
var flippeditemid;
var canvasFrontString;
var canvasBackString;
var customItemCanvasDataFront;
var customItemCanvasDataBack;
var lastAddedItemDesignId;
var line1;
var line2;
var line3;
var line4;
var imageFacing;
var shoppingCart;
var designAdded = false;
var filters = ['grayscale', 'invert', 'remove-color', 'sepia', 'brownie',
    'brightness', 'contrast', 'saturation', 'vibrance', 'noise', 'vintage',
    'pixelate', 'blur', 'sharpen', 'emboss', 'technicolor',
    'polaroid', 'blend-color', 'gamma', 'kodachrome',
    'blackwhite', 'blend-image', 'hue', 'resize'
];
$(document).ready(function() {

    //setup front side canvas 
    fabric.Object.prototype.objectCaching = true;

    canvas = new fabric.Canvas('tcanvas', {
        hoverCursor: 'pointer',
        selection: true,
        selectionBorderColor: 'brown',

        isDrawingMode: false,
        freeDrawingBrush: new fabric.PencilBrush({
            decimate: 8
        })
    });

    fabric.Object.prototype.transparentCorners = false;
    canvas.on({
        'object:moving': function(e) {
            e.target.opacity = 0.5;
        },
        'object:modified': function(e) {
            e.target.opacity = 1;
        },
        'selection:created': onObjectSelected,
        'selection:updated': onObjectSelected,
        //'object:selected': onObjectSelected,
        'selection:cleared': onSelectedCleared
    });


    canvas.on('before:path:created', function(opt) {
        var path = opt.path;
        //path.set({ fill: 'red', stroke: 'green', opacity: 0.5 });
        path.set({
            stroke: 'transparent',
            opacity: 0.1
        });

        var pathInfo = fabric.util.getPathSegmentsInfo(path.path);
        path.segmentsInfo = pathInfo;
        var pathLength = pathInfo[pathInfo.length - 1].length;
        var text = $("#text-string").val();
        if (text == "") {
            text = 'Sample. This text should be small enough to fit in the path.';
        }
        //var fontSize = 2.5 * pathLength / text.length;
        var fontSize = 1 * pathLength / text.length;
        var text = new fabric.Text(text, {
            fontSize: fontSize,
            path: path,
            top: path.top,
            left: path.left
        });
        canvas.add(text);
    });

    canvas.on('path:created', function(opt) {
        canvas.remove(opt.path);
        canvas.isDrawingMode = false
    })


    //console.log("Document is ready");
    // piggyback on `canvas.findTarget`, to fire "object:over" and "object:out" events
    canvas.findTarget = (function(originalFn) {
        return function() {
            var target = originalFn.apply(this, arguments);
            if (target) {
                if (this._hoveredTarget !== target) {
                    canvas.fire('object:over', {
                        target: target
                    });
                    if (this._hoveredTarget) {
                        canvas.fire('object:out', {
                            target: this._hoveredTarget
                        });
                    }
                    this._hoveredTarget = target;
                }
            } else if (this._hoveredTarget) {
                canvas.fire('object:out', {
                    target: this._hoveredTarget
                });
                this._hoveredTarget = null;
            }
            return target;
        };
    })(canvas.findTarget);

    canvas.on('object:over', function(e) {
        //e.target.setFill('red');
        //canvas.renderAll();
    });

    canvas.on('object:out', function(e) {
        //e.target.setFill('green');
        //canvas.renderAll();
    });


	//SM: START OF CURVED TEXT DECLARATION*******************

	fabric.TextCurved = fabric.util.createClass(fabric.Object, {
		type: 'text-curved',
		diameter: 250,
		kerning: 0,
		text: 'New curved text',
		flipped: false,
		fill: '#000',
		fontFamily: 'Times New Roman',
		fontSize: 40, // in px
		fontWeight: 'normal',
		fontStyle: '', // "normal", "italic" or "oblique".
		cacheProperties: fabric.Object.prototype.cacheProperties.concat('diameter', 'kerning', 'flipped', 'fill', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'strokeStyle', 'strokeWidth'),
		strokeStyle: null,
		strokeWidth: 0,
		padding: 10,

		initialize: function(text, options) {
			options || (options = {});
			this.text = text;

			this.callSuper('initialize', options);
			//this.set('lockUniScaling', true);

			// Draw curved text here initially too, while we need to know the width and height.
			var canvas = this.getCircularText();
			this._trimCanvas(canvas);
			this.set('width', canvas.width);
			this.set('height', canvas.height + 20);
		},

		_getFontDeclaration: function()
		{
			return [
				// node-canvas needs "weight style", while browsers need "style weight"
				(fabric.isLikelyNode ? this.fontWeight : this.fontStyle),
				(fabric.isLikelyNode ? this.fontStyle : this.fontWeight),
				this.fontSize + 'px',
				(fabric.isLikelyNode ? ('"' + this.fontFamily + '"') : this.fontFamily)
			].join(' ');
		},

		_trimCanvas: function(canvas)
		{
			//SM: Updated
			if (2 == 2){
				return;
			}
			var ctx = canvas.getContext('2d'),
				w = canvas.width,
				h = canvas.height,
				//w = 600,
				//h = 600,
				pix = {x:[], y:[]}, n,
				imageData = ctx.getImageData(0,0,w,h),
				fn = function(a,b) { return a-b };

			for (var y = 0; y < h; y++) {
				for (var x = 0; x < w; x++) {
					if (imageData.data[((y * w + x) * 4)+3] > 0) {
						pix.x.push(x);
						pix.y.push(y);
					}
				}
			}
			pix.x.sort(fn);
			pix.y.sort(fn);
			n = pix.x.length-1;

			w = pix.x[n] - pix.x[0];
			h = pix.y[n] - pix.y[0];
			var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

			canvas.width = w;
			canvas.height = h;
			ctx.putImageData(cut, 0, 0);
		},

		// Source: http://jsfiddle.net/rbdszxjv/
		getCircularText: function()
		{
			var text = this.text,
				diameter = this.diameter,
				flipped = this.flipped,
				kerning = this.kerning,
				fill = this.fill,
				inwardFacing = true,
				startAngle = 0,
				canvas = fabric.util.createCanvasElement(),
				ctx = canvas.getContext('2d'),
				cw, // character-width
				x, // iterator
				clockwise = -1; // draw clockwise for aligned right. Else Anticlockwise

			if (flipped) {
				startAngle = 180;
				inwardFacing = false;
			}

			startAngle *= Math.PI / 180; // convert to radians

			// Calc heigt of text in selected font:
			var d = document.createElement('div');
			d.style.fontFamily = this.fontFamily;
			d.style.whiteSpace = 'nowrap';
			d.style.fontSize = this.fontSize + 'px';
			d.style.fontWeight = this.fontWeight;
			d.style.fontStyle = this.fontStyle;
			//d.style.margin = '10px';
			d.textContent = text;
			document.body.appendChild(d);
			//var textHeight = d.offsetHeight;
			
			//SM: Updated
			var textHeight = d.offsetHeight + 50;
			document.body.removeChild(d);

			canvas.width = canvas.height = diameter;
			ctx.font = this._getFontDeclaration();

			// Reverse letters for center inward.
			//if (inwardFacing) { 
			//	text = text.split('').reverse().join('') 
			//};

			// Setup letters and positioning
			ctx.translate(diameter / 2, diameter / 2); // Move to center
			startAngle += (Math.PI * !inwardFacing); // Rotate 180 if outward
			ctx.textBaseline = 'middle'; // Ensure we draw in exact center
			ctx.textAlign = 'center'; // Ensure we draw in exact center

			// rotate 50% of total angle for center alignment
			for (x = 0; x < text.length; x++) {
				cw = ctx.measureText(text[x]).width;
				startAngle += ((cw + (x == text.length-1 ? 0 : kerning)) / (diameter / 2 - textHeight)) / 2 * -clockwise;
			}

			// Phew... now rotate into final start position
			ctx.rotate(startAngle);

			// Now for the fun bit: draw, rotate, and repeat
			for (x = 0; x < text.length; x++) {
				cw = ctx.measureText(text[x]).width; // half letter
				// rotate half letter
				ctx.rotate((cw/2) / (diameter / 2 - textHeight) * clockwise);
				// draw the character at "top" or "bottom"
				// depending on inward or outward facing

				// Stroke
				if (this.strokeStyle && this.strokeWidth) {
					ctx.strokeStyle = this.strokeStyle;
					ctx.lineWidth = this.strokeWidth;
					ctx.miterLimit = 2;
					ctx.strokeText(text[x], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2));
				}

				// Actual text
				ctx.fillStyle = fill;
				ctx.fillText(text[x], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2));

				ctx.rotate((cw/2 + kerning) / (diameter / 2 - textHeight) * clockwise); // rotate half letter
			}
			return canvas;
		},

		_set: function(key, value) {
			switch(key) {
				case 'scaleX':
					this.fontSize *= value;
					this.diameter *= value;
					this.width *= value;
					this.scaleX = 1;
					if (this.width < 1) { this.width = 1; }
					break;

				case 'scaleY':
					this.height *= value;
					this.scaleY = 1;
					if (this.height < 1) { this.height = 1; }
					break;

				default:
					this.callSuper('_set', key, value);
					break;
			}
		},

		_render: function(ctx)
		{
			var canvas = this.getCircularText();
			this._trimCanvas(canvas);

			this.set('width', canvas.width);
			this.set('height', canvas.height);

			ctx.drawImage(canvas, -this.width / 2, -this.height / 2, this.width, this.height);

			this.setCoords();
		},

		toObject: function(propertiesToInclude) {
			return this.callSuper('toObject', ['text', 'diameter', 'kerning', 'flipped', 'fill', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'strokeStyle', 'strokeWidth', 'styles'].concat(propertiesToInclude));
		}
	});

	fabric.TextCurved.fromObject = function(object, callback, forceAsync) {
	   return fabric.Object._fromObject('TextCurved', object, callback, forceAsync, 'text-curved');
	};

	//SM: END OF CURVED TEXT DECLARATION*******************
	
	$('#fontSize,#kerning').on('input', changeFontSize);
	
	function changeFontSize()
	{
		var fSize = +$('#fontSize').val();
		var kerning = +$('#kerning').val();
		var activeObject = canvas.getActiveObject();

		if (activeObject.type === 'text')  {
			activeObject.set({
				fontSize: fSize,
			});
			canvas.renderAll();
		}

		if  (activeObject.type === 'text-curved')  {
			activeObject.set({
				fontSize: fSize,
				kerning: kerning,
			});
			canvas.renderAll();
		}
		
	}
	
	$('#diameter,#kerningX').on('input', editObject);
	

	function editObject()
	{
		var text = $('#text-string').val();
		var fName = 'Arial';
		var fSize = +$('#fontSize').val();
		var diameter = +$('#diameter').val();
		var kerning = +$('#kerning').val();
		var flipped = false;
		var activeObject = canvas.getActiveObject();

		if (activeObject.type === 'text-curved') {
			activeObject.set({
				text: text,
				diameter: +$('#diameter').val(),
				fontSize: fSize,
				kerning: kerning,
				flipped: flipped
			});
			canvas.renderAll();
		}
	}


	
    /*
    canvas.on('mouse:wheel', function(opt) {
      var delta = opt.e.deltaY;
      var zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.setZoom(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    })
    */
    document.getElementById('add-text').onclick = function() {
        //console.log("Add text clicked");
        var text = $("#text-string").val();
        if (text.trim() == "") {
            return;
        }
        var textSample = new fabric.Text(text, {
            //left: fabric.util.getRandomInt(0, 200),
            //top: fabric.util.getRandomInt(0, 400),
            left: 100,
            top: 100,
            fontFamily: 'helvetica',
            angle: 0,
            fill: '#000000',
            //fill: gradient,
            scaleX: 1,
            scaleY: 1,
            fontWeight: '',
            hasRotatingPoint: true
        });

        canvas.add(textSample);
		showToast("Added to design");
		designAdded = true;
        canvas.item(canvas.item.length - 1).hasRotatingPoint = true;
		displayToolBarSection('texteditor', true);
        //$("#texteditor").css('display', 'block');
		//$("#texteditorAdd").css('display', 'block');
		displayToolBarSection('texteditorAdd', true);		
        //$("#coloreditor").css('display', 'block');
		displayToolBarSection('coloreditor', true);
        //$("#imagefiltercoloreditor").css('display', 'none');
		displayToolBarSection('imagefiltercoloreditor', false);
        //$("#imageeditor").css('display', 'block');
		displayToolBarSection('imageeditor', true);		
		$("#informationDisplay").css('display', 'none');		
		$("#diameterBtn").css('display', 'none');
		$("#kerningBtn").css('display', 'none');


    };
    $("#text-string").keyup(function() {
		$("#text-string-two").val(this.value);
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.text = this.value;
            canvas.renderAll();
			designAdded = true;
        }else if (activeObject && activeObject.type === 'text-curved') {
            editObject();
			designAdded = true;
        }
    });

    $("#text-string-two").keyup(function() {
		$("#text-string").val(this.value);
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.text = this.value;
            canvas.renderAll();
			designAdded = true;
        }else if (activeObject && activeObject.type === 'text-curved') {
            editObject();
			designAdded = true;
        }
    });
    $(".font-color-picker").click(function(e) {
        var el = e.target;
        el.appendChild(document.getElementById("check"));
        changeFontColor(el.style.backgroundColor);
    });

    $(".image-filter-color-picker").click(function(e) {
        var el = e.target;
        el.appendChild(document.getElementById("image-filter-check"));
        applyImageFilter(el.style.backgroundColor);
    });


    $(".holograph-picker").click(function(e) {
        var el = e.target;
        el.appendChild(document.getElementById("holograph-check"));
        changeHolograph(el.style.backgroundImage);
    });
    $(".img-polaroid").click(function(e) {
        var el = e.target;
        /*temp code*/
        //console.log("Image clicked");
        var offset = 50;
        //var left = fabric.util.getRandomInt(0 + offset, 200 - offset);
        //var top = fabric.util.getRandomInt(0 + offset, 400 - offset);
        var left = 200;
        var top = 200;

        var angle = fabric.util.getRandomInt(-20, 40);
        var width = fabric.util.getRandomInt(30, 50);
        var opacity = (function(min, max) {
            return Math.random() * (max - min) + min;
        })(0.5, 1);

        fabric.Image.fromURL(el.src, function(image) {
            image.set({
                left: left,
                top: top,
                angle: 0,
                padding: 10,
                cornersize: 10,
                hasRotatingPoint: true
            });
            //image.scale(getRandomNum(0.1, 0.25)).setCoords();
            canvas.add(image);
        });
    });
    document.getElementById('remove-selected').onclick = function() {
        var activeObject = canvas.getActiveObject();
        //var activeGroup = canvas.getActiveGroup();
        if (activeObject) {
            canvas.remove(activeObject);
            $("#text-string").val("");
            $("#text-string-two").val("");
        } else if (activeGroup) {
            var objectsInGroup = activeGroup.getObjects();
            canvas.discardActiveGroup();
            objectsInGroup.forEach(function(object) {
                canvas.remove(object);
            });
        }
    };
    document.getElementById('clone-selected').onclick = function() {
        //var object = fabric.util.object.clone(canvas.getActiveObject());
        //object.set("top", object.top+50);
        //object.set("left", object.left+100);
        //canvas.add(object);


        /****SM: DO NOT DELETE****/
        var copyData = canvas.getActiveObject().toObject();
        fabric.util.enlivenObjects([copyData], function(objects) {
            objects.forEach(function(o) {
                o.set('top', o.top + 50);
                o.set('left', o.left + 100);
                canvas.add(o);
            });
            canvas.renderAll();
        });




    }

    document.getElementById('shape-outline').onclick = function() {


        var activeObject = canvas.getActiveObject();
        canvas.discardActiveObject().renderAll();
        //activeObject.set ( {hasBorders: false, hasControls: false });
        var ctx = canvas.getContext("2d");
        var pointX = activeObject.left;
        var pointY = activeObject.top;
        var cw = activeObject.width;
        var ch = activeObject.height;

        var imageData = ctx.getImageData(pointX, pointY, cw, ch);
        var data = imageData.data;

        // This is used by the marching ants algorithm
        // to determine the outline of the non-transparent
        // pixels on the image
        var defineNonTransparent = function(x, y) {
            var a = data[(y * cw + x) * 4 + 3];
            return (a > 20);
        }

        geom = {};
        geom.contour = function(grid, start) {
            var s = start || d3_geom_contourStart(grid), // starting point 
                c = [], // contour polygon 
                x = s[0], // current x position 
                y = s[1], // current y position 
                dx = 0, // next x direction 
                dy = 0, // next y direction 
                pdx = NaN, // previous x direction 
                pdy = NaN, // previous y direction 
                i = 0;

            do {
                // determine marching squares index 
                i = 0;
                if (grid(x - 1, y - 1)) i += 1;
                if (grid(x, y - 1)) i += 2;
                if (grid(x - 1, y)) i += 4;
                if (grid(x, y)) i += 8;

                // determine next direction 
                if (i === 6) {
                    dx = pdy === -1 ? -1 : 1;
                    dy = 0;
                } else if (i === 9) {
                    dx = 0;
                    dy = pdx === 1 ? -1 : 1;
                } else {
                    dx = d3_geom_contourDx[i];
                    dy = d3_geom_contourDy[i];
                }

                // update contour polygon 
                if (dx != pdx && dy != pdy) {
                    c.push([x, y]);
                    pdx = dx;
                    pdy = dy;
                }

                x += dx;
                y += dy;
            } while (s[0] != x || s[1] != y);

            return c;
        };

        // lookup tables for marching directions 
        var d3_geom_contourDx = [1, 0, 1, 1, -1, 0, -1, 1, 0, 0, 0, 0, -1, 0, -1, NaN],
            d3_geom_contourDy = [0, -1, 0, 0, 0, -1, 0, 0, 1, -1, 1, 1, 0, -1, 0, NaN];

        function d3_geom_contourStart(grid) {
            var x = 0,
                y = 0;

            // search for a starting point; begin at origin 
            // and proceed along outward-expanding diagonals 
            while (true) {
                if (grid(x, y)) {
                    return [x, y];
                }
                if (x === 0) {
                    x = y + 1;
                    y = 0;
                } else {
                    x = x - 1;
                    y = y + 1;
                }
            }
        }
        // call the marching ants algorithm
        // to get the outline path of the image
        // (outline=outside path of transparent pixels
        points = geom.contour(defineNonTransparent);

        /* draw outline path ***WORKED****
            ctx.beginPath();	
		 
            ctx.moveTo(points[0][0],points[0][1]);
            for(var i=1;i<points.length;i++){
                var point=points[i];
                ctx.lineTo(point[0],point[1]);
				

			
            }
            ctx.closePath();
            ctx.stroke();			
			*/
        var polygonPoints = [];

        for (var i = 1; i < points.length; i++) {
            polygonPoints.push({
                x: points[i][0],
                y: points[i][1]
            });
        }
        var object = new fabric.Polygon(polygonPoints, {
            left: 200,
            top: 200,
            fill: 'black',
            objectCaching: false,
            transparentCorners: false,
            hasRotatingPoint: true
        });

        canvas.add(object);
    }




    document.getElementById('bring-to-front').onclick = function() {
        var activeObject = canvas.getActiveObject();
        //var activeGroup = canvas.getActiveGroup();
        if (activeObject) {
            activeObject.bringToFront();
        } else if (activeGroup) {
            var objectsInGroup = activeGroup.getObjects();
            canvas.discardActiveGroup();
            objectsInGroup.forEach(function(object) {
                object.bringToFront();
            });
        }
    };
    document.getElementById('send-to-back').onclick = function() {
        var activeObject = canvas.getActiveObject();
        //var activeGroup = canvas.getActiveGroup();
        if (activeObject) {
            activeObject.sendToBack();
        } else if (activeGroup) {
            var objectsInGroup = activeGroup.getObjects();
            canvas.discardActiveGroup();
            objectsInGroup.forEach(function(object) {
                object.sendToBack();
            });
        }
    };
    $("#text-bold").click(function() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.fontWeight = (activeObject.fontWeight == 'bold' ? '' : 'bold');
            canvas.renderAll();
        }else  if (activeObject && activeObject.type === 'text-curved') {
            activeObject.set ({ 
				fontWeight : (activeObject.fontWeight == 'bold' ? '' : 'bold')
			});
			
			
            canvas.renderAll();
        }
    });
    $("#text-italic").click(function() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.fontStyle = (activeObject.fontStyle == 'italic' ? '' : 'italic');
            canvas.renderAll();
        }else  if (activeObject && activeObject.type === 'text-curved') {
            activeObject.set ({ 
				fontStyle : (activeObject.fontStyle == 'italic' ? '' : 'italic')
			});
			
			
            canvas.renderAll();
        }
    });
    $("#text-strike").click(function() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.set("linethrough", !activeObject.get("linethrough"));
            canvas.renderAll();
        }else  if (activeObject && activeObject.type === 'text-curved') {
			activeObject.set("linethrough", !activeObject.get("linethrough"));		
			
            canvas.renderAll();
        }
    });
    $("#text-underline").click(function() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.set("underline", !activeObject.get("underline"));
            canvas.renderAll();
        }
    });
    $("#text-left").click(function() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.textAlign = 'left';
            canvas.renderAll();
        }
    });
    $("#text-center").click(function() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.textAlign = 'center';
            canvas.renderAll();
        }
    });
    $("#text-right").click(function() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.textAlign = 'right';
            canvas.renderAll();
        }
    });
    $("#font-family").change(function() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.fontFamily = this.value;
            canvas.renderAll();
        } else if (activeObject && activeObject.type === 'text-curved') {
            activeObject.fontFamily = this.value;
            canvas.renderAll();
        }
    });
    $('#text-bgcolor').miniColors({
        change: function(hex, rgb) {
            var activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'text') {
                activeObject.backgroundColor = this.value;
                canvas.renderAll();
            }
        },
        open: function(hex, rgb) {
            //
        },
        close: function(hex, rgb) {
            //
        }
    });
    $('#text-fontcolor').miniColors({
        change: function(hex, rgb) {
            var activeObject = canvas.getActiveObject();
            //console.log(activeObject.type);

            if (activeObject && activeObject.type === 'text') {
                //activeObject.fill = this.value;
                activeObject.set("fill", this.value);

                //activeObject.fill = gradient;
                canvas.renderAll();
            }else if (activeObject && activeObject.type === 'text-curved') {
                //activeObject.fill = this.value;
                activeObject.set("fill", this.value);

                //activeObject.fill = gradient;
                canvas.renderAll();
            } else if (activeObject && ((activeObject.type === 'rect') || (activeObject.type === 'polygon') || (activeObject.type === 'circle') || (activeObject.type === 'line') || (activeObject.type === 'triangle') || (activeObject.type === 'ellipse'))) {

                //activeObject.fill = this.value;
                activeObject.set("fill", this.value);

                //activeObject.fill = gradient;

                canvas.renderAll();
                /*
                const context = canvas.getContext('2d');
                  const imgData = context.getImageData(0, 0, canvas.width, canvas.height)
                  for (let i = 0; i < imgData.data.length; i += 4) {
                	if(imgData.data[i+3] == 0)
                	   continue;
                	imgData.data[i + 0] = rgb.r;
                	imgData.data[i + 1] = rgb.g;
                	imgData.data[i + 2] = rgb.b;
                	imgData.data[i + 3] = 255;				
                  }
                  context.putImageData(imgData, 0, 0);
                  //canvas.renderAll();
                  */
            }
        },
        open: function(hex, rgb) {
            //
        },
        close: function(hex, rgb) {
            //
        }
    });

    $('#text-strokecolor').miniColors({
        change: function(hex, rgb) {
            var activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'text') {
                activeObject.strokeStyle = this.value;
                canvas.renderAll();
            }
        },
        open: function(hex, rgb) {
            //
        },
        close: function(hex, rgb) {
            //
        }
    });



    $('#flip').click(
        function() {
            if ($(this).attr("data-original-title") == "Show Second View") {
                $(this).attr('data-original-title', 'Show First View');

                flippeditemid = localStorage.getItem("curProductItem");
                curFacing = document.getElementById("customItemDiv").style.backgroundImage;
                newFacing = curFacing.replace("front", "back");
                document.getElementById("customItemDiv").style.backgroundImage = newFacing;


                canvasFrontString = JSON.stringify(canvas);
                customItemCanvasDataFront = canvas.toDataURL();
                canvas.clear();
                imageFacing = "back";
                try {
                    //var json = JSON.parse(canvasBackString);

                    canvas.loadFromJSON(canvasBackString);
                } catch (e) {}

            } else {
                $(this).attr('data-original-title', 'Show Second View');

                curFacing = document.getElementById("customItemDiv").style.backgroundImage;
                newFacing = curFacing.replace("back", "front");
                document.getElementById("customItemDiv").style.backgroundImage = newFacing;


                canvasBackString = JSON.stringify(canvas);
                customItemCanvasDataBack = canvas.toDataURL();
                canvas.clear();
                imageFacing = "front";
                try {
                    //var json = JSON.parse(canvasFrontString);
                    canvas.loadFromJSON(canvasFrontString);
                } catch (e) {}
            }
            canvas.renderAll();
            setTimeout(function() {
                canvas.calcOffset();
            }, 200);
        });
    $(".clearfix button,a").tooltip();



    //SM: Below code is for Cart functionality*******************************

    shoppingCart = (function() {
        // =============================
        // Private methods and propeties
        // =============================
        cart = [];

        // Constructor
        function Item(itemdesignid, itemid, name, price, count, color, canvasFrontString, canvasBackString,
            customItemCanvasDataFront, customItemCanvasDataBack, itemImage, coloredItem, itemNote, itemNoteInstr, quantitiesremaining, cridesignsizefactor, canvaWidth, shipweightkg) {
            this.itemdesignid = itemdesignid;
            this.itemid = itemid;
            this.name = name;
            this.price = price;
            this.count = count;
            this.color = color;
            this.canvasFrontString = canvasFrontString;
            this.canvasBackString = canvasBackString;
            this.customItemCanvasDataFront = customItemCanvasDataFront;
            this.customItemCanvasDataBack = customItemCanvasDataBack;
            this.itemImage = itemImage;
            this.coloredItem = coloredItem;
            this.itemNote = itemNote;
            this.itemNoteInstr = itemNoteInstr;
            this.quantitiesremaining = quantitiesremaining;
            this.cridesignsizefactor = cridesignsizefactor;
			this.canvaWidth = canvaWidth;
			this.shipweightkg = shipweightkg;

        }

        // Save cart
        function saveCart() {
            if (shoppingCart.totalCount() == 0) {
                document.getElementById("orderNowBtnId").style.display = "none"
                document.getElementById("checkOutDivId").style.display = "none"
            } else {
                document.getElementById("orderNowBtnId").style.display = "inline-block"
            }
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
        }

        // Load cart
        function loadCart() {
            cart = JSON.parse(localStorage.getItem('shoppingCart'));
        }



        if (localStorage.getItem("shoppingCart") != null) {
            loadCart();
        }


        // =============================
        // Public methods and propeties
        // =============================
        var obj = {};

        obj.displayCart = function() {
            //SM
            displayCart();
			
			

        }

        obj.displayAddedToCartPop = function() {
            //SM

			
            var cartArray = shoppingCart.listCart();
            var output = "";
			
            for (var i in cartArray) {

                if (cartArray[i].itemdesignid == lastAddedItemDesignId) {
                    output += "<tr style='background-color:#FCFBFB; box-shadow: 1px 1px 2px #222222; '>" +
                        "<td style='position: relative; padding-top:60px;'> <div id='itemHdrDiv' >" + cartArray[i].name +
                        " (Unit price = CAD " + cartArray[i].price + ") </div>";

                    //+ "<div style='height: 300px; width:300px; background-color: " + cartArray[i].color + "; background-size: cover; background-repeat: no-repeat; background-image:url(" + '"/goodsandgift/img/'+ cartArray[i].itemImage +'_front.png"' + ") '><img style='margin-left: 0px; ' src='" + cartArray[i].customItemCanvasDataFront + "'/></div>"		  
                    if (cartArray[i].customItemCanvasDataFront != undefined) {
                        if (cartArray[i].customItemCanvasDataFront != "") {
							
                            output += "<div style='height: 200px; width:200px; border-radius: 10px; background-color: " + cartArray[i].color + "; background-size: cover; background-repeat: no-repeat;  background-image:url(" + '"/goodsandgift/img/' + cartArray[i].itemImage + '_front.png"' + ") '><img style='margin-left: 0px; ' src='" + cartArray[i].customItemCanvasDataFront + "'/></div>";
                        }
                    }

                    if (cartArray[i].customItemCanvasDataBack != undefined) {
                        if (cartArray[i].customItemCanvasDataBack != "") {
                            output += "<div style='height: 200px; width:200px; border-radius: 10px; background-color: " + cartArray[i].color + "; background-size: cover; background-repeat: no-repeat;  background-image:url(" + '"/goodsandgift/img/' + cartArray[i].itemImage + '_back.png"' + ") '><img style='margin-left: 0px; ' src='" + cartArray[i].customItemCanvasDataBack + "'/></div>";
                        }
                    }

                    output += "<div class='input-group' style='margin-top: 10px;'><button class='minus-item input-group-addon btn btn-primary' data-itemdesignid=" + cartArray[i].itemdesignid + " data-itemid=" + cartArray[i].itemid + " data-name=" + cartArray[i].name + ">-</button>" +
                        "<input type='number' autocomplete='off'  min='0' max='" + cartArray[i].quantitiesremaining + "' class='item-count form-control' style='margin: 0px; width: 40px;' data-maxcnt = '" + cartArray[i].quantitiesremaining + "' data-itemdesignid=" + cartArray[i].itemdesignid + " data-itemid=" + cartArray[i].itemid + "  data-name='" + cartArray[i].name + "' value='" + cartArray[i].count + "'>" +
                        "<button class='plus-item btn btn-primary input-group-addon' data-itemdesignid=" + cartArray[i].itemdesignid + " data-itemid=" + cartArray[i].itemid + " data-name=" + cartArray[i].name + ">+</button>" +
                        "<button type='button' class='btn btn-secondary' style='margin-left: 10px' onclick=Show('cart') >View Cart</button>" +
                        "</td></tr>";
                    break;
                }

            }
            document.getElementById("addToCartModal").style.display = "block";
            $('.show-pop-cart').html(output);
            $('.total-cart').html(shoppingCart.totalCart());

			var shippingPrice = parseFloat(document.getElementById("shippingPrice").innerHTML);
			if ( isNaN(shippingPrice)){
				shippingPrice = 0;
			} 
			document.getElementById("totalPricewithShipping").innerHTML = shoppingCart.totalCart() + shippingPrice;
		
            $('.total-count').html(shoppingCart.totalCount());



        }

        // Add to cart - addtocart
        obj.addItemToCart = function(itemid, name, price, count, itemdesignid, itemImage, quantitiesremaining, cridesignsizefactor, displayAddedToCartPop, shipweightkg) {

            var lclCanvasFrontString = "";
            var lclCanvasBackString = "";

			//Canvas Front String Json, Back String Json and Front and Back Data are stored in Cart as if 
			// the design was taken from 600 x 600 canvas
			var ele = document.getElementById("customItemDiv");
			var canvaWidth = ele.offsetWidth;	
			//canvaWidth = canvaWidth - 10;			
			var canvasSizeFactor = 600/canvaWidth ;	
										
            canvas.discardActiveObject().renderAll();
			var origCanvas = "";
			

			
			
			var tempcanvas = new fabric.Canvas('pcanvas', {
				hoverCursor: 'pointer',
				selection: true,
				selectionBorderColor: 'blue'
			});
			
			
            if (imageFacing == "back") {
                lclCanvasBackString = JSON.stringify(canvas);
				
				//origCanvas = lclCanvasBackString;
				lclCanvasBackString = enlargeCanvasJson(lclCanvasBackString, canvasSizeFactor);
				
	
				tempcanvas.loadFromJSON(lclCanvasBackString, function() {
				   tempcanvas.renderAll();
				   customItemCanvasDataBack = tempcanvas.toDataURL();	
				   //console.log("customItemCanvasDataBack Loaded")
				}); 				

                lclCanvasFrontString = canvasFrontString;
				lclCanvasFrontString = enlargeCanvasJson(lclCanvasFrontString, canvasSizeFactor);
				

				tempcanvas.loadFromJSON(lclCanvasFrontString, function() {
				   tempcanvas.renderAll();
				   customItemCanvasDataFront = tempcanvas.toDataURL();	
				   //console.log("customItemCanvasDataFront Loaded")
				}); 
				document.body.style.cursor='wait';
				document.getElementById("loaderRingDivId").style.display = "block";
				setTimeout(function() {
					//console.log("calling addItemToCartAsync")
					shoppingCart.addItemToCartAsync(itemid, name, price, count, itemdesignid, itemImage, quantitiesremaining, cridesignsizefactor, lclCanvasFrontString, lclCanvasBackString, canvaWidth, shipweightkg);
					
					shoppingCart.displayCart();
					
					if (displayAddedToCartPop){
						shoppingCart.displayAddedToCartPop();
					}
					document.body.style.cursor='default';
					document.getElementById("loaderRingDivId").style.display = "none";
				}, 500);
            } else {

                if (canvasBackString != undefined) {
					if (canvasBackString != ""){
						lclCanvasBackString = canvasBackString;
						lclCanvasBackString = enlargeCanvasJson(lclCanvasBackString, canvasSizeFactor);

						tempcanvas.loadFromJSON(lclCanvasBackString, function() {
						   tempcanvas.renderAll();
						   customItemCanvasDataBack = tempcanvas.toDataURL();	
						   //console.log("customItemCanvasDataBack Loaded")
						});  
					}
                }
				
                lclCanvasFrontString = JSON.stringify(canvas);
				lclCanvasFrontString = enlargeCanvasJson(lclCanvasFrontString, canvasSizeFactor);				
	
			
				tempcanvas.loadFromJSON(lclCanvasFrontString, function() {
				   tempcanvas.renderAll();
				   customItemCanvasDataFront = tempcanvas.toDataURL();	
				   //console.log("customItemCanvasDataFront Loaded")
				});   
				document.body.style.cursor='wait';
				document.getElementById("loaderRingDivId").style.display = "block";
				setTimeout(function() {
					//console.log("calling addItemToCartAsync")
					shoppingCart.addItemToCartAsync(itemid, name, price, count, itemdesignid, itemImage, quantitiesremaining, cridesignsizefactor, lclCanvasFrontString, lclCanvasBackString, canvaWidth, shipweightkg);
					
					shoppingCart.displayCart();
					
					if (displayAddedToCartPop){
						shoppingCart.displayAddedToCartPop();
					}
					document.body.style.cursor='default';
					document.getElementById("loaderRingDivId").style.display = "none";
				}, 500);
				

            }
		}
		
		obj.addItemToCartAsync = function(itemid, name, price, count, itemdesignid, itemImage, quantitiesremaining, cridesignsizefactor, lclCanvasFrontString, lclCanvasBackString, canvaWidth, shipweightkg ) {


            var itemNote = document.getElementById("add-note-string").value;
			itemNote = itemNote.replaceAll("'", "''");
            var itemNoteInstr = document.getElementById("addInstrDivId").innerHTML;

            var lclColor = document.getElementById("customItemDiv").style.backgroundColor;
			
            if (flippeditemid != itemid) {
                lclCanvasBackString = "";
                customItemCanvasDataBack = "";
            }

            if (itemdesignid == 0) {

                for (var item in cart) {

                    if (cart[item].itemid === itemid &&
                        cart[item].canvasFrontString === lclCanvasFrontString &&
                        cart[item].canvasBackString === lclCanvasBackString &&
                        cart[item].color === lclColor &&
                        cart[item].itemNote === itemNote) {
                        lastAddedItemDesignId = cart[item].itemdesignid;

                        if (cart[item].count > quantitiesremaining - 1) {
                            cart[item].count = quantitiesremaining
                        } else {
                            cart[item].count++;
                        }
                        saveCart();
                        return;
                    }
                }
            }
            if (itemdesignid != 0) {
                for (var item in cart) {
                    if (cart[item].itemdesignid === itemdesignid) {
                        lastAddedItemDesignId = itemdesignid;

                        if (cart[item].count > quantitiesremaining - 1) {
                            cart[item].count = quantitiesremaining
                        } else {
                            cart[item].count++;
                        }
                        //cart[item].count ++;

                        saveCart();
                        return;
                    }
                }
            }
            itemdesignid = fabric.util.getRandomInt(1, 99999);
            lastAddedItemDesignId = itemdesignid;

            var coloredItem = localStorage.getItem("coloreditem");

            var item = new Item(itemdesignid, itemid, name, price, count, lclColor, lclCanvasFrontString, lclCanvasBackString,
                customItemCanvasDataFront, customItemCanvasDataBack, itemImage, coloredItem, itemNote, itemNoteInstr, quantitiesremaining, cridesignsizefactor, canvaWidth, shipweightkg);
            cart.push(item);
            saveCart();
			designAdded = false;

        }
        // Set count from item
        //obj.setCountForItem = function(name, count) {
        obj.setCountForItem = function(itemdesignid, count) {
            for (var i in cart) {
                if (cart[i].itemdesignid === itemdesignid) {
                    cart[i].count = count;
                    break;
                }
            }
        };
        // Remove item from cart
        //obj.removeItemFromCart = function(name) {
        obj.removeItemFromCart = function(itemdesignid) {
            for (var item in cart) {
                if (cart[item].itemdesignid === itemdesignid) {
                    cart[item].count--;
                    if (cart[item].count === 0) {
                        cart.splice(item, 1);
                    }
                    break;
                }
            }
            saveCart();
        }

        // Remove all items from cart
        //obj.removeItemFromCartAll = function(name) {
        obj.removeItemFromCartAll = function(itemdesignid) {
            for (var item in cart) {
                if (cart[item].itemdesignid === itemdesignid) {
                    cart.splice(item, 1);
                    break;
                }
            }
            saveCart();
        }

        // Clear cart
        obj.clearCart = function() {
            cart = [];
            saveCart();
        }

        // Count cart 
        obj.totalCount = function() {
            var totalCount = 0;
            for (var item in cart) {
                totalCount += parseInt(cart[item].count);
            }
            return totalCount;
        }

        // Total cart
        obj.totalCart = function() {
            var totalCart = 0;
            for (var item in cart) {
                totalCart += cart[item].price * cart[item].count;
            }
            return Number(totalCart.toFixed(2));
        }

        // List cart
        obj.listCart = function() {
            var cartCopy = [];
            for (i in cart) {
                item = cart[i];
                itemCopy = {};
                for (p in item) {
                    itemCopy[p] = item[p];

                }
                itemCopy.total = Number(item.price * item.count).toFixed(2);
                cartCopy.push(itemCopy)
            }
            return cartCopy;
        }

        return obj;
    })();


    // *****************************************
    // Triggers / Events
    // ***************************************** 


    // Clear items
    $('.clear-cart').click(function() {
        shoppingCart.clearCart();
        displayCart();
    });




    function displayCart() {
        var cartArray = shoppingCart.listCart();
        var output = "";
        for (var i in cartArray) {

            output += "<tr style='background-color:#FCFBFB; box-shadow: 1px 1px 2px #222222; '>" +
                "<td style='position: relative; padding-top:60px'><div id='itemHdrDiv' style='display:flex; flex-direction: row;'>";

            if (cartArray[i].coloredItem == "y") {
                output += "<label style='height: 20px; width:20px; margin-bottom: 0px; margin-right: 10px; background-color: " + cartArray[i].color + "'> </label>"
            }

            output += cartArray[i].name +
                " (Unit price = CAD " + cartArray[i].price + ") </div>" +
                "<div style='display:flex; flex-direction: row; margin-bottom: 5px;'>";

            //if (cartArray[i].coloredItem == "y"){
            //output += "Color: <label style='height: 20px; width:20px; background-color: "+ cartArray[i].color +"'> </label>"
            //}

            output += "<button class='btn btn-secondary' style='margin-left: 0px; '  data-itemdesignid=" + cartArray[i].itemdesignid + " data-itemid=" + cartArray[i].itemid + " data-name=" + cartArray[i].name + " onclick='showDesignItem(" + '"' + cartArray[i].itemdesignid + '"' + ")' >Open</button></div>";


            if (cartArray[i].itemNote != "") {
                output += "<div>Note:" + cartArray[i].itemNote + "</div>";
            }
            if (cartArray[i].customItemCanvasDataFront != undefined) {
                if (cartArray[i].customItemCanvasDataFront != "") {
                    output += "<div style='height: 200px; width:200px; border-radius: 10px; background-color: " + cartArray[i].color + "; background-size: cover; background-repeat: no-repeat;  background-image:url(" + '"/goodsandgift/img/' + cartArray[i].itemImage + '_front.png"' + ") '><img style='margin-left: 0px; ' src='" + cartArray[i].customItemCanvasDataFront + "'/></div>";
                }
            }

            if (cartArray[i].customItemCanvasDataBack != undefined) {
                if (cartArray[i].customItemCanvasDataBack != "") {
                    output += "<div style='height: 200px; width:200px; border-radius: 10px; background-color: " + cartArray[i].color + "; background-size: cover; background-repeat: no-repeat;  background-image:url(" + '"/goodsandgift/img/' + cartArray[i].itemImage + '_back.png"' + ") '><img style='margin-left: 0px;  ' src='" + cartArray[i].customItemCanvasDataBack + "'/></div>";
                }
            }

            output += "<div class='input-group' style='margin-top: 10px;'><button class='minus-item input-group-addon btn btn-primary' data-itemdesignid=" + cartArray[i].itemdesignid + " data-itemid=" + cartArray[i].itemid + " data-name=" + cartArray[i].name + ">-</button>" +
                "<input type='number'  autocomplete='off' min='0' max='" + cartArray[i].quantitiesremaining + "' class='item-count form-control' style='margin: 0px; width: 40px;' data-maxcnt = '" + cartArray[i].quantitiesremaining + "' data-itemdesignid=" + cartArray[i].itemdesignid + " data-itemid=" + cartArray[i].itemid + "  data-name='" + cartArray[i].name + "' value='" + cartArray[i].count + "'>" +
                "<button class='plus-item btn btn-primary input-group-addon' data-itemdesignid=" + cartArray[i].itemdesignid + " data-itemid=" + cartArray[i].itemid + " data-name=" + cartArray[i].name + ">+</button>" +
                "<button class='delete-item' style='margin-left: 10px; cursor: pointer;  border: none;' data-itemdesignid=" + cartArray[i].itemdesignid + " data-itemid=" + cartArray[i].itemid + " data-name=" + cartArray[i].name + "><i class='fa fa-trash' style='font-size:24px;color:#d11a2a'></i></button>" +
                "  " +
                "CAD " + cartArray[i].total + "</div> </td>" +
                "</tr>";


        }
        $('.show-cart').html(output);
        $('.total-cart').html(shoppingCart.totalCart());
		var shippingPrice = parseFloat(document.getElementById("shippingPrice").innerHTML);
		if ( isNaN(shippingPrice)){
			shippingPrice = 0;
		} 
		document.getElementById("totalPricewithShipping").innerHTML = shoppingCart.totalCart() + shippingPrice;
        $('.total-count').html(shoppingCart.totalCount());

        localStorage.setItem("cartTotal", shoppingCart.totalCart());

        if (shoppingCart.totalCount() == 0) {
            document.getElementById("orderNowBtnId").style.display = "none";
            document.getElementById("checkOutDivId").style.display = "none";
            document.getElementById("totalpricedivid").style.display = "none";
            document.getElementById("pickUpMessageId").style.display = "none";

            document.getElementById("cartlabelid").innerHTML = "CART IS EMPTY";

        } else {
            document.getElementById("orderNowBtnId").style.display = "inline-block";
            document.getElementById("totalpricedivid").style.display = "inline-block";
            document.getElementById("cartlabelid").innerHTML = "CART";
            document.getElementById("pickUpMessageId").style.display = "block";
			
			if (document.getElementById("checkOutDivId").style.display == "block"){
				if (document.getElementById('shipToMe').checked){
					document.getElementById("addressEntered").style.display = "none";
					document.getElementById("addresscontainerDiv").style.display = "block";
					document.getElementById("shippingDiv").style.display = "none";
					document.getElementById("paymentDiv").style.display = "none";
				}
			}
        }
    }

    // Delete item button

    $('.show-cart').on("click", ".delete-item", function(event) {
        //var name = $(this).data('name')
        var itemdesignid = $(this).data('itemdesignid')
        shoppingCart.removeItemFromCartAll(itemdesignid);
        displayCart();
    })


    // -1
    $('.show-cart').on("click", ".minus-item", function(event) {
        //var name = $(this).data('name')
        var itemdesignid = $(this).data('itemdesignid')
        shoppingCart.removeItemFromCart(itemdesignid);
        displayCart();
    })
    // +1
    $('.show-cart').on("click", ".plus-item", function(event) {
        //var name = $(this).data('name')
        var itemid = $(this).data('itemid');
        var itemdesignid = $(this).data('itemdesignid');

        var tf = JSON.parse(localStorage.getItem("itemList"));
        var rows = JSON.parse(tf);

        for (var i = 0; i < rows.length; i++) {
            if (rows[i].itemid == itemid) {
                //document.getElementById('customItemFacing').src= "/goodsandgift/img/" + rows[i].image + "_front.png";
                var name = rows[i].itemname;
                var price = rows[i].price;
                var itemImage = rows[i].image;
                var quantitiesremaining = rows[i].quantitiesremaining;
                var cridesignsizefactor = rows[i].cridesignsizefactor;
				var shipweightkg = rows[i].shipweightkg;
				var displayAddedToCartPop = false;
                shoppingCart.addItemToCart(itemid, name, price, 1, itemdesignid, itemImage, quantitiesremaining, cridesignsizefactor, displayAddedToCartPop, shipweightkg);
                //displayCart();


                break;
            }
        }

    })

    // Item count input
    $('.show-cart').on("change", ".item-count", function(event) {
        //var name = $(this).data('name');
        var itemid = $(this).data('itemid');
        var count = Number($(this).val());

        var itemdesignid = $(this).data('itemdesignid');
        var maxcnt = $(this).data('maxcnt');
        if (count > maxcnt) {
            count = maxcnt;
        }

        //shoppingCart.setCountForItem(name, count);
        shoppingCart.setCountForItem(itemdesignid, count);
        displayCart();
    });

    $('.show-pop-cart').on("click", ".minus-item", function(event) {
        //var name = $(this).data('name')
        var itemdesignid = $(this).data('itemdesignid')
        shoppingCart.removeItemFromCart(itemdesignid);
        shoppingCart.displayAddedToCartPop();
        displayCart();
    })
    // +1
    $('.show-pop-cart').on("click", ".plus-item", function(event) {
        //var name = $(this).data('name')
        var itemid = $(this).data('itemid');
        var itemdesignid = $(this).data('itemdesignid');

        var tf = JSON.parse(localStorage.getItem("itemList"));
        var rows = JSON.parse(tf);

        for (var i = 0; i < rows.length; i++) {
            if (rows[i].itemid == itemid) {
                //document.getElementById('customItemFacing').src= "/goodsandgift/img/" + rows[i].image + "_front.png";
                var name = rows[i].itemname;
                var price = rows[i].price;
                var itemImage = rows[i].image;
                var quantitiesremaining = rows[i].quantitiesremaining;
                var cridesignsizefactor = rows[i].cridesignsizefactor;
				var displayAddedToCartPop = true;
				var shipweightkg = rows[i].shipweightkg;
                shoppingCart.addItemToCart(itemid, name, price, 1, itemdesignid, itemImage, quantitiesremaining, cridesignsizefactor, displayAddedToCartPop, shipweightkg);
                //shoppingCart.displayAddedToCartPop();
                //displayCart();

                break;
            }
        }


    })

    // Item count input
    $('.show-pop-cart').on("change", ".item-count", function(event) {
        //var name = $(this).data('name');
        var itemid = $(this).data('itemid');
        var count = Number($(this).val());
        var itemdesignid = $(this).data('itemdesignid');
        var maxcnt = $(this).data('maxcnt');
        if (count > maxcnt) {
            count = maxcnt;
        }
        //shoppingCart.setCountForItem(name, count);
        shoppingCart.setCountForItem(itemdesignid, count);
        //shoppingCart.setCountForItem(name, count);
        //shoppingCart.setCountForItem(itemid, count);
        shoppingCart.displayAddedToCartPop();
        displayCart();
    });


    displayCart();



    //SM: Above code is for Cart functionality

}); //doc ready


function setFreehandText() {
    //fabric.Object.prototype.objectCaching = true;
    canvas.isDrawingMode = true;
    //canvas.freeDrawingBrush = new fabric.PencilBrush({ decimate: 8 });
}

window.onbeforeunload = function(event)
{
	if (designAdded){
		return true;
	}
};

function createCurvedText(){
	var text = $('#text-string').val();
	var fName = 'Arial';
	//var fSize = +$('#fontSize').val();
	var fSize = 20;
	var diameter = +$('#diameter').val();
	var kerning = +$('#kerning').val();
	var flipped = false;
	var activeObject = new fabric.TextCurved(text, {
			diameter: +$('#diameter').val(),
			fontSize: fSize,
			fontFamily: fName,
			kerning: kerning,
			flipped: flipped,
			left: 20,
			top: 20
		});
	canvas.add(activeObject);

}
function applyFilter(index, filter) {
    var obj = canvas.getActiveObject();
    obj.filters[index] = filter;
    var timeStart = +new Date();
    obj.applyFilters();
    var timeEnd = +new Date();
    var dimString = canvas.getActiveObject().width + ' x ' +
        canvas.getActiveObject().height;
    $('bench').innerHTML = dimString + 'px ' +
        parseFloat(timeEnd - timeStart) + 'ms';
    canvas.renderAll();
}

function getFilter(index) {
    var obj = canvas.getActiveObject();
    return obj.filters[index];
}

function applyFilterValue(index, prop, value) {
    var obj = canvas.getActiveObject();
    if (obj.filters[index]) {
        obj.filters[index][prop] = value;
        var timeStart = +new Date();
        obj.applyFilters();
        var timeEnd = +new Date();
        var dimString = canvas.getActiveObject().width + ' x ' +
            canvas.getActiveObject().height;
        $('bench').innerHTML = dimString + 'px ' +
            parseFloat(timeEnd - timeStart) + 'ms';
        canvas.renderAll();
    }
}

function loadPattern(obj, imgUrl) {
    if (imgUrl == undefined) {
        imgUrl = "imgart/baby-paws-purple-1.png";
    }

    fabric.util.loadImage(imgUrl, function(img) {
        obj.set('fill', new fabric.Pattern({
            source: img,
            repeat: 'repeat'
        }));

        canvas.renderAll();
    });
}

function hideColorDropDown() {
    document.getElementById("color-picker-dropdown").style.display = "none"
}

function hideImageFilterColorDropDown() {
    document.getElementById("image-filter-color-dropdown").style.display = "none"
}

function toggleColorDropDown() {
    hideHolographDropDown();
    if (document.getElementById("color-picker-dropdown").style.display == "block") {
        document.getElementById("color-picker-dropdown").style.display = "none";
    } else {
        document.getElementById("color-picker-dropdown").style.display = "block";
    }
}

function toggleImageFilterDropDown() {
    hideHolographDropDown();
    if (document.getElementById("image-filter-color-dropdown").style.display == "block") {
        document.getElementById("image-filter-color-dropdown").style.display = "none";
    } else {
        document.getElementById("image-filter-color-dropdown").style.display = "block";
    }
}

function changeFontColor(newFontColor) {
    document.getElementById("fontcolordivid").style.backgroundColor = newFontColor;
    var activeObject = canvas.getActiveObject();
    //console.log(activeObject.type);

    if (activeObject && ((activeObject.type === 'text') || (activeObject.type === 'text-curved') || (activeObject.type === 'rect') || (activeObject.type === 'polygon') || (activeObject.type === 'circle') || (activeObject.type === 'line') || (activeObject.type === 'triangle') || (activeObject.type === 'ellipse'))) {

        activeObject.set("fill", newFontColor);

        canvas.renderAll();
    }
	

    if (activeObject && activeObject.type === 'image') {


        const [r, g, b, a] = newFontColor.match(/\d+/g).map(Number);
        var rFactor = 0.01 + (r * 2.19 / 255);
        var gFactor = 0.01 + (g * 2.19 / 255);
        var bFactor = 0.01 + (b * 2.19 / 255);

        f = fabric.Image.filters;
        //applyFilterValue(17, 'gamma', new f.Gamma({gamma: [rFactor, gFactor, bFactor] }));
        applyFilter(17, new f.Gamma({
            gamma: [rFactor, gFactor, bFactor]
        }));

    }
}

function applyImageFilter(newFontColor) {
    document.getElementById("imagefilterdivid").style.backgroundColor = newFontColor;
    var activeObject = canvas.getActiveObject();
    //console.log(activeObject.type);

    if (activeObject && ((activeObject.type === 'text') || (activeObject.type === 'rect') || (activeObject.type === 'polygon') || (activeObject.type === 'circle') || (activeObject.type === 'line') || (activeObject.type === 'triangle') || (activeObject.type === 'ellipse'))) {

        activeObject.set("fill", newFontColor);

        canvas.renderAll();
    }

    if (activeObject && activeObject.type === 'image') {


        const [r, g, b, a] = newFontColor.match(/\d+/g).map(Number);
        var rFactor = 0.01 + (r * 2.19 / 255);
        var gFactor = 0.01 + (g * 2.19 / 255);
        var bFactor = 0.01 + (b * 2.19 / 255);

        f = fabric.Image.filters;
        applyFilter(17, new f.Gamma({
            gamma: [rFactor, gFactor, bFactor]
        }));

        /*
        var activeObject = canvas.getActiveObject();
        var x = "/goodsandgift/img/holograph-3.png";
        fabric.util.loadImage(x, function(img) {
          activeObject.set('fill', new fabric.Pattern({
        	source: img,
        	repeat: 'repeat'
          }));

          canvas.renderAll();
        });	
        */
    }
}

function hideHolographDropDown() {
    document.getElementById("holograph-picker-dropdown").style.display = "none"
}

function toggleHolographDropDown() {
    hideColorDropDown();
    if (document.getElementById("holograph-picker-dropdown").style.display == "block") {
        document.getElementById("holograph-picker-dropdown").style.display = "none";
    } else {
        document.getElementById("holograph-picker-dropdown").style.display = "block";
    }
}

function changeHolograph(imgURL) {

    document.getElementById("holographdivid").style.backgroundImage = imgURL;
    var activeObject = canvas.getActiveObject();
    //var x = imgURL.src;
    //var x = "/goodsandgift/img/holograph-3.png"; //Works
    var x = imgURL.slice(4, -1).replace(/"/g, "");
    fabric.util.loadImage(x, function(img) {
        activeObject.set('fill', new fabric.Pattern({
            source: img,
            repeat: 'repeat'
        }));

        canvas.renderAll();
    });
}

function addImageToCanvas(e) {
    var el = e.target;
    /*temp code*/
    //console.log("Image clicked");
    var offset = 50;
    //var left = fabric.util.getRandomInt(0 + offset, 200 - offset);
    //var top = fabric.util.getRandomInt(0 + offset, 400 - offset);
    var left = 100;
    var top = 100;

    var angle = fabric.util.getRandomInt(-20, 40);
    var width = fabric.util.getRandomInt(30, 50);
    var opacity = (function(min, max) {
        return Math.random() * (max - min) + min;
    })(0.5, 1);

    if (el.src.includes("imgart/circle.png")) {
        var object = new fabric.Circle({
            radius: 50,
            fill: 'black',
            left: left,
            top: top
        });

        canvas.add(object);
        //loadPattern(object);

    } else if (el.src.includes("imgart/rectangle.png")) {
        var object = new fabric.Rect({
            width: 100,
            height: 100,
            fill: 'black',
            opacity: 1,
            left: left,
            top: top,
            hasRotatingPoint: true
        });

        canvas.add(object);
    } else if (el.src.includes("imgart/fabricjs-polygon-")) {

        var imageStr = el.src.split("imgart/")[1];

        var xyz = JSON.parse(localStorage.getItem("artList"));
        var artArray = JSON.parse(xyz);

        var points = [{
            x: 3,
            y: 4
        }, {
            x: 16,
            y: 3
        }]
        for (var i = 0; i < artArray.length; i++) {
            if (artArray[i].imagefilename == imageStr) {
                points = JSON.parse(artArray[i].additionalinfo)
                break;
            }
        }

        var object = new fabric.Polygon(points, {
            left: left,
            top: top,
            fill: 'black',
            //strokeWidth: 4,
            //stroke: 'green',
            //scaleX: 4,
            //scaleY: 4,
            objectCaching: false,
            transparentCorners: false,
            //cornerColor: 'blue',
            hasRotatingPoint: true
        });

        canvas.add(object);
    } else if (el.src.includes("imgart/triangle.png")) {
        var object = new fabric.Triangle({
            width: 100,
            height: 100,
            fill: 'black',
            left: left,
            top: top,
            hasRotatingPoint: true
        });
        canvas.add(object);
    } else if (el.src.includes("imgart/eclipse.png")) {
        var object = new fabric.Ellipse({
            left: left,
            top: top,
            strokeWidth: 1,
            stroke: 'black',
            fill: 'black',
            selectable: true,
            originX: 'center',
            originY: 'center',
            rx: 50,
            ry: 30,
            hasRotatingPoint: true
        });
        canvas.add(object);
    } else if (el.src.includes("imgart/line.png")) {
        var object = new fabric.Line([50, 150, 200, 150], {
            stroke: 'black',
            strokeWidth: 10,
            hasRotatingPoint: true
        });
        canvas.add(object);
    } else {
        fabric.Image.fromURL(el.src, function(image) {
            image.set({
                left: left,
                top: top,
                angle: 0,
                padding: 10,
                cornersize: 10,
                hasRotatingPoint: true
            });

            image.scaleToWidth(200);
            image.scaleToHeight(200);
            //image.scale(getRandomNum(0.1, 0.25)).setCoords();
            canvas.add(image);
        });
    }
	showToast("Added to design");
	designAdded = true;
};

function addToCart(itemid) {
    var tf = JSON.parse(localStorage.getItem("itemList"));
    var rows = JSON.parse(tf);

    for (var i = 0; i < rows.length; i++) {
        if (rows[i].itemid == itemid) {
            //document.getElementById('customItemFacing').src= "/goodsandgift/img/" + rows[i].image + "_front.png";
            var name = rows[i].itemname;
            var price = rows[i].price;
            var itemImage = rows[i].image;
            var quantitiesremaining = rows[i].quantitiesremaining;
            var cridesignsizefactor = rows[i].cridesignsizefactor;
			var shipweightkg = rows[i].shipweightkg;
			var displayAddedToCartPop = true;
            shoppingCart.addItemToCart(itemid, name, price, 1, 0, itemImage, quantitiesremaining, cridesignsizefactor, displayAddedToCartPop, shipweightkg);
            //shoppingCart.displayCart();
            //showToast("Item added to cart");
            //shoppingCart.displayAddedToCartPop();
			
            break;
        }
    }
}


function showDesignItem(itemdesignid) {

    //var sc = JSON.parse(localStorage.getItem("shoppingCart"));
    //var cartrows = JSON.parse(sc);
    cartrows = shoppingCart.listCart();
    var itemid;
    var backgrcolor;
    //var canvasBackString;
    //var canvasFrontString;

										
    for (var i = 0; i < cartrows.length; i++) {
        if (cartrows[i].itemdesignid == itemdesignid) {
            itemid = cartrows[i].itemid;
            canvasBackString = cartrows[i].canvasBackString;
            canvasFrontString = cartrows[i].canvasFrontString;
			//canvasBackString = enlargeCanvasJson(canvasBackString, canvasSizeFactor);
			//canvasFrontString = enlargeCanvasJson(canvasFrontString, canvasSizeFactor);
            backgrcolor = cartrows[i].color;
            break;
        }
    }
    localStorage.setItem("curProductItem", itemid);
	showProduct(itemid,"n","n");
	
	//In the cart Front String Json, Back String Json and Front and Back Data were stored as if
	// the design was taken from 600 x 600 canvas.
	// So if the current canvas is of different size adjust the dimensions
	
	var ele = document.getElementById("customItemDiv");
	var canvaWidth = ele.offsetWidth;	
	//canvaWidth = canvaWidth - 10;	
	var canvasSizeFactor = canvaWidth/600 ;	
	

	canvasFrontString = enlargeCanvasJson(canvasFrontString, canvasSizeFactor);
	if (canvasBackString != ""){
		canvasBackString = enlargeCanvasJson(canvasBackString, canvasSizeFactor);
	}
    canvas.loadFromJSON(canvasFrontString);
    document.getElementById("customItemDiv").style.backgroundColor = backgrcolor;

}

function enlargeCanvasJson(canvasJsonStr, multiplier) {
    if (multiplier == undefined) {
        multiplier = 2;
    }

    var canvasJsonObj = JSON.parse(canvasJsonStr);
    var canvasJson = canvasJsonObj.objects;
    for (var i = 0; i < canvasJson.length; i++) {
        canvasJson[i].left = multiplier * canvasJson[i].left;
        canvasJson[i].top = multiplier * canvasJson[i].top;
        canvasJson[i].scaleX = multiplier * canvasJson[i].scaleX;
        canvasJson[i].scaleY = multiplier * canvasJson[i].scaleY;
    }
    canvasJsonObj.objects = canvasJson;
    return JSON.stringify(canvasJsonObj);

}

function loadTemplateItemOnCanvas(event) {
    var elem = event.target;
    var itemid = elem.dataset.itemid;
    var imgsrc = elem.dataset.imgsrc;
    var backgrcolor = elem.dataset.itemcolor;
    var frontString = elem.dataset.canvasfrontstring;
    var backString = elem.dataset.canvasbackstring;

    var target = imgsrc + "canvases/" + frontString;
    $.ajax({
        url: target,
        success: function(data) {
            //parse your data here
            //you can split into lines using data.split('\n') 
            //an use regex functions to effectively parse it
            canvasFrontString = data;

            if (backString != '') {
                target = imgsrc + "canvases/" + backString;

                $.ajax({
                    url: target,
                    success: function(dataB) {
						
						//In the order placed, Front String Json, Back String Json and Front and Back Data were stored as if
						// the design was taken from 600 x 600 canvas.
						// So if the current canvas is of different size adjust the dimensions
						
						//showProduct(itemid, "n", "n");
						showMDAProduct(itemid, "n", "n");
						var ele = document.getElementById("customItemDiv");
						var canvaWidth = ele.offsetWidth;
						//canvaWidth = canvaWidth - 10; // To exclude padding/margin						
						var canvasSizeFactor = canvaWidth/600 ;
						
						
						
                        canvasBackString = dataB;
						//SM: TEMP
                        canvasBackString = enlargeCanvasJson(dataB, canvasSizeFactor);
                        
						
						//SM: TEMP
                        //canvasFrontString = enlargeCanvasJson(canvasFrontString, 0.5);

						canvasFrontString = enlargeCanvasJson(canvasFrontString, canvasSizeFactor);
                        canvas.loadFromJSON(canvasFrontString);
                        document.getElementById("customItemDiv").style.backgroundColor = backgrcolor;
                        loadMDAPics(itemid);
                    }
                })
            } else {
                //showProduct(itemid, "n", "n");
				showMDAProduct(itemid, "n", "n");
                localStorage.setItem("curProductItem", itemid);
                //canvasFrontString = enlargeCanvasJson(canvasFrontString);

				var ele = document.getElementById("customItemDiv");
				var canvaWidth = ele.offsetWidth;		
				//canvaWidth = canvaWidth - 10; // To exclude padding/margin				
				var canvasSizeFactor = canvaWidth/600 ;
				
				
				canvasFrontString = enlargeCanvasJson(canvasFrontString, canvasSizeFactor);

                canvas.loadFromJSON(canvasFrontString);
                document.getElementById("customItemDiv").style.backgroundColor = backgrcolor;
                loadMDAPics(itemid);
            }


        }
    });
}


function loadMockupItem(itemid, frontString, backString, backgrcolor){


    var imgsrc = "order";

    var target = imgsrc + "canvases/" + frontString;
    $.ajax({
        url: target,
        success: function(data) {
            //parse your data here
            //you can split into lines using data.split('\n') 
            //an use regex functions to effectively parse it
            canvasFrontString = data;

            if (backString != '') {
                target = imgsrc + "canvases/" + backString;

                $.ajax({
                    url: target,
                    success: function(dataB) {
						
						//In the order placed, Front String Json, Back String Json and Front and Back Data were stored as if
						// the design was taken from 600 x 600 canvas.
						// So if the current canvas is of different size adjust the dimensions
						
						showProduct(itemid, "n", "n");
						//showMDAProduct(itemid, "n", "n");
						var ele = document.getElementById("customItemDiv");
						var canvaWidth = ele.offsetWidth;
						//canvaWidth = canvaWidth - 10; // To exclude padding/margin						
						var canvasSizeFactor = canvaWidth/600 ;
						
						
						
                        canvasBackString = dataB;
						//SM: TEMP
                        canvasBackString = enlargeCanvasJson(dataB, canvasSizeFactor);
                        
						
						//SM: TEMP
                        //canvasFrontString = enlargeCanvasJson(canvasFrontString, 0.5);

						canvasFrontString = enlargeCanvasJson(canvasFrontString, canvasSizeFactor);
                        canvas.loadFromJSON(canvasFrontString);
                        document.getElementById("customItemDiv").style.backgroundColor = backgrcolor;
                        //loadMDAPics(itemid);
                    }
                })
            } else {
                showProduct(itemid, "n", "n");
				//showMDAProduct(itemid, "n", "n");
                localStorage.setItem("curProductItem", itemid);
                //canvasFrontString = enlargeCanvasJson(canvasFrontString);

				var ele = document.getElementById("customItemDiv");
				var canvaWidth = ele.offsetWidth;		
				//canvaWidth = canvaWidth - 10; // To exclude padding/margin				
				var canvasSizeFactor = canvaWidth/600 ;
				
				
				canvasFrontString = enlargeCanvasJson(canvasFrontString, canvasSizeFactor);

                canvas.loadFromJSON(canvasFrontString);
                document.getElementById("customItemDiv").style.backgroundColor = backgrcolor;
                //loadMDAPics(itemid);
            }


        }
    });	
}


function loadMDAPics(itemid) {
    var innerHTML = "<button   type='button' class='btn btn-primary' style='margin: 5px;' onclick=getPrintImage('" + itemid + "')>Download PNG</button>";

    //innerHTML  += "<button   type='button' class='btn btn-primary' style='margin: 5px;' onclick=getSVGImage('"+itemid+"')>Download SVG</button>";

    document.getElementById("mdaPics").innerHTML = innerHTML;
    document.getElementById("mdaPics").style.display = "block";
}

function getPrintImage(itemid) {

    var tf = JSON.parse(localStorage.getItem("itemList"));
    var rows = JSON.parse(tf);
    var cridesignsizefactor = 2;

    for (var i = 0; i < rows.length; i++) {
        if (rows[i].itemid == itemid) {
            cridesignsizefactor = rows[i].cridesignsizefactor;
            break;
        }
    }


    var canvasString = JSON.stringify(canvas);
    //canvasStringEnlrg = enlargeCanvasJson(canvasString, cridesignsizefactor );
    canvasStringEnlrg = enlargeCanvasJson(canvasString, 5);

    //document.getElementById("dcanvas").style.display = "block";
	
    downloadcanvas = new fabric.Canvas('dcanvas', {
        hoverCursor: 'pointer',
        selection: true,
        selectionBorderColor: 'blue'
    });

    downloadcanvas.loadFromJSON(canvasStringEnlrg);
    downloadcanvas.renderAll();

	document.getElementById("loaderRingDivId").style.display = "block";
    setTimeout(function() {
        var link = document.createElement('a');
        link.download = 'PRINT.png';
        link.href = downloadcanvas.toDataURL()
        //link.href = resizedCanvas.toDataURL()
        link.click();
		document.getElementById("loaderRingDivId").style.display = "none";
        //document.getElementById("dcanvas").style.display = "none";
    }, 1000);

}

function getSVGImage(itemid) {
    var tf = JSON.parse(localStorage.getItem("itemList"));
    var rows = JSON.parse(tf);
    var cridesignsizefactor = 2;

    for (var i = 0; i < rows.length; i++) {
        if (rows[i].itemid == itemid) {
            cridesignsizefactor = rows[i].cridesignsizefactor;
            break;
        }
    }


    var canvasString = JSON.stringify(canvas);
    //canvasStringEnlrg = enlargeCanvasJson(canvasString, cridesignsizefactor );
    canvasStringEnlrg = enlargeCanvasJson(canvasString, 5);

    //document.getElementById("dcanvas").style.display = "block";

    downloadcanvas = new fabric.Canvas('dcanvas', {
        hoverCursor: 'pointer',
        selection: true,
        selectionBorderColor: 'blue'
    });

    downloadcanvas.loadFromJSON(canvasStringEnlrg);
    downloadcanvas.renderAll();

	document.getElementById("loaderRingDivId").style.display = "block";
    setTimeout(function() {
        /*	
          var link = document.createElement('a');
          link.download = 'PRINT.svg';
          link.href = downloadcanvas.toSVG();
          link.click();
        */
        //const svg = document.querySelector('svg');
        //console.log(downloadcanvas.toSVG());
        const base64doc = btoa(unescape(encodeURIComponent(downloadcanvas.toSVG())));
        //const base64doc = downloadcanvas.toSVG();
        const a = document.createElement('a');
        const e = new MouseEvent('click');
        a.download = 'download.svg';
        a.href = 'data:image/svg+xml;base64,' + base64doc;
        a.dispatchEvent(e);
		document.getElementById("loaderRingDivId").style.display = "none";
    }, 1000);
}

function getPrintNCutImage(itemid) {
    /*SM:*****Also Worked***DO NOT DELETE****
    var tf = JSON.parse(localStorage.getItem("itemList"));
    var rows = JSON.parse(tf);
    var cridesignsizefactor = 1;
    
    for (var i = 0; i < rows.length; i++) {
    	if (rows[i].itemid == itemid) {
    		cridesignsizefactor = rows[i].cridesignsizefactor;

    		break;
    	}
    }


    
    var myImage = document.getElementById('tcanvas');
    var resizedCanvas = document.createElement("canvas");
    var resizedContext = resizedCanvas.getContext("2d");

    resizedCanvas.height = 600*cridesignsizefactor*2;
    resizedCanvas.width = 600*cridesignsizefactor*2;

    resizedContext.drawImage(myImage, 0, 0, resizedCanvas.width, resizedCanvas.height);

      var link = document.createElement('a');
      link.download = 'PRINTNCUT.png';
      //link.href = canvas.toDataURL()
      link.href = resizedCanvas.toDataURL()
      link.click();
    */
}

function getData(file) {
    let target = fetch("itemcanvases/" + file);

    $.ajax({
        url: target,
        success: function(data) {
            //parse your data here
            //you can split into lines using data.split('\n') 
            //an use regex functions to effectively parse it
        }
    });
}

function clearCart() {
    shoppingCart.clearCart();
    shoppingCart.displayCart();
}





function getRandomNum(min, max) {
    return Math.random() * (max - min) + min;
}

function encodeImageFileAsURL(element) {
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = function() {
        var imageInBase64 = reader.result;
        //console.log('RESULT', imageInBase64)

        var offset = 50;
        //var left = fabric.util.getRandomInt(0 + offset, 200 - offset);
        //var top = fabric.util.getRandomInt(0 + offset, 400 - offset);
        var left = 230;
        var top = 260;

        var angle = fabric.util.getRandomInt(-20, 40);
        var width = fabric.util.getRandomInt(30, 50);
        var opacity = (function(min, max) {
            return Math.random() * (max - min) + min;
        })(0.5, 1);

        fabric.Image.fromURL(imageInBase64, function(image) {
            image.set({
                left: left,
                top: top,
                angle: 0,
                padding: 10,
                cornersize: 10,
                hasRotatingPoint: true
            });
            image.scaleToWidth(120);
            //image.scale(getRandomNum(0.1, 0.25)).setCoords();
            canvas.add(image);
        });
    }
    reader.readAsDataURL(file);
}

function onObjectSelected(e) {
    var selectedObject = e.target;
    $("#text-string").val("");
    $("#text-string-two").val("");
    //console.log(selectedObject.type);
    selectedObject.hasRotatingPoint = true
    selectedObject.set({
        'borderColor': '#fbb802',
        'cornerColor': '#fbb802'
    });

	$("#text-string-two").css('display', 'inline-block');
	$("#text-strike").css('display', 'inline-block');
	$("#text-underline").css('display', 'inline-block');
	$("#holographSecid").css('display', 'inline-block');
	$("#clone-selected").css('display', 'inline-block');
	


    if (selectedObject && selectedObject.type === 'text') {
        //display text editor	    	
        //$("#texteditor").css('display', 'block');
		displayToolBarSection('texteditor', true);
		//$("#texteditorAdd").css('display', 'block');
		displayToolBarSection('texteditorAdd', true);
        //$("#coloreditor").css('display', 'block');
		displayToolBarSection('coloreditor', true);
        //$("#imagefiltercoloreditor").css('display', 'none');
		displayToolBarSection('imagefiltercoloreditor', false);
        $("#text-string").val(selectedObject.text);
        $("#text-string-two").val(selectedObject.text);
        $('#text-fontcolor').miniColors('value', selectedObject.fill);
        $('#text-strokecolor').miniColors('value', selectedObject.strokeStyle);
        //$("#imageeditor").css('display', 'block');
		displayToolBarSection('imageeditor', true);
		$("#informationDisplay").css('display', 'none');

		$("#diameterBtn").css('display', 'none');
		$("#kerningBtn").css('display', 'none');
	
		$('#fontSize').val(selectedObject.fontSize);
		$('#fontFamilyDisplay').val(selectedObject.fontFamily);
		
    }else if (selectedObject && selectedObject.type === 'text-curved') {
        //display text editor	    	
        //$("#texteditor").css('display', 'block');
		displayToolBarSection('texteditor', true);
		//$("#texteditorAdd").css('display', 'block');
		displayToolBarSection('texteditorAdd', true);
        //$("#coloreditor").css('display', 'block');
		displayToolBarSection('coloreditor', true);
	
	$("#diameterBtn").css('display', 'inline-block');
	$("#kerningBtn").css('display', 'inline-block');
	
        //$("#imagefiltercoloreditor").css('display', 'none');	
		displayToolBarSection('imagefiltercoloreditor', false);		
        $("#text-string").val(selectedObject.text);
        $("#text-string-two").val(selectedObject.text);
        $('#text-fontcolor').miniColors('value', selectedObject.fill);
        $('#text-strokecolor').miniColors('value', selectedObject.strokeStyle);
        //$("#imageeditor").css('display', 'block');
		displayToolBarSection('imageeditor', true);
		$("#informationDisplay").css('display', 'none');
		
		$("#text-string-two").css('display', 'none');
		$("#text-strike").css('display', 'none');
		$("#text-underline").css('display', 'none');
		$("#holographSecid").css('display', 'none');
		$("#clone-selected").css('display', 'none');
		
		$('#diameter').val(selectedObject.diameter);
		$('#fontSize').val(selectedObject.fontSize);
		$('#fontFamilyDisplay').val(selectedObject.fontFamily);
		$('#kerning').val(selectedObject.kerning);		
    } else if (selectedObject && selectedObject.type === 'image') {
        //display image editor
        //$("#texteditor").css('display', 'none');
		displayToolBarSection('texteditor', false);
		//$("#texteditorAdd").css('display', 'none');
		displayToolBarSection('texteditorAdd', false);
        //$("#coloreditor").css('display', 'none');
		displayToolBarSection('coloreditor', false);
        //$("#imagefiltercoloreditor").css('display', 'block');
		displayToolBarSection('imagefiltercoloreditor', true);
        //$("#imageeditor").css('display', 'block');
		displayToolBarSection('imageeditor', true);
		$("#informationDisplay").css('display', 'none');
    } else if (selectedObject && ((selectedObject.type === 'rect') || (selectedObject.type === 'polygon') || (selectedObject.type === 'circle') || (selectedObject.type === 'line') || (selectedObject.type === 'triangle') || (selectedObject.type === 'ellipse'))) {
        //display image editor
        //$("#texteditor").css('display', 'none');
		displayToolBarSection('texteditor', false);
		//$("#texteditorAdd").css('display', 'none');
		displayToolBarSection('texteditorAdd', false);
        //$("#coloreditor").css('display', 'block');
		displayToolBarSection('coloreditor', true);
        //$("#imagefiltercoloreditor").css('display', 'none');
		displayToolBarSection('imagefiltercoloreditor', false);
        //$('#text-fontcolor').miniColors('value', selectedObject.fill);
        //$("#imageeditor").css('display', 'block');
		displayToolBarSection('imageeditor', true);
		$("#informationDisplay").css('display', 'none');
    }
}

function displayToolBarSection(sectionName, displayFlag){
	if (displayFlag){
		$("#toolbarSec").css('display', 'block');
	}
	if (sectionName == "texteditor"){
		if (displayFlag) {
			$("#text-string-two").css('display', 'inline-block');
			$("#font-family").css('display', 'inline-block');
			$("#fontSizeBtn").css('display', 'inline-block');
		} else {
			$("#text-string-two").css('display', 'none');
			$("#font-family").css('display', 'none');
			$("#fontSizeBtn").css('display', 'none');			
		}
	} else if (sectionName == "texteditorAdd"){
		if (displayFlag) {
			$("#text-bold").css('display', 'inline-block');
			$("#text-italic").css('display', 'inline-block');
			$("#text-strike").css('display', 'inline-block');
			$("#text-underline").css('display', 'inline-block');
		} else {
			$("#text-bold").css('display', 'none');
			$("#text-italic").css('display', 'none');
			$("#text-strike").css('display', 'none');
			$("#text-underline").css('display', 'none');		
		}
	}else if (sectionName == "coloreditor"){
		if (displayFlag) {
			$("#fontColora").css('display', 'inline-block');
			$("#holographSecid").css('display', 'inline-block');
		}else {
			$("#fontColora").css('display', 'none');
			$("#holographSecid").css('display', 'none');
		}
	}else if (sectionName == "imageeditor"){
		if (displayFlag) {
			$("#bring-to-front").css('display', 'inline-block');
			$("#send-to-back").css('display', 'inline-block');
			$("#clone-selected").css('display', 'inline-block');
			$("#remove-selected").css('display', 'inline-block');
		}else {
			$("#bring-to-front").css('display', 'none');
			$("#send-to-back").css('display', 'none');
			$("#clone-selected").css('display', 'none');
			$("#remove-selected").css('display', 'none');			
		}
	}else if (sectionName == "imagefiltercoloreditor"){
		if (displayFlag) {
			$("#shape-outline").css('display', 'inline-block');
		}else {
			$("#shape-outline").css('display', 'none');
	
		}
	}
}
function onSelectedCleared(e) {
    hideColorDropDown();
    hideHolographDropDown();
    //$("#texteditor").css('display', 'none');
	displayToolBarSection('texteditor', false);
	//$("#texteditorAdd").css('display', 'none');
	displayToolBarSection('texteditorAdd', false);
    //$("#coloreditor").css('display', 'none');
	displayToolBarSection('coloreditor', false);
    //$("#imagefiltercoloreditor").css('display', 'none');
	displayToolBarSection('imagefiltercoloreditor', false);
    $("#text-string").val("");
    $("#text-string-two").val("");
    //$("#imageeditor").css('display', 'none');
	displayToolBarSection('imageeditor', false);
	$("#diameterBtn").css('display', 'none');
	$("#kerningBtn").css('display', 'none');
	$("#textFontFamily").css('display', 'none');
	$("#informationDisplay").css('display', 'block');
}

function setFont(font) {
	document.getElementById("textFontFamily").style.display = "none";
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'text') {
        activeObject.fontFamily = font;
		$('#fontFamilyDisplay').val(font);
        canvas.renderAll();
    } else if (activeObject && activeObject.type === 'text-curved') {
        activeObject.set({
				fontFamily: font
			});
		$('#fontFamilyDisplay').val(font);
        canvas.renderAll();
    }
}

function removeWhite() {
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
        activeObject.filters[2] = new fabric.Image.filters.RemoveWhite({
            hreshold: 100,
            distance: 10
        }); //0-255, 0-255
        activeObject.applyFilters(canvas.renderAll.bind(canvas));
    }
}