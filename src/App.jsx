import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useFetchDataQuery, useUpdateDataMutation } from "./store/api/DataApi";

const App = () => {
  const { data: apiResponse } = useFetchDataQuery();
  // const  = useSelector((state) => state.data.data.data?.data);
  const [columns, setColumns] = useState({});
  const [updateData] = useUpdateDataMutation();
  const nameRef = useRef();

  // Effect to update columns when data is fetched
  useEffect(() => {
    if (apiResponse?.data?.data) {
      const organizedColumns = Object.entries(apiResponse.data.data).reduce(
        (acc, [status, items]) => ({
          ...acc,
          [status]: { status, items },
        }),
        {}
      );
      setColumns(organizedColumns);
    }
  }, [apiResponse]);

  // Handle drag end event to update the column status of the item
  const onDragEnd = ({ source, destination }) => {
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    const start = columns[source.droppableId];
    const end = columns[destination.droppableId];

    if (start === end) {
      const newItems = Array.from(start.items);
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);
      setColumns((prevState) => ({
        ...prevState,
        [start.status]: { ...start, items: newItems },
      }));
    } else {
      const startItems = Array.from(start.items);
      const [movedItem] = startItems.splice(source.index, 1);

      const endItems = Array.from(end.items);
      endItems.splice(destination.index, 0, movedItem);

      const updatedItem = {
        itemId: movedItem.id,
        updatedStatus: end.status,
        prevStatus: start.status,
      };
      updateData(updatedItem);

      setColumns((prevState) => ({
        ...prevState,
        [start.status]: { ...start, items: startItems },
        [end.status]: { ...end, items: endItems },
      }));
    }
  };

  // Handle adding a new column
  const handleColumn = () => {
    const newColumnId = nameRef.current.value;
    if (newColumnId.trim() === "") return;

    const newColumn = { status: newColumnId, items: [] };
    setColumns((prevState) => ({
      ...prevState,
      [newColumn.status]: newColumn,
    }));
    nameRef.current.value = "";
  };

  return (
    <>
      <div className="flex justify-center items-center py-2">
        <div className="border border-black p-2 bg-gray-100 flex flex-col items-center gap-3">
          <input
            type="text"
            placeholder="Add new column"
            ref={nameRef}
            className="bg-gray-500 p-2 text-white border-2 rounded border-gray-400 m-1 placeholder:text-white"
          />
          <button
            onClick={handleColumn}
            className="bg-black text-white p-2 rounded"
          >
            Submit
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
            height: "full",
          }}
        >
          {Object.values(columns).map((col) => (
            <Droppable key={col.status} droppableId={col.status}>
              {(provided, snapshot) => (
                <div
                  className={`text-center p-2 border rounded bg-gray-200 ${
                    snapshot.isDraggingOver ? "bg-blue-100" : ""
                  }`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>{col.status}</h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "120px",
                    }}
                  >
                    {col.items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            className={`bg-gray-500 p-2 text-white border-2 rounded border-gray-400 m-1 ${
                              snapshot.isDragging
                                ? "bg-blue-200 text-black"
                                : ""
                            }`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {item.title}
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
