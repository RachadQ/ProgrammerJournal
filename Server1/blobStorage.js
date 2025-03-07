require('dotenv').config();

const { BlobServiceClient } = require('@azure/storage-blob');
const multer = require('multer'); // Middleware for handling file uploads

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

const containerClient = blobServiceClient.getContainerClient(containerName);
 // List all containers in the storage account
 const containers = blobServiceClient.listContainers();
 console.log("Connection String:", process.env.AZURE_STORAGE_CONNECTION_STRING);
 // Function to test the connection by listing containers
async function testConnection() {
    try {
      // Try to list containers to verify access
      const containers = [];
      for await (const container of blobServiceClient.listContainers()) {
        containers.push(container);
      }
  
      if (containers.length === 0) {
        console.log("No containers found. The storage is empty.");
      } else {
        console.log("Containers found:", JSON.stringify(containers, null, 2));
      }
    } catch (error) {
      if (error.statusCode === 403) {
        console.error("Permission error: You do not have permission to list containers.");
      } else if (error.statusCode === 401) {
        console.error("Unauthorized: Invalid connection string or credentials.");
      } else {
        console.error("Error accessing Azure Blob Storage:", error.message);
      }
    }
  }
 
console.log("Connection String:", connectionString);
console.log("Container Name:", containerName);
//Upload file to Azure Blob
const uploadFile = async (file) =>
{
    
  if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("Azure Storage connection string not found in .env file");
}

    try{
        console.log('Uploaded file:', file); 
    const blobName = file.originalname;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    //const uploadBlobResponse = await blockBlobClient.upload(file.buffer,file.buffer.length);
    await blockBlobClient.upload(file.buffer, file.buffer.length);
    const fileUrl = `${process.env.AZURE_STORAGE_BLOB_URL}/${blobName}`
    return fileUrl;
    }
    catch(error){

        console.log("The error is" + error.message);
    }

};

const storage = multer.memoryStorage();
const upload = multer({storage});
// Test connection by listing containers
testConnection();

module.exports = {uploadFile,upload};



