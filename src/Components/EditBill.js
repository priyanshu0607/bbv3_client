import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './EditBill.css';
import SearchDropdown from './SearchDropDown';

const EditBill = () => {
  const [billData, setBillData] = useState({
    customer_name: '',
    customer_mobile_number: '',
    booking_date: '',
    return_date: '',
    total_amount: '',
    advance_amount: '',
    advance_amount_paid: '',
    online_offline_mode: '',
    discount: '',
    items_ordered: [],
    comments: ''
  });
  const [itemsOrdered, setItemsOrdered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalItems, setOriginalItems] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState({});
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchBillData(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchBillData = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/bill/displayBill/${id}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const jsonData = await response.json();
  
      // Helper function to convert UTC date to IST date in YYYY-MM-DD format
      const toISTDateString = (utcDate) => {
        const date = new Date(utcDate);
        date.setHours(date.getHours() + 5); // add 5 hours
        date.setMinutes(date.getMinutes() + 30); // add 30 minutes for IST
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      };
  
      // Convert the UTC dates from the server to IST
      jsonData.booking_date = jsonData.booking_date ? toISTDateString(jsonData.booking_date) : '';
      jsonData.return_date = jsonData.return_date ? toISTDateString(jsonData.return_date) : '';
  
      setBillData(jsonData);
      const items = parseItemsOrdered(jsonData.items_ordered);
      setItemsOrdered(items);
      setOriginalItems(items);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bill data:", err);
      toast.error("Error fetching bill data.");
      setLoading(false);
    }
  };
  
  const handleAddNewItem = () => {
    const newItem = {
      item_description: '',
      item_size: 0,
      quantity: 1,
      rateOfOne: 0,
      totalrate: 0,
      isNew: true
    };
    const updatedItems = [...itemsOrdered, newItem];
    setItemsOrdered(updatedItems);
    updateTotalAmount(updatedItems);
  };
  

  const parseItemsOrdered = (itemsArray) => {
    if (!itemsArray || !Array.isArray(itemsArray)) {
      console.error("Invalid items array:", itemsArray);
      return [];
    }
    return itemsArray.map(itemStr => {
      const itemParts = itemStr.match(/item_description:\s*([^,]+)\s*item_size:\s*([^,]+)\s*quantity:\s*(\d+)\s*rate:\s*(\d+\.?\d*)/);
      if (!itemParts) {
        console.error("Invalid item string format:", itemStr);
        return null;
      }
      const item_description = itemParts[1].trim();
      const item_size = (itemParts[2].trim());
      const quantity = parseInt(itemParts[3].trim(), 10);
      const rate = parseFloat(itemParts[4].trim());
      const rateOfOne = rate / quantity;
      const totalrate = quantity * rateOfOne;

      return { item_description, item_size, quantity, rateOfOne, totalrate };
    }).filter(item => item !== null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Set the date in a consistent format (YYYY-MM-DD) when updating the state
    if (name === "booking_date" || name === "return_date") {
      setBillData((prevData) => ({
        ...prevData,
        [name]: value, // Directly use the date string from input without modifications
      }));
    } else {
      setBillData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = itemsOrdered.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [name]: value };
        
        // Recalculate totalrate if rate or quantity changes
        const quantity = name === "quantity" ? parseInt(value, 10) : item.quantity;
        const rate = name === "rateOfOne" ? parseFloat(value) : item.rateOfOne;
        
        updatedItem.totalrate = quantity * rate;
        return updatedItem;
      }
      return item;
    });
    setItemsOrdered(updatedItems);
    updateTotalAmount(updatedItems);
  };

  const updateTotalAmount = (items) => {
    const totalAmount = items.reduce((sum, item) => sum + item.totalrate, 0);
    setBillData((prevData) => ({
      ...prevData,
      total_amount: totalAmount,
    }));
  };

  const updateInventory = async (itemDescription, quantity) => {
    try {
        console.log(`Updating inventory for ${itemDescription}: Adjusting quantity by ${quantity}`);
        
        const response = await fetch(`http://localhost:3000/api/bill/updateQuantity`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_description: itemDescription, quantity: quantity })
        });

        if (!response.ok) {
            const result = await response.json();
            console.error(`Failed to update inventory for ${itemDescription}: ${result.error}`);
        } else {
            console.log(`Successfully updated ${itemDescription}.`);
        }
    } catch (error) {
        console.error(`Error updating inventory for ${itemDescription}:`, error);
    }
};


  const updateInventoryForChanges = async (original, updated) => {
    const originalMap = new Map(original.map(item => [item.item_description, item]));
    const updatedMap = new Map(updated.map(item => [item.item_description, item]));

    // Adjust for updated or deleted items
    for (const [desc, originalItem] of originalMap.entries()) {
      const updatedItem = updatedMap.get(desc);
      if (updatedItem) {
        const quantityDiff = updatedItem.quantity - originalItem.quantity;
        if (quantityDiff !== 0) {
          await updateInventory(desc, -quantityDiff);
        }
        updatedMap.delete(desc); // Remove item after processing
      } else {
        // If item is deleted, add its quantity back to inventory
        await updateInventory(desc, originalItem.quantity);
      }
    }

    // Adjust for newly added items in updatedMap
    for (const [desc, newItem] of updatedMap.entries()) {
      await updateInventory(desc, -newItem.quantity);
    }
  };

  const handleEdit = async () => {
    try {
      await updateInventoryForChanges(originalItems, itemsOrdered);
      
      const itemsStringArray = itemsOrdered.map(item => 
        `item_description: ${item.item_description} item_size: ${item.item_size} quantity: ${item.quantity} rate:${item.totalrate}`
      );
      console.log(itemsStringArray)
      const updatedBillData = {
        ...billData,
        items_ordered: itemsStringArray
      };

      const response = await fetch(`http://localhost:3000/api/bill/updateBooking/${updatedBillData.bill_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBillData),
      });
      if (response.ok) {
        toast.success("Bill updated successfully!");
      } else {
        throw new Error("Failed to update bill");
      }
    } catch (err) {
      console.error("Error updating bill:", err);
      toast.error("Error updating bill.");
    }
  };

  const handleDeleteItem = async (index) => {
    const deletedItem = itemsOrdered[index];
    const updatedItems = [...itemsOrdered];
    updatedItems.splice(index, 1);

    setItemsOrdered(updatedItems);
    updateTotalAmount(updatedItems);

    console.log(`Deleting item: ${deletedItem.item_description}, Quantity to add back: ${deletedItem.quantity}`);

    // Await to ensure the inventory update completes for debugging
    await updateInventory(deletedItem.item_description, deletedItem.quantity-1);
    console.log(`Inventory updated for deletion: ${deletedItem.item_description}`);
};



  const handleAddItem = (selectedItem) => {
    const newItem = {
      item_description: selectedItem.item_description,
      item_size: selectedItem.item_size,
      quantity: 1,
      rateOfOne: selectedItem.rate,
      totalrate: selectedItem.rate * 1,
    };
    
    const updatedItems = [...itemsOrdered, newItem];
    setItemsOrdered(updatedItems);
    updateTotalAmount(updatedItems);
  };

  const onSelectItem = (selectedItem) => {
    handleAddItem(selectedItem);
  };


  const returnBill = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/bill/Return/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create bill");
    } catch (err) {
      toast.error("Error creating bill.");
      console.error("Error creating bill:", err);
    }
  };

  const combination = async (id) => {
    if (!id) {
      toast.error("Invalid Bill ID.");
      return;
    }
  
    setIsLoading((prev) => ({ ...prev, [id]: true }));
  
    try {
      // Parallelize inventory updates
      const inventoryPromises = itemsOrdered.map(({ item_description, quantity }) =>
        updateInventory(item_description, quantity) // Increment inventory by quantity
      );
  
      // Await all inventory updates and return bill simultaneously
      await Promise.all([
        ...inventoryPromises,
        returnBill(id) // Process the bill return
      ]);
      navigate('/');
      window.alert("Return Successful")
    } catch (err) {
      console.error("Error in combination:", err);
      toast.error("Error processing the bill. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }));
    }
  };
  

  
  
  return (
    <div>
      <ToastContainer />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="edit-form">
          <h2>Edit Bill</h2>
          {Object.keys(billData).length > 0 ? (
            <div>
              <div className="form-group">
                <label>Customer Name:</label>
                <input
                  type="text"
                  name="customer_name"
                  value={billData.customer_name}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Customer Phone:</label>
                <input
                  type="text"
                  name="customer_mobile_number"
                  value={billData.customer_mobile_number}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Booking Date:</label>
                <input
                  type="date"
                  name="booking_date"
                  value={billData.booking_date.split('T')[0]}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Return Date:</label>
                <input
                  type="date"
                  name="return_date"
                  value={billData.return_date.split('T')[0]}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Advance Amount:</label>
                <input
                  type="number"
                  name="advance_amount"
                  value={billData.advance_amount}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Advance Amount Paid:</label>
                <input
                  type="number"
                  name="advance_amount_paid"
                  value={billData.advance_amount_paid}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
             <div className="form-group">
  <label>Payment Mode:</label>

  {(billData.online_offline_mode === "online" || billData.online_offline_mode === "offline") ? (
    <select
      name="online_offline_mode"
      value={billData.online_offline_mode}
      onChange={handleChange}
      className="form-control"
    >
      <option value="" disabled>Select Payment Mode</option>
      <option value="online">Online</option>
      <option value="offline">Offline</option>
    </select>
  ) : (
    <div className="d-flex gap-4">
      <div>
        <label className="form-label d-block">Rent Mode:</label>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="rent_mode"
            value="upi"
            checked={billData.online_offline_mode?.split('_')[0] === 'upi'}
            onChange={() => {
              const deposit = billData.online_offline_mode?.split('_')[1] || 'cash';
              setBillData(prev => ({ ...prev, online_offline_mode: `upi_${deposit}` }));
            }}
          />
          <label className="form-check-label">UPI</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="rent_mode"
            value="cash"
            checked={billData.online_offline_mode?.split('_')[0] === 'cash'}
            onChange={() => {
              const deposit = billData.online_offline_mode?.split('_')[1] || 'upi';
              setBillData(prev => ({ ...prev, online_offline_mode: `cash_${deposit}` }));
            }}
          />
          <label className="form-check-label">Cash</label>
        </div>
      </div>

      <div>
        <label className="form-label d-block">Deposit Mode:</label>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="deposit_mode"
            value="upi"
            checked={billData.online_offline_mode?.split('_')[1] === 'upi'}
            onChange={() => {
              const rent = billData.online_offline_mode?.split('_')[0] || 'cash';
              setBillData(prev => ({ ...prev, online_offline_mode: `${rent}_upi` }));
            }}
          />
          <label className="form-check-label">UPI</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="deposit_mode"
            value="cash"
            checked={billData.online_offline_mode?.split('_')[1] === 'cash'}
            onChange={() => {
              const rent = billData.online_offline_mode?.split('_')[0] || 'upi';
              setBillData(prev => ({ ...prev, online_offline_mode: `${rent}_cash` }));
            }}
          />
          <label className="form-check-label">Cash</label>
        </div>
      </div>
    </div>
  )}
</div>

              <div className="form-group">
                <label>Discount:</label>
                <input
                  type="number"
                  name="discount"
                  value={billData.discount}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <input
                  type="text"
                  name="status"
                  value={billData.status}                  
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Comments:</label>
                <textarea
                  name="comments"
                  value={billData.comments}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <h3>Items Ordered</h3>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <SearchDropdown onSelectItem={onSelectItem} />
                  <button className="btn2 btn-success ml-2" 
                   onClick={handleAddNewItem}>Add New Item</button>
                </div>
                <table className="table table-bordered mt-3">
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th>Item Size</th>
                      <th>Rate</th>
                      <th>Quantity</th>
                      <th>Total Rate</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  {itemsOrdered.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {item.isNew ? (
                          <input
                              type="text"
                              name="item_description"
                              value={item.item_description}
                              onChange={(e) => handleItemChange(index, e)}
                              className="form-control"
                            />
                                ) : (
                                  item.item_description
                                )}
                              </td>
                              <td>
                                {item.isNew ? (
                                  <input
                                    type="number"
                                    name="item_size"
                                    value={item.item_size}
                                    onChange={(e) => handleItemChange(index, e)}
                                    className="form-control"
                                  />
                                ) : (
                                  item.item_size
                                )}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  name="rateOfOne"
                                  value={item.rateOfOne}
                                  onChange={(e) => handleItemChange(index, e)}
                                  className="form-control"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  name="quantity"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, e)}
                                  className="form-control"
                                />
                              </td>
                              <td>{item.totalrate}</td>
                              <td>
                                <button className="btn btn-danger" onClick={() => handleDeleteItem(index)}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                </table>
                                      </div>

              <div className="form-group">
                <label>Total Amount:</label>
                <input
                  type="number"
                  name="total_amount"
                  value={billData.total_amount}
                  readOnly
                  className="form-control"
                />
              </div>
              <button
                  className="btn btn-primary"
                  style={{ marginBottom: "10px" }}
                  onClick={() => {combination(billData.bill_id)
                  }}
                >
                Return
              </button>
              <button className="btn btn-primary" style={{ marginBottom: "10px" }} onClick={handleEdit}>Edit</button>
              <button className="btn btn-primary" onClick={()=> navigate('/')}>Back</button>
            </div>
          ) : (
            <p>No bill data available for editing.</p>
          )}
        </div>
      )}
    </div>
  ); 
};

export default EditBill;