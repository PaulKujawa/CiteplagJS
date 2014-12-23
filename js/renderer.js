/**
 * responsible for any html output
 */
MyApp.Renderer = (function() {
    Renderer.patternPanels     = $('#patternPanels');
    Renderer.comparisonDiv     = $('#comparison');
    Renderer.errorDiv          = $('#errorOutput');
    Renderer.section           = $('section');
    Renderer.detailsDiv        = $('aside');
    Renderer.pageDescription   = $('#pagedescription');
    Renderer.fileUpload        = $('#fileUpload');

    /**
     *
     * @constructor
     */
    function Renderer() {}


    /**
     * resets html markup
     */
    Renderer.resetForNewFile = function() {
        this.patternPanels.empty();
        this.comparisonDiv.empty();
        this.errorDiv.empty().addClass('hidden');
        this.fileUpload.addClass('hidden');
    };


    /**
     * displays error message
     * @param content
     * @returns {boolean}
     */
    Renderer.throwErrorMsg = function(content) {
        this.errorDiv
            .append('<span>' +content+ '</span>')
            .removeClass('hidden');
        return false;
    };


    /**
     * creates a tab for a matchType
     * @param patternTitle
     * @param leftFileHTML
     * @param rightFileHTML
     */
    Renderer.createTab = function(patternTitle, leftFileHTML, rightFileHTML) {
        var tab = $('<li><a href="#'+patternTitle+'Tab" data-toggle="tab">'+patternTitle+'</a></li>');
        this.patternPanels.append(tab);

        var div = $('<div id="'+patternTitle+'Tab" class="tab-pane"></div>')
            .append('<div class="leftArea">'+leftFileHTML+'</div>')
            .append('<div class="canvas"></div>')
            .append('<div class="rightArea">'+rightFileHTML+'</div>')
            .append('<div class="clearFloat"></div>');
        this.comparisonDiv.append(div);
    };


    /**
     * todo needs to be changed
     */
    Renderer.setUp = function() {
        MyApp.Renderer.handleDetails();
        MyApp.Renderer.activateTab();
        MyApp.Renderer.drawCanvas();
    };


    /**
     * attaches click listener to feature divs to display their details
     */
    Renderer.handleDetails = function() {
        var featDetails = MyApp.ComparisonParser.featDetails,
            _self = this;

        _self.patternPanels.click(function() {
            _self.detailsDiv.empty();
        });

        $.each(featDetails, function(theClass, detail) {
            $("."+theClass).click(function() {
                _self.detailsDiv.empty();
                _self.detailsDiv.append('<h3>Feature details</h3>' + detail);
            });
        });
    };


    /**
     * activate the first tab as default
     * todo could be inserted somewhere else
     */
    Renderer.activateTab = function() {
        this.patternPanels.find('li:first').addClass('active');
        this.comparisonDiv.find('div:first').addClass('active');
    };


    /**
     * drawing the canvas, inclusive all points
     * calls Canvas.connect()
     */
    Renderer.drawCanvas = function() {
        var tab = this.comparisonDiv.find('.tab-pane.active'),
            connectedClasses    = [],
            leftArea            = $(tab).find('.leftArea'),
            canvasDiv           = $(tab).find('.canvas'),
            rightArea           = $(tab).find('.rightArea'),
            yOffset             = leftArea.offset().top,
            xOffset             = leftArea.offset().left;

        $('svg').remove();
        MyApp.Canvas.drawPaper(canvasDiv);

        // calculate widths & heights
        var canvasHeight        = canvasDiv.height(),
            canvasWidth         = canvasDiv.width(),
            heightRelLeft       = canvasHeight/leftArea[0].scrollHeight,
            heightRelRight      = canvasHeight/rightArea[0].scrollHeight,
            widthRelation       = canvasWidth/(rightArea.offset().left + rightArea.outerWidth()),
            scrollOffsetLeft    = leftArea.scrollTop(),
            scrollOffsetRight   = rightArea.scrollTop();


        $(tab).find(".leftArea [class^='feature']").filter(function() { // all divs with .feature
            var leftFeat = this;

            // looks for .featureX_Y or .featureX
            var featClass = leftFeat.className.match(/feature(\d+)_(\d+)/); // feature in grp
            if (featClass == null) featClass = leftFeat.className.match(/feature(\d+)/); // feature alone
            featClass = featClass[0]; // featureX

            // first appearance so original OT
            if (connectedClasses.indexOf(featClass) == -1) {
                connectedClasses.push(featClass);

                // set position into relation
                var rightFeat = rightArea.find('.'+featClass+':first'),
                    xLeft   = $(leftFeat).offset().left - xOffset,
                    yLeft   = $(leftFeat).offset().top - yOffset + scrollOffsetLeft,
                    xRight  = rightFeat.offset().left - xOffset,
                    yRight  = rightFeat.offset().top - yOffset + scrollOffsetRight;

                var leftPoint   = {x: xLeft*widthRelation, y: yLeft*heightRelLeft},
                    rightPoint  = {x: xRight*widthRelation, y: yRight*heightRelRight};

                MyApp.Canvas.connect(leftPoint, rightPoint);
            }
        });
    };

    return Renderer;
})();