Todos.TodosController = Ember.ArrayController.extend({
    actions: {
        createToDo: function() { // triggered by action of an <input> in view
            var title = this.get('newTitle'); // value field of this <input>
            if (!title) { return false; }
            if (!title.trim()) { return; }

            var todo = this.store.createRecord('todo', { // creates new model entry
                title: title,
                isCompleted: false
            });

            this.set('newTitle', ''); // clears value field
            todo.save(); // flush
        }
    }
});
