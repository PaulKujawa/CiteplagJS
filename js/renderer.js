MyApp.Renderer = (function() {
    Renderer.patternPanels     = $('#patternPanels');
    Renderer.renderDiv         = $('#renderDiv');
    Renderer.errorDiv          = $('#errorOutput');
    Renderer.section           = $('section');
    Renderer.detailsDiv        = $('aside');


    function Renderer() {}

    Renderer.resetMarkup = function() {
        this.patternPanels.empty();
        this.renderDiv.empty();
        this.errorDiv.empty().addClass('hidden');
    };


    Renderer.createTab = function(patternTitle, leftFileHTML, rightFileHTML) {
        var tab = $(
            '<li>' +
                '<a href="#'+patternTitle+'Tab" data-toggle="tab">'+patternTitle+'</a>' +
            '</li>'
        );
        this.patternPanels.append(tab);

        var div = $('<div id="'+patternTitle+'Tab" class="tab-pane"></div>')
            .append('<div class="leftArea">'+leftFileHTML+'</div>')
            .append('<div class="canvas"></div>')
            .append('<div class="rightArea">'+rightFileHTML+'</div>')
            .append('<div class="clearFloat"></div>');
        this.renderDiv.append(div);
    };


    Renderer.attachDetailsDiv = function() {
        var featDetails = MyApp.ComparisonParser.featDetails,
            _self = this;

        $.each(featDetails, function(theClass, detail) {
            theClass = "."+theClass;

            $(theClass).mouseenter(function() {
                _self.section.addClass('col-md-9');
                _self.detailsDiv.removeClass('hidden');
                _self.detailsDiv.append('<h3>Feature details</h3>' + detail);
            });

            $(theClass).mouseleave(function() {
                _self.detailsDiv.empty();
            });
        });
    };


    Renderer.activateTab = function() {
        this.patternPanels.find('li:first').addClass('active');
        this.renderDiv.find('div:first').addClass('active');
    };

    return Renderer;
})();