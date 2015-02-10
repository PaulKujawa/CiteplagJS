/**
 * converts comparison files' bodies from xml into html markup and adds feature tags
 */
MyApp.ComparisonParser = (function() {
    ComparisonParser.xmlString      = "";
    ComparisonParser.activeFeatures = {}; //activeFeatures[position][i]
    ComparisonParser.activeGroups   = {};
    ComparisonParser.activeIds      = {};
    ComparisonParser.nextFeaturePos = 0;

    /**
     *
     * @constructor
     */
    function ComparisonParser() {}



    /**
     * main function, which parses the whole string (xml body)
     * checks for xml tags and feature positions
     * @param matches
     * @param docNr
     */
    ComparisonParser.convertFile = function(matches, docNr) {
        var _self           = this,
            closingPos      = null;
        _self.xmlString     = MyApp.XMLFileHandler['compareFilesXML'][docNr];
        _self.getNextFeaturePos();


        for (var pos = _self.xmlString.length-1; 0 <= pos; pos--) {
            if (_self.xmlString[pos] === '>') {
                closingPos = pos;
                if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups))
                    _self.insertFeatOT(closingPos); // feature opening tag, right of started xml tag

            } else if (_self.xmlString[pos] === '<') {
                _self.convertXMLTag(pos, closingPos);
                if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups))
                    _self.insertFeatCT(pos); // feature closing tag, left of converted xml tag

            } else if (pos == _self.nextFeaturePos) {
                _self.handleFeatPos(matches, docNr, pos); // insert feature OT / CT

                var oldPos = _self.nextFeaturePos; // since multiple OT / CT are handled together
                while (oldPos == _self.nextFeaturePos)
                    _self.getNextFeaturePos();
            }
        }
    };


    /**
     * inserts end-tags or opening tags to hold classes between their tags active
     * active classes (of feature or groups) are implemented through connecting divs before & after each tag
     * @param matches
     * @param docNr
     * @param pos
     */
    ComparisonParser.handleFeatPos = function(matches, docNr, pos) {
        var _self       = this,
            noStartYet  = true,
            noEndYet    = true;

        $.each(matches, function(i, match) { // one time "for" OT and all times "for" CT
            $.each(match[docNr], function(f, feat) {
                if (noStartYet && feat['start'] == pos) { // set OT just once
                    _self.insertFeatOT(pos-1); // OT left of pos
                    delete _self.activeFeatures[pos];
                    delete _self.activeGroups[pos];
                    delete _self.activeIds[pos];
                    noStartYet = false;

                    if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups))
                        _self.insertFeatCT(pos); // now CT right of pos (left of OT)
                }

                if (feat['end'] == pos) {
                    if (noEndYet) { // set CT just once
                        if (! $.isEmptyObject(_self.activeFeatures) || ! $.isEmptyObject(_self.activeGroups))
                            _self.insertFeatOT(pos-1); // first OT right of pos                                               theor. should be pos
                        _self.insertFeatCT(pos); // now CT right of pos (left of OT)                                          theor. should be pos+1
                        noEndYet = false;
                    }
                    _self.addActiveClass(feat); // add ALL CT to stacks
                }
            });
        });
    };



    /**
     * Adds feature to stack (features & groups)
     * @param feat
     */
    ComparisonParser.addActiveClass = function(feat) {
        var startPos  = feat['start'],
            featClass = feat['class'];

        if (feat['isGroup']) { // push group class to active ones
            if ( this.activeGroups[startPos] === undefined )
                this.activeGroups[startPos] = [];
            this.activeGroups[startPos].push(featClass);

        } else { // push feature class to active ones
            if ( this.activeFeatures[startPos] === undefined)
                this.activeFeatures[startPos] = [];
            this.activeFeatures[startPos].push(featClass);
        }

        if ( this.activeIds[startPos] === undefined) // push Id of feature/group to active ones
            this.activeIds[startPos] = [];
        this.activeIds[startPos].push(feat['id']);
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
        var classes = "",
            ids     = "";

        if (! $.isEmptyObject(this.activeFeatures)) classes += "feature ";
        if (! $.isEmptyObject(this.activeGroups))   classes += "group ";

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

        $.each(this.activeIds, function(i, position) {
            $.each(position, function(k, featId) {
                ids += featId + " ";
            });
        });

        var tag = "<div class='" +classes.slice(0, -1)+ "' data-ids='" +ids.slice(0, -1)+ "'>";
        this.xmlString = this.xmlString.substr(0, pos+1) +tag+ this.xmlString.substr(pos+1);
    };



    /**
     * pops highest left feature position, which may be a opening or start tag
     */
    ComparisonParser.getNextFeaturePos = function() {
        var pos = null;
        if (! $.isEmptyObject(MyApp.FindingsParser.featurePositions) ) {
            pos = MyApp.FindingsParser.featurePositions[0];
            MyApp.FindingsParser.featurePositions.splice(0, 1); // removes 1 item from index 0
        }
        this.nextFeaturePos= pos;
    };

    return ComparisonParser;
})();