var MyApp = MyApp || {};

/**
 * start point of application & any user-event listener
 * calls xmlFileHandler.loadCollusion()
 */
$(function() {
    // SO.com/questions/19741754/capturing-shown-event-from-bootstrap-tab
    $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
        MyApp.Renderer.drawCanvas();
    });


    /**
     * start point, after a file as been chosen
     */
    $('#saveUpload').click(function() {
        $("#collusionModal").modal("hide");
        var filename = $("#collusionInput").val();
        MyApp.Renderer.pageDescription.remove();
        MyApp.Renderer.resetForNewFile();
        MyApp.XMLFileHandler.loadCollusion($("#xmlFolder").val(), filename);
    });
});