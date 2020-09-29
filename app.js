const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");

const fs = require('fs');
const readline = require('readline');
const prompt = require('prompt-sync')({sigint: true});

/**
 * 
 * @param {BlobServiceClient} blobServiceClient 
 */
async function showLogs(blobServiceClient) {
    for await (const containerClientProps of blobServiceClient.listContainers()) {
      let containerClient = blobServiceClient.getContainerClient(containerClientProps.name);
      console.log(`Container : ${containerClientProps.name}`);
      for await (const blob of containerClient.listBlobsFlat()) {
        console.log(`Blob : ${blob.name}`);
        let appendBlobClient = containerClient.getAppendBlobClient(blob.name);
        let logFile = await appendBlobClient.downloadToFile('logFile.txt');
        fs.readFile('logFile.txt', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(data);
        });
      }
    }
}

async function showContainers(blobServiceClient) {
    for await (const containerClientProps of blobServiceClient.listContainers()) {
      let containerClient = blobServiceClient.getContainerClient(containerClientProps.name);
      console.log(`Container : ${containerClientProps.name}`);
    }
}


/**
 * 
 * @param {BlobServiceClient} blobServiceClient 
 */
async function deleteLogFile(blobServiceClient, containerName, logFilename) {
    let containerClient = blobServiceClient.getContainerClient(containerName);
    containerClient.deleteBlob(logFilename);
}


async function main() {
    // Enter your storage account name
    const account = process.env.ACCOUNT_NAME || "track12uxstudy";
  
    // Azure AD Credential information is required to run this sample:
    if (
      !process.env.AZURE_TENANT_ID ||
      !process.env.AZURE_CLIENT_ID ||
      !process.env.AZURE_CLIENT_SECRET
    ) {
      console.warn(
        "Azure AD authentication information not provided, but it is required to run this sample. Exiting."
      );
      return;
    }
  
    // ONLY AVAILABLE IN NODE.JS RUNTIME
    // DefaultAzureCredential will first look for Azure Active Directory (AAD)
    // client secret credentials in the following environment variables:
    //
    // - AZURE_TENANT_ID: The ID of your AAD tenant
    // - AZURE_CLIENT_ID: The ID of your AAD app registration (client)
    // - AZURE_CLIENT_SECRET: The client secret for your AAD app registration
    //
    // If those environment variables aren't found and your application is deployed
    // to an Azure VM or App Service instance, the managed service identity endpoint
    // will be used as a fallback authentication source.
    const defaultAzureCredential = new DefaultAzureCredential();
  
    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net`,
      defaultAzureCredential
    );
    
    // var rl = readline.createInterface(process.stdin, process.stdout);
    // rl.setPrompt(`Commands ` + '\n' + '1: View logs\n' + '2: Show containers\n' + '3: Delete log file' + '-1: Quit\n' + 'Enter your command: ');
    // rl.prompt();
    // rl.on('line', (choice) => {
    //     if (choice == '-1') {
    //         rl.close();
    //     }
    //     else if (choice == '1') {
    //         showLogs(blobServiceClient);
    //         rl.prompt();
    //     }
    //     else if (choice == '2') {
    //         showContainers(blobServiceClient);
    //         rl.prompt();
    //     }
    // }); 

    let quit = false;
    while (!quit) {
        let choice = prompt(`Commands ` + '\n' + '1: View logs\n' + '2: Show containers\n' + '3: Delete log file\n' + '-1: Quit\n' + 'Enter your command: ');
        choice = Number(choice);
        if (choice == -1) {
            quit = true;
        }
        else if (choice == 1) {
            await showLogs(blobServiceClient);
        }
        else if (choice == 2) {
            await showContainers(blobServiceClient);
        }
        else if (choice == 3) {
            let containerName = prompt('Enter the name of the container that contains the log file to delete: ');
            let logFileName = prompt('Enter the name of the log file to delete: ');
            await deleteLogFile(blobServiceClient, containerName, logFileName);
        }
    }


  
  }
  
  main().catch((err) => {
    console.error("Error running sample:", err.message);
  });