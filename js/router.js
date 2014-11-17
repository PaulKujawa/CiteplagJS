App.Router.map(function() {
    //this.resource('index', {path: '/' });
    this.route('compareFiles', {path: '/upload'});
    this.route('comparison');
});


App.ComparisonRoute = Ember.Route.extend({
    model: function() { // todo remove since it's just for learning
        return this.store.find('collusionFiles', 1);
    }
});