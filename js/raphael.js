MyApp.Raphael = (function() {
    Raphael.r       = 8;
    Raphael.paper   = {};
    Raphael.padding = 20;

    function Raphael() {}


    Raphael.connect = function(yLeft, yRight) {
        MyApp.Raphael.drawLeftDot(yLeft);
        MyApp.Raphael.drawRightDot(yRight);
        MyApp.Raphael.drawLine(yLeft, yRight);
    };


    Raphael.drawLeftDot = function(y) {
        var x = this.padding + this.r;
        y += this.r;

        var circle = this.paper.circle(x, y, this.r);
        circle.attr("fill", "#D1E0EE");
        circle.attr("stroke", "#B4CBDF");
    };


    Raphael.drawRightDot = function(y) {
        var x = 271 - this.padding - this.r;
        y += this.r;

        var circle = this.paper.circle(x, y, this.r);
        circle.attr("fill", "#D1E0EE");
        circle.attr("stroke", "#B4CBDF");
    };


    Raphael.drawLine = function(yLeft, yRight) {
        var xLeft   = this.padding + (this.r)*2;
        var xRight  = $('svg').width() - this.padding - (this.r)*2;
        yLeft      += this.r;
        yRight     += this.r;

        var line = this.paper.path("M"+xLeft+"," + yLeft + " L0"+xRight+"," + yRight);
        line.attr("stroke-width", 0.5);
    };

    return Raphael;
})();


