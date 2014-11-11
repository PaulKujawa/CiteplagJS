Uploads.UploadController = Ember.ArrayController.extend({
    actions: {
        uploadFiles: function(){
            $.ajax({
                type: "GET" ,
                url: "collusion.xml" ,
                dataType: "xml",
                contentType: "text/xml;charset=utf-8",
                async: false,

                success: function(file) {
                    var xml = $(file);
                    var title = xml.find("title");
                    console.log( title.text() );

                    //var xmlDoc = $.parseXML(xml);
                    //$(xmlDoc).find('title').each(function() {
                    //   alert ( $(this).text() );
                    //});
                },

                error: function(xhr, textStatus, error) {
                    console.log( textStatus + ': ' + xhr.responseText);
                    showError('error:' + xhr.status);
                }
            });
        }
    }
});