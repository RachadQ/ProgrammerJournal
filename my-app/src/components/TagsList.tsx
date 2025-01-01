import { TagsListProps } from "../interface/TagsListProps";
import Tag from "./tag";

const TagsList: React.FC<TagsListProps> = ({ tags }) => {
    return (
      <div className="tags-list">
        {tags.map(tag => (
          <Tag key={tag.name} name={tag.name}  />
        ))}
      </div>
    );
  };
  
  export default TagsList;