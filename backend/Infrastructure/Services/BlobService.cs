using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Core.Interfaces;

namespace Infrastructure.Services;

public class BlobService : IBlobService
{
    private readonly string _containerName = "profiles";
    private readonly BlobServiceClient _blobServiceClient;

    public BlobService(BlobServiceClient blobServiceClient)
    {
        _blobServiceClient = blobServiceClient;
    }

    public async Task<string> UploadImage(Stream imageStream, string fileName, string contentType)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
        
        var blobClient = containerClient.GetBlobClient(fileName);
        
        var blobHttpHeader = new BlobHttpHeaders {ContentType = contentType};
        await blobClient.UploadAsync(imageStream, new BlobUploadOptions { HttpHeaders = blobHttpHeader });
        
        return blobClient.Uri.ToString();
    }
}