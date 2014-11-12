Uploads.UploadController = Ember.ArrayController.extend({
    actions: {
        uploadFiles: function(){
            $.ajax({
                type: "GET" ,
                url: this.get('suspiciousFile'),
                dataType: "xml",

                success: function(file) {
                    // example for source.xml & suspicious.xml
                    var start = 6,
                        length = 13,
                        content = (new XMLSerializer()).serializeToString(file),
                        part = content.substring(start, start+length);
                    console.log( part );

                    // example for collusion.xml
                    $(file).find("match").each(function() {
                        var detail = $(this).find("detail").text();
                        console.log( "found details: "+ detail );
                    });
                },

                error: function(xhr, textStatus, error) {
                    console.log( textStatus + ': ' + xhr.responseText);
                    showError('error:' + xhr.status);
                }
            });
        }
    }
});