Uploads.UploadController = Ember.ArrayController.extend({
    actions: {
        createFile: function(){

            alert("ok");
            /*
            var fd = new FormData(document.getElementById("fileinfo"));
            fd.append("postContent", this.get('newPost'));
            this.set('newPost', ''); //reset text field
            $('#inputFile').val(''); //reset fileinput field

            Ember.$.ajax({
                url: "http://localhost:3000/posts",
                type: "POST",
                data: fd,
                processData: false,  // tell jQuery not to process the data
                contentType: false,   // tell jQuery not to set contentType
            });
            */
        }
    }
});