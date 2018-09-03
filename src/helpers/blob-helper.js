var azstorage = require('azure-storage');
const blobContainerName = "workerfiles";

exports.uploadFile = function (batchId) {
	const blobService = azstorage.createBlobService();
	blobService.createBlockBlobFromLocalFile(blobContainerName,batchId,"uploads/"+batchId,err => {
            if(err) {
                console.log("[blob-helper]Error:"+err);
            } else {
		console.log("[blob-helper]Uploaded blob "+batchId);
            }
        });

};
