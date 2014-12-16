MyApp.Renderer = (function() {
    Renderer.patternPanels  = $('#patternPanels');
    Renderer.section        = $('section');
    Renderer.renderDiv      = $('#renderDiv');
    Renderer.errorDiv       = $('#errorOutput');
    Renderer.detailsDiv     = $('aside');

    function Renderer() {}

    Renderer.resetMarkup = function() {
        this.patternPanels.empty();
        this.renderDiv.empty();
        this.errorDiv.empty().addClass('hidden');
    };


    Renderer.createTab = function(patternTitle, leftFileHTML, rightFileHTML) {
        var tab = $('<li><a href="#'+patternTitle+'Tab" data-toggle="tab">'+patternTitle+'</a></li>');
        this.patternPanels.append(tab);

        var div = $('<div id="'+patternTitle+'Tab" class="tab-pane"></div>')
            .append('<div class="leftArea">'+leftFileHTML+'</div>')
            .append('<div class="canvas"></div>')
            .append('<div class="rightArea">'+rightFileHTML+'</div>')
            .append('<div class="clearFloat"></div>');
        this.renderDiv.append(div);
    };


    Renderer.setUp = function() {
        MyApp.Renderer.attachDetails();
        MyApp.Renderer.activateTab();
        MyApp.Renderer.drawCanvas();
    };


    Renderer.attachDetails = function() {
        var featDetails = MyApp.ComparisonParser.featDetails,
            _self = this;

        $.each(featDetails, function(theClass, detail) {
            theClass = "."+theClass;

            $(theClass).mouseenter(function() {
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


    Renderer.drawCanvas = function() {
        var tabs = this.renderDiv.children();

        $.each(tabs, function(i, tab) {
            var connectedClasses = [],
                canvasDiv = $(tab).find('.canvas');

            MyApp.Raphael.paper = Raphael(canvasDiv.offset().left, canvasDiv.offset().top, 271, 500);
            var canvasOffset = $('svg').offset().top;

            $(tab).find(".leftArea [class^='feature']").filter(function() {
                var classi = this.className.match(/feature(\d+)_(\d+)/)[0];
                if (connectedClasses.indexOf(classi) == -1) { // original opening tag, no connecting tag
                    connectedClasses.push(classi);
                    var yLeft   = $(this).offset().top - canvasOffset,
                        yRight  = $(tab).find('.rightArea .'+classi+':first').offset().top - canvasOffset;

                    MyApp.Raphael.connect(yLeft, yRight)
                }
            });

            console.log(connectedClasses);
            return false;
        });
    };

    return Renderer;
})();