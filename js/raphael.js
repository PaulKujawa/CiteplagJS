MyApp.Canvas = (function() {
    Canvas.r       = 6;
    Canvas.paper   = {};
    Canvas.width   = 0;

    function Canvas() {}


    Canvas.connect = function(yLeft, yRight) {
        MyApp.Canvas.drawLeftDot(yLeft);
        MyApp.Canvas.drawRightDot(yRight);
        MyApp.Canvas.drawLine(yLeft, yRight);
    };


    Canvas.drawPaper = function(canvasDiv)  {
        var padding     = parseInt(canvasDiv.css('padding-left').slice(0, -2)),
            left        = canvasDiv.offset().left + padding,
            top         = canvasDiv.offset().top,
            height      = canvasDiv.outerHeight();

        this.width = canvasDiv.innerWidth() - 2*padding;
        this.paper = Raphael(left, top, this.width, height);
        //this.paper = Raphael( $(".canvas").eq(0) , 200, 200);
    };


    Canvas.drawLeftDot = function(y) {
        var x = this.r;
        y += this.r;

        var circle = this.paper.circle(x, y, this.r);
        circle.attr("fill", "#D1E0EE");
        circle.attr("stroke", "#B4CBDF");
    };


    Canvas.drawRightDot = function(y) {
        var x = this.width - this.r;
        y += this.r;

        var circle = this.paper.circle(x, y, this.r);
        circle.attr("fill", "#D1E0EE");
        circle.attr("stroke", "#B4CBDF");
    };


    Canvas.drawLine = function(yLeft, yRight) {
        var xLeft   = this.r*2;
        var xRight  = this.width - 2*this.r;
        yLeft      += this.r;
        yRight     += this.r;

        var line = this.paper.path("M"+xLeft+"," + yLeft + " L0"+xRight+"," + yRight);
        line.attr("stroke-width", 0.5);
    };

    return Canvas;
})();


