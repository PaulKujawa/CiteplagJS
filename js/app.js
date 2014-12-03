$(function() {
    const   xmlFolder       =   "xmlFiles/",
            inputTag        = $('#collusionFileInput'),
            renderDiv       = $('#renderDiv'),
            patternPanels   = $('#patternPanels'),
            detailsDiv      = $('aside'),
            section         = $('section');

    var featDetails = new Object(), compareFilesXML = new Array(), matchTypes = new Object(), //[mType][m][d]['start']
        collusionJSON, loadXMLFile, loadCompareXML, parseCollusionXML, parseMatches, replaceXMLTag, resetMarkup,
        createTab, convertXMLtoHTML, orderFeaturePos, renderMatchTypes, getNextFeaturePos, featureOpeningTag,
        parseMatchDetail, attachDetailsDiv;


    inputTag.change(function() {
        resetMarkup();
        var filename = $(this).val();
        loadXMLFile(filename, function(file) {
            collusionJSON = $.xml2json(file);
            loadCompareXML(0);
        });
    });


    resetMarkup = function() {
        patternPanels.empty();
        renderDiv.empty();
        compareFilesXML = new Array(); // not necessary since always 2 elements
        matchTypes = new Object();
    };


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

        var cnt = 0;
        $.each(matches, function(i, vMatch) {
            cnt = parseMatches(vMatch, cnt);
        });
        renderMatchTypes();
    };


    parseMatches = function(vMatch, cnt) {
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
                            doc['class'] = vMatch.type + cnt;

                            if (vFeat.value !== undefined)
                                doc['value'] = vFeat.value;

                            if (vMatch.detail !== undefined)
                                doc['detail'] = parseMatchDetail(vMatch.detail);

                            docs.push(doc);
                            cnt++;
                        }
                    });
                }
            });
        });
        matchTypes[vMatch.type].push(docs);
        return cnt;
    };


    parseMatchDetail = function(detail) {
        var div = "";

        if (detail.detail.name === undefined)
            detail = detail.detail; // details

        $.each(detail, function(i, vDetail) {
            if (vDetail.name !== undefined)
                div += '<div>' + vDetail.name;

            if (vDetail.text !== undefined)
                div += ': ' + vDetail.text;

            if (vDetail.detail !== undefined) // recursive for nested details
                div += parseMatchDetail(vDetail);

            div += '</div>';
        });
        return div;
    };


    renderMatchTypes = function() {
        $.each(matchTypes, function(matchTitle, mType) {
            var docNr = 0;
            var featurePositions    = orderFeaturePos(mType, docNr),
                leftFileHTML        = convertXMLtoHTML(featurePositions, mType, docNr, matchTitle);

            docNr++;
            featurePositions        = orderFeaturePos(mType, docNr);
            var rightFileHTML       = convertXMLtoHTML(featurePositions, mType, docNr, matchTitle);

            createTab(matchTitle, leftFileHTML, rightFileHTML);
        });

        attachDetailsDiv();
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
        var xmlString       = compareFilesXML[docNr],
        nextFeaturePos      = getNextFeaturePos(featurePositions),
        activeFeatClasses   = new Object(), // activeFeatClasses[position][i]
        closingPos          = null;

        for(var pos = xmlString.length-1; pos >= 0; pos--) {
            if (xmlString[pos] === '>') {
                closingPos = pos;
                if (! $.isEmptyObject(activeFeatClasses))
                    xmlString = featureOpeningTag(xmlString, activeFeatClasses, closingPos);

            } else if (xmlString[pos] === '<') {
                xmlString = replaceXMLTag(xmlString, pos, closingPos);
                if (! $.isEmptyObject(activeFeatClasses))
                    xmlString = xmlString.substr(0, pos) +"</div>"+ xmlString.substr(pos);


            } else if (pos == nextFeaturePos) {
                if (! $.isEmptyObject(activeFeatClasses))
                    xmlString = featureOpeningTag(xmlString, activeFeatClasses, pos-1);

                $.each(matches, function(i, match) {
                    if (match[docNr]['start'] == pos) {
                        delete activeFeatClasses[pos];

                        if (! $.isEmptyObject(activeFeatClasses))
                            xmlString = xmlString.substr(0, pos) +"</div>"+ xmlString.substr(pos);

                    } else if (match[docNr]['end'] == pos) {
                        xmlString = xmlString.substr(0, pos+1) +"</div>"+ xmlString.substr(pos+1);
                        if (! $.isEmptyObject(activeFeatClasses))
                            xmlString = xmlString.substr(0, pos) +"</div>"+ xmlString.substr(pos);

                        var startPos = match[docNr]['start'];
                        if ( isNaN(activeFeatClasses[startPos]) )
                            activeFeatClasses[startPos] = new Array();
                        var newClass = matchTitle+activeFeatClasses[startPos].length;
                        activeFeatClasses[startPos].push(newClass);

                        if (match[docNr]['detail'] !== undefined) {
                            featDetails[newClass] = new Array();
                            featDetails[newClass].push(match[docNr]['detail']);
                        }
                    }
                });
                nextFeaturePos = getNextFeaturePos(featurePositions);
            }
        }
        return xmlString;
    };


    replaceXMLTag = function(xmlString, pos, closingPos) {
        if (xmlString[pos+1] === '/')
            return xmlString.substr(0, pos) + '</div>' + xmlString.substr(closingPos+1);

        else {
            var xmlTag = xmlString.substr(pos, closingPos-pos+1),
                length = xmlTag.indexOf(' '); // would cut off attr
            if (length == -1)
                length = closingPos-pos;
            xmlTag     = xmlString.substr(pos+1, length-1);

            return xmlString.substr(0, pos) + '<div class="'+xmlTag+'">' + xmlString.substr(closingPos+1);
        }
    };


    featureOpeningTag = function(xmlString, activeFeatures, pos) {
        var classes = "";
        $.each(activeFeatures, function(i, position) {
            $.each(position, function(k, featClass) {
                classes += featClass + " ";
            });
        });
        var tag = '<div class="feature '+ classes.slice(0, -1) +'">';

        return xmlString.substr(0, pos+1) +tag+ xmlString.substr(pos+1);
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


    attachDetailsDiv = function() {
        $.each(featDetails, function(theClass, details) {
            var content = "";
            $.each(details, function(i, div) {
               content +=  div; // todo check for duplicate details
            });

            $('.'+theClass).mouseenter(function() {
                section.addClass('col-md-9');
                detailsDiv.removeClass('hidden');
                detailsDiv.append('<h3>Feature details</h3>' + content);
            });

            $('.'+theClass).mouseleave(function() {
                 detailsDiv.empty();
             });
        });
    };
});