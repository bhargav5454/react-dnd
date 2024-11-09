import React from "react";
import { Droppable } from "react-beautiful-dnd";
import Item from "./Item";

const Column = ({ col: { list, status } }) => {
  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <div className="flex flex-col gap-2 p-4 bg-gray-200 rounded shadow-md w-72 min-h-[100px] ">
          <h2>{status}</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "120px",
            }}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {list.map((text, index) => (
              <Item key={text} text={text} index={index} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default Column;
