/**
 * converts comparison files' bodies from xml into html markup and adds feature tags
 */
MyApp.ComparisonParser = (function() {
    ComparisonParser.xmlString      = "";
    ComparisonParser["featDetails"] = {};
    ComparisonParser.activeFeatures = {}; //activeFeatures[position][i]
    ComparisonParser.activeGroups   = {};
    ComparisonParser.nextFeaturePos = 0;

    /**
     *
     * @constructor
     */
    function ComparisonParser() {}


    /**
     * main function, which parses the whole string (xml body)
     * checks for xml tags and feature positions
     * calls getNextFeaturePos(), insertFeatCT(), insertFeatOT(), convertXMLTag() and handleFeatPos()
     * @param matches
     * @param docNr
     */
    ComparisonParser.convertFile = function(matches, docNr) {
        var _self           = this,
            closingPos      = null;
        _self.xmlString     = MyApp.XMLFileHandler['compareFilesXML'][docNr];
        _self.getNextFeaturePos();

        for (var pos = _self.xmlString.length-1; pos >= 0; pos--) {
            if (_self.xmlString[pos] === '>') {
                closingPos = pos;
                if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups))
                    _self.insertFeatOT(closingPos); // feature opening tag, right of started xml tag

            } else if (_self.xmlString[pos] === '<') {
                _self.convertXMLTag(pos, closingPos);
                if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups))
                    _self.insertFeatCT(pos); // feature closing tag, left of converted xml tag

            } else if (pos == _self.nextFeaturePos)
                _self.handleFeatPos(matches, docNr, pos); // insert feature starting or closing tag
        }
    };


    /**
     * inserts end-tags and hold the classes of their opening tags "active" until their opening tags appear
     * active classes (of feature or groups) are implemented through connecting divs before & after each tag
     * calls insertFeatCT(), insertFeatOT(), getNextFeaturePos()
     * @param matches
     * @param docNr
     * @param pos
     */
    ComparisonParser.handleFeatPos = function(matches, docNr, pos) {
        var _self = this;
        $.each(matches, function(i, match) {

            $.each(match[docNr], function(f, feat) {
                if (feat['start'] == pos) {
                    _self.insertFeatOT(pos-1);
                    delete _self.activeFeatures[pos];
                    delete _self.activeGroups[pos];

                    if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups))
                        _self.insertFeatCT(pos); // left
                    _self.getNextFeaturePos();
                    return false; // stop each loop, since multiple features could start at this pos


                } else if (feat['end'] == pos) {
                    if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups)) {
                        _self.insertFeatOT(pos-1);
                        _self.insertFeatCT(pos); // right (pos = '<')
                    } else
                        _self.insertFeatCT(pos+1); // right

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
                    return false; // all closing feature found, break for performance
                } else
                    return true; // no effect, just for consistent return points
            });
        });
    };


    /**
     * convert xml tag into html tag with the previous xml tag as it's class
     * @param pos
     * @param closingPos
     */
    ComparisonParser.convertXMLTag = function(pos, closingPos) {
        if (this.xmlString[pos+1] === '/')
            this.xmlString = this.xmlString.substr(0, pos) + "</div>" + this.xmlString.substr(closingPos+1);

        else {
            var xmlTag = this.xmlString.substr(pos, closingPos-pos+1),
                length = xmlTag.indexOf(' '); // cuts off any attributes
            if (length == -1)
                length = closingPos-pos;
            xmlTag     = this.xmlString.substr(pos+1, length-1);

            this.xmlString = this.xmlString.substr(0, pos) + '<div class="'+xmlTag+'">' + this.xmlString.substr(closingPos+1);
        }
    };


    /**
     * insert feature closing tag
     * @param pos
     */
    ComparisonParser.insertFeatCT = function(pos) {
        this.xmlString = this.xmlString.substr(0, pos) +"</div>"+ this.xmlString.substr(pos);
    };


    /**
     * insert feature opening tag with every active class of features or feature groups
     * @param pos
     */
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


    /**
     * pops highest left feature position, which may be a opening or start tag
     */
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