App.CompareFilesController = Ember.ArrayController.extend({
    actions: {
        upload: function() {
            store = this.store;

            $.ajax({
                type: "GET" ,
                url: "xmlFiles/" + "collusion.xml",// + this.get('suspiciousFile'),
                dataType: "xml",

                success: function(file) { // for collusion controller
                    var parsedJSON = $.xml2json(file);

                    $.each(parsedJSON.alignments.match, function(i, vMatch) { // o(n)
                        if (typeof  vMatch.detail !== undefined) {/* todo */}

                        // align, match, was mit details machen?
                        // 1. doc, f_pattern1 > start & length nur placeholder?
                        // 2. doc, f_pattern1 > kein start & length?

                        $.each(vMatch.ref, function(j, vRef) { // o(2)
                            $.each(parsedJSON.document, function(k, vDoc) { // o(2)
                                if (vDoc.id === vRef.document) {
                                    $.each(vDoc.feature, function(h, vFeat) { // o(n)
                                        if (vFeat.id === vRef.feature) {
                                            if (vFeat.start)
                                                var until = parseInt(vFeat.start) + parseInt(vFeat.length);
                                                console.log(
                                                    vFeat.type + ": " +
                                                    vFeat.start + " - " + until
                                                );
                                        }
                                    });
                                }
                            });
                        });
                    });



                    /*store.createRecord('compareFiles', {
                       title: part
                    });*/

                },

                error: function(xhr, textStatus, error) {
                    console.log( [textStatus, xhr.responseText].join(':') );
                }
            });
        },

        parse: function(file, pos, length) {
            var content = (new XMLSerializer()).serializeToString(file);
            return content.substring(pos, pos+length);
        }
    }
});