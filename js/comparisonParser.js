MyApp.ComparisonParser = (function() {
    ComparisonParser["featurePositions"]   = [];
    ComparisonParser["featDetails"]        = {};

    function ComparisonParser() {}

    ComparisonParser.orderFeaturePos = function(matches, docNr) {
        var _self = this;
        _self.featurePositions = [];

        $.each(matches, function(m, match) {
            $.each(match[docNr], function(f, feature) {
                _self.featurePositions.push(feature['start']);
                _self.featurePositions.push(feature['end']);
            });
        });

        this.featurePositions.sort(function(a, b) {
            return b-a;
        });
    };


    ComparisonParser.convertXMLtoHTML = function(matches, docNr) {
        var xmlString       = MyApp.XMLFileHandler['compareFilesXML'][docNr],
            _self           = this,
            nextFeaturePos  = _self.getNextFeaturePos(),
            activeFeatures  = {}, // activeFeatures[position][i]
            activeGroups    = {},
            closingPos      = null;

        for (var pos = xmlString.length-1; pos >= 0; pos--) {
            if (xmlString[pos] === '>') {
                closingPos = pos;
                if (! $.isEmptyObject(activeFeatures) || ! $.isEmptyObject(activeGroups))
                    xmlString = _self.featureOpeningTag(xmlString, activeFeatures, activeGroups, closingPos, 1);

            } else if (xmlString[pos] === '<') {
                xmlString = _self.replaceXMLTag(xmlString, pos, closingPos);
                if (! $.isEmptyObject(activeFeatures) || ! $.isEmptyObject(activeGroups))
                    xmlString = xmlString.substr(0, pos) +"</div>"+ xmlString.substr(pos);


            } else if (pos == nextFeaturePos) {
                $.each(matches, function(i, match) {
                    $.each(match[docNr], function(f, feat) {
                        if (feat['start'] == pos) {
                            xmlString = _self.featureOpeningTag(xmlString, activeFeatures, activeGroups, pos-1, 2);
                            delete activeFeatures[pos];
                            delete activeGroups[pos];
                            if (! $.isEmptyObject(activeFeatures) || ! $.isEmptyObject(activeGroups))
                                xmlString = xmlString.substr(0, pos) +"</div>"+ xmlString.substr(pos); // left
                            nextFeaturePos = _self.getNextFeaturePos();
                            return false; // stop each loop, since multiple features could start at this pos

                        } else if (feat['end'] == pos) {
                            if (! $.isEmptyObject(activeFeatures) || ! $.isEmptyObject(activeGroups)) {
                                xmlString = _self.featureOpeningTag(xmlString, activeFeatures, activeGroups, pos-1, 3);
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
                                                _self.featDetails[featClass] = [];
                                                _self.featDetails[featClass].push(feat2['detail']);
                                            }
                                            nextFeaturePos = _self.getNextFeaturePos();
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
        return xmlString;
    };


    ComparisonParser.replaceXMLTag = function(xmlString, pos, closingPos) {
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


    ComparisonParser.featureOpeningTag = function(xmlString, activeFeatures, activeGroups, pos, x) {
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


    ComparisonParser.getNextFeaturePos = function() {
        var pos = null;
        if (! $.isEmptyObject(this.featurePositions)) {
            pos = this.featurePositions[0];
            this.featurePositions.splice(0, 1); // removes 1 item from index 0
        }
        return pos;
    };

    return ComparisonParser;
})();