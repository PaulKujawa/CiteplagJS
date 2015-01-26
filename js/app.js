var MyApp = MyApp || {};

/**
 * start point of application & any user-event listener
 * calls xmlFileHandler.loadCollusion()
 */
$(function() {
    $('#newFile').click(function(event) {
        event.preventDefault();
        var fileUpload = $('#fileUpload');
        fileUpload.removeClass('hidden');
    });


    // SO.com/questions/19741754/capturing-shown-event-from-bootstrap-tab
    $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
        MyApp.Renderer.drawCanvas();
    });


    /**
     * start point, after a file as been chosen
     */
    $('#collusionFileInput').change(function() {
        var filename = $(this).val();
        MyApp.Renderer.pageDescription.remove();
        MyApp.Renderer.resetForNewFile();
        MyApp.XMLFileHandler.loadCollusion(filename);
    });
});