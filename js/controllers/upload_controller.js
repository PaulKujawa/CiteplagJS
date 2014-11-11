Uploads.UploadController = Ember.ArrayController.extend({
    actions: {
        uploadFiles: function(){
            $.ajax({
                type: "GET" ,
                url: this.get('suspiciousFile'),
                dataType: "xml",
                contentType: "text/xml;charset=utf-8",
                async: false,

                success: function(file) {
                    var xml = $(file);
                    var title = xml.find("title");
                    console.log( "title: "+ title.text() );
                },

                error: function(xhr, textStatus, error) {
                    console.log( textStatus + ': ' + xhr.responseText);
                    showError('error:' + xhr.status);
                }
            });
        }
    }
});