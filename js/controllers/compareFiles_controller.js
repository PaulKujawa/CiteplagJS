App.CompareFilesController = Ember.ArrayController.extend({
    actions: {
        upload: function() {
            var store = this.store;

            $.ajax({
                type: "GET" ,
                url: "xmlFiles/collusion.xml",// + this.get('suspiciousFile'),
                dataType: "xml",

                success: function(file) { // for collusion controller
                    var parsedJSON = $.xml2json(file);

                    if (parsedJSON.alignments.match.ref === undefined)
                        var matches = parsedJSON.alignments.match; // matches
                    else
                        var matches = parsedJSON.alignments; // 1 match



                    $.each(matches, function(i, vMatch) { // o(n)
                        if (vMatch.detail !== undefined) {/* todo */}

                        $.each(vMatch.ref, function(j, vRef) { // o(2)

                            $.each(parsedJSON.document, function(k, vDoc) { // o(2)
                                if (vDoc.id === vRef.document) {

                                    $.each(vDoc.feature, function(h, vFeat) { // o(n)
                                        if (vFeat.id === vRef.feature && vFeat.start !== undefined) {
                                            var until = parseInt(vFeat.start) + parseInt(vFeat.length);
                                            console.log(
                                                vFeat.type + ": " + vFeat.start + " - " + until
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