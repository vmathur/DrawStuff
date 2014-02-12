function Canvas(page){
    var funcs = {
        clear     : clear,
        setColour : setColour,
        setWidth  : setWidth,
        update    : update,
        dot       : dot,
        save      : save
    };
    var c;

    $(document).ready(function(){
        setCanvas($(page).find('#draw').get(0));
        start();
    });

    return funcs;

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
        var dataURL = canvas.toDataURL();
        kik.photo.saveToGallery(dataUrl, function (status) {
            if (status) {
                console.log('save succeeded');
            } else {
                console.log('save failed');
            }
        });
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
        var yoffset = 80+canvas.offsetTop;
        var xoffset = 20;
        
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
            
            lastx = event.touches[0].clientX - xoffset;
            lasty = event.touches[0].clientY - yoffset;
            
            var lineColour = setColour("#000000");
            var lineWidth = setWidth(8);

            dot(lastx,lasty);

            drawing = {'type':'dot','line':{'x1':lastx,'y1':lasty,'x2':0,'y2':0},'colour':lineColour, 'width':lineWidth};
            $canvas.trigger('draw', {'drawing':drawing});
        });
  
        canvas.addEventListener('touchmove', function(event) {
            event.preventDefault();                 
            
            var newx = event.touches[0].clientX - xoffset;
            var newy = event.touches[0].clientY - yoffset;

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
