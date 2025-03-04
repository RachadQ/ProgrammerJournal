import { useEffect, useState } from "react";

const UserImage = () => {

    const [image, setImage] = useState<string | null>(null);
    
    return (
        <div>
          <h2>Your Profile Image</h2>
          {image ? <img src={image} alt="Profile" style={{ width: "200px", margin: "10px" }} /> : <p>No image found</p>}
        </div>
      );
}

export default UserImage