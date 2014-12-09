var CollusionParser = function() {
    this.collusionJSON      = [];
    this.matchTypes         = {}; /*[mType][m][d][f]['start']*/
    this.comparisonParser   = [];
    this.renderer           = [];
};


CollusionParser.prototype.parseMatches = function() {
    var matches = this.collusionJSON.alignments; // match
    if (matches.match.ref === undefined)
        matches = matches.match; // matches

    var cnt = 0;
    $.each(matches, function(i, match) {
        if (this.matchTypes[match.type] === undefined)
            this.matchTypes[match.type] = [];
        this.parseMatch(match, cnt);
        cnt++;
    });
    this.renderMatchTypes();
};


CollusionParser.prototype.renderMatchTypes = function() {
    $.each(this.matchTypes, function(matchTitle, matches) {

        var docNr = 0;
        this.comparisonParser.orderFeaturePos(matches, docNr);
        var leftFileHTML = this.comparisonParser.convertXMLtoHTML(matches, docNr);

        docNr++;
        this.comparisonParser.orderFeaturePos(matches, docNr);
        var rightFileHTML = this.comparisonParser.convertXMLtoHTML(matches, docNr);

        this.renderer.createTab(matchTitle, leftFileHTML, rightFileHTML);
        this.renderer.attachDetailsDiv();
        this.renderer.activateTab();
    });
};


CollusionParser.prototype.parseMatch = function(match, cnt) {
    var documents = [];
    $.each(match.ref, function(i, ref) {
        var features = [];

        $.each(this.collusionJSON.document, function(j, doc) {
            if (doc.id == ref.document) {
                $.each(doc.feature, function(k, feature) {
                    if (feature.id == ref.feature) {
                        var parsedFeat = this.parseFeature(match, feature, cnt);
                        features.push(parsedFeat);

                        if (parsedFeat['group']) {
                            var nestedCnt = 0;
                            $.each(feature.link, function(l, id) {
                                if (id.ref !== undefined)
                                    id = id.ref;
                                id = id.substr(1); // cut off char #
                                $.each(doc.feature, function(m, linkedFeat) {
                                    if (linkedFeat.id == id) {
                                        linkedFeat = this.parseFeature(match, linkedFeat, cnt+"_"+nestedCnt);
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
    this.matchTypes[match.type].push(documents);
};


CollusionParser.prototype.parseFeature = function(vMatch, feat, cnt) {
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


CollusionParser.prototype.parseMatchDetail = function(detail) {
    var div = "";

    if (detail.detail.name === undefined)
        detail = detail.detail; // details

    $.each(detail, function(i, vDetail) {
        if (vDetail.name !== undefined)
            div += '<div>' + vDetail.name;

        if (vDetail.text !== undefined)
            div += ': ' + vDetail.text;

        if (vDetail.detail !== undefined) // recursive for nested details
            div += this.parseMatchDetail(vDetail);

        div += '</div>';
    });
    return div;
};


CollusionParser.prototype.setJSON = function(json) {
    this.collusionJSON = json;
};


CollusionParser.prototype.setComparisonParser = function(comparisonParser) {
    this.comparisonParser = comparisonParser;
};


CollusionParser.prototype.setRenderer = function(renderer) {
    this.renderer = renderer
};
