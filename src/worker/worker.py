import azure.common
import azure.storage
import os, uuid, sys
import time
from datetime import datetime, timedelta
from azure.storage.blob import BlockBlobService, PublicAccess, BlobPermissions
from azure.storage.queue import QueueService
from azure.storage.table import TableService

#Check for env variables
if "AZURE_STORAGE_ACCOUNT" in os.environ and "AZURE_STORAGE_ACCESS_KEY" in os.environ:
    print("Found needed env variables, starting...")
else:
    print("Missing required azure storge settings from environment variables AZURE_STORAGE_ACCOUNT or AZURE_STORAGE_ACCESS_KEY. Exiting")
    exit();

account_name = os.getenv("AZURE_STORAGE_ACCOUNT")
account_key = os.getenv("AZURE_STORAGE_ACCESS_KEY")
queue_name = "tasksqueue"
container_name = "workerfiles"
block_blob_service = BlockBlobService(account_name, account_key)
queue_service = QueueService(account_name, account_key)
table_service = TableService(account_name, account_key)
temp_store_dir = "uploads"

if not os.path.exists(temp_store_dir):
    os.makedirs(temp_store_dir)

while True:
        #Check for messages in our queue every 5 seconds
        messages = queue_service.get_messages(queue_name,1)
        for message in messages:
                print(message.content)
                block_blob_service.get_blob_to_path(container_name,message.content,temp_store_dir+"/"+message.content);
                #DO WORK ON THE FILE
                ####
                #Upload the file
                block_blob_service.create_blob_from_path(container_name,"p_"+message.content,temp_store_dir+"/"+message.content);
                #Create a unique sas key for each file
		token = block_blob_service.generate_blob_shared_access_signature(
                        container_name,
                        "p_"+message.content,
                        BlobPermissions.READ,
                        datetime.utcnow() + timedelta(hours=1),
                )
                full_uri="https://"+account_name+".blob.core.windows.net/" + container_name + "/" + "p_"+message.content+"?"+token
                print(full_uri)
                task = {'PartitionKey': 'tasks', 'RowKey': message.content, 'Status' : 'processed','FileUri':full_uri}
                table_service.update_entity('TasksTracker', task)
                queue_service.delete_message(queue_name, message.id, message.pop_receipt)
                os.remove(temp_store_dir+"/"+message.content)
        time.sleep(5)
