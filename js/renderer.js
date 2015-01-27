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
    Renderer.usedColors        = [];

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
        $('svg').remove();
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
        var tab = $('<li class="navbar-brand"><a href="#'+patternTitle+'Tab" data-toggle="tab">'+patternTitle+'</a></li>');
        this.patternPanels.append(tab);

        var div = $('<div id="'+patternTitle+'Tab" class="tab-pane"></div>')
            .append('<div class="leftArea">'+leftFileHTML+'</div>')
            .append('<div class="canvas"></div>')
            .append('<div class="rightArea">'+rightFileHTML+'</div>')
            .append('<div class="clearFloat"></div>');
        this.comparisonDiv.append(div);
    };


    /**
     * Setup function
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
                _self.detailsDiv.append('<h3>Match details</h3>' + detail);
            });
        });
    };


    /**
     * activate the first tab as default
     */
    Renderer.activateTab = function() {
        this.patternPanels.find('li:first').addClass('active');
        this.comparisonDiv.find('div:first').addClass('active');
    };

    $(window).resize(function() {
        MyApp.Renderer.drawCanvas();
    });


    /**
     * drawing the canvas, inclusive all points
     * calls Canvas.connect()
     */
    Renderer.drawCanvas = function() {
        var tab = this.comparisonDiv.find('.tab-pane.active'),
            _self               = this,
            connectedClasses    = [],
            color               = MyApp.Renderer.newColor(),
            lastGrp             = -1,
            leftArea            = $(tab).find('.leftArea'),
            canvasDiv           = $(tab).find('.canvas'),
            rightArea           = $(tab).find('.rightArea'),
            yOffset             = leftArea.offset().top,
            xOffset             = leftArea.offset().left;

        // in case of redrawing
        $('svg').remove();
        MyApp.Canvas.drawPaper(canvasDiv);

        // same colors every time
        var colorsCopy = [];
        if (_self.usedColors.length > 0)
            colorsCopy = _self.usedColors.slice();

        // calculate widths & heights
        var canvasHeight        = canvasDiv.height(),
            canvasWidth         = canvasDiv.width(),
            heightRelLeft       = canvasHeight/leftArea[0].scrollHeight,
            heightRelRight      = canvasHeight/rightArea[0].scrollHeight,
            widthRelation       = canvasWidth/(rightArea.offset().left + rightArea.outerWidth()),
            scrollOffsetLeft    = leftArea.scrollTop(),
            scrollOffsetRight   = rightArea.scrollTop();


        $(tab).find(".leftArea [class^='feature']").filter(function() { // all divs with .feature
            var leftFeat = this,
                featClass = leftFeat.className.match(/feature(\d+)_(\d+)/); // feature in grp

            if (featClass == null)
                featClass = leftFeat.className.match(/feature(\d+)/); // feature | group

            // featClass eg ["feautre0_1", "0", "1"]
            if (connectedClasses.indexOf(featClass[0]) == -1) { // first occurrence
                connectedClasses.push(featClass[0]);

                if (featClass[1] != lastGrp) {
                    lastGrp = featClass[1];

                    if (colorsCopy.length > 0)
                        color = colorsCopy.pop();
                    else {
                        color = MyApp.Renderer.newColor();
                        _self.usedColors.push(color);
                    }
                }

                // set position into relation
                var rightFeat   = rightArea.find('.'+featClass[0]+':first'),
                    xLeft       = $(leftFeat).offset().left - xOffset,
                    yLeft       = $(leftFeat).offset().top - yOffset + scrollOffsetLeft,
                    xRight      = rightFeat.offset().left - xOffset,
                    yRight      = rightFeat.offset().top - yOffset + scrollOffsetRight;

                var leftPoint   = {x: xLeft*widthRelation, y: yLeft*heightRelLeft},
                    rightPoint  = {x: xRight*widthRelation, y: yRight*heightRelRight};

                MyApp.Canvas.connect(leftPoint, rightPoint, featClass[0], color);
            }
        });
    };


    /**
     * Returns "random" color
     * @returns {string}
     */
    Renderer.newColor = function() {
        // from http://www.paulirish.com/2009/random-hex-color-code-snippets/ @11.01.2015
        return '#'+Math.floor(Math.random()*16777215).toString(16);
    };



    /**
     * scrolls clicked features into top of scrollable view and highlight them
     * gets called after click events, eg. from Canvas.drawLeftDot()
     * @param featClass
     */
    Renderer.scrollIntoView = function(featClass) {
        var tab                 = this.comparisonDiv.find('.tab-pane.active'),
            leftArea            = $(tab).find('.leftArea'),
            rightArea           = $(tab).find('.rightArea'),
            yOffset             = leftArea.offset().top;

        $.each([leftArea, rightArea], function(i, area) { // left & right
            var feature     = area.find('.'+featClass+":first"),
                lineHeight  = parseFloat(feature.css('line-height')),
                pos         = feature.offset().top - yOffset + area.scrollTop();

            if (pos >= lineHeight)
                pos -= lineHeight; // to show previous line as well for context

            area.animate({scrollTop: pos}, 'slow')
                    .find("."+featClass).addClass('alert alert-info');
        });

        setTimeout(function() {
            leftArea.find("."+featClass).removeClass('alert alert-info');
            rightArea.find("."+featClass).removeClass('alert alert-info');
        }, 5000);

    };

    return Renderer;
})();