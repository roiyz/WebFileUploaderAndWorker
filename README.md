# WebFileUploaderAndWorker

A generic Node.js file upload web interface and python worker (optimized for Azure)

BEFORE YOU CONTINUE ANY FURTHER
This project is not intended to be used in production systems. It LACKS substantial items and enhancements to make it ready for production deployment, such as:
-	Adequate test coverage
-	Error handling and recovery
-	Sufficient logging for debugging and troubleshooting
-	Artifacts cleanup
-	Security hardening
-	Modularization 
-	Costs optimization
-	Some artifacts names are hard coded in directly within the files.
-	Cross platform compatibility (this project is running on Ubuntu Linux and wasn’t tested on other linux distros or windows based os)
-	And probably some more.

The following project consists of 3 main components:
-	A node.js based web page to upload files
-	A python worker that processes the files
-	An azure storage blob, table and queue used to store the files and coordinate the workers

Installation notes:
-	Get an azure storage account. This project uses the storage account’s keys so make sure it’s a dedicated storage account just for this project. 
		Create a storage Queue named “tasksqueue”
		Create a blob container named “workerfiles”
		Create a table named “TasksTracker” 
-	Web
		Download the web source code to an ubuntu linux box. 
		Set the following environment variables
			AZURE_STORAGE_ACCESS_KEY - a valid key to your storage account
			AZURE_STORAGE_ACCOUNT- the storage account’s name
		To get the web service started run node app.js
		By default, the web servers start with port 8080
-	Python worker
		Make sure you have the azure python module by using ‘pip install azure’. Check this Azure [page]( https://docs.microsoft.com/en-us/python/azure/python-sdk-azure-install?view=azure-python) for more details and options
		Start the python worker with python worker.py (can be on the same box as the web server but also works by running it on another box)

-	Run/Test
		Browse to the http://localhost:8080 where the web server is installed
		Upload a file by using the web page "upload" button.
		Track the worker’s process
		:If everything is ok, the webpage should redirect you to download the “processed” file

