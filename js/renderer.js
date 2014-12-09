var Renderer = function() {
    this.comparisonParser= [];
    this.patternPanels   = $('#patternPanels');
    this.renderDiv       = $('#renderDiv');
    this.errorDiv        = $('#errorOutput');
    this.section         = $('section');
    this.detailsDiv      = $('aside');
};

Renderer.prototype.resetMarkup = function() {
    this.patternPanels.empty();
    this.renderDiv.empty();
    this.errorDiv.empty().addClass('hidden');
};


Renderer.prototype.createTab = function(patternTitle, leftFileHTML, rightFileHTML) {
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


Renderer.prototype.attachDetailsDiv = function() {
    var featDetails = this.comparisonParser.getFeatDetails();
    $.each(featDetails, function(theClass, details) {
        var content = "";
        $.each(details, function(i, div) {
            content +=  div; // todo check for duplicate details
        });

        theClass = "."+theClass;
        $(theClass).mouseenter(function() {
            this.section.addClass('col-md-9');
            this.detailsDiv.removeClass('hidden');
            this.detailsDiv.append('<h3>Feature details</h3>' + content);
        });

        $(theClass).mouseleave(function() {
            this.detailsDiv.empty();
        });
    });
};


Renderer.prototype.activateTab = function() {
    this.patternPanels.find('li:first').addClass('active');
    this.renderDiv.find('div:first').addClass('active');
}


Renderer.prototype.setComparisonParser = function(parser) {
    this.comparisonParser = parser;
}
