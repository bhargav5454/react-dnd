import React, { useRef, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import "./App.css";
import Column from "./Column";

const App = () => {
  const [columns, setColumns] = useState({
    todo: { status: "todo", list: ["item 1", "item 2", "item 3"] },
    doing: { status: "doing", list: [] },
    done: { status: "done", list: [] },
    reject: { status: "reject", list: [] },
  });

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
        [start.status]: { ...start, list: newList },
      }));
    } else {
      const newStartList = Array.from(start.list);
      const [movedItem] = newStartList.splice(source.index, 1);
      const newEndList = Array.from(end.list);
      newEndList.splice(destination.index, 0, movedItem);

      setColumns((state) => ({
        ...state,
        [start.status]: { ...start, list: newStartList },
        [end.status]: { ...end, list: newEndList },
      }));
    }
  };

  const nameRef = useRef();
  const handleColumn = () => {
    const newColumnId = nameRef.current.value.trim();
    if (!newColumnId) return;

    setColumns((state) => ({
      ...state,
      [newColumnId]: { status: newColumnId, list: [] },
    }));
    nameRef.current.value = "";
  };

  return (
    <>
      <div className="flex justify-center items-center py-4">
        <div className="border border-gray-400 p-4 bg-gray-100 flex flex-col items-center gap-3">
          <input
            type="text"
            placeholder="Add new column"
            ref={nameRef}
            className="bg-gray-500 p-2 text-white rounded placeholder:text-white"
          />
          <button
            onClick={handleColumn}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-wrap gap-4 px-4 justify-center h-auto">
          {Object.values(columns).map((col) => (
            <Column col={col} key={col.status} />
          ))}
        </div>
      </DragDropContext>
    </>
  );
};

export default App;
