import React, { Fragment, useEffect, useState } from "react";
import Sidebar from "../DesignComponents/SideBar";
import { useNavigate } from "react-router-dom";
import "./ViewItems.css"; // Assuming you have a CSS file for styling
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS

const ViewItems = () => {
  const [items, setItems] = useState([]);
  const [editItemId, setEditItemId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // Search term for description
  const [sizeSearchTerm, setSizeSearchTerm] = useState(""); // New state for size search term
  const navigate = useNavigate();

  const getItems = async () => {
    try {
      const response = await fetch(`https://bbv3-server.onrender.com/api/bill/items`);
      const jsonData = await response.json();

      if (jsonData && Array.isArray(jsonData.rows)) {
        setItems(jsonData.rows);
      } else {
        setItems([]);
        console.error("Failed to fetch items, invalid response format:", jsonData);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setItems([]);
    }
  };

  const handleEditClick = (item) => {
    setEditItemId(item.item_id);
    setEditFormData({ ...item });
  };

  const handleSaveClick = async (itemId) => {
    try {
      await fetch(`https://bbv3-server.onrender.com/api/bill/items/edit/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      const updatedItems = items.map((item) =>
        item.item_id === itemId ? editFormData : item
      );
      setItems(updatedItems);
      setEditItemId(null);
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await fetch(`https://bbv3-server.onrender.com/api/bill/items/delete/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const updatedItems = items.filter((item) => item.item_id !== itemId);
      setItems(updatedItems);
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSizeSearchChange = (e) => {
    setSizeSearchTerm(e.target.value);
  };

  useEffect(() => {
    getItems();
  }, []);

  // Filter items based on search term and size term
  const filteredItems = items.filter(
    (item) =>
      item.item_description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      item.item_size.toString().includes(sizeSearchTerm)
  );

  return (
    <Fragment>
      <Sidebar />
      <div className="content">
        <h1 className="text-center mt-3" style={{ fontFamily: 'Times New Roman, Times, serif' }}>View All Items</h1>
        
        {/* Search bars */}
        <div className="d-flex justify-content-center mt-3">
          <input
            type="text"
            placeholder="Search by description"
            value={searchTerm}
            onChange={handleSearchChange}
            className="searchB mr-2"
          />
          <input
            type="text"
            placeholder="Search by size"
            value={sizeSearchTerm}
            onChange={handleSizeSearchChange}
            className="searchB"
          />
        </div>

        {filteredItems.length > 0 ? (
          <table className="table mt-5 text-center">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Description</th>
                <th>Size</th>
                <th>Rate</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.item_id}>
                  <td>{item.item_id}</td>
                  <td>
                    {editItemId === item.item_id ? (
                      <input
                        type="text"
                        name="item_description"
                        value={editFormData.item_description}
                        onChange={handleInputChange}
                      />
                    ) : (
                      item.item_description
                    )}
                  </td>
                  <td>
                    {editItemId === item.item_id ? (
                      <input
                        type="text"
                        name="item_size"
                        value={editFormData.item_size}
                        onChange={handleInputChange}
                      />
                    ) : (
                      item.item_size
                    )}
                  </td>
                  <td>
                    {editItemId === item.item_id ? (
                      <input
                        type="number"
                        name="rate"
                        value={editFormData.rate}
                        onChange={handleInputChange}
                      />
                    ) : (
                      item.rate
                    )}
                  </td>
                  <td>
                    {editItemId === item.item_id ? (
                      <input
                        type="number"
                        name="item_quantity"
                        value={editFormData.item_quantity}
                        onChange={handleInputChange}
                      />
                    ) : (
                      item.item_quantity === 0 ? (
                        <span style={{ color: "red" }}>Out of Stock</span>
                      ) : (
                        item.item_quantity
                      )
                    )}
                  </td>
                  <td>
                    {editItemId === item.item_id ? (
                      <button
                        className="btn btn-success action-button"
                        onClick={() => handleSaveClick(item.item_id)}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="btn btn-warning action-button"
                        onClick={() => handleEditClick(item)}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="btn btn-danger action-button2"
                      onClick={() => handleDelete(item.item_id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No items found in inventory.</p>
        )}
        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate('/inventory')}
        >
          Add Inventory
        </button>
      </div>
    </Fragment>
  );
};


export default ViewItems;
