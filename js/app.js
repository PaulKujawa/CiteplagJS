$(function() {
    const xmlFolder = "xmlFiles/";

    var getXMLFile = function(filename) {
        $.ajax({
            type: "GET",
            url: xmlFolder + filename,
            dataType: "xml",
            success: function(file) {
                return file;
            },
            error: function(xhr, textStatus, error) {
                console.log( [textStatus, xhr.responseText].join(':') );
            }
        })
    };


    var getCompareFiles = function(parsedJSON) {
        var xmlFiles = {};
        $.each(parsedJSON.document, function(i, doc) {
            var file    = getXMLFile(doc.src),
                content = (new XMLSerializer()).serializeToString(xmlFolder+file);
            xmlFiles.push(doc.id, content);
        });
        return xmlFiles;
    };


    var readXML = function(content, from, length) {
        from = parseInt(from);
        length = parseInt(length);
        return content.substring(from, from+length);
    };


    $('#collusionFileInput').change(function() {
        var filename    = $(this).val(),
            xmlFile     = getXMLFile(filename),
            parsedJSON  = $.xml2json(xmlFile),
            compFiles   = getCompareFiles(parsedJSON),
            matches     = parsedJSON.alignments; // just one match

        if (parsedJSON.alignments.match.ref === undefined)
            matches = parsedJSON.alignments.match; // matches

        $.each(matches, function(i, vMatch) {
            if (vMatch.detail !== undefined) {/*todo*/}
            $.each(vMatch.ref, function(j, vRef) {
                $.each(parsedJSON.document, function(k, vDoc) {
                    if (vDoc.id === vRef.document) {
                        $.each(vDoc.feature, function(h, vFeat) {
                            if (vFeat.id === vRef.feature) {
                                var content = compFiles[doc.id];
                                var excerpt = readXML(content, vFeat.start, vFeat.length);
                                $('#suspiciousFileArea').append(excerpt);
                            }
                        });
                    }
                });
            });
        });
    });
});
