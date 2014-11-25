$(function() {
    const   xmlFolder       =   "xmlFiles/",
            inputTag        = $('#collusionFileInput'),
            renderDiv       = $('#renderDiv'),
            patternPanels   = $('#patternPanels');

    var collusionJSON, compareFilesXML = [], matchTypes = new Object(),
        loadXMLFile, loadCompareXML, parseCollusionXML, findMatchFeatures,
        createTab, convertXMLtoHTML, convertBetweenFeatures, orderFeaturePos, render;


    inputTag.change(function() {
        var filename = $(this).val();
        loadXMLFile(filename, function(file) {
            collusionJSON = $.xml2json(file);
            loadCompareXML(0);
        });
    });


    loadXMLFile = function(filename, callback) {
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


    loadCompareXML = function(i) {
        var doc = collusionJSON.document[i].src;

        $.ajax({
            type: "GET",
            url: xmlFolder + doc.src,
            dataType: "xml",

            success: function(file) {
                compareFilesXML[i] = (new XMLSerializer()).serializeToString(file);
                if (i === 0)
                    loadCompareXML(1);
                parseCollusionXML();
            },
            error: function(xhr, textStatus, error) {
                console.log( [textStatus, xhr.responseText].join(':') );
            }
        });
    };


    parseCollusionXML = function() {
        var matches = collusionJSON.alignments; // match
        if (matches.match.ref === undefined)
            matches = matches.match; // matches

        $.each(matches, function(i, vMatch) {
            findMatchFeatures(vMatch);
        });
        render();
    };


    findMatchFeatures = function(vMatch) {
        if (vMatch.detail !== undefined) {}

        if ( isNaN(matchTypes[vMatch.type]) )
            matchTypes[vMatch.type] = new Array();
        var i = matchTypes[vMatch.type].length();

        $.each(vMatch.ref, function(j, vRef) {
            $.each(collusionJSON.document, function(k, vDoc) {
                if (vDoc.id === vRef.document) {
                    $.each(vDoc.feature, function(h, vFeat) {
                        if (vFeat.id === vRef.feature) {
                            var doc = new Object();
                            doc['start'] = parseInt(vFeat.start);
                            doc['until'] = doc['start'] + parseInt(vFeat.length);
                            //doc['value'] = vFeat.value; todo if given
                            matchTypes[vMatch.type][i] = doc;
                        }
                    });
                }
            });
        });
    };


    render = function() {
        $.each(matchTypes, function(i, mType) { // todo iterate over first level = match types
            var featurePositions    = orderFeaturePos(mType, 0),
                leftFileHTML        = convertXMLtoHTML(compareFilesXML[0], featurePositions);
            featurePositions        = orderFeaturePos(mType, 1);
            var rightFileHTML       = convertXMLtoHTML(compareFilesXML[1], featurePositions);

            createTab(mType, leftFileHTML, rightFileHTML);
        });
        patternPanels.find('li').first().addClass('active');
    };


    orderFeaturePos = function(matchType, docCnt) {
        /*  todo
            select all featurePos of container[matchType][docCnt]
            order them DESC
            return as list
        */
    };


    convertXMLtoHTML = function(xmlString, featurePositions) { //  todo what to do with features?!
        var highPos = xmlString.length()-1,
            lowPos  = highPos;

        while(lowPos !== 0) {
            if (! featurePositions.empty)           // todo not sure if works
                lowPos = featurePositions.pop();    // todo just placeholder yet
            else
                lowPos = 0;

            var excerpt         = xmlString.substr(lowPos, highPos),
                replacedExcerpt = convertBetweenFeatures(excerpt);

            xmlString.replace(excerpt, replacedExcerpt);
            highPos = lowPos-1;
        }
        return xmlString;
    };


    convertBetweenFeatures = function(excerpt) {
        var closingPos = null;

        for(var highPos = excerpt.length()-1; highPos >= 0; highPos--) {
            if (excerpt[highPos] === '>')
                closingPos = highPos;

            else if (excerpt[highPos] === '<') {
                if (closingPos === null)
                    alert("error: one xml tag isn't closed");
                else {
                    var toReplace = excerpt.substr(highPos, closingPos);

                    if (excerpt[highPos+1] === '/')
                        excerpt.replace(toReplace, '</div>');
                    else {
                        var xmlTag = excerpt.substring(highPos+1, closingPos-1);
                        excerpt.replace(toReplace, '<div class="'+xmlTag+'">');
                    }
                }
            }
        }
        return excerpt;
    };


    createTab = function(patternTitle, leftFileHTML, rightFileHTML) {
        var tab = $('<a href="#'+patternTitle+'Tab" data-toggle="tab">'+patternTitle+'</a>')
                  .wrap('<li></li>');
        patternPanels.append(tab);

        var div = $('<div id="'+patternTitle+'Tab"></div>')
            .append('<div class="leftArea">'+leftFileHTML+'</div>')
            .append('<div class="canvas"></div>')
            .append('<div class="rightArea">'+rightFileHTML+'</div>')
            .append('<div class="clearFloat"></div>');
        renderDiv.append(div);
    };
});