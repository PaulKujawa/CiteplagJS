MyApp.ComparisonParser = (function() {
    // OT = opening tag

    ComparisonParser.xmlString      = "";
    ComparisonParser["featDetails"] = {};
    ComparisonParser.activeFeatures = {}; //activeFeatures[position][i]
    ComparisonParser.activeGroups   = {};
    ComparisonParser.nextFeaturePos = 0;

    function ComparisonParser() {}


    ComparisonParser.convertFile = function(matches, docNr) {
        var _self           = this,
            closingPos      = null;
        _self.xmlString     = MyApp.XMLFileHandler['compareFilesXML'][docNr];
        _self.getNextFeaturePos();

        for (var pos = _self.xmlString.length-1; pos >= 0; pos--) {
            if (_self.xmlString[pos] === '>') {
                closingPos = pos;
                if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups))
                    _self.insertFeatOT(closingPos);

            } else if (_self.xmlString[pos] === '<') {
                _self.replaceXMLTag(pos, closingPos);
                if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups))
                    _self.xmlString = _self.xmlString.substr(0, pos) +"</div>"+ _self.xmlString.substr(pos);

            } else if (pos == _self.nextFeaturePos)
                _self.handleFeatPos(matches, docNr, pos);
        }
    };


    ComparisonParser.handleFeatPos = function(matches, docNr, pos) {
        var _self = this;
        $.each(matches, function(i, match) {

            $.each(match[docNr], function(f, feat) {
                if (feat['start'] == pos) {
                    _self.insertFeatOT(pos-1);
                    delete _self.activeFeatures[pos];
                    delete _self.activeGroups[pos];

                    if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups))
                        _self.xmlString = _self.xmlString.substr(0, pos) +"</div>"+ _self.xmlString.substr(pos); // left

                    _self.getNextFeaturePos();
                    return false; // stop each loop, since multiple features could start at this pos


                } else if (feat['end'] == pos) {
                    if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups)) {
                        _self.insertFeatOT(pos-1);
                        _self.xmlString = _self.xmlString.substr(0, pos) +"</div>"+ _self.xmlString.substr(pos); // right (pos = '<')
                    } else
                        _self.xmlString = _self.xmlString.substr(0, pos+1) +"</div>"+ _self.xmlString.substr(pos+1); // right

                    while (pos == _self.nextFeaturePos) { // more features ending at this pos?
                        $.each(matches, function(g, match2) {
                            $.each(match2[docNr], function(h, feat2) {
                                if (feat2['end'] == pos) {
                                    var startPos  = feat2['start'],
                                        featClass = feat2['class'];

                                    if (feat2['group']) {
                                        if ( _self.activeGroups[startPos] === undefined )
                                            _self.activeGroups[startPos] = [];
                                        _self.activeGroups[startPos].push(featClass);
                                    } else {
                                        if ( _self.activeFeatures[startPos] === undefined)
                                            _self.activeFeatures[startPos] = [];
                                        _self.activeFeatures[startPos].push(featClass);
                                    }
                                    if (feat2['detail'] !== undefined && docNr == 0) {
                                        _self.featDetails[featClass] = [];
                                        _self.featDetails[featClass].push(feat2['detail']);
                                    }
                                    _self.getNextFeaturePos();
                                }
                            });




                        });
                    }
                    return false;
                } else
                    return true;
            });
        });
    };


    ComparisonParser.replaceXMLTag = function(pos, closingPos) {
        if (this.xmlString[pos+1] === '/')
            this.xmlString = this.xmlString.substr(0, pos) + "</div>" + this.xmlString.substr(closingPos+1);

        else {
            var xmlTag = this.xmlString.substr(pos, closingPos-pos+1),
                length = xmlTag.indexOf(' '); // would cut off attr
            if (length == -1)
                length = closingPos-pos;
            xmlTag     = this.xmlString.substr(pos+1, length-1);

            this.xmlString = this.xmlString.substr(0, pos) + '<div class="'+xmlTag+'">' + this.xmlString.substr(closingPos+1);
        }
    };


    ComparisonParser.insertFeatOT = function(pos) {
        var classes = "";

        if (! $.isEmptyObject(this.activeFeatures))
            classes += "feature ";

        if (! $.isEmptyObject(this.activeGroups))
            classes += "group ";

        $.each(this.activeFeatures, function(i, position) {
            $.each(position, function(k, featClass) {
                classes += featClass + " ";
            });
        });

        $.each(this.activeGroups, function(i, position) {
            $.each(position, function(k, featClass) {
                classes += featClass + " ";
            });
        });

        var tag = '<div class="'+ classes + '">';
        this.xmlString = this.xmlString.substr(0, pos+1) +tag+ this.xmlString.substr(pos+1);
    };


    ComparisonParser.getNextFeaturePos = function() {
        var pos = null;
        if (! $.isEmptyObject(MyApp.CollusionParser.featurePositions) ) {
            pos = MyApp.CollusionParser.featurePositions[0];
            MyApp.CollusionParser.featurePositions.splice(0, 1); // removes 1 item from index 0
        }
        this.nextFeaturePos= pos;
    };

    return ComparisonParser;
})();