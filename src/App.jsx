import React, { useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import "./App.css";

const App = () => {
  const initialColumns = {
    todo: { id: "todo", list: ["item 1", "item 2", "item 3"] },
    doing: { id: "doing", list: [] },
    done: { id: "done", list: [] },
    reject: { id: "reject", list: [] },
  };

  const [columns, setColumns] = useState(initialColumns);

  const onDragEnd = ({ source, destination }) => {
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    )
      return;

    const start = columns[source.droppableId];
    const end = columns[destination.droppableId];

    if (start === end) {
      const newList = Array.from(start.list);
      const [movedItem] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, movedItem);

      setColumns((state) => ({
        ...state,
        [start.id]: { ...start, list: newList },
      }));
    } else {
      const startList = Array.from(start.list);
      const [movedItem] = startList.splice(source.index, 1);
      const endList = Array.from(end.list);
      endList.splice(destination.index, 0, movedItem);

      setColumns((state) => ({
        ...state,
        [start.id]: { ...start, list: startList },
        [end.id]: { ...end, list: endList },
      }));
    }
  };
  const name = useRef();
  const handleColumn = () => {
    const newColumnId = name.current.value;
    if (newColumnId.trim() === "") return;
    const newColumn = {
      id: newColumnId,
      list: [],
    };
    setColumns((state) => ({ ...state, [newColumn.id]: newColumn }));
    name.current.value = "";
  };

  return (
    <>
      <div className="flex justify-center items-center py-2">
        <div className="border border-black p-2 bg-gray-100 flex flex-col items-center gap-3">
          <input
            type="text"
            placeholder="add new column"
            ref={name}
            className="bg-gray-500 p-2 text-white border-2 rounded border-gray-400 m-1 placeholder:text-white"
          />
          <button
            onClick={handleColumn}
            className="bg-black text-white p-2 rounded"
          >
            submit
          </button>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            margin: "24px auto",
            width: "80%",
            gap: "8px",
          }}
        >
          {Object.values(columns).map((col) => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided) => (
                <div className="text-center p-2 border rounded bg-gray-200">
                  <h2>{col.id}</h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "120px",
                    }}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {col.list.map((text, index) => (
                      <Draggable key={text} draggableId={text} index={index}>
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
    </>
  );
};

export default App;
