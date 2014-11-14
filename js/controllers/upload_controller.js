App.UploadController = Ember.ArrayController.extend({
    actions: {
        uploadSuspiciousFile: function() {
            var file = this.readSourceFiles(this.get('suspiciousFile'));
            var content = (new XMLSerializer()).serializeToString(file);
            console.log( content.substring(6, 6+13) );
        },

        uploadComparisonFile: function() {
            var file = this.readSourceFiles(this.get('comparisonFile'));
            console.log("do something");
        },

        uploadCollusionFile: function(){
            var file = this.readSourceFiles(this.get('collusionFile'));
            $(file).find("match").each(function() {
                console.log( "found details: "+ $(this).find("detail").text() );
            });
        },


        readSourceFiles: function(filename) {
            $.ajax({
                type: "GET" ,
                url: "xmlFiles/"+filename,
                dataType: "xml",

                success: function(file) {
                    return file;
                },
                error: function(xhr, textStatus, error) {
                    console.log( textStatus + ': ' + xhr.responseText);
                    showError('error:' + xhr.status);
                }
            });
        }
    }
});