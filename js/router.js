Uploads.Router.map(function() {
    this.resource('todos', { path: '/' });
});

Uploads.UploadsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('todo'); // returns all todos
    }
});