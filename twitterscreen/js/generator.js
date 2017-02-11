var leftRightPadding = 8;
var textImagePadding = 5;

var lastRenderedImageDimensions = [];
var lastRenderedLineHeight = 0;

// Stolen from http://stackoverflow.com/a/16599668/
function getLines(ctx, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
      var word = words[i];
      var width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
          currentLine += " " + word;
      } else {
          lines.push(currentLine);
          currentLine = word;
      }
  }
  lines.push(currentLine);
  return lines;
}

function generate() {
  var c = document.getElementById("previewCanvas");
  var ctx = c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  lastRenderedImageDimensions = [];
  lastRenderedLineHeight = 0;

  // rendered pixels of iphone 6 - 750 × 1334
  // height is 750 (iphone height) minus 64 (navbar plus status bar height),
  c.width = 750;
  c.height = 1334;
  c.style.width = "375px";
  c.style.height = "667px";
  ctx.scale(2,2);
  ctx.font = "200 30px Helvetica Neue";

  var styleWidth = parseInt(c.style.width,10);
  var styleHeight = parseInt(c.style.height,10);

  ctx.fillStyle = "white";
  ctx.fillRect(0,0,styleWidth,styleHeight);
  ctx.fillStyle = "black";

  var caption = document.getElementById("captionArea").value;
  if (caption.length > 140) {
    console.log("impossible to tweet");
    return;
  }
  var lines = getLines(ctx, caption, styleWidth-(leftRightPadding*2));
  lines.forEach((line, i) => {
    ctx.fillText(line, leftRightPadding, (i + 1) * 30);
  })

  var files = document.getElementById("filePicker").files;
  var file = files[0];
  if (file && file.type.match('image.*')) {
  var img = new Image();

  img.onload = function() {
    var ratio = img.width / img.height;
    var lineHeight = lines.length * 30 + 5;
    lastRenderedImageDimensions = fitImageOn(c, ctx, img, styleWidth-(leftRightPadding*2), styleHeight-lineHeight, leftRightPadding, lineHeight+textImagePadding);
    lastRenderedLineHeight = lineHeight;
  }

  img.src = URL.createObjectURL(file);
 }
}

var fitImageOn = function(canvas, context, imageObj, styleWidth, styleHeight, x, y) {
  // Stolen from https://sdqali.in/blog/2013/10/03/fitting-an-image-in-to-a-canvas-object/
  // >implying i'm going to write my own aspect fit method for a meme generator i'll never use

	var imageAspectRatio = imageObj.width / imageObj.height;
	var canvasAspectRatio = styleWidth / styleHeight;
	var renderableHeight, renderableWidth, xStart, yStart;

	// If image's aspect ratio is less than canvas's we fit on height
	// and place the image centrally along width
	if(imageAspectRatio < canvasAspectRatio) {
		renderableHeight = styleHeight;
		renderableWidth = imageObj.width * (renderableHeight / imageObj.height);
		xStart = (styleWidth - renderableWidth) / 2 + x;
		yStart = y;
	}

	// If image's aspect ratio is greater than canvas's we fit on width
	else if(imageAspectRatio > canvasAspectRatio) {
		renderableWidth = styleWidth
		renderableHeight = imageObj.height * (renderableWidth / imageObj.width);
		xStart = x;
		yStart = y;
	}

	// Happy path - keep aspect ratio
	else {
		renderableHeight = styleHeight;
		renderableWidth = styleWidth;
		xStart = x;
		yStart = y;
	}
	context.drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight);
  return [renderableWidth, renderableHeight]
};

function save() {
  var c = document.getElementById("previewCanvas");

  var cropCanvas = document.createElement("canvas");
  var cropCtx = cropCanvas.getContext("2d");
  cropCanvas.width = c.width;
  cropCanvas.height = lastRenderedLineHeight+textImagePadding+(lastRenderedImageDimensions[1]*2);
  cropCanvas.style.width = c.style.width;
  cropCanvas.style.height = cropCanvas.height/2 + "px";
  cropCtx.scale(2,2);

  cropCtx.drawImage(c,0,0,cropCanvas.width,cropCanvas.height,0,0,cropCanvas.width/2,cropCanvas.height/2);

  var data = cropCanvas.toDataURL('image/png');
  window.location.href = data;
}
