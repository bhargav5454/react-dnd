import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import "./App.css";

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

   // Make sure we're actually moving the item
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
     // Move the item within the list
     // Start by making a new list without the dragged item
     const newList = start.list.filter(
       (_, idx) => idx !== source.index
     )

     // Then insert the item at the right location
     newList.splice(destination.index, 0, start.list[source.index])

     // Then create a new copy of the column object
     const newCol = {
       id: start.id,
       list: newList
     }

     // Update the state
     setColumns(state => ({ ...state, [newCol.id]: newCol }))
     return null
   } else {
     // If start is different from end, we need to update multiple columns
     // Filter the start list like before
     const newStartList = start.list.filter(
       (_, idx) => idx !== source.index
     )

     // Create a new start column
     const newStartCol = {
       id: start.id,
       list: newStartList
     }

     // Make a new end list array
     const newEndList = end.list

     // Insert the item into the end list
     newEndList.splice(destination.index, 0, start.list[source.index])

     // Create a new end column
     const newEndCol = {
       id: end.id,
       list: newEndList
     }

     // Update the state
     setColumns(state => ({
       ...state,
       [newStartCol.id]: newStartCol,
       [newEndCol.id]: newEndCol
     }))
     return null
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
          <Droppable droppableId={col.id} key={col.id}>
            {(provided) => (
              <div className="text-center p-2 border rounded bg-gray-200">
                <h2>{col.id}</h2>
                <div
                  key={col.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "120px",
                  }}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {col.list.map((text, index) => (
                    <Draggable draggableId={text} index={index} key={index}>
                      {(provided) => (
                        <div
                          className="bg-gray-500 p-2 text-white border-2 rounded border-gray-400 m-1"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {text}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default App;
