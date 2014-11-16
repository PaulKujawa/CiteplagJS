App.CompareFilesController = Ember.ArrayController.extend({
    actions: {
        uploadFile: function() {
            var filename = this.get('suspiciousFile'); // todo get via param
            $.ajax({
                type: "GET" ,
                url: "xmlFiles/" + filename,
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
                    showError('error:' + xhr.status);
                }
            });
        }
    }
});