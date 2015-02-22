/**
 * responsible for the canvas between the texts
 * @author Paul Kujawa p.kujawa@gmx.net
 */
MyApp.Canvas = (function() {
    Canvas.r            = 6;
    Canvas.paper        = {};
    Canvas.width        = 0;
    Canvas.height       = 0;
    Canvas.usedColors   = [];



    /**
     *
     * @constructor
     */
    function Canvas() {}



    /**
     * Drawing the whole canvas
     */
    Canvas.drawCanvas = function() {
        var _self               = this,
            lastGrpNr           = -1, // to remember the last feature's group (color matching)
            color               = MyApp.Canvas.newColor(),
            tab                 = MyApp.TabRenderer.comparisonDiv.find('.tab-pane.active'),
            leftArea            = $(tab).find('.leftArea'),
            canvasDiv           = $(tab).find('.canvas'),
            rightArea           = $(tab).find('.rightArea'),
            yOffset             = leftArea.offset().top, // distance between leftArea and window's top
            xOffset             = leftArea.offset().left, // distance between leftArea and windows left border
            heightRelLeft       = canvasDiv.height()/leftArea[0].scrollHeight, // relation between canvas height and left text's height
            heightRelRight      = canvasDiv.height()/rightArea[0].scrollHeight, // relation between canvas height and right text's height
            widthRelation       = canvasDiv.width()/(rightArea.offset().left + rightArea.outerWidth()),// rel. between canvas' and text's width
            scrollOffsetLeft    = leftArea.scrollTop(), // current left bar position
            scrollOffsetRight   = rightArea.scrollTop(); // current right bar position

        // setup (redraw as well)
        $('svg').remove();
        MyApp.Canvas.drawPaper(canvasDiv);
        var colorsCopy = [],
            matchType  = $(tab).data("matchtype");
        if (_self.usedColors.length > 0)
            colorsCopy = _self.usedColors.slice();


        $.each(MyApp.TabRenderer.featToConnect[matchType], function(leftClass, rightClasses) {
            $.each(rightClasses, function(i, rightClass) {
                // same color for features within same group
                var                 group = leftClass.match(/feature(\d+)_(\d+)/);  // 0=featureX_Y, 1=X, 2=Y
                if (group == null)  group = leftClass.match(/feature(\d+)/);        // 0=featureX,   1=X

                if (group[1] != lastGrpNr) {
                    lastGrpNr = group[1];
                    if (colorsCopy.length > 0)
                        color = colorsCopy.pop();
                    else {
                        color = MyApp.Canvas.newColor();
                        _self.usedColors.push(color);
                    }
                }

                // set position into relation
                var leftFeat    = leftArea.find("." +leftClass).first(), // first occurrence of this feature
                    rightFeat   = rightArea.find('.'+rightClass).first(),
                    xLeft       = leftFeat.offset().left    - xOffset, // feature's pos - different from left Area & windows border
                    yLeft       = leftFeat.offset().top     - yOffset + scrollOffsetLeft, // feature's pos - area's diff to top - scroll bar's offset
                    xRight      = rightFeat.offset().left   - xOffset,
                    yRight      = rightFeat.offset().top    - yOffset + scrollOffsetRight;

                var leftPoint   = {x: xLeft*widthRelation,  y: yLeft*heightRelLeft},
                    rightPoint  = {x: xRight*widthRelation, y: yRight*heightRelRight};

                MyApp.Canvas.connectPoints(leftPoint, rightPoint, leftFeat, rightFeat, color);
            });
        });
    };



    /**
     * Returns random hex color
     * @returns {string}
     */
    Canvas.newColor = function() {
        // from http://www.paulirish.com/2009/random-hex-color-code-snippets/ @11.01.2015
        return '#'+ ('000000' + Math.floor(Math.random()*16777215).toString(16) ).slice(-6);
    };



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

        // 2 rectangles
        var width   = this.width/ 2,
            rl      = this.paper.rect(0, 1, width, this.height-1), // border are cut off
            rr      = this.paper.rect(width, 1, width, this.height-1);

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
    Canvas.connectPoints = function(leftPos, rightPos, leftFeat, rightFeat, color) {
        var leftDot     = MyApp.Canvas.drawLeftDot(leftPos);
        var rightDot    = MyApp.Canvas.drawRightDot(rightPos);
        var middleLine  = MyApp.Canvas.drawLine(leftPos, rightPos);
        MyApp.Canvas.setAttributes(leftDot,     leftFeat,   color);
        MyApp.Canvas.setAttributes(rightDot,    rightFeat,  color);
        MyApp.Canvas.setAttributes(middleLine,  null,       color);
    };



    /**
     * draws a point for the left document
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
     * @param feat
     * @param color
     */
    Canvas.setAttributes = function(element, feat, color) {
        element.attr("stroke", color);

        if (feat != null)
            element.attr("cursor", "pointer")
                   .click(function() {feat.trigger('click');});
    };

    return Canvas;
})();


