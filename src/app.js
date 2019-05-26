var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var tasksTracker = require('./helpers/tasks-tracking.js');
var blobHelper = require('./helpers/blob-helper.js');
var guid = require('uuid');
const PORT = 8080;
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){

  // File upload form
  var form = new formidable.IncomingForm();

  // Handle single files for now
  form.multiples = true;

  // store all uploads in the /uploads directory
  var batchId = guid();
  var uploadDir = 'uploads/';

  if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
  }
  form.uploadDir = path.join(__dirname, uploadDir);

  // Move the uploaded file to the proper staging area, then upload it to the blob container, and enter a new message to the process queue
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir,batchId));
    blobHelper.uploadFile(batchId);
    tasksTracker.submitBatch(batchId,file.name);
  });

  // log errors 
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once the file has been uploaded, send a response to the client
  form.on('end', function() {
    console.log("Finished processing form");
    res.end(batchId);
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

//The below route is used for ajax calls coming from the web page to understand the job's status
app.get('/ID/:requestId', function (req, res) {
  var requestId= req.params['requestId'];
  tasksTracker.getStatus(requestId,function(returnValue){
     res.send(returnValue);
  });

})

var server = app.listen(PORT, function(){
  tasksTracker.initDB(); 
  console.log('Server listening on port '+PORT);
});
