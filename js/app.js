var MyApp = MyApp || {};

/**
 * start point of application & any user-event listener
 * @author Paul Kujawa p.kujawa@gmx.net
 */
$(function() {
    // stackoverflow.com/questions/19741754/capturing-shown-event-from-bootstrap-tab
    $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
        MyApp.Canvas.drawCanvas();
    });




    /**
     * Redraw canvas on window resize
     */
    $(window).resize(function() {
        MyApp.Canvas.drawCanvas();
    });


    /**
     * start point, after a file as been chosen
     */
    $('#saveUpload').click(function() {
        $("#findingsModal").modal("hide");
        var filename = $("#findingsInput").val();

        MyApp.TextAreas.resetForNewFile();
        MyApp.XMLFileHandler.loadFinding($("#xmlFolder").val(), filename);
    });
});
