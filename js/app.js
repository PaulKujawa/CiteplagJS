$(function() {
    $('#collusionFileInput').change(function() {
        var filename = $(this).val(),
            callback = function(file) {
                MyApp.CollusionParser['collusionJSON'] = $.xml2json(file);
                this.loadCompare(0);
            };

        MyApp.Renderer.resetMarkup();
        MyApp.XMLFileHandler.loadCollusion(filename, callback());
    });
});