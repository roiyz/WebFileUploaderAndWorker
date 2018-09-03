var azstorage = require('azure-storage');
const tableName = "TasksTracker";
const queueName = "tasksqueue";
const partitionName = "tasks";

//Initializes the table that will hold information about the uploaded files
exports.initDB = function() {
  console.log("Initializing tasks tables");
  var tableService = azstorage.createTableService();
  tableService.createTableIfNotExists(tableName, function(error, result, response) {
  if (error) {
     console.error("Error trying to initialize the tracking DB " + error);  
  }
  else
  {
    var queueSvc = azstorage.createQueueService();
    queueSvc.createQueueIfNotExists(queueName, function(error, results, response){
      if(!error){
      // Queue created or exists
      }
    });
  }
});
}

//Used to track submitted files by insert an entry to the table and pushing a new message into the queue
exports.submitBatch = function (batchId,originalFileName) {
	var tableService = azstorage.createTableService();
        var queueSvc = azstorage.createQueueService();
        var entGen = azstorage.TableUtilities.entityGenerator;
        var entity = {
            PartitionKey: entGen.String(partitionName),
            RowKey: entGen.String(batchId),
            Status: entGen.String('Queued'),
            OriginalFileName: entGen.String(originalFileName),
            FileUri: entGen.String('')
            };
        tableService.insertEntity(tableName, entity, function(error, result, response) {
        if (!error) {
           console.log("(1)success inserting job with " + batchId + " Id " + originalFileName); 
	   queueSvc.createMessage(queueName, batchId, function(error, results, response){
             if(!error){
               console.log("(2)success inserting job with " + batchId + " Id");
             }
           });
        }
        else
                        console.error("Error inserting new batch, for batchId="+ batchId + " " +error);
        });
};

//Gets the status for a specific uploaded file (batch Id)
exports.getStatus = function (batchId,callback) {
        var tableService = azstorage.createTableService();
        console.log("[tasks-tracking]Checking status for batchId "+batchId);
	tableService.retrieveEntity(tableName, 'tasks',batchId, function(error, result, response){
          if(!error){
                console.log("[tasks-tracking]"+ result["Status"]["_"] + " " + result["FileUri"]["_"]);
		//if the file is processed, the url with be pushed into the FileUri column. Return this value if it exists, otherwise just return the value qqueued
		callback(result["FileUri"]["_"]);
   	  }
	  else
	  {
		callback("queued")
	  }

	});
};
