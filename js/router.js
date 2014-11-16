/*
    serializer for turning JSON payload into record obj
    normally between adapter (of cloud) and store, which will return a generated record
 */


App.Router.map(function() {
    //this.resource('index', {path: '/' });
    // for nested routes set resource
    this.route('upload');
    this.route('comparison');
});

App.IndexRoute          = Ember.Route.extend({});
App.CompareFilesRoute   = Ember.Route.extend({});
App.CollusionFileRoute  = Ember.Route.extend({});


App.ComparisonRoute = Ember.Route.extend({
    model: function() { // todo remove since it's just for learning
        return this.store.find('collusionFile');
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