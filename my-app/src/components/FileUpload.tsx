import React, { useState } from "react";
import { Accept, useDropzone } from 'react-dropzone';
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import * as Toggle from "@radix-ui/react-toggle";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "./Default/AuthProvider";


const FileUpload = ({userId}) => {
    const { authToken,loginUserUserId} = useAuth();
     
    const [isOpen,setIsOpen] = useState(false);
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
        <div className="text-center">
      <div className="relative flex justify-center mb-4">
        <img
          src="https://www.bing.com/th?id=OIP.42gCaIWoZnhhRiZ7BzQXjQHaHa&w=174&h=185&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"
          alt="Profile Picture"
          className="w-32 h-32 md:w-48 md:h-48 rounded-full"
        />

         {/* Edit button (only visible if logged-in user matches the username of the profile) */}
         {userId === loginUserUserId && authToken && (
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-md"
          style = {{
            marginBottom: '30px',  // Added margin to push it slightly up
            marginRight: '560px',   // Added margin to push it slightly left
          }}
        >
          <i className={`fa ${faEdit} text-sm`} />
        </button>
        )}
      </div>

      {isOpen && (
      <div key={isOpen.toString()} className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto text-center border">
          <h2 className="text-xl font-semibold mb-4">Upload an Image</h2>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 p-6 rounded-lg cursor-pointer hover:bg-gray-100"
          >
            <input {...getInputProps()} />
            <p className="text-gray-500">Drag & drop an image here, or click to select one</p>
          </div>
          {file && <p className="mt-2 text-gray-600">Selected file: {file.name}</p>}
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={uploadFile}
              className="bg-blue-500 text-white px-2 py-1 rounded-md"
            >
              Upload Image
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-gray-400 text-white px-2 py-1 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    );

};

export default FileUpload;