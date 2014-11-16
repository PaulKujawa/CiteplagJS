App.CompareFilesController = Ember.ArrayController.extend({
    actions: {
        upload: function() {
           $.ajax({
                type: "GET" ,
                url: "xmlFiles/" + this.get('suspiciousFile'),
                dataType: "xml",

                success: function(file) {
                    var content = (new XMLSerializer()).serializeToString(file),
                        part = content.substring(6, 6+13),
                        store = this.store;
                    store.createRecord('compareFiles', {
                       title: part
                    });

                },

                error: function(xhr, textStatus, error) {
                    console.log( [textStatus, xhr.responseText].join(':') );
                }
            });
        }
    }
});