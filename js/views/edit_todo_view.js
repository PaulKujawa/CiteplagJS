Uploads.EditToDoView = Ember.TextField.extend({
   didInsertElement: function() {
       this.$().focus();
   }
});

Ember.Handlebars.helper('edit-todo', Uploads.EditToDoView);