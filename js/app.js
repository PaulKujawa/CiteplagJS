var MyApp = MyApp || {};

$(function() {
    //$('#collusionFileInput').change(function() {
        var filename = "collusion.xml"; //$(this).val();
        MyApp.Renderer.resetMarkup();
        MyApp.XMLFileHandler.loadCollusion(filename);
   // });
});