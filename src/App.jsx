import React, { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Clock, Plus, X } from "lucide-react";
import {
  useAddNewCardMutation,
  useAddNewColumnMutation,
  useFetchDataQuery,
  useUpdateDataMutation,
  useUpdateIndexMutation,
} from "./store/api/DataApi";

const App = () => {
  const { data: apiResponse } = useFetchDataQuery();
  const [columns, setColumns] = useState({});
  const [Model, setModel] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const MAX_LENGTH = 100;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const nameRef = useRef();

  // axios query
  const [updateData] = useUpdateDataMutation();
  const [updateIndex] = useUpdateIndexMutation();
  const [newColums] = useAddNewColumnMutation();
  const [newCard] = useAddNewCardMutation();

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8001");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "order_updated") {
        if (data?.item.data?.data) {
          const organizedColumns = Object.entries(data?.item.data?.data).reduce(
            (acc, [status, items]) => ({
              ...acc,
              [status]: { status, items },
            }),
            {}
          );
          setColumns(organizedColumns);
        }
      }
      if (data.type === "reordered_updated") {
        if (data?.item) {
          setColumns((prevState) => ({
            ...prevState,
            [data.item.status]: {
              status: data.item.status,
              items: data.item.updatedData,
            },
          }));
        }
      }
      if (data.type === "new_column") {
        const newColumnId = data.item.columnName;
        setColumns((prevState) => ({
          ...prevState,
          [newColumnId]: { status: newColumnId, items: [] },
        }));
      }
    };
    return () => socket.close();
  }, []);

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
        newIndex: destination.index,
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
    if (newColumnId == "") {
      alert("Please enter a column name");
      return;
    }
    newColums({ columnName: newColumnId });
    if (newColumnId.trim() === "") return;

    const newColumn = { status: newColumnId, items: [] };
    setColumns((prevState) => ({
      ...prevState,
      [newColumn.status]: newColumn,
    }));
    nameRef.current.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    newCard(formData);
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      status: "",
    });
    setModel(false);
  };

  // Toggle the modal visibility
  const handleAddCard = (statusId) => {
    setModel(true);
    setFormData((prevData) => ({
      ...prevData,
      status: statusId,
    }));
  };

  const closeModal = () => {
    setModel(false);
  };

  const handleToggle = (id) => {
    setExpandedItemId(expandedItemId === id ? null : id); // Toggle the expansion
  };

  const onDragUpdate = (data) => {
    console.log("🚀 ~ onDragUpdate ~ data:", data.destination);
  };

  return (
    <>
      <div className="min-h-screen bg-white p-8 overflow-x-auto flex">
        <div className="">
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
            <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
              <div className="flex gap-4 flex-grow justify-center">
                {Object.values(columns).map((col) => (
                  <Droppable key={col.status} droppableId={col.status}>
                    {(provided, snapshot) => (
                      <>
                        <div
                          className={`bg-[#f3f6ff] border border-gray-500 rounded-lg w-[300px] h-full shadow-lg p-3`}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <div className="flex justify-between">
                            <h2 className="text-lg font-bold text-gray-800 border-gray-300">
                              {col.status}
                            </h2>
                            <div className="border p-1  border-dashed rounded-full border-gray-500 text-gray-500 hover:text-blue-600 hover:ease-in-out">
                              <Plus
                                onClick={() => handleAddCard(col.status)}
                                size={18}
                              />
                            </div>
                          </div>
                          <div>
                            {col.items.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id.toString()}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <>
                                    <div
                                      className={`bg-white  rounded-lg border border-gray-200 mt-3 ${
                                        snapshot.isDragging
                                          ? "shadow-2xl ring-1 ring-gray-300"
                                          : ""
                                      }`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <div className="todo-card p-3  transition duration-300 ease-in-out">
                                        <h3 className="text-gray-800 text-xl font-semibold mb-2">
                                          {item.title}
                                        </h3>

                                        <div key={item.id} className="mb-4">
                                          <p className="text-gray-600 text-sm">
                                            {item.description.length >
                                            MAX_LENGTH
                                              ? expandedItemId === item.id
                                                ? item.description
                                                : `${item.description.substring(
                                                    0,
                                                    MAX_LENGTH
                                                  )}...`
                                              : item.description}
                                          </p>
                                          {item.description.length >
                                            MAX_LENGTH && (
                                            <button
                                              className="text-blue-500 text-sm focus:outline-none hover:underline"
                                              onClick={() =>
                                                handleToggle(item.id)
                                              }
                                            >
                                              {expandedItemId === item.id
                                                ? "Less"
                                                : "More"}
                                            </button>
                                          )}
                                        </div>

                                        <div className="flex items-center text-gray-500 text-sm">
                                          <Clock
                                            className="text-gray-500 mr-2"
                                            size={16}
                                          />
                                          <span>{item.dueDate}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      </>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          </div>
        </div>

      {/* Modal with smooth animation */}
      {Model && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-5 backdrop-blur-sm transition-all duration-500 ease-in-out opacity-100">
          <div className="bg-white rounded-lg w-1/4 p-6 transform transition-all duration-500 ease-in-out scale-100 opacity-100 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Add New Card</h2>
              <button onClick={closeModal}>
                <X className="text-gray-600" />
              </button>
            </div>
            {/* Add form or content for the new card */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Card title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Card description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
