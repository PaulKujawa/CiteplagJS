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
     * todo I'm working on
     */
    Renderer.drawCanvas = function() {
        var tab = this.comparisonDiv.find('.tab-pane.active'),
            connectedClasses    = [],
            leftArea            = $(tab).find('.leftArea'),
            canvasDiv           = $(tab).find('.canvas'),
            rightArea           = $(tab).find('.rightArea'),
            heightOffset        = leftArea.offset().top;

        $('svg').remove();
        MyApp.Canvas.drawPaper(canvasDiv);


        // heights & y-positions
        var divHeight           = leftArea.height(),
            heightRelLeft       = divHeight/leftArea[0].scrollHeight,
            heightRelRight      = divHeight/rightArea[0].scrollHeight,
            heightOffsetLeft    = leftArea.scrollTop(),
            heightOffsetRight   = rightArea.scrollTop();


        $(tab).find(".leftArea [class^='feature']").filter(function() { // all divs with .feature

            // looks for .featureX_Y or .featureX
            var featClass = this.className.match(/feature(\d+)_(\d+)/); // feature in grp
            if (featClass == null) featClass = this.className.match(/feature(\d+)/); // feature alone
            featClass = featClass[0]; // featureX

            if (connectedClasses.indexOf(featClass) == -1) { // first appearance so original OT
                connectedClasses.push(featClass);

                var rightDiv = rightArea.find('.'+featClass+':first'),
                yLeft   =  $(this).offset().top - heightOffset + heightOffsetLeft,
                yRight  = rightDiv.offset().top - heightOffset + heightOffsetRight;

                MyApp.Canvas.connect(yLeft*heightRelLeft, yRight*heightRelRight);
            }
        });
    };

    return Renderer;
})();