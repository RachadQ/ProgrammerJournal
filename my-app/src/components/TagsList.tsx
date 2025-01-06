import { TagsListProps } from "../interface/TagsListProps";
import Tag from "./tag";

const TagsList: React.FC<TagsListProps> = ({ tags }) => {
    return (
      <div className="tags-list">
        {tags.map(tag => (
          <Tag key={tag._id} name={tag.name} _id={tag._id}  />
        ))}
      </div>
    );
  };
  
  export default TagsList;