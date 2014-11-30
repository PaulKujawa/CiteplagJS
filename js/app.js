$(function() {
    const   xmlFolder       =   "xmlFiles/",
            inputTag        = $('#collusionFileInput'),
            renderDiv       = $('#renderDiv'),
            patternPanels   = $('#patternPanels');

    var collusionJSON, compareFilesXML = new Array(), matchTypes = new Object(), //[mType][m][d]['start']
        loadXMLFile, loadCompareXML, parseCollusionXML, findMatchFeatures,
        createTab, convertXMLtoHTML, orderFeaturePos, render, getNextFeaturePos, connectFeatureOpening;


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
        closingPos              = null;

        for(var pos = xmlString.length-1; pos >= 0; pos--) {
            if (xmlString[pos] === '>') {
                closingPos = pos;
                if (! $.isEmptyObject(activeFeatures))
                    xmlString = connectFeatureOpening(xmlString, activeFeatures, closingPos);


            } else if (xmlString[pos] === '<') { // replace tag
                if (xmlString[pos+1] === '/')
                    xmlString     = xmlString.substr(0, pos) + '</div>' + xmlString.substr(closingPos+1);
                else {
                    var xmlTag = xmlString.substr(pos, closingPos-pos+1),
                        length = xmlTag.indexOf(' '); // would cut off attr
                    if (length == -1)
                        length = closingPos-pos;
                    xmlTag    = xmlString.substr(pos+1, length-1);
                    xmlString = xmlString.substr(0, pos) + '<div class="'+xmlTag+'">' + xmlString.substr(closingPos+1);
                }

                if (! $.isEmptyObject(activeFeatures)) // connectFeatureClosing
                    xmlString = xmlString.substr(0, pos) +"</div>"+ xmlString.substr(pos);


            } else if (pos == nextFeaturePos) {
                $.each(matches, function(i, match) {
                    if (! $.isEmptyObject(activeFeatures))
                        xmlString = connectFeatureOpening(xmlString, activeFeatures, pos);

                    if (match[docNr]['start'] == pos) { // todo pop in right order
                        xmlString = xmlString.substr(0, pos) +'<div class="feature '+activeFeatures.pop()+'">'+ xmlString.substr(pos);
                    } else if (match[docNr]['end'] == pos) {
                        xmlString = xmlString.substr(0, pos+1) +"</div>"+ xmlString.substr(pos+1);
                        activeFeatures.push(matchTitle+activeFeatures.length);
                    }

                    if (! $.isEmptyObject(activeFeatures)) // connectFeatureClosing
                        xmlString = xmlString.substr(0, pos) +"</div>"+ xmlString.substr(pos);

                });
                nextFeaturePos = getNextFeaturePos(featurePositions);
            }
        }
        return xmlString;
    };


    connectFeatureOpening = function(xmlString, activeFeatures, pos) {
        var classes = "";
        $.each(activeFeatures, function(i, featClass) {
            classes += featClass + " ";
        });
        classes = classes.slice(0, -1);
        return xmlString.substr(0, pos+1) +'<div class="feature '+classes+'">'+ xmlString.substr(pos+1);
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