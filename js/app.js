$(function() {
    const   xmlFolder       =   "xmlFiles/",
            inputTag        = $('#collusionFileInput'),
            renderDiv       = $('#renderDiv'),
            patternPanels   = $('#patternPanels');

    var collusionJSON, compareFilesXML = new Array(), matchTypes = new Object(), //[mType][m][d]['start']
        loadXMLFile, loadCompareXML, parseCollusionXML, findMatchFeatures,
        createTab, convertXMLtoHTML, orderFeaturePos, render, getNextFeaturePos;


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
                    startPos  = xmlString.indexOf('<body>')+ 6,
                    length    = xmlString.indexOf('</body>') - startPos;

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
                        if (vFeat.id == vRef.feature) {
                            var doc = new Object(); // todo <link ref> ignored yet
                            doc['start'] = parseInt(vFeat.start);
                            doc['end']   = parseInt(vFeat.start) + parseInt(vFeat.length);
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
            var docNr = 0;
            var featurePositions    = orderFeaturePos(mType, docNr),
                leftFileHTML        = convertXMLtoHTML(featurePositions, mType, docNr, matchTitle);

            docNr++;
            featurePositions        = orderFeaturePos(mType, docNr);
            var rightFileHTML       = convertXMLtoHTML(featurePositions, mType, docNr, matchTitle);

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


    convertXMLtoHTML = function(featurePositions, matches, docNr, matchTitle) {
        var xmlString             = compareFilesXML[docNr],
        nextFeaturePos          = getNextFeaturePos(featurePositions),
        activeFeatures          = new Array(),
        activeFeatCnt           = 0,
        closingPos              = null;

        for(var highPos = xmlString.length-1; highPos >= 0; highPos--) {
            if (xmlString[highPos] === '>')
                closingPos = highPos;

            else if (xmlString[highPos] === '<') {
                if (! $.isEmptyObject(activeFeatures)) // add connecting feature div, right of div
                    xmlString = xmlString.substr(0, closingPos+1) +'<div class="feature '+activeFeatures.pop()+'">'+ xmlString.substr(closingPos+2);

                if (xmlString[highPos+1] === '/') // replace closing tag
                    xmlString     = xmlString.substr(0, highPos) + '</div>' + xmlString.substr(closingPos+1);

                else { // replace opening tag
                    var xmlTag = xmlString.substr(highPos, closingPos-highPos+1),
                        length = xmlTag.indexOf(' '); // would cut off attr
                    if (length == -1)
                        length = closingPos-highPos;

                    xmlTag    = xmlString.substr(highPos+1, length-1);
                    xmlString = xmlString.substr(0, highPos) + '<div class="'+xmlTag+'">' + xmlString.substr(closingPos+1);
                }

                if (! $.isEmptyObject(activeFeatures)) // add connecting feature div, left of div
                    xmlString = xmlString.substr(0, highPos+1) +"</div>"+ xmlString.substr(highPos+2);

            } else if (highPos == nextFeaturePos) { // add feature tag
                $.each(matches, function(i, match) {
                    if (match[docNr]['start'] == highPos) {
                        xmlString = xmlString.substr(0, highPos) +'<div class="feature '+activeFeatures.pop()+'">'+ xmlString.substr(highPos);

                    } else if (match[docNr]['end'] == highPos) {
                        xmlString = xmlString.substr(0, highPos+1) +"</div>"+ xmlString.substr(highPos+2);
                        activeFeatures.push(matchTitle+activeFeatCnt);
                        activeFeatCnt++;
                    }
                });
                nextFeaturePos = getNextFeaturePos(featurePositions);
            }
        }
        return xmlString;
    };


    getNextFeaturePos = function(featurePositions) {
        var pos = null;
        if (! $.isEmptyObject(featurePositions)) {
            pos = featurePositions[0];
            featurePositions.splice(0, 1); // removes 1 item from index 0
        }
        return pos;
    }


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