/**
 * responsible for the canvas between the texts
 */
MyApp.Canvas = (function() {
    Canvas.r       = 5;
    Canvas.paper   = {};
    Canvas.width   = 0;
    Canvas.height  = 0;

    /**
     *
     * @constructor
     */
    function Canvas() {}


    /**
     * draws the initial paper for the canvas
     * @param canvasDiv
     */
    Canvas.drawPaper = function(canvasDiv)  {
        var padding     = parseInt(canvasDiv.css('padding-left').slice(0, -2)),
            left        = canvasDiv.offset().left + padding,
            top         = canvasDiv.offset().top,
            height      = canvasDiv.outerHeight();

        this.width = canvasDiv.innerWidth() - 2*padding;
        this.height = canvasDiv.outerHeight();

        this.paper = Raphael(left, top, this.width, height);
        MyApp.Canvas.drawRectangle();
    };


    Canvas.drawRectangle = function() {
        var width = this.width/ 2,
            rl = this.paper.rect(0, 1, width, this.height-1), // border are cut off
            rr = this.paper.rect(width, 1, width, this.height-1);

        rl.attr("fill", "#F0F8FF");
        rl.attr("stroke", "#B4CBDF");

        rr.attr("fill", "#F0F8FF");
        rr.attr("stroke", "#B4CBDF");
    };

    /**
     * draws two points and connects them
     * @param left
     * @param right
     */
    Canvas.connect = function(left, right) {
        MyApp.Canvas.drawLeftDot(left);
        MyApp.Canvas.drawRightDot(right);
        MyApp.Canvas.drawLine(left, right);
    };


    /**
     * draws a point for the left document
     * @param pos
     */
    Canvas.drawLeftDot = function(pos) {
        pos.x += this.r;
        pos.y += this.r;

        var circle = this.paper.circle(pos.x, pos.y, this.r);
        circle.attr("fill", "#D1E0EE");
        circle.attr("stroke", "#B4CBDF");
    };


    /**
     * draws a point for the right document
     * @param pos
     */
    Canvas.drawRightDot = function(pos) {
        pos.x -= this.r;
        pos.y += this.r;

        var circle = this.paper.circle(pos.x, pos.y, this.r);
        circle.attr("fill", "#D1E0EE");
        circle.attr("stroke", "#B4CBDF");
    };


    /**
     * draws a line (normally between two points)
     * @param left
     * @param right
     */
    Canvas.drawLine = function(left, right) {
        left.x += this.r;

        right.x -= this.r;

        var line = this.paper.path("M"+ left.x +","+ left.y +" L0"+ right.x +","+ right.y);
        line.attr("stroke-width", 1);
        line.attr("stroke", "#B4CBDF");
    };

    return Canvas;
})();


