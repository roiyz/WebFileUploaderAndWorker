$('.upload-btn').on('click', function (){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
});

$('#upload-input').on('change', function(){

  var files = $(this).get(0).files;

  if (files.length > 0){
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();

    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name);
    }

    var jqXHR = $.ajax({
      url: '/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
          $("#batchId").text(data);
	  
          console.log('upload successful!\n' + data);
          $('#loading-indicator').show();
          checkStatus(data);
      },
      xhr: function() {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function(evt) {

          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);

            // update the Bootstrap progress bar with the new percentage
            $('.progress-bar').text(percentComplete + '%');
            $('.progress-bar').width(percentComplete + '%');

            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $('.progress-bar').html('Done');
            }

          }

        }, false);

        return xhr;
      }
    });
  }
});

//Uses the batchId to check the status against the /ID api call which looks up in the tasks table for a row with the batch ID
function checkStatus(batchId){
        var xmlhttp = new XMLHttpRequest();
        var url = "/ID/"+batchId;

        xmlhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            if(this.responseText!='queued' && this.responseText!='')
            {
              $('#loading-indicator').hide();
              window.location.href=this.responseText;
            }
            else
            {
              setTimeout(checkStatus,5000,batchId);
            }
          }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
}



