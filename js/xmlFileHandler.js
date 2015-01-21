/**
 * responsible for file uploads, both collusion and comparison files
 */
MyApp.XMLFileHandler = (function() {
    XMLFileHandler["folder"]          = "./xmlFiles/";
    XMLFileHandler["compareFilesXML"] = {};

    /**
     *
     * @constructor
     */
    function XMLFileHandler() {}


    /**
     * loads collusion file via AJAX and converts from XML into JSON
     * calls loadCompare(0) or Renderer.throwErrorMsg() on error
     * @param filename
     */
    XMLFileHandler.loadCollusion = function(filename) {
        var _self = this;

        if (filename.split(".").pop() != "xml")
            return MyApp.Renderer.throwErrorMsg( "Wrong file type. Please choose a xml file." );

        $.ajax({
            type: "GET",
            url: _self.folder + filename,
            dataType: "xml",

            success: function(file) {
                MyApp.CollusionParser['collusionJSON'] = $.xml2json(file);
                _self.loadCompare(0);
            },
            error: function(xhr) {
                MyApp.Renderer.throwErrorMsg( xhr.responseText );
            }
        })
    };


    /**
     * loads body-parts, of source and suspicious file (recursive), and saves them as xml-strings
     * calls CollusionParser.parseMatches()
     * @param i
     */
    XMLFileHandler.loadCompare = function(i) {
        var filename = MyApp.CollusionParser['collusionJSON'].document[i].src,
            _self = this;

        if (filename === undefined)
            return MyApp.Renderer.throwErrorMsg( "No comparison files in your Collusion.xml given." );

        $.ajax({
            type: "GET",
            url: _self.folder + filename,
            dataType: "xml",

            success: function(file) {
                var xmlString = (new XMLSerializer()).serializeToString(file),
                    startPos  = xmlString.indexOf('<body>')+ 6,
                    length    = xmlString.indexOf('</body>') - startPos;

                if (startPos == -1 || length < 0)
                    return MyApp.Renderer.throwErrorMsg( "Compare files must have body tags." );

                _self.compareFilesXML[i] = xmlString.substr(startPos, length); // overwrites old values as well
                if (i == 0)
                    _self.loadCompare(1);
                else
                    MyApp.CollusionParser.parseMatches();
                return true;
            },
            error: function(xhr) {
                MyApp.Renderer.throwErrorMsg( xhr.responseText );
            }
        });
    };

    return XMLFileHandler;
})();