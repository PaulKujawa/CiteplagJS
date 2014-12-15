var MyApp = MyApp || {};

$(function() {
    $('#collusionFileInput').change(function() {
        var filename = $(this).val();
        MyApp.Renderer.resetMarkup();
        MyApp.XMLFileHandler.loadCollusion(filename);
    });
});