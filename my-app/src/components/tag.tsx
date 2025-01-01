import { TagProp } from "../interface/TagProp";

// Tag component to render individual tags
const Tag: React.FC<TagProp> = ({ name }) => {
    return (
      <span key={name} className="tag">
        {name}
      </span>
    );
  };
  
  export default Tag;