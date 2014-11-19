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


    getSourceFile = function(i) {
        var doc = collusionJSON.document[i],
            renderArea = $('#renderArea');

        $.ajax({
            type: "GET",
            url: xmlFolder + doc.src,
            dataType: "xml",
            success: function(file) {
                compareFiles[doc.id] = (new XMLSerializer()).serializeToString(file);
                renderArea.append('<div id="'+doc.id+'"></div>')

                if (i === 0) {
                    renderArea.append('<div id="canvas"></div>');
                    getSourceFile(1);
                }
                else {
                    parseFiles();
                    renderArea.append('<div class="clearFloat"></div>');
                }
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
                                $('#'+vDoc.id).append(excerpt);
                            }
                        });
                    }
                });
            });
        });
    };



    readXML = function(content, from, length) {
        from = parseInt(from);
        length = parseInt(length);
        return content.substring(from, from+length);
    };
});
