/**
 * responsible for any html output
 */
MyApp.Renderer = (function() {
    Renderer.patternPanels      = $('#patternPanels');
    Renderer.comparisonDiv      = $('#comparison');
    Renderer.errorDiv           = $('#errorOutput');
    Renderer.section            = $('section');
    Renderer.detailsDiv         = $('aside');
    Renderer.pageDescription    = $('#pagedescription');
    Renderer.fileUpload         = $('#fileUpload');
    Renderer.usedColors         = [];
    Renderer.featToConnect      = {};

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
        this.detailsDiv.empty();
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
     * attaches click listener to feature divs to display their details
     */
    Renderer.handleDetails = function() {
        var tab         = this.comparisonDiv.find('.tab-pane.active'),
            leftArea    = $(tab).find('.leftArea'),
            _self       = this;

        $(tab).find(".feature, .group, :not(.leftArea, .rightArea)").filter(function() { // no subfeats
            // all get groupX & featureX classes
            var featDiv         = this,
                detailString    = "",
                classList       = featDiv.classList.toString(),
                groupClasses    = classList.match(/group(\d+)/g),
                featClasses     = classList.match(/feature(\d+)/g);

            if (groupClasses != null)   detailString = MyApp.Renderer.getDetail(groupClasses, detailString);
            if (featClasses  != null)   detailString = MyApp.Renderer.getDetail(featClasses, detailString);

            $(featDiv)
                .click(function() {
                    _self.detailsDiv.empty();
                    _self.detailsDiv.append(detailString);
                })
                .css( 'cursor', 'pointer' );
        });
    };


    /**
     * Get match detail for given class
     * @param classList
     * @param details
     * @returns {*}
     */
    Renderer.getDetail = function(classList, details) {
        $.each(classList, function(i, classi) {
            if ( MyApp.CollusionParser.featDetails.hasOwnProperty(classi))
                details += '<h3>Match detail ' +classi+ '</h3>' + MyApp.CollusionParser.featDetails[classi];
        });
        return details;
    };

    /**
     * activate the first tab as default
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
        var _self               = this,
            lastGrpNr           = -1,
            color               = MyApp.Renderer.newColor(),
            tab                 = _self.comparisonDiv.find('.tab-pane.active'),
            leftArea            = $(tab).find('.leftArea'),
            canvasDiv           = $(tab).find('.canvas'),
            rightArea           = $(tab).find('.rightArea'),
            yOffset             = leftArea.offset().top,
            xOffset             = leftArea.offset().left,
            heightRelLeft       = canvasDiv.height()/leftArea[0].scrollHeight,
            heightRelRight      = canvasDiv.height()/rightArea[0].scrollHeight,
            widthRelation       = canvasDiv.width()/(rightArea.offset().left + rightArea.outerWidth()),
            scrollOffsetLeft    = leftArea.scrollTop(),
            scrollOffsetRight   = rightArea.scrollTop();

        // setup (redraw as well)
        $('svg').remove();
        MyApp.Canvas.drawPaper(canvasDiv);
        var colorsCopy = [];
        if (_self.usedColors.length > 0)
            colorsCopy = _self.usedColors.slice();


        $.each(_self.featToConnect, function(leftClass, rightClass) { // one match each
            // same color for features within same group
            var                 group = leftClass.match(/feature(\d+)_(\d+)/);  // 0=featureX_Y, 1=X, 2=Y
            if (group == null)  group = leftClass.match(/feature(\d+)/);        // 0=featureX,   1=X


            if (group[1] != lastGrpNr) {
                lastGrpNr = group[1];
                if (colorsCopy.length > 0)
                    color = colorsCopy.pop();
                else {
                    color = MyApp.Renderer.newColor();
                    _self.usedColors.push(color);
                }
            }

            // set position into relation
            var leftFeat    = leftArea.find("." +leftClass).first(),
                rightFeat   = rightArea.find('.'+rightClass).first(),
                xLeft       = $(leftFeat).offset().left - xOffset,
                yLeft       = $(leftFeat).offset().top  - yOffset + scrollOffsetLeft,
                xRight      = rightFeat.offset().left   - xOffset,
                yRight      = rightFeat.offset().top    - yOffset + scrollOffsetRight;

            var leftPoint   = {x: xLeft*widthRelation,  y: yLeft*heightRelLeft},
                rightPoint  = {x: xRight*widthRelation, y: yRight*heightRelRight};

            // add scrollMethod to features themselves
            leftFeat.click(function() {MyApp.Renderer.scrollIntoView(leftFeat, rightFeat)});
            rightFeat.click(function() {MyApp.Renderer.scrollIntoView(leftFeat, rightFeat)});
            MyApp.Canvas.connect(leftPoint, rightPoint, leftFeat, rightFeat, color);

            leftFeat.css( 'cursor', 'pointer' );
            rightFeat.css( 'cursor', 'pointer' );
        });
    };


    /**
     * Returns "random" color
     * @returns {string}
     */
    Renderer.newColor = function() {
        // from http://www.paulirish.com/2009/random-hex-color-code-snippets/ @11.01.2015
        return '#'+ ('000000' + Math.floor(Math.random()*16777215).toString(16) ).slice(-6);
    };



    /**
     * scrolls clicked features into top of scrollable view and highlight them
     * gets called after click events, eg. from Canvas.drawLeftDot()
     * @paramLeftClass
     * @paramRightClass
     */
    Renderer.scrollIntoView = function(leftFeat, rightFeat) {
        var _self       = this,
            tab         = this.comparisonDiv.find('.tab-pane.active');

        tab.find('.leftArea *, .rightArea *').removeClass('alert alert-info'); // incl. feat highlighted for match details

        MyApp.Renderer.scrollToClass(leftFeat);
        MyApp.Renderer.scrollToClass(rightFeat);

        tab.find('.leftArea *, .rightArea *').one("mouseup", function() {
            tab.find('.leftArea *, .rightArea *').removeClass('alert alert-info'); // incl. feat highlighted for match details
            _self.detailsDiv.empty();
        });
    };


    /**
     * Scrolls one side to feature-div
     * @param feature
     */
    Renderer.scrollToClass = function(feature) {
        var lineHeight  = parseFloat(feature.css('line-height')),
            area        = feature.closest('.leftArea, .rightArea'),
            relFeatPos  = feature.offset().top - area.offset().top + area.scrollTop();

        if (relFeatPos >= lineHeight)
            relFeatPos -= lineHeight; // to show previous line as well for context

        area.animate(
            {scrollTop: relFeatPos},
            'slow'
        );
        feature.addClass('alert alert-info');
    };


    return Renderer;
})();
