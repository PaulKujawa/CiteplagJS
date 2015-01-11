/**
 * Parses collusion file
 */
MyApp.CollusionParser = (function() {
    CollusionParser["collusionJSON"]    = [];
    CollusionParser["matchTypes"]       = {}; /*[mType][m][d][f]['start']*/
    CollusionParser["featurePositions"] = [];

    /**
     *
     * @constructor
     */
    function CollusionParser() {}


    /**
     * Catches all matches and saves them categorized to display as panels later
     * calls parseMatch() & eventually handleMatchTypes()
     */
    CollusionParser.parseMatches = function() {
        var _self = this;
        _self.matchTypes = {};

        var matches = _self.collusionJSON.alignments; // match
        if (matches.match.ref === undefined)
            matches = matches.match; // matches


        if (typeof(matches) == "function")
            return MyApp.Renderer.throwErrorMsg("Your collusion.xml has no 'match' in 'alignments'.");

        var cnt = 0;
        $.each(matches, function(i, match) {
            if (match.type === undefined)
                return MyApp.Renderer.throwErrorMsg("A 'match' in your collusion.xml has no 'type' attribute given.");

            if (_self.matchTypes[match.type] === undefined)
                _self.matchTypes[match.type] = [];
            _self.parseMatch(match, cnt);
            cnt++;
        });
        _self.handleMatchTypes();
    };


    /**
     * loops referenced features, of a match, and stores them in matchTypes[type]
     * calls parseFeature()
     * @param match
     * @param cnt
     */
    CollusionParser.parseMatch = function(match, cnt) {
        var documents = [],
            _self = this;

        if (match.ref.length != 2)
            return MyApp.Renderer.throwErrorMsg("A 'match' has less than 2 'ref' tags.");

        $.each(match.ref, function(i, ref) {
            var features = [];

            $.each(_self.collusionJSON.document, function(j, doc) {
                if (doc.id == ref.document) {
                    $.each(doc.feature, function(k, feature) {
                        if (feature.id == ref.feature) {
                            var inGroup = false,
                                parsedFeat = _self.parseFeature(match, feature, cnt, inGroup);
                            features.push(parsedFeat);

                            if (parsedFeat['group']) {
                                var nestedCnt = 0;
                                inGroup = true;
                                $.each(feature.link, function(l, id) {
                                    if (id.ref !== undefined)
                                        id = id.ref;
                                    $.each(doc.feature, function(m, linkedFeat) {
                                        if (linkedFeat.id == id) {
                                            linkedFeat = _self.parseFeature(match, linkedFeat, cnt+"_"+nestedCnt, inGroup);
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
        _self.matchTypes[match.type].push(documents);
    };


    /**
     * set up a representing object for a feature
     * @param vMatch
     * @param feat
     * @param cnt
     * @param inGroup
     * @returns {{}}
     */
    CollusionParser.parseFeature = function(vMatch, feat, cnt, inGroup) {
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

        if (!inGroup && vMatch.detail !== undefined)
            feature['detail'] = this.parseMatchDetail(vMatch.detail);

        return feature;
    };


    /**
     * recursively parses details and returns them as string
     * @param detail
     * @returns {string}
     */
    CollusionParser.parseMatchDetail = function(detail) {
        var div = "",
            _self = this;

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
    CollusionParser.orderFeaturePos = function(matches, docNr) {
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
     * calls orderFeaturePos(), ComparisonParser.convertFile() and Renderer.createTab for every matchType
     * finally, calls Renderer.setUp()
     */
    CollusionParser.handleMatchTypes = function() {
        var _self = this;
        $.each(_self.matchTypes, function(matchTitle, matches) {
            var html = [];
            for (var docNr = 0; docNr <= 1; docNr++) {
                _self.orderFeaturePos(matches, docNr);
                MyApp.ComparisonParser.convertFile(matches, docNr);
                html.push(MyApp.ComparisonParser.xmlString);
            }
            MyApp.Renderer.createTab(matchTitle, html[0], html[1]);
        });
        MyApp.Renderer.setUp();
    };


    return CollusionParser;
})();
