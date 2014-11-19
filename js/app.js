$(function() {
    const xmlFolder = "xmlFiles/";
    var collusionJSON, compareFiles = new Object(),
        getSourceFile, parseFiles, getXMLFile, readXML;

    $('#collusionFileInput').change(function() {
        var filename = $(this).val();
        getXMLFile(filename, function(file) {
            collusionJSON = $.xml2json(file);
            getSourceFile(0);
        });
    });

    getSourceFile = function(i) {
        var doc = collusionJSON.document[i];

        $.ajax({
            type: "GET",
            url: xmlFolder + doc.src,
            dataType: "xml",
            success: function(file) {
                compareFiles[doc.id] = (new XMLSerializer()).serializeToString(file);
                if (i === 0)
                    getSourceFile(1);
                else
                    parseFiles();
            },
            error: function(xhr, textStatus, error) {
                console.log( [textStatus, xhr.responseText].join(':') );
            }
        });
    };


    parseFiles = function() {
        var matches = collusionJSON.alignments; // just one match
        if (collusionJSON.alignments.match.ref === undefined)
            matches = collusionJSON.alignments.match; // matches

        $.each(matches, function(i, vMatch) {
            if (vMatch.detail !== undefined) {/*todo*/}
            $.each(vMatch.ref, function(j, vRef) {
                $.each(collusionJSON.document, function(k, vDoc) {
                    if (vDoc.id === vRef.document) {
                        $.each(vDoc.feature, function(h, vFeat) {
                            if (vFeat.id === vRef.feature) {
                                var content = compareFiles[vDoc.id];
                                var excerpt = readXML(content, vFeat.start, vFeat.length);
                                $('#suspiciousFileArea').append(excerpt);
                            }
                        });
                    }
                });
            });
        });
    };


    getXMLFile = function(filename, callback) {
        $.ajax({
            type: "GET",
            url: xmlFolder + filename,
            dataType: "xml",
            success: callback,
            error: function(xhr, textStatus, error) {
                console.log( [textStatus, xhr.responseText].join(':') );
            }
        })
    };

    readXML = function(content, from, length) {
        from = parseInt(from);
        length = parseInt(length);
        return content.substring(from, from+length);
    };
});
