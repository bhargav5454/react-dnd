import React, { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { PlusCircle, X } from "lucide-react";
import {
  useFetchDataQuery,
  useUpdateDataMutation,
  useUpdateIndexMutation,
} from "./store/api/DataApi";

const App = () => {
  const { data: apiResponse } = useFetchDataQuery();
  // const  = useSelector((state) => state.data.data.data?.data);
  const [columns, setColumns] = useState({});
  const [updateData] = useUpdateDataMutation();
  const [updateIndex] = useUpdateIndexMutation();

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
      updateIndex({
        status: start.status,
        sourceIndex: source?.index,
        destinationIndex: destination?.index,
      });
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

  const handleNewItem = (columnStatus) => {
    const newItemText = newItemTexts[columnStatus] || "";
    if (newItemText) {
      setColumns((prev) => ({
        ...prev,
        [columnStatus]: {
          ...prev[columnStatus],
          items: [
            ...prev[columnStatus].items,
            { id: `task${Date.now()}`, title: newItemText },
          ],
        },
      }));
      setNewItemTexts((prev) => ({ ...prev, [columnStatus]: "" }));
      setActiveInputs((prev) => ({ ...prev, [columnStatus]: false }));
    }
  };

  // const onDragUpdate = (data) => {
  //   console.log("🚀 ~ onDragUpdate ~ data:", data.destination)

  // }
  return (
    <>
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center mb-8">
            <div className="bg-white border border-gray-300 shadow-md rounded-lg p-4 flex items-center space-x-4">
              <input
                type="text"
                placeholder="Add new column"
                ref={nameRef}
                className="bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
              <button
                onClick={handleColumn}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              >
                Add Column
              </button>
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 flex-wrap justify-center">
              {Object.values(columns).map((col) => (
                <Droppable key={col.status} droppableId={col.status}>
                  {(provided, snapshot) => (
                    <div
                      className={`bg-gray-50 border border-gray-500 rounded-lg w-[300px] h-full shadow-lg ${
                        snapshot.isDraggingOver ? "ring-2 ring-gray-400" : ""
                      }`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <h2 className="text-lg font-bold text-gray-800 p-4 text-center border-b border-gray-300">
                        {col.status}
                      </h2>
                      <div className="p-4 space-y-3">
                        {col.items.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                className={`bg-white p-4 rounded-lg border border-gray-200 ${
                                  snapshot.isDragging
                                    ? "shadow-lg ring-1 ring-gray-300"
                                    : ""
                                }`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <h3 className="text-gray-700 font-semibold">
                                  {item.title}
                                </h3>
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
        </div>
      </div>
    </>
  );
};

export default App;
