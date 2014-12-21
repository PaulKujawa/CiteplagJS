var MyApp = MyApp || {};

/**
 * start point of application, after initial collusion file is selected
 * calls xmlFileHandler.loadCollusion()
 */
$(function() {
    $('#newFile').click(function(event) {
        event.preventDefault();
        var fileUpload = $('#fileUpload');
        fileUpload.removeClass('hidden');
    });


    $('#collusionFileInput').change(function() {
        var filename = $(this).val(); //"collusion.xml"; //
        MyApp.Renderer.resetMarkup();
        MyApp.XMLFileHandler.loadCollusion(filename);
    });
});