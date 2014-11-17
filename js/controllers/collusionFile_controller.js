App.CollusionFileController = Ember.ObjectController.extend({
    actions: {
        upload: function(){
            $.ajax({
                type: "GET" ,
                url: "xmlFiles/" + this.get('collusionFile'),
                dataType: "xml",

                success: function(file) {
                    alert("jay");

                    /*$(file).find("match").each(function() {
                        console.log( "found details: "+ $(this).find("detail").text() );
                    });*/
                },

                error: function(xhr, textStatus, error) {
                    console.log( [textStatus, xhr.responseText].join(':') );
                }
            });
        }
    }
});