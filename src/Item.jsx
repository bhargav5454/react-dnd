import { Draggable } from "react-beautiful-dnd";

const Item = ({ text, index }) => {
  return (
    <Draggable draggableId={text} index={index}>
      {(provided) => (
        <div
          className="bg-gray-500 p-2 text-white border-2 rounded border-gray-400 m-1 shadow-sm"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {text}
        </div>
      )}
    </Draggable>
  );
};

export default Item;
