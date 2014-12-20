var MyApp = MyApp || {};

/**
 * start point of application, after initial collusion file is selected
 * calls xmlFileHandler.loadCollusion()
 */
$(function() {
    //$('#collusionFileInput').change(function() {
        var filename = "collusion.xml"; //$(this).val();
        MyApp.Renderer.resetMarkup();
        MyApp.XMLFileHandler.loadCollusion(filename);
   // });
});