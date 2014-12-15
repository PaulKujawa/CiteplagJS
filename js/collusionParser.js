MyApp.CollusionParser = (function() {
    CollusionParser["collusionJSON"]  = [];
    CollusionParser["matchTypes"]     = {}; /*[mType][m][d][f]['start']*/

    function CollusionParser() {}

    CollusionParser.parseMatches = function() {
        var _self = this;

        var matches = _self.collusionJSON.alignments; // match
        if (matches.match.ref === undefined)
            matches = matches.match; // matches

        var cnt = 0;
        $.each(matches, function(i, match) {
            if (_self.matchTypes()[match.type] === undefined)
                _self.matchTypes[match.type] = [];
            _self.parseMatch(match, cnt);
            cnt++;
        });
        _self.renderMatchTypes();
    };


    CollusionParser.renderMatchTypes = function() {
        var _self = this;
        $.each(_self.matchTypes, function(matchTitle, matches) {

            var docNr = 0;
            _self.orderFeaturePos(matches, docNr);
            var leftFileHTML = _self.convertXMLtoHTML(matches, docNr);

            docNr++;
            MyApp.ComparisonParser.orderFeaturePos(matches, docNr);
            var rightFileHTML = _self.convertXMLtoHTML(matches, docNr);

            MyApp.Renderer.createTab(matchTitle, leftFileHTML, rightFileHTML);
            MyApp.Renderer.attachDetailsDiv();
            MyApp.Renderer.activateTab();
        });
    };


    CollusionParser.parseMatch = function(match, cnt) {
        var documents = [],
            _self = this;

        $.each(match.ref, function(i, ref) {
            var features = [];

            $.each(_self.collusionJSON.document, function(j, doc) {
                if (doc.id == ref.document) {
                    $.each(doc.feature, function(k, feature) {
                        if (feature.id == ref.feature) {
                            var parsedFeat = _self.parseFeature(match, feature, cnt);
                            features.push(parsedFeat);

                            if (parsedFeat['group']) {
                                var nestedCnt = 0;
                                $.each(feature.link, function(l, id) {
                                    if (id.ref !== undefined)
                                        id = id.ref;
                                    id = id.substr(1); // cut off char #
                                    $.each(doc.feature, function(m, linkedFeat) {
                                        if (linkedFeat.id == id) {
                                            linkedFeat = _self.parseFeature(match, linkedFeat, cnt+"_"+nestedCnt);
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


    CollusionParser.parseFeature = function(vMatch, feat, cnt) {
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
            feature['detail'] = this.parseMatchDetail(vMatch.detail);

        return feature;
    };


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
})();
