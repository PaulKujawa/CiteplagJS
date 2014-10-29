Todos.Router.map(function() {
    this.resource('todos', { path: '/' }); // links todos template (see index.html)
});

Todos.TodosRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('todo'); // returns all todos
    }
});