import React, { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Clock, X, MoreHorizontal, Edit } from "lucide-react";
import {
  useAddNewCardMutation,
  useAddNewColumnMutation,
  useFetchDataQuery,
  useUpdateDataMutation,
  useUpdateIndexMutation,
} from "./store/api/DataApi";

const App = () => {
  // State management
  const { data: apiResponse } = useFetchDataQuery();
  const [columns, setColumns] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  // Constants
  const MAX_DESCRIPTION_LENGTH = 100;
  const nameRef = useRef();

  // API mutations
  const [updateData] = useUpdateDataMutation();
  const [updateIndex] = useUpdateIndexMutation();
  const [addNewColumn] = useAddNewColumnMutation();
  const [addNewCard] = useAddNewCardMutation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // WebSocket connection
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8001");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "order_updated":
          if (data?.item.data?.data) {
            const organizedColumns = Object.entries(data.item.data.data).reduce(
              (acc, [status, items]) => ({
                ...acc,
                [status]: { status, items },
              }),
              {}
            );
            setColumns(organizedColumns);
          }
          break;

        case "reordered_updated":
          if (data?.item) {
            setColumns((prevState) => ({
              ...prevState,
              [data.item.status]: {
                status: data.item.status,
                items: data.item.updatedData,
              },
            }));
          }
          break;

        case "new_column":
          const newColumnId = data.item.columnName;
          setColumns((prevState) => ({
            ...prevState,
            [newColumnId]: { status: newColumnId, items: [] },
          }));
          break;
      }
    };

    return () => socket.close();
  }, []);

  // Initialize columns from API data
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

  // Drag and drop handlers
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
      // Moving within the same column
      const newItems = Array.from(start.items);
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);

      setColumns((prevState) => ({
        ...prevState,
        [start.status]: { ...start, items: newItems },
      }));

      updateIndex({
        status: start.status,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      });
    } else {
      // Moving between columns
      const startItems = Array.from(start.items);
      const [movedItem] = startItems.splice(source.index, 1);
      const endItems = Array.from(end.items);
      endItems.splice(destination.index, 0, movedItem);

      updateData({
        newIndex: destination.index,
        itemId: movedItem.id,
        updatedStatus: end.status,
        prevStatus: start.status,
      });

      setColumns((prevState) => ({
        ...prevState,
        [start.status]: { ...start, items: startItems },
        [end.status]: { ...end, items: endItems },
      }));
    }
  };

  // UI event handlers
  const handleAddColumn = () => {
    const columnName = nameRef.current.value.trim();

    if (!columnName) {
      alert("Please enter a column name");
      return;
    }

    addNewColumn({ columnName });
    setColumns((prevState) => ({
      ...prevState,
      [columnName]: { status: columnName, items: [] },
    }));
    nameRef.current.value = "";
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addNewCard(formData);
    setFormData({ title: "", description: "", dueDate: "", status: "" });
    setIsModalOpen(false);
  };

  const handleAddCard = (statusId) => {
    setIsModalOpen(true);
    setFormData((prev) => ({ ...prev, status: statusId }));
  };

  const handleToggleDescription = (id) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  const handleRemoveColumn = (statusId) => {
    const newColumns = { ...columns };
    delete newColumns[statusId];
    setColumns(newColumns);
  };

  const handleRenameColumn = (statusId) => {
    const newName = prompt("Enter new column name:", statusId);
    if (newName && newName !== statusId) {
      const newColumns = { ...columns };
      newColumns[newName] = { ...newColumns[statusId], status: newName };
      delete newColumns[statusId];
      setColumns(newColumns);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 overflow-x-auto">
        <div className="min-w-fit">
          {/* Column Creation Header */}
          <div className="flex justify-start items-center mb-8">
            <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-4 flex items-center space-x-4">
              <input
                type="text"
                placeholder="Add new column"
                ref={nameRef}
                className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={handleAddColumn}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition  ease-in-out transform hover:scale-105"
              >
                Add Column
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 flex-nowrap justify-start">
              {Object.values(columns).map((col) => (
                <div key={col.status} className="bg-white border border-gray-200 rounded-xl w-[320px] shadow-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">
                      {col.status}
                    </h2>
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => setActiveDropdown(col.status)}
                        className=" rounded-full hover:bg-indigo-100 transition-colors"
                        aria-label="Column options"
                      >
                        <MoreHorizontal className="text-indigo-600" size={20} />
                      </button>

                      {activeDropdown === col.status && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => {
                              handleAddCard(col.status);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                          >

                            Add new card
                          </button>
                          <button
                            onClick={() => {
                              handleRemoveColumn(col.status);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                          >
                            Remove column
                          </button>
                          <button
                            onClick={() => {
                              handleRenameColumn(col.status);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                          >
                            Rename column
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Droppable droppableId={col.status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[700px] rounded-lg transition-colors  ${snapshot.isDraggingOver ? "bg-indigo-50" : ""
                          }`}
                      >
                        {col.items.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg border mb-3 last:mb-0 ${snapshot.isDragging
                                  ? "shadow-2xl border-indigo-300 ring-2 ring-indigo-200"
                                  : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                                  }  `}
                              >
                                <div className="p-4">
                                  <h3 className="text-gray-900 font-semibold text-lg mb-2">
                                    {item.title}
                                  </h3>

                                  <div className="mb-3">
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                      {item.description.length > MAX_DESCRIPTION_LENGTH
                                        ? expandedItemId === item.id
                                          ? item.description
                                          : `${item.description.substring(0, MAX_DESCRIPTION_LENGTH)}...`
                                        : item.description}
                                    </p>
                                    {item.description.length > MAX_DESCRIPTION_LENGTH && (
                                      <button
                                        type="button"
                                        className="text-indigo-600 text-sm mt-1 hover:underline focus:outline-none"
                                        onClick={() => handleToggleDescription(item.id)}
                                      >
                                        {expandedItemId === item.id ? "Show less" : "Read more"}
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center text-gray-500">
                                    <Clock className="text-indigo-500 mr-2" size={16} />
                                    <time className="text-sm">{item.dueDate}</time>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Add Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-[400px] p-6 shadow-2xl transform transition-all duration-300 ease-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Card</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Enter card title"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Enter card description"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all  transform hover:scale-[1.02]"
              >
                Add Card
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
