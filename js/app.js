$(function() {
    const   xmlFolder       =   "xmlFiles/",
            inputTag        = $('#collusionFileInput'),
            renderDiv       = $('#renderDiv'),
            patternPanels   = $('#patternPanels');

    var collusionJSON, compareFilesXML = new Array(), matchTypes = new Object(),
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

        var m    = matchTypes[vMatch.type].length,
            docs = new Array(),
            d    = 0;

        $.each(vMatch.ref, function(j, vRef) {
            $.each(collusionJSON.document, function(k, vDoc) {
                if (vDoc.id === vRef.document) {
                    $.each(vDoc.feature, function(h, vFeat) {
                        if (vFeat.id === vRef.feature) {
                            var doc = new Object(); // todo <link ref> ignored yet
                            doc['start'] = parseInt(vFeat.start);
                            doc['end']   = doc['start'] + parseInt(vFeat.length);
                            //doc['value'] = vFeat.value; todo if given
                            docs[d] = doc;
                            d++;
                        }
                    });
                }
            });
        });
        matchTypes[vMatch.type][m] = docs;
    };


    render = function() {
        $.each(matchTypes, function(matchTitle, mType) { //mType[m][d]['start']
            var featurePositions    = orderFeaturePos(mType, 0),
                leftFileHTML        = convertXMLtoHTML(compareFilesXML[0], featurePositions);
            featurePositions        = orderFeaturePos(mType, 1);
            var rightFileHTML       = convertXMLtoHTML(compareFilesXML[1], featurePositions);

            createTab(matchTitle, leftFileHTML, rightFileHTML);
        });

        patternPanels.find('li').first().addClass('active');
        renderDiv.find('div').first().addClass('active');
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
       /* var highPos = xmlString.length-1,
            lowPos  = highPos;

        while(lowPos !== 0) {
            if ($.isEmptyObject(featurePositions))
                lowPos = 0;
            else {
                lowPos = featurePositions[0];
                featurePositions.splice(0, 1); // removes 1 item from index 0
            }

            var excerpt         = xmlString.substr(lowPos, highPos-lowPos),
                replacedExcerpt = convertBetweenFeatures(excerpt);
        }
        */

            var replacedExcerpt = convertBetweenFeatures(xmlString);

            xmlString = xmlString.replace(xmlString, replacedExcerpt);
//            highPos = lowPos-1;

        return xmlString;
    };


    convertBetweenFeatures = function(excerpt) {
        console.log( excerpt);
        console.log( );
        var closingPos = null;
        for(var highPos = excerpt.length-1; highPos >= 0; highPos--) {
            if (excerpt[highPos] === '>')
                closingPos = highPos;

            else if (excerpt[highPos] === '<') {
                if (closingPos === null)
                    alert("error: one xml tag itself isn't closed");
                else {
                    var toReplace = excerpt.substr(highPos, closingPos-highPos+1);

                    if (excerpt[highPos+1] === '/')
                        excerpt = excerpt.replace(toReplace, '</div>');

                    else {
                        var length = toReplace.indexOf(' ');
                        if (length == -1) // xmlTag with attr, which don't matter
                            length = closingPos-highPos;

                        var xmlTag = excerpt.substr(highPos+1, length-1);
                        console.log(
                            "toReplace: " + toReplace +
                            " length: " + length +
                            " xmlTag: " + xmlTag
                        );

                        excerpt = excerpt.replace(toReplace, '<div class="'+xmlTag+'">');
                    }
                }
            }
        }
        console.log( excerpt );
        return excerpt;
    };

    var str = '<p>The traditional consultation in general practice was brief.<xref ref-type="bibr" ' +
        'rid="B2">2</xref> The patient presented symptoms and the doctor prescribed treatment. In 1957 ' +
        'Balint gave new insights into the meaning of symptoms.<xref ref-type="bibr" rid="B10">10</xref> ' +
        'By 1979 an enhanced model of consultation was presented, in which the doctors dealt with ongoing ' +
        'as well as presenting problems and added health promotion and education about future appropriate ' +
        'use of services.<xref ref-type="bibr" rid="B11">11</xref> Now, with an ageing population and more ' +
        'community care of chronic illness, there are more issues to be considered at each consultation. ' +
        'Ideas of what constitutes good general practice are more complex.' +
        '<xref ref-type="bibr" rid="B12">12</xref> Good practice now includes both extended care ' +
        'of chronic medical problems&#x2014;for example, coronary heart disease' +
        '<xref ref-type="bibr" rid="B13">13</xref>&#x2014;and a public health role. At first this ' +
        'model was restricted to those who lead change (&#x201C;early adopters&#x201D;) and ' +
        'enthusiasts<xref ref-type="bibr" rid="B14">14</xref> but now it is embedded in professional ' +
        'and managerial expectations of good practice.</p>';
    convertBetweenFeatures(str);


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