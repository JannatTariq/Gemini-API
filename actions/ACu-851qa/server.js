async function(properties, context) {
    const key = context.keys.key;
    const addHttpsToUrl = (url) => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https:${url}`;
        }
        return url;
    };
    const fileUrl = addHttpsToUrl(properties.file);
    
    if (!fileUrl) {
        console.error("File URL is undefined or empty!");
        return Promise.reject({
            success: false,
            error_message: "File URL is required"
        });
    }

    function getMimeType(fileExtension) {
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'pdf': 'application/pdf',
            'mp3': 'audio/mp3',
            'wav': 'audio/wav',
            'mpeg': 'video/mpeg',
            'mp4': 'video/mp4',
            'mov': 'video/mov',
            'avi': 'video/avi',
            'wmv': 'video/wmv',
            'flv': 'video/flv',
            'mpg': 'video/mpg',
            'mpegps': 'video/mpegps'
        };
        
        return mimeTypes[fileExtension.toLowerCase()] || 'application/octet-stream'; 
    }

        try {
          
            const fileExtension = fileUrl.split('.').pop(); 
            const mimeType = getMimeType(fileExtension); 

            const response = await fetch(fileUrl, { method: 'HEAD' });

            if (!response.ok) {
                throw new Error(`Failed to fetch file size: ${response.status} ${response.statusText}`);
            }
            const fileSize = parseInt(response.headers.get('Content-Length'), 10); 
            
            const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${key}`;
            
            const fileData = await fetch(fileUrl).then(res => res.blob()); 
            
            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Content-Length': fileSize,
                    'X-Goog-Upload-Offset': '0',
                    'X-Goog-Upload-Command': 'upload, finalize',
                    'Content-Type': mimeType
                },
                body: fileData
            });
           
            
            if (!uploadResponse.ok) {
                throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }

            const fileInfo = await uploadResponse.json();
              
            
               
            const fileUri = fileInfo.file;

            return {
                name: fileUri.name || "Unknown Name", 
                mimeType: fileUri.mimeType || mimeType,
                sizeBytes: fileUri.sizeBytes || fileSize,
                createTime: fileUri.createTime || "N/A",
                updateTime: fileUri.updateTime || "N/A",
                expirationTime: fileUri.expirationTime || "N/A",
                sha256Hash: fileUri.sha256Hash || "N/A",
                uri: fileUri.uri || "N/A",
                state: fileUri.state || "N/A"
            };
            
        } catch (error) {
            return{
                error: error.message
            }
        }
   

}