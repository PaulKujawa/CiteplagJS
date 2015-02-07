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
    Renderer.featToConnect      = {};


    /**
     *
     * @constructor
     */
    function Renderer() {}



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
    Renderer.attachDetails = function() {
        var tab         = this.comparisonDiv.find('.tab-pane.active'),
            _self       = this;

        $(tab).find(".feature, .group, :not(.leftArea, .rightArea)").filter(function() { // no subfeats
            // get all groupX & featureX classes
            var featDiv         = this,
                detailString    = "",
                classList       = featDiv.classList.toString(),
                groupClasses    = classList.match(/group(\d+)/g),
                featClasses     = classList.match(/feature(\d+)/g);

            if (groupClasses != null)   detailString = MyApp.Renderer.getDetail(groupClasses, detailString);
            if (featClasses  != null)   detailString = MyApp.Renderer.getDetail(featClasses, detailString);

            $(featDiv)
                .css('cursor', 'pointer')
                .click(function() {
                    _self.detailsDiv.empty();
                    _self.detailsDiv.append(detailString);
                });
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
     * Makes feature tags highlighted after clicks & scroll to them
     */
    Renderer.handleConnections = function() {
        var tab = this.comparisonDiv.find('.tab-pane.active');

        $(tab).find(".leftArea .feature, .rightArea .feature").filter(function() {
            var featDiv     = this,
                classList   = featDiv.classList.toString();

            // make all featureX & featureX_Y animated
            var subFeatClasses = classList.match(/feature(\d+)_(\d+)/g); // todo attach features with comma, if != null
            if (subFeatClasses != null) {
                var connections;
                if ($(featDiv).parents('.leftArea').length > 0)
                        connections = MyApp.Renderer.getConnections(subFeatClasses, 'l');
                else    connections = MyApp.Renderer.getConnections(subFeatClasses, 'r');

                $(featDiv).click(function() {MyApp.Renderer.highlightConnection(connections)})
                          .css( 'cursor', 'pointer' );
            }
        });
    };



    /**
     * Returns array with connected classes
     * @param subFeatClasses
     * @param side
     * @returns {*}
     */
    Renderer.getConnections = function(subFeatClasses, side) {
        var _self       = this,
            connections = [];
        // featToConnect[leftClass] = rightClass

        if (side === 'l') {
            $.each(subFeatClasses, function(i, leftClass) {
                if ( _self.featToConnect.hasOwnProperty(leftClass)) {
                    var connection = {leftClass: leftClass, rightClass: _self.featToConnect[leftClass]};
                    connections.push(connection);
                }
            });

        } else if (side === 'r') {
            $.each(subFeatClasses, function(i, rightClass) {
                for (var leftClass in _self.featToConnect) {
                    if (_self.featToConnect.hasOwnProperty(leftClass) && _self.featToConnect[leftClass] == rightClass) {
                        var connection = {leftClass: leftClass, rightClass: rightClass};
                        connections.push(connection);
                    }
                }
            });
        }

        return connections;
    };


    /**
     * Gets all connected classes of one feat-tag to highlight them and scroll them serially into view
     * @param connections
     */
    Renderer.highlightConnection = function(connections) {
        var _self       = this,
            tab         = this.comparisonDiv.find('.tab-pane.active'),
            allDivs     = tab.find('.leftArea *, .rightArea *');

        allDivs.removeClass('alert alert-info'); // incl. feat highlighted for match details

        $.each(connections, function(i, connection) {
            var leftClass    = '.leftArea  .'+connection['leftClass'],
                rightClass   = '.rightArea .'+connection['rightClass'];

            tab.find(leftClass+','+rightClass).addClass('alert alert-info');
            MyApp.Renderer.scrollToFeature( tab.find(leftClass).first() );
            MyApp.Renderer.scrollToFeature( tab.find(rightClass).first() );
        });

        allDivs.one("mouseup", function() {
            allDivs.removeClass('alert alert-info'); // incl. feat highlighted for match details
            _self.detailsDiv.empty();
        });
    };



    /**
     * Scrolls one side to feature-div
     * @param feature
     */
    Renderer.scrollToFeature = function(feature) {
        var lineHeight  = parseFloat(feature.css('line-height')),
            area        = feature.closest('.leftArea, .rightArea'),
            relFeatPos  = feature.offset().top - area.offset().top + area.scrollTop();

        if (relFeatPos >= lineHeight)
            relFeatPos -= lineHeight; // to show previous line as well for context

        area.animate({scrollTop: relFeatPos}, 1500);
    };


    return Renderer;
})();
