$(function() {
    const   xmlFolder       =   "xmlFiles/",
            inputTag        = $('#collusionFileInput'),
            renderDiv       = $('#renderDiv'),
            patternPanels   = $('#patternPanels');

    var collusionJSON, compareFilesXML = new Array(), matchTypes = new Object(), //[mType][m][d]['start']
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
            url: xmlFolder + doc,
            dataType: "xml",

            success: function(file) {
                var xmlString = (new XMLSerializer()).serializeToString(file),
                    startPos    = xmlString.indexOf('<body>')+ 6,
                    length      = xmlString.indexOf('</body>') - startPos;

                compareFilesXML[i] = xmlString.substr(startPos, length);
                if (i === 0)
                    loadCompareXML(1);
                else
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
        if (vMatch.detail !== undefined) {/* todo so what? */}
        if ( isNaN(matchTypes[vMatch.type]) )
            matchTypes[vMatch.type] = new Array();

        var docs = new Array();
        $.each(vMatch.ref, function(j, vRef) {
            $.each(collusionJSON.document, function(k, vDoc) {
                if (vDoc.id === vRef.document) {
                    $.each(vDoc.feature, function(h, vFeat) {
                        if (vFeat.id === vRef.feature) {
                            var doc = new Object(); // todo <link ref> ignored yet
                            doc['start'] = parseInt(vFeat.start);
                            doc['end']   = doc['start'] + parseInt(vFeat.length);
                            if (vFeat.value !== undefined)
                                doc['value'] = vFeat.value;
                            docs.push(doc);
                        }
                    });
                }
            });
        });
        matchTypes[vMatch.type].push(docs);
    };


    render = function() {
        $.each(matchTypes, function(matchTitle, mType) {
            var featurePositions    = orderFeaturePos(mType, 0),
                leftFileHTML        = convertXMLtoHTML(compareFilesXML[0], featurePositions);

            featurePositions        = orderFeaturePos(mType, 1);
            var rightFileHTML       = convertXMLtoHTML(compareFilesXML[1], featurePositions);

            createTab(matchTitle, leftFileHTML, rightFileHTML);
        });

        patternPanels.find('li:first').addClass('active');
        renderDiv.find('div:first').addClass('active');
    };


    orderFeaturePos = function(matchType, docCnt) {
        var positions = new Array();

        $.each(matchType, function(m, match) {
            positions.push(match[docCnt]['start']);
            positions.push(match[docCnt]['end']);
        });

        positions.sort(function(a, b) {
            return b-a;
        });

        return positions;
    };


    convertXMLtoHTML = function(xmlString, featurePositions) { //  todo what to do with features?!
        var highPos = xmlString.length-1,
            lowPos  = highPos;

        while(lowPos !== 0) {
            if ($.isEmptyObject(featurePositions))
                lowPos = 0;
            else {
                lowPos = featurePositions[0];
                featurePositions.splice(0, 1); // removes 1 item from index 0
            }

            var excerpt = xmlString.substr(lowPos, highPos-lowPos+1);
            xmlString   = xmlString.substr(0, lowPos) + convertBetweenFeatures(excerpt) +
                          xmlString.substr(highPos+1, xmlString.length-highPos-1);
            highPos = lowPos-1;
        }
        return xmlString;
    };


    convertBetweenFeatures = function(excerpt) {
        var closingPos = null;

        for(var highPos = excerpt.length-1; highPos >= 0; highPos--) {
            if (excerpt[highPos] === '>') {
                closingPos = highPos;

            } else if (excerpt[highPos] === '<') {
                if (excerpt[highPos+1] === '/') {
                    excerpt     = excerpt.substr(0, highPos) + '</div>' +
                                  excerpt.substr(closingPos+1);
                    // todo set inDiv = true;


                } else {
                    var xmlTag = excerpt.substr(highPos, closingPos-highPos+1),
                        length = xmlTag.indexOf(' '); // would cut off attr
                    if (length == -1)
                        length = closingPos-highPos;

                    xmlTag  = excerpt.substr(highPos+1, length-1);
                    excerpt = excerpt.substr(0, highPos) + '<div class="'+xmlTag+'">' +
                              excerpt.substr(closingPos+1);
                    // todo if (inDiv) attach div with class at clPos

                }

            /*} else if (highPos == opPos || highPos == clPos) {
                if (highPos == opPos) {
                    excerpt = excerpt.substr(0, opPos) +'<div class="OP">'+ excerpt.substr(opPos);
                } else {
                    excerpt = excerpt.substr(0, clPos+1) +'</div>'+ excerpt.substr(clPos);
                    // todo if (inDiv)
                     //todo save clPos+1+6 (6=</div>)
                     //todo save specific pattern class

                }*/
            }
        }
        return excerpt;
    };

    /*var opPos = 10,
        clPos = 30;
    console.log(convertBetweenFeatures(
        '<h1>my heaDLINE</h1>' +
            '<p>ABCDEFGHijklmnopqrstuvwxyz</p>'
    ));*/

    createTab = function(patternTitle, leftFileHTML, rightFileHTML) {
        var tab = $(
            '<li>' +
                '<a href="#'+patternTitle+'Tab" data-toggle="tab">'+patternTitle+'</a>' +
            '</li>'
        );
        patternPanels.append(tab);

        var div = $('<div id="'+patternTitle+'Tab" class="tab-pane"></div>')
            .append('<div class="leftArea">'+leftFileHTML+'</div>')
            .append('<div class="canvas"></div>')
            .append('<div class="rightArea">'+rightFileHTML+'</div>')
            .append('<div class="clearFloat"></div>');
        renderDiv.append(div);
    };
});