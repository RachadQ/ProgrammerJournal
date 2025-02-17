import React, { useState } from "react";
import { Accept, useDropzone } from 'react-dropzone';
import axios from "axios";

const FileUpload = () => {

    const [file, setFile] = useState<File | null>(null);


    //Handle file selection via react=dropzone
    const onDrop = (acceptedFiles) => {
        setFile(acceptedFiles[0]);
    }

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: false,
        accept: 'image/*' as unknown as Accept,  // Explicitly cast to Accept type
      });

    //function to uplad file to the backend server
    const uploadFile = async () => {
        if(!file)
        {
            alert('Please select an image first!');
            return;
        }

        const formData = new FormData();
        formData.append('file',file);

        try{
                const response = await axios.post('http://localhost:3001/upload', formData,
                    {
                        headers:{
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )
                console.log( "reached file upload" + response.data);  // Handle response (image uploaded successfully)
        }
        catch(error)
        {
            console.error('Error uploading image:', error);  // Handle error
        }
    }

    return (
        <div>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Drag and drop an image here, or click to select one</p>
          </div>
          {file && <p>Selected file: {file.name}</p>}
          <button onClick={uploadFile}>Upload Image</button>
        </div>
      );

};

export default FileUpload;