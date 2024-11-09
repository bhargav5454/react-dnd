import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import "./App.css";
import Column from "./Column";

const App = () => {
  const initialColumns = {
    todo: {
      id: "todo",
      list: ["item 1", "item 2", "item 3"],
    },
    doing: {
      id: "doing",
      list: [],
    },
    done: {
      id: "done",
      list: [],
    },
    reject: {
      id: "reject",
      list: [],
    },
  };
  const [columns, setColumns] = useState(initialColumns);
  const onDragEnd = ({ source, destination }) => {
       // Make sure we have a valid destination
       if (destination === undefined || destination === null) return null

       // If the source and destination columns are the same
       // AND if the index is the same, the item isn't moving
       if (
         source.droppableId === destination.droppableId &&
         destination.index === source.index
       )
         return null
   
   
       // Set start and end variables
       const start = columns[source.droppableId]
       const end = columns[destination.droppableId]
    // If start is the same as end, we're in the same column
    if (start === end) {
      /* ... */
    } else {
      // If start is different from end, we need to update multiple columns
      // Filter the start list like before
      const newStartList = start.list.filter((_, idx) => idx !== source.index);

      // Create a new start column
      const newStartCol = {
        id: start.id,
        list: newStartList,
      };

      // Make a new end list array
      const newEndList = end.list;

      // Insert the item into the end list
      newEndList.splice(destination.index, 0, start.list[source.index]);

      // Create a new end column
      const newEndCol = {
        id: end.id,
        list: newEndList,
      };

      // Update the state
      setColumns((state) => ({
        ...state,
        [newStartCol.id]: newStartCol,
        [newEndCol.id]: newEndCol,
      }));
      return null;
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          margin: "24px auto",
          width: "80%",
          gap: "8px",
        }}
      >
        {Object.values(columns).map((col) => (
          <Column col={col} key={col.id} />
        ))}
      </div>
    </DragDropContext>
  );
};

export default App;
