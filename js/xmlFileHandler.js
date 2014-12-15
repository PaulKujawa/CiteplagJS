MyApp.XMLFileHandler = (function() {
    XMLFileHandler["folder"]          = "./xmlFiles/";
    XMLFileHandler["errorDiv"]        = $('#errorOutput');
    XMLFileHandler["compareFilesXML"] = {};

    function XMLFileHandler() {}

    XMLFileHandler.throwErrorMsg = function(content) {
        this.errorDiv
            .append('<span>' +content+ '</span>')
            .removeClass('hidden');
        return false;
    };


    XMLFileHandler.loadCollusion = function(filename, callback) {
        var _self = this;

        $.ajax({
            type: "GET",
            url: _self.folder + filename,
            dataType: "xml",

            success: callback,
            error: function(xhr) {
                _self.throwErrorMsg( xhr.responseText );
            }
        })
    };


    XMLFileHandler.loadCompare = function(i) {
        var filename = MyApp.CollusionParser['collusionJSON'].document[i].src,
            _self = this;

        $.ajax({
            type: "GET",
            url: _self.folder + filename,
            dataType: "xml",

            success: function(file) {
                var xmlString = (new XMLSerializer()).serializeToString(file),
                    startPos  = xmlString.indexOf('<body>')+ 6,
                    length    = xmlString.indexOf('</body>') - startPos;

                this.compareFilesXML[i] = xmlString.substr(startPos, length); // overwrites old values as well
                if (i === 0)
                    _self.loadCompare(i++);
                else
                    MyApp.CollusionParser.parseMatches();
            },
            error: function(xhr) {
                _self.throwErrorMsg( xhr.responseText );
            }
        });
    };

    return XMLFileHandler;
})();