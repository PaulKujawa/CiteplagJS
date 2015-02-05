/**
 * responsible for the canvas between the texts
 */
MyApp.Canvas = (function() {
    Canvas.r       = 6;
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
     * @param leftPos
     * @param rightPos
     * @param leftFeat
     * @param rightFeat
     * @param color
     */
    Canvas.connect = function(leftPos, rightPos, leftFeat, rightFeat, color) {
        var leftDot     = MyApp.Canvas.drawLeftDot(leftPos);
        var rightDot    = MyApp.Canvas.drawRightDot(rightPos);
        var middleLine  = MyApp.Canvas.drawLine(leftPos, rightPos);
        MyApp.Canvas.setAttributes(leftDot,     leftFeat, rightFeat, color);
        MyApp.Canvas.setAttributes(rightDot,    leftFeat, rightFeat, color);
        MyApp.Canvas.setAttributes(middleLine,  leftFeat, rightFeat, color);
    };


    /**
     * draws a point for the left document
     * class Renderer.scrollIntoView()
     * @param pos
     */
    Canvas.drawLeftDot = function(pos) {
        pos.x += this.r;
        pos.y += this.r;
        return this.paper.circle(pos.x, pos.y, this.r).attr("fill", "#D1E0EE");
    };


    /**
     * draws a point for the right document
     * @param pos
     */
    Canvas.drawRightDot = function(pos) {
        pos.x -= this.r;
        pos.y += this.r;
        return this.paper.circle(pos.x, pos.y, this.r).attr("fill", "#D1E0EE");
    };


    /**
     * draws a line (normally between two points)
     * @param left
     * @param right
     */
    Canvas.drawLine = function(left, right) {
        left.x += this.r;
        right.x -= this.r;
        return this.paper.path("M"+ left.x +","+ left.y +" L0"+ right.x +","+ right.y).attr("stroke-width", 3);
    };


    /**
     * Sets attributes for dots and lines
     * @param element
     * @param leftFeat
     * @param rightFeat
     * @param color
     */
    Canvas.setAttributes = function(element, leftFeat, rightFeat, color) {
        element
            .attr("stroke", color)
            .attr("cursor", "pointer")
            .click(function() {
                leftFeat.trigger('click');
            });
    };

    return Canvas;
})();


