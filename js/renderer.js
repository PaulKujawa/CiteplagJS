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
    Renderer.resetMarkup = function() {
        this.pageDescription.hide(1000, function() {
            this.remove();
        });

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
        var tab = this.comparisonDiv.find('.active'),
            connectedClasses    = [],
            leftArea            = $(tab).find('.leftArea'),
            canvasDiv           = $(tab).find('.canvas'),
            rightArea           = $(tab).find('.rightArea'),
            height              = leftArea.height(),
            yLeftRelation       = height/leftArea[0].scrollHeight,
            yRightRelation      = height/rightArea[0].scrollHeight,
            top                 = canvasDiv.offset().top;

        MyApp.Canvas.drawPaper(canvasDiv);

        $(tab).find(".leftArea [class^='feature']").filter(function() {
            var classi = this.className.match(/feature(\d+)_(\d+)/)[0];

            if (connectedClasses.indexOf(classi) == -1) { // original opening tag, no connecting tag
                connectedClasses.push(classi);
                var yLeft   = $(this).offset().top - top,
                yRight  = $(tab).find('.rightArea .'+classi+':first').offset().top - top;

                MyApp.Canvas.connect(yLeft*yLeftRelation, yRight*yRightRelation);
            }
        });

    };

    return Renderer;
})();