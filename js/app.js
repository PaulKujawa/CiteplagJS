$(function() {
    $('#collusionFileInput').change(function() {
        var filename = $(this).val(),
            callback = function(file) {
                var collusionJSON = $.xml2json(file);
                collusionParser.setJSON(collusionJSON);
                fileHandler.loadCompare(0, collusionJSON);
            };

        var fileHandler      = new XmlFileHandler("./xmlFiles/"),
            collusionParser  = new CollusionParser(),
            comparisonParser = new ComparisonParser(),
            renderer         = new Renderer();

        renderer.resetMarkup();

        // todo seems wrong way
        collusionParser.setComparisonParser(comparisonParser);
        collusionParser.setRenderer(renderer);
        comparisonParser.setFileHandler(fileHandler);
        renderer.setComparisonParser(comparisonParser);
        fileHandler.setCollusionParser(collusionParser);
        fileHandler.loadCollusion(filename, callback);
    });
});