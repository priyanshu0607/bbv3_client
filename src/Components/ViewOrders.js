import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../DesignComponents/SideBar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ViewBookings.css";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
};

const ViewOrders = () => {
  const [isLoading, setIsLoading] = useState({});
  const [orders, setOrders] = useState([]);
  const [searchInput, setSearchInput] = useState(localStorage.getItem("searchInput") || "");
  const [startDate, setStartDate] = useState(localStorage.getItem("startDate") || "");
  const [endDate, setEndDate] = useState(localStorage.getItem("endDate") || "");
  const [itemSearch, setItemSearch] = useState(localStorage.getItem("itemSearch") || "");
  const [filteredOrders, setFilteredOrders] = useState(JSON.parse(localStorage.getItem("filteredOrders")) || []);
  const [isFiltered, setIsFiltered] = useState(localStorage.getItem("isFiltered") === "true");
  const navigate = useNavigate();
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };
  const getOrders = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/bill/displayAllBill");
      const jsonData = await response.json();
      const jsonData1 = jsonData.rows
      if (Array.isArray(jsonData1)) {
        setOrders(jsonData1);
      } else {
        setOrders([]);
        console.error("Invalid response format:", jsonData1);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setOrders([]);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };
  

  useEffect(() => {
    getOrders();
  }, []);

  const parseItemsOrdered = (itemsOrderedArray) => {
    if (!Array.isArray(itemsOrderedArray)) {
      console.error("items_ordered is not an array:", itemsOrderedArray);
      return [];
    }

    return itemsOrderedArray.map((item, index) => {
      try {
        const itemParts = item.split(/\s*item_description:|\s*item_size:|\s*quantity:|\s*rate:/).filter(part => !!part);
        if (itemParts.length !== 4) {
          throw new Error(`Invalid item format at index ${index}`);
        }
        
        const item_description = itemParts[0].trim();
        const item_size = itemParts[1].trim();
        const quantity = parseInt(itemParts[2].trim(), 10);
        const rate = parseFloat(itemParts[3].trim());
        
        console.log("Item Description:", item_description);
        return { description: item_description, size: item_size, quantity, rate };
      } catch (error) {
        console.error("Error parsing items_ordered:", error);
        return { description: "", size: "", quantity: 0, rate: 0 };
      }
    });
  };

  const filteredBookings = orders.filter((booking) => {
    const searchLower = searchInput.toLowerCase();
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(searchLower) ||
      booking.customer_mobile_number.includes(searchInput);

    const returnDate = new Date(booking.return_date);
    returnDate.setDate(returnDate.getDate() + 1);

    const matchesDateRange =
      (!startDate || returnDate >= new Date(startDate)) &&
      (!endDate || returnDate <= new Date(endDate));

    const itemsOrdered = parseItemsOrdered(booking.items_ordered);
    const matchesItemSearch =
      itemSearch === "" || itemsOrdered.some(item => item.description.toLowerCase().includes(itemSearch));

    return matchesSearch && matchesDateRange && matchesItemSearch;
  });

  const handleEdit = (bookingId) => {
    navigate(`/edit-orders/${bookingId}`); // Navigate to edit page with bookingId
  };
  const handleEdit2 = (bookingId) => {
    navigate(`/edit-orders-before-return/${bookingId}`); // Navigate to edit page with bookingId
  };
  const handleDelete = async (bookingId) => {
    try {
      // Make API call to delete booking with bookingId
      const response = await fetch(`http://localhost:3000/api/bill/deleteBill/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }
  
      // Update orders list after deletion
      const updatedOrders = orders.filter((booking) => booking.bill_id !== bookingId);
      setOrders(updatedOrders);
  
    } catch (err) {
      console.error("Error deleting booking:", err);
      toast.error("Error deleting booking.");
    }
  };
  

  const handleViewBooking = (bookingId) => {
    navigate(`/view-bill/${bookingId}`);
  };

  const handleSearch = () => {
    const searchLower = searchInput.toLowerCase();
    const filtered = orders.filter((booking) => {
      const matchesSearch =
        booking.customer_name.toLowerCase().includes(searchLower) ||
        booking.customer_mobile_number.includes(searchInput);

      const returnDate = new Date(booking.return_date);
      returnDate.setDate(returnDate.getDate() + 1);

      const matchesDateRange =
        (!startDate || returnDate >= new Date(startDate)) &&
        (!endDate || returnDate <= new Date(endDate));

      const itemsOrdered = parseItemsOrdered(booking.items_ordered);
      const matchesItemSearch =
        itemSearch === "" || itemsOrdered.some(item => item.description.toLowerCase().includes(itemSearch));

      return matchesSearch && matchesDateRange && matchesItemSearch;
    });

    setFilteredOrders(filtered);
    setIsFiltered(true);
    localStorage.setItem("filteredOrders", JSON.stringify(filtered));
    localStorage.setItem("isFiltered", "true");
    localStorage.setItem("searchInput", searchInput);
    localStorage.setItem("startDate", startDate);
    localStorage.setItem("endDate", endDate);
    localStorage.setItem("itemSearch", itemSearch);
  };

  const handleReset = () => {
    setFilteredOrders([]);
    setIsFiltered(false);
    setSearchInput("");
    setStartDate("");
    setEndDate("");
    setItemSearch("");
    localStorage.removeItem("filteredOrders");
    localStorage.removeItem("isFiltered");
    localStorage.removeItem("searchInput");
    localStorage.removeItem("startDate");
    localStorage.removeItem("endDate");
    localStorage.removeItem("itemSearch");
  };

  return (
    <Fragment>
      <Sidebar />
      <div className="content">
        <ToastContainer />
        <h1 className="text-center mt-5" style={{ fontFamily: "Times New Roman, Times, serif" }}>
          Homepage
        </h1>
        <h2 className="text-center mt-2" style={{ fontFamily: "Times New Roman, Times, serif" }}>View Orders</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Customer Name or Mobile Number"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Item Description"
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value.toLowerCase())}
            className="search-input"
          />
        </div>
        <div className="date-filter">
            <label>
              Start Date:
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" />
            </label>
            <label>
              End Date:
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" />
            </label>
          </div>
          <div className="button-container1" style={{marginLeft:'auto',marginRight:'auto'}}>
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
          <button className="btn btn-secondary" onClick={handleReset}>Refresh</button>
        </div>
          {(isFiltered ? filteredOrders : orders).length > 0 ?  (
  <>
    <table className="table mt-5 text-center">
      <thead>
        <tr>
          <th>Bill ID</th>
          <th>Customer Name</th>
          <th>Customer Phone</th>
          <th>Booking Date</th>
          <th>Return Date</th>
          <th>Advance Amount</th>
          <th>Total Amount</th>
          <th>Comments</th>
          <th>Action</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
      {(isFiltered ? filteredOrders : orders).map((booking) => {
                const itemsOrdered = parseItemsOrdered(booking.items_ordered);
                return itemsOrdered.map((item, idx) => (
                  <tr key={`${booking.bill_id}-${idx}`}>
            <td>{booking.bill_id}</td>
            <td>{booking.customer_name}</td>
            <td>{booking.customer_mobile_number}</td>
            <td>{formatDate(booking.booking_date)}</td>
            <td>{formatDate(booking.return_date)}</td>
            <td>{booking.advance_amount}</td>
            <td>{booking.total_amount}</td>
            <td>{booking.comments}</td>
            <td>
              <button
                className="btn1 btn-primary"
                onClick={() => handleEdit2(booking.bill_id)}
                disabled={isLoading[booking.bill_id]}
              >
                {isLoading[booking.bill_id] ? "Processing..." : "Return"}
              </button>
            </td>
            <td className="button-containerB">
              <button className="btn btn-primary action-button" onClick={() => handleViewBooking(booking.bill_id)}>
                <i className="fas fa-eye"></i>
              </button>
              <button className="btn btn-warning action-button" onClick={() => handleEdit(booking.bill_id)}>
                <i className="fas fa-pencil-alt"></i>
              </button>
              <button className="btn btn-danger action-button2" onClick={() => handleDelete(booking.bill_id)}>
                <i className="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        ))
      })}
      </tbody>
    </table>
    {/* Display total count */}
    <p className="text-center mt-3">
      <strong>Orders count: {filteredBookings.length}</strong>
    </p>
  </>
) : (
  <p>No bookings found.</p>
)}

      </div>
    </Fragment>
  );
};

export default ViewOrders;