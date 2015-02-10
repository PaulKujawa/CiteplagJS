/**
 * Parses finding file
 */
MyApp.FindingsParser = (function() {
    FindingsParser.findingsJSON      = [];
    FindingsParser.matchTypes       = {}; /*[mType][m][d][f]['start']*/
    FindingsParser.featurePositions = [];
    FindingsParser.featDetails      = {};

    /**
     *
     * @constructor
     */
    function FindingsParser() {}



    /**
     * Catches all matches and saves them categorized to display as panels later
     */
    FindingsParser.parseMatches = function() {
        var _self = this;
        _self.matchTypes = {};

        var matches = _self.findingsJSON.alignments; // match
        if (matches.match.ref === undefined)
            matches = matches.match; // matches

        if (typeof(matches) == "function")
            return MyApp.TabRenderer.throwErrorMsg("Your finding.xml has no 'match' in 'alignments'.");

        var matchCnt = 0;
        $.each(matches, function(i, match) {
            if (_self.matchTypes[match.type] === undefined)
                _self.matchTypes[match.type] = [];

            _self.parseMatchFeats(match, matchCnt);
            matchCnt++;
        });
        _self.handleMatchTypes();
        return true;
    };



    /**
     * stores directly linked features of a match in matchTypes[type]
     * @param match
     * @param matchCnt
     */
    FindingsParser.parseMatchFeats = function(match, matchCnt) {
        var bothDocuments   = [],
            _self           = this;

        $.each(match.ref, function(refNr, ref) {
            var features = [];

            $.each(_self.findingsJSON.document, function(j, doc) {
                if (doc.id == ref.document) {

                    $.each(doc.feature, function(k, feature) {
                        if (doc.feature.value !== undefined)
                            feature = doc.feature; // just one feature

                        if (feature.id == ref.feature) {
                            var parsedFeat = _self.parseFeature(match, feature, matchCnt, refNr, false); // false - not in grp
                            features.push(parsedFeat);

                            if (parsedFeat['isGroup']) {
                                var matchSubCnt = 0;

                                $.each(feature.link, function(l, id) {
                                    if (id.ref !== undefined) // just one link
                                        id = id.ref;

                                    $.each(doc.feature, function(m, subFeat) {
                                        if (subFeat.id == id) {
                                            subFeat = _self.parseFeature(match, subFeat, matchCnt+"_"+matchSubCnt, refNr, true); // true - in grp
                                            features.push(subFeat);

                                            if (refNr == 1 && match.subconnections !== undefined) { // connect from right sub-features to left sub-ones
                                                var leftClassToConnect = FindingsParser.getLeftClassToConnect(match.subconnections, bothDocuments[0], doc.id, id);
                                                if (leftClassToConnect != null) // not explicitly listed as subConnection
                                                    _self.connectFeats(match.type, leftClassToConnect, subFeat['class']);
                                            }
                                        }
                                    });
                                    matchSubCnt++;
                                });
                            } else if (refNr == 1)// single feature out of grp && same class names both sides, runs just one time
                                _self.connectFeats(match.type, parsedFeat['class'], parsedFeat['class']);
                        }
                        if (feature == doc.feature) return false; // just one feat so skip further attr (loop elements)
                    });
                }
            });
            bothDocuments.push(features);
        });
        _self.matchTypes[match.type].push(bothDocuments);
    };



    /**
     * set up a representing object for a feature
     * @param vMatch
     * @param feat
     * @param matchCnt
     * @param refNr
     * @param inGroup
     * @returns {{}}
     */
    FindingsParser.parseFeature = function(vMatch, feat, matchCnt, refNr, inGroup) {
        var feature             = {};
            feature['start']    = parseInt(feat.start);
            feature['end']      = parseInt(feat.start) + parseInt(feat.length);
            feature['isGroup']  = feat.link !== undefined;
            feature['inGroup']  = inGroup;
            feature['id']       = feat.id;

        if (feature['isGroup'])             feature['class'] = "group" + matchCnt;
        else                                feature['class'] = "feature" + matchCnt;

        if (feat.value !== undefined)       feature['value']  = feat.value;
        if (vMatch.detail !== undefined)    feature['detail'] = this.parseMatchDetail(vMatch.detail);

        // no subFeatures -> left & right same class -> just left side to store
        if (refNr == 0 && !feature['inGroup'] && feature['detail'] !== undefined) {
            this.featDetails[feature['class']] = [];
            this.featDetails[feature['class']].push(feature['detail']);
        }
        return feature;
    };



    /**
     * Returns class of left feature, matching given right feature
     * @param connections
     * @param leftFeats
     * @param docID
     * @param featId
     * @returns {boolean}
     */
    FindingsParser.getLeftClassToConnect = function(connections, leftFeats, docID, featId) {
        var leftClass = null;
//        var leftClassToConnect = FindingsParser.getLeftClassToConnect(match.subconnections, bothDocuments[0], doc.id, id);

        if (connections.connection.ref === undefined)
            connections = connections.connection; // just one connection

        $.each(connections, function(i, connection) {
            if (docID == connection.ref[1].document && featId == connection.ref[1].feature) { // 2nd document (right side) && id matching
                var leftId = connection.ref[0].feature;

                $.each(leftFeats, function(i, feat) {
                    if (feat.id == leftId) {
                        leftClass = feat.class;
                        return true;
                    }
                });
                if (leftClass != null) return true;
            }
        });
        return leftClass;
    };



    /**
     * adds 2 features, which have to be visually connected
     * @param matchType
     * @param leftClass
     * @param rightClass
     */
    FindingsParser.connectFeats = function(matchType, leftClass, rightClass) {
        if (MyApp.TabRenderer.featToConnect[matchType] === undefined)
            MyApp.TabRenderer.featToConnect[matchType] = {};


        if (MyApp.TabRenderer.featToConnect[matchType][leftClass] === undefined)
            MyApp.TabRenderer.featToConnect[matchType][leftClass] = [];

        MyApp.TabRenderer.featToConnect[matchType][leftClass].push(rightClass);
    };



    /**
     * recursively parses details and returns them as string
     * @param detail
     * @returns {string}
     */
    FindingsParser.parseMatchDetail = function(detail) {
        var div     = "",
            _self   = this;

        if (detail.detail.name === undefined)
            detail = detail.detail; // details

        $.each(detail, function(i, vDetail) {
            if (vDetail.name !== undefined)
                div += '<div>' + vDetail.name;

            if (vDetail.text !== undefined)
                div += ': ' + vDetail.text;

            if (vDetail.detail !== undefined) // recursive for nested details
                div += _self.parseMatchDetail(vDetail);

            div += '</div>';
        });
        return div;
    };



    /**
     * orders feature positions, both start & end, in reverse order for an efficient parsing
     * @param matches
     * @param docNr
     */
    FindingsParser.orderFeaturePos = function(matches, docNr) {
        var _self = this;
        _self.featurePositions = [];

        $.each(matches, function(m, match) {
            $.each(match[docNr], function(f, feature) {
                _self.featurePositions.push(feature['start']);
                _self.featurePositions.push(feature['end']);
            });
        });

        _self.featurePositions.sort(function(a, b) {
            return b-a;
        });
    };



    /**
     * Attaches tabs for matchTypes with compiled texts
     */
    FindingsParser.handleMatchTypes = function() {
        var _self = this;
        $.each(_self.matchTypes, function(matchTitle, matches) {
            var html = [];
            for (var docNr = 0; docNr <= 1; docNr++) {
                _self.orderFeaturePos(matches, docNr);
                MyApp.ComparisonParser.convertFile(matches, docNr);
                html.push(MyApp.ComparisonParser.xmlString);
            }
            MyApp.TabRenderer.createTab(matchTitle, html[0], html[1]);
        });

        MyApp.TabRenderer.patternPanels.find('li:first').addClass('active');
        MyApp.TabRenderer.comparisonDiv.find('div:first').addClass('active');
        MyApp.Canvas.drawCanvas();
    };


    return FindingsParser;
})();
