function Canvas(page){
    var funcs = {
        clear     : clear,
        setColour : setColour,
        setWidth  : setWidth,
        update    : update,
        dot       : dot,
        save      : save,
        upload    : upload
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
        context.fillStyle = "#000000";
        context.strokeStyle = "#000000";
        context.arc(x,y,1,0,Math.PI*2,false);
        context.fill();
        context.stroke();
        context.closePath();
    }

    function line(x1,y1,x2,y2){
        var context = getCanvas().getContext("2d");
        context.beginPath();
        //context.fillStyle = "#000000";
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
        kik.photo.saveToGallery(dataURL, function (status) {
            if (status) {
                console.log('save succeeded');
            } else {
                console.log('save failed');
            }
        });
    }

    function upload(photos){
        var img = new Image;
        img.src = photos;

        img.onload = function(){
        c.getContext("2d").drawImage(img,0,0); // Or at whatever offset you like
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
  
        document.ontouchmove = function(e){ e.preventDefault(); }
  
        canvas.addEventListener('touchstart', function(event) {
            event.preventDefault();                 
            
            lastx = event.touches[0].clientX - offsetX;
            lasty = event.touches[0].clientY - offsetY;
            
            var lineColour = setColour("#000000");
            var lineWidth = setWidth(8);

            dot(lastx,lasty);

            drawing = {'type':'dot','line':{'x1':lastx,'y1':lasty,'x2':0,'y2':0},'colour':lineColour, 'width':lineWidth};
            $canvas.trigger('draw', {'drawing':drawing});
        });
  
        canvas.addEventListener('touchmove', function(event) {
            event.preventDefault();                 
            
            var newx = event.touches[0].clientX - offsetX;
            var newy = event.touches[0].clientY - offsetY;

            var lineColour = setColour("#000000");
            var lineWidth = setWidth(8);

            line(lastx,lasty, newx,newy);

            drawing = {'type':'line','line':{'x1':lastx,'y1':lasty,'x2':newx,'y2':newy},'colour':lineColour, 'width':lineWidth};
            $canvas.trigger('draw', {'drawing':drawing});
    
            lastx = newx;
            lasty = newy;
        });
        
        $clear.on('click',function(){
          clear();
          $canvas.trigger('clear');
        });
          
        clear();
    }

}
