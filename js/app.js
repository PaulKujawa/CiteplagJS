$(function() {
    const   xmlFolder       =   "./xmlFiles/",
        inputTag        = $('#collusionFileInput'),
        renderDiv       = $('#renderDiv'),
        patternPanels   = $('#patternPanels'),
        detailsDiv      = $('aside'),
        section         = $('section'),
        errorDiv        = $('#errorOutput');

    var collusionJSON, featDetails = {}, compareFilesXML = [], matchTypes = {}, /*[mType][m][d][f]['start']*/
        loadXMLFile, loadCompareXML, parseMatches, parseMatch, replaceXMLTag, resetMarkup,
        createTab, convertXMLtoHTML, orderFeaturePos, renderMatchTypes, getNextFeaturePos, featureOpeningTag,
        parseMatchDetail, attachDetailsDiv, throwErrorMsg, parseFeature;

    var debug=true;

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
        errorDiv.empty().addClass('hidden');
        compareFilesXML = []; // not necessary since always 2 elements
        matchTypes = {};
    };


    loadXMLFile = function(filename, callback) {
        $.ajax({
            type: "GET",
            url: xmlFolder + filename,
            dataType: "xml",
            success: callback,
            error: function(xhr) { //, textStatus, error
                throwErrorMsg( xhr.responseText );
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
                    parseMatches();
            },
            error: function(xhr) { //, textStatus, error
                throwErrorMsg( xhr.responseText );
            }
        });
    };


    parseMatches = function() {
        var matches = collusionJSON.alignments; // match
        if (matches.match.ref === undefined)
            matches = matches.match; // matches

        var cnt = 0;
        $.each(matches, function(i, match) {
            if (matchTypes[match.type] === undefined)
                matchTypes[match.type] = [];
            parseMatch(match, cnt);
            cnt++;
        });
        renderMatchTypes();
    };


    parseMatch = function(match, cnt) {
        var documents = [];
        $.each(match.ref, function(i, ref) {
            var features = [];

            $.each(collusionJSON.document, function(j, doc) {
                if (doc.id == ref.document) {
                    $.each(doc.feature, function(k, feature) {
                        if (feature.id == ref.feature) {
                            var parsedFeat = parseFeature(match, feature, cnt);
                            features.push(parsedFeat);

                            if (parsedFeat['group']) {
                                var nestedCnt = 0;
                                $.each(feature.link, function(l, id) {
                                    if (id.ref !== undefined)
                                        id = id.ref;
                                    id = id.substr(1); // cut off char #
                                    $.each(doc.feature, function(m, linkedFeat) {
                                        if (linkedFeat.id == id) {
                                            linkedFeat = parseFeature(match, linkedFeat, cnt+"_"+nestedCnt);
                                            features.push(linkedFeat);
                                        }
                                    });
                                    nestedCnt++;
                                });
                            }
                        }
                    });
                }
            });
            documents.push(features);
        });
        matchTypes[match.type].push(documents);
    };


    parseFeature = function(vMatch, feat, cnt) {
        var feature = {};
        feature['start'] = parseInt(feat.start);
        feature['end']   = parseInt(feat.start) + parseInt(feat.length);
        feature['group'] = feat.link !== undefined;

        if (feature['group'])
            feature['class'] = "group" + cnt;
        else
            feature['class'] = "feature" + cnt;

        if (feat.value !== undefined)
            feature['value'] = feat.value;

        if (vMatch.detail !== undefined)
            feature['detail'] = parseMatchDetail(vMatch.detail);

        return feature;
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
        $.each(matchTypes, function(matchTitle, matches) {

            var docNr = 0;
            var featurePositions    = orderFeaturePos(matches, docNr),
                leftFileHTML        = convertXMLtoHTML(featurePositions, matches, docNr);

            docNr++;
            featurePositions        = orderFeaturePos(matches, docNr);
            var rightFileHTML       = convertXMLtoHTML(featurePositions, matches, docNr);

            createTab(matchTitle, leftFileHTML, rightFileHTML);
        });

        attachDetailsDiv();
        patternPanels.find('li:first').addClass('active');
        renderDiv.find('div:first').addClass('active');
    };


    orderFeaturePos = function(matches, docNr) {
        var positions = [];
        $.each(matches, function(m, match) {
            $.each(match[docNr], function(f, feature) {
                positions.push(feature['start']);
                positions.push(feature['end']);
            });
        });

        positions.sort(function(a, b) {
            return b-a;
        });
        return positions;
    };


    convertXMLtoHTML = function(featurePositions, matches, docNr) {
        var xmlString   = compareFilesXML[docNr],
            nextFeaturePos  = getNextFeaturePos(featurePositions),
            activeFeatures  = {}, // activeFeatures[position][i]
            activeGroups    = {},
            closingPos      = null;

        for (var pos = xmlString.length-1; pos >= 0; pos--) {
            if (xmlString[pos] === '>') {
                closingPos = pos;
                if (! $.isEmptyObject(activeFeatures) || ! $.isEmptyObject(activeGroups))
                    xmlString = featureOpeningTag(xmlString, activeFeatures, activeGroups, closingPos, 1);

            } else if (xmlString[pos] === '<') {
                xmlString = replaceXMLTag(xmlString, pos, closingPos);
                if (! $.isEmptyObject(activeFeatures) || ! $.isEmptyObject(activeGroups))
                    xmlString = xmlString.substr(0, pos) +"</div>"+ xmlString.substr(pos);


            } else if (pos == nextFeaturePos) {
                $.each(matches, function(i, match) {
                    $.each(match[docNr], function(f, feat) {
                        if (feat['start'] == pos) {
                            xmlString = featureOpeningTag(xmlString, activeFeatures, activeGroups, pos-1, 2);
                            delete activeFeatures[pos];
                            delete activeGroups[pos];
                            if (! $.isEmptyObject(activeFeatures) || ! $.isEmptyObject(activeGroups))
                                xmlString = xmlString.substr(0, pos) +"</div>"+ xmlString.substr(pos); // left
                            nextFeaturePos = getNextFeaturePos(featurePositions);
                            return false; // stop each loop, since multiple features could start at this pos

                        } else if (feat['end'] == pos) {
                            if (! $.isEmptyObject(activeFeatures) || ! $.isEmptyObject(activeGroups)) {
                                xmlString = featureOpeningTag(xmlString, activeFeatures, activeGroups, pos-1, 3);
                                xmlString = xmlString.substr(0, pos) +"</div>"+ xmlString.substr(pos); // right (pos = '<')
                            } else
                                xmlString = xmlString.substr(0, pos+1) +"</div>"+ xmlString.substr(pos+1); // right

                            while (pos == nextFeaturePos) { // more features ending at this pos?
                                $.each(matches, function(g, match2) {
                                    $.each(match2[docNr], function(h, feat2) {
                                        if (feat2['end'] == pos) {
                                            var startPos  = feat2['start'],
                                                featClass = feat2['class'];

                                            if (feat2['group']) {
                                                if ( activeGroups[startPos] === undefined )
                                                    activeGroups[startPos] = [];
                                                activeGroups[startPos].push(featClass);
                                            } else {
                                                if ( activeFeatures[startPos] === undefined)
                                                    activeFeatures[startPos] = [];
                                                activeFeatures[startPos].push(featClass);
                                            }
                                            if (feat2['detail'] !== undefined) {
                                                featDetails[featClass] = [];
                                                featDetails[featClass].push(feat2['detail']);
                                            }
                                            nextFeaturePos = getNextFeaturePos(featurePositions);
                                        }
                                    });
                                });
                            }
                            return false;
                        } else
                            return true;
                    });
                });
            }
        }
        debug = false;
        return xmlString;
    };


    replaceXMLTag = function(xmlString, pos, closingPos) {
        if (xmlString[pos+1] === '/')
            return xmlString.substr(0, pos) + "</div>" + xmlString.substr(closingPos+1);

        else {
            var xmlTag = xmlString.substr(pos, closingPos-pos+1),
                length = xmlTag.indexOf(' '); // would cut off attr
            if (length == -1)
                length = closingPos-pos;
            xmlTag     = xmlString.substr(pos+1, length-1);

            return xmlString.substr(0, pos) + '<div class="'+xmlTag+'">' + xmlString.substr(closingPos+1);
        }
    };


    featureOpeningTag = function(xmlString, activeFeatures, activeGroups, pos, x) {
        var classes = "";

        if (! $.isEmptyObject(activeFeatures))
            classes += "feature ";

        if (! $.isEmptyObject(activeGroups))
            classes += "group ";

        $.each(activeFeatures, function(i, position) {
            $.each(position, function(k, featClass) {
                classes += featClass + " ";
            });
        });

        $.each(activeGroups, function(i, position) {
            $.each(position, function(k, featClass) {
                classes += featClass + " ";
            });
        });

        var tag = '<div class="'+ classes + " " + x + '">';
        return xmlString.substr(0, pos+1) +tag+ xmlString.substr(pos+1);
    };


    getNextFeaturePos = function(featurePositions) {
        var pos = null;
        if (! $.isEmptyObject(featurePositions)) {
            pos = featurePositions[0];
            featurePositions.splice(0, 1); // removes 1 item from index 0
        }
        return pos;
    };


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

            theClass = "."+theClass;
            $(theClass).mouseenter(function() {
                section.addClass('col-md-9');
                detailsDiv.removeClass('hidden');
                detailsDiv.append('<h3>Feature details</h3>' + content);
            });

            $(theClass).mouseleave(function() {
                detailsDiv.empty();
            });
        });
    };


    throwErrorMsg = function(content) {
        errorDiv
            .append('<span>' +content+ '</span>')
            .removeClass('hidden');
        return false;

    };
});