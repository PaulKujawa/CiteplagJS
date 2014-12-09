var XmlFileHandler = function(folder) {
    this.folder             = folder;
    this.errorDiv           = $('#errorOutput');
    this.compareFilesXML    = {};
    this.collusionParser    = [];
};


XmlFileHandler.prototype.throwErrorMsg = function(content) {
    this.errorDiv
        .append('<span>' +content+ '</span>')
        .removeClass('hidden');
    return false;
};


XmlFileHandler.prototype.loadCollusion = function(filename, callback) {
    $.ajax({
        type: "GET",
        url: this.folder + filename,
        dataType: "xml",

        success: callback,
        error: function(xhr) {
            this.throwErrorMsg( xhr.responseText );
        }
    })
};


XmlFileHandler.prototype.loadCompare = function(i, collusionJSON) {
    var filename = collusionJSON.document[i].src;

    $.ajax({
        type: "GET",
        url: this.folder + filename,
        dataType: "xml",

        success: function(file) {
            var xmlString = (new XMLSerializer()).serializeToString(file),
                startPos  = xmlString.indexOf('<body>')+ 6,
                length    = xmlString.indexOf('</body>') - startPos;

            this.compareFilesXML[i] = xmlString.substr(startPos, length); // overwrites old values as well
            if (i === 0)
                this.loadCompare(i++, collusionJSON);
            else
                this.collusionParser.parseMatches();
        },
        error: function(xhr) {
            this.throwErrorMsg( xhr.responseText );
        }
    });
};


XmlFileHandler.prototype.setCollusionParser = function(collusionParser) {
    this.collusionParser = collusionParser;
};


XmlFileHandler.prototype.getCompareFilesXML = function() {
    return this.compareFilesXML;
};