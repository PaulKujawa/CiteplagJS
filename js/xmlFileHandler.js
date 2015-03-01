/**
 * responsible for file uploads, both findings and comparison files
 * @author Paul Kujawa p.kujawa@gmx.net
 */
MyApp.XMLFileHandler = (function() {
    XMLFileHandler.folder          = "";
    XMLFileHandler.compareFilesXML = {};

    /**
     *
     * @constructor
     */
    function XMLFileHandler() {}



    /**
     * loads finding file via AJAX and converts from XML into JSON
     * @param folder
     * @param filename
     */
    XMLFileHandler.loadFinding = function(folder, filename) {
        var _self = this;
        _self.folder = folder;

        if (filename.split(".").pop() != "xml")
            return MyApp.TextAreas.throwErrorMsg( "Wrong file type. Please choose a xml file." );

        $.ajax({
            type: "GET",
            url: _self.folder + filename,
            dataType: "xml",

            success: function(file) {
                MyApp.FindingsParser['findingsJSON'] = $.xml2json(file);
                _self.loadCompare(0);
            },
            error: function(xhr) {
                return MyApp.TextAreas.throwErrorMsg( xhr.responseText );
            }
        })
        return true;
    };



    /**
     * loads body-parts, of source and suspicious file (recursive), and saves them as xml-strings
     * @param i
     */
    XMLFileHandler.loadCompare = function(i) {
        var filename = MyApp.FindingsParser['findingsJSON'].document[i].src,
            _self = this;

        if (filename === undefined)
            return MyApp.TextAreas.throwErrorMsg( "Not two comparison files in your Findings file given." );

        $.ajax({
            type: "GET",
            url: _self.folder + filename,
            dataType: "html",

            success: function(xmlString) {
                var startPos    = xmlString.indexOf('<body>') + 6,
                    length      = xmlString.indexOf('</body>');

                if (startPos == 5)  { // no <body> tag
                    startPos = 0;
                    length = xmlString.length;
                }
                length -= startPos;

                _self.compareFilesXML[i] = xmlString.substr(startPos, length); // overwrites old values as well
                if (i == 0)
                    _self.loadCompare(1);
                else
                    MyApp.FindingsParser.parseMatches();
                return true;
            },
            error: function(xhr) {
                MyApp.TextAreas.throwErrorMsg( xhr.responseText );
            }
        });
        return true;
    };

    return XMLFileHandler;
})();