function Canvas(page){
    var funcs = {
        clear     : clear,
        setColour : setColour,
        setWidth  : setWidth,
        update    : update,
        dot       : dot,
        save      : save,
        upload    : upload,
        updateImage:updateImage
    };
    var c, offsetX, offsetY;
    setOffsets();
    $(page).on('appLayout appShow appReady', setOffsets);

    $(document).ready(function(){
        setCanvas($(page).find('#draw').get(0));
        start();
        setOffsets();
    });

    return funcs;

    function setOffsets() {
        if (c) {
            var offset = $(c).offset();
            offsetX = offset.left;
            offsetY = offset.top+20;
        } else {
            offsetX = 0;
            offsetY = 0;
        }
    }

    function setCanvas(canvas){
      c = canvas;
    }

    function getCanvas(){
      return c;
    }
    function clear() {
        var context = getCanvas().getContext("2d");
        context.fillStyle = "#ffffff";
        context.rect(0, 0, 300, 300);
        context.fill();
    }

    function dot(x,y) {
        var context = getCanvas().getContext("2d");
        context.beginPath();
        context.moveTo(x, y-0.2);
        context.lineTo(x, y);
        context.stroke();
        context.closePath();
    }

    function line(x1,y1,x2,y2){
        var context = getCanvas().getContext("2d");
        context.beginPath();
        context.moveTo(x1,y1);
        context.lineTo(x2,y2);
        context.stroke();
        context.closePath();
    }

    function setColour(colour){
        var context = getCanvas().getContext("2d");
        context.strokeStyle = colour;
        return colour;
    }

    function setWidth(width){
        var context = getCanvas().getContext("2d");
        context.lineWidth = width;
        return width;
    }


    function update(drawing){
        console.log('canvas update: ');
        console.log(drawing);
        setColour(drawing.colour)
        setWidth(drawing.width);
        var mark = drawing.line;
        if(drawing.type==='dot'){
            dot(mark.x1,mark.y1);
        }else{
            line(mark.x1,mark.y1,mark.x2,mark.y2);
        }
    }

    function save(){
        var dataURL = c.toDataURL();
        if(kik && kik.enabled){
            kik.photo.saveToGallery(dataURL, function (status) {
                if (status) {
                    console.log('save succeeded');
                } else {
                    console.log('save failed');
                }
            });
        }
    }

    function upload(photo){
        var img = new Image;
        img.src = photo;
        var height = img.height;
        var width  = img.width;
        var hscale  = 300/height;
        var wscale  = 300/width;


        updateImage(img,1,1);
    }

    function updateImage(img,hscale,wscale){
        img.onload = function(){
            // c.getContext("2d").scale( hscale, wscale );
            c.getContext("2d").drawImage(img,0,0); // Or at whatever offset you like
            // c.getContext("2d").scale( 1/hscale, 1/wscale );
        };
    }

    function start(){
        var $canvas = $(page).find('#draw');
        var $clear  = $(page).find('#clear');
        var canvas  = getCanvas();
        var context = canvas.getContext("2d");
        // var event = new CustomEvent('draw',{
        //     detail: {
        //       message: "Canvas drawing at Canvas.start",
        //     },
        //     bubbles: true,
        //     cancelable: true
        //   }
        // );

        var drawing;
        
        var lastx;
        var lasty;
        //var white ="#ffffff";
        //var width =300;
        //var height=300;
        
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 10;
  
        document.ontouchmove = function(e){ e.preventDefault(); }
  
        canvas.addEventListener('touchstart', function(event) {
            event.preventDefault();                 
            
            lastx = event.touches[0].clientX - offsetX;
            lasty = event.touches[0].clientY - offsetY;
            
            context.strokeStyle

            var lineColour =  context.strokeStyle;
            var lineWidth = context.lineWidth;

            dot(lastx,lasty);

            drawing = {'type':'dot','line':{'x1':lastx,'y1':lasty,'x2':0,'y2':0},'colour':lineColour, 'width':lineWidth};
            $canvas.trigger('draw', {'drawing':drawing});
        });
  
        canvas.addEventListener('touchmove', function(event) {
            event.preventDefault();                 
            
            var newx = event.touches[0].clientX - offsetX;
            var newy = event.touches[0].clientY - offsetY;

            var lineColour =  context.strokeStyle;
            var lineWidth = context.lineWidth;

            line(lastx,lasty, newx,newy);

            drawing = {'type':'line','line':{'x1':lastx,'y1':lasty,'x2':newx,'y2':newy},'colour':lineColour, 'width':lineWidth};
            $canvas.trigger('draw', {'drawing':drawing});
    
            lastx = newx;
            lasty = newy;
        });

        var flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;

        //mouse events
        canvas.addEventListener("mousemove", function (e) {
            findxy('move', e)
        }, false);
        canvas.addEventListener("mousedown", function (e) {
            findxy('down', e)
        }, false);
        canvas.addEventListener("mouseup", function (e) {
            findxy('up', e)
        }, false);
        canvas.addEventListener("mouseout", function (e) {
            findxy('out', e)
        }, false);

        function findxy(res, e) {
            if (res == 'down') {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - offsetX;
                currY = e.clientY - offsetY;

                flag = true;
                dot_flag = true;
                if (dot_flag) {
                    dot(currX,currY);
                    dot_flag = false;
                }
            }
            if (res == 'up' || res == "out") {
                flag = false;
            }
            if (res == 'move') {
                if (flag) {
                    prevX = currX;
                    prevY = currY;
                    currX = e.clientX - offsetX;
                    currY = e.clientY - offsetY;
                    line(prevX,prevY,currX,currY);
                }
            }

            var lineColour =  context.strokeStyle;
            var lineWidth = context.lineWidth;

            drawing = {'type':'line','line':{'x1':prevX,'y1':prevY,'x2':currX,'y2':currY},'colour':lineColour, 'width':lineWidth};
            $canvas.trigger('draw', {'drawing':drawing});

        }

        $clear.on('click',function(){
          clear();
          $canvas.trigger('clear');
        });
          
        clear();
    }

}
