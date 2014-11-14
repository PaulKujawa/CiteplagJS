App.Router.map(function() {
    //this.resource('index', {path: '/' });
    this.route('upload'); // for nested routes set resource
    this.route('comparison');
});

App.IndexRoute = Ember.Route.extend({
    setupController: function(controller) {
        controller
            .set('title', "Welcome to CitePlag")
            .set('description', "CitePlag demonstrates Citation-based Plagiarism Detection (CbPD)");
    }
});

App.UploadRoute = Ember.Route.extend({
    model: function() {
        return [{
            mTitle: "Your suspicious file",
            mAction: "uploadSuspiciousFile",
            mValue: "suspiciousFile"
        }, {
            mTitle: "Your comparison file",
            mAction: "uploadComparisonFile",
            mValue: "comparisonFile"
        }, {
            mTitle: "Your collusion file",
            mAction: "uploadCollusionFile",
            mValue: "collusionFile"
        }];
    }
});

App.ComparisonRoute = Ember.Route.extend({
    model: function() {
        return [{
            mTitle: "BC",
            mAction: "patternBC"
        }, {
            mTitle: "CC",
            mAction: "patternCC"
        },{
            mTitle: "GCT",
            mAction: "patternGCT"
        },{
            mTitle: "LCCS",
            mAction: "patternLCCS"
        },{
            mTitle: "LCCS Dist.",
            mAction: "patternLCCSD"
        }];
    }
});