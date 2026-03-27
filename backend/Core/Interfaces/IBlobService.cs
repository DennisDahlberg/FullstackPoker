namespace Core.Interfaces;

public interface IBlobService
{
    Task<string> UploadImage(Stream imageStream, string fileName, string contentType);
}