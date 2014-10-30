Todos.TodoController = Ember.ObjectController.extend({
    isCompleted: function(key, value) {
        var model = this.get('model');

        if (value === undefined) { // called through page load
            return model.get('isCompleted');

        } else { // called through clicked checkbox
            model.set('isCompleted', value);
            model.save();
            return value; // to set the checkbox
        }
    }.property('model.isCompleted')
});