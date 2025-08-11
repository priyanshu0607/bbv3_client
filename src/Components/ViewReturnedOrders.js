import React, { Fragment, useEffect, useState } from "react";
import Sidebar from "../DesignComponents/SideBar";
import { useNavigate } from "react-router-dom";
import "./ViewBookings.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const ViewReturnedOrders = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/bill/getOrdersR`);
        const jsonData = await response.json();
  
        if (Array.isArray(jsonData)) {
          const sortedBookings = jsonData.sort((a, b) => a.bill_id - b.bill_id);
          setBookings(sortedBookings);
  
          // Restore filters from localStorage
          const savedSearch = localStorage.getItem("searchInput") || "";
          const savedStartDate = localStorage.getItem("startDate") || "";
          const savedEndDate = localStorage.getItem("endDate") || "";
          const savedItemSearch = localStorage.getItem("itemSearch") || "";
          const savedFilteredOrders = JSON.parse(localStorage.getItem("filteredOrders")) || sortedBookings;
          const savedIsFiltered = localStorage.getItem("isFiltered") === "true";
  
          setSearchInput(savedSearch);
          setStartDate(savedStartDate);
          setEndDate(savedEndDate);
          setItemSearch(savedItemSearch);
          setFilteredOrders(savedFilteredOrders);
          setIsFiltered(savedIsFiltered);
        } else {
          setBookings([]);
          setFilteredOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
  
    fetchOrders();
  }, []);
  

  const parseItemsOrdered = (itemsOrderedArray) => {
    if (!Array.isArray(itemsOrderedArray)) return [];
    
    return itemsOrderedArray.map((item) => {
      const parts = item.split(/item_description:|item_size:|quantity:|rate:/).filter(Boolean);
      return parts.length === 4
        ? { description: parts[0].trim(), size: parts[1].trim(), quantity: parseInt(parts[2]), rate: parseFloat(parts[3]) }
        : { description: "", size: "", quantity: 0, rate: 0 };
    });
  };

  const handleSearch = () => {
    const searchLower = searchInput.toLowerCase();
    const filtered = bookings.filter((booking) => {
      const matchesSearch = booking.customer_name.toLowerCase().includes(searchLower) || booking.customer_mobile_number.includes(searchInput);
      const returnDate = new Date(booking.return_date);
      const matchesDateRange = (!startDate || returnDate >= new Date(startDate)) && (!endDate || returnDate <= new Date(endDate));
      const itemsOrdered = parseItemsOrdered(booking.items_ordered);
      const matchesItemSearch = itemSearch === "" || itemsOrdered.some(item => item.description.toLowerCase().includes(itemSearch));
  
      return matchesSearch && matchesDateRange && matchesItemSearch;
    });
  
    setFilteredOrders(filtered);
    setIsFiltered(true);
  
    // Save state to localStorage
    localStorage.setItem("searchInput", searchInput);
    localStorage.setItem("startDate", startDate);
    localStorage.setItem("endDate", endDate);
    localStorage.setItem("itemSearch", itemSearch);
    localStorage.setItem("filteredOrders", JSON.stringify(filtered));
    localStorage.setItem("isFiltered", "true");
  };
  

  const handleReset = () => {
    setFilteredOrders(bookings);
    setIsFiltered(false);
    setSearchInput("");
    setStartDate("");
    setEndDate("");
    setItemSearch("");
  
    // Clear localStorage
    localStorage.removeItem("searchInput");
    localStorage.removeItem("startDate");
    localStorage.removeItem("endDate");
    localStorage.removeItem("itemSearch");
    localStorage.removeItem("filteredOrders");
    localStorage.removeItem("isFiltered");
  };
  

  const handleEdit = (bookingId) => navigate(`/edit-orders/${bookingId}`);
  const handleViewBooking = (bookingId) => navigate(`/view-return-bill/${bookingId}`);

  const handleDelete = async (bookingId) => {
    try {
      await fetch(`http://localhost:3000/api/bill/deleteBill/${bookingId}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
      const updatedBookings = bookings.filter((booking) => booking.bill_id !== bookingId);
      setBookings(updatedBookings);
      setFilteredOrders(updatedBookings);
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  return (
    <Fragment>
      <Sidebar />
      <div className="content">
        <h1 className="text-center mt-5">View Past Orders</h1>
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
        {filteredOrders.length > 0 ? (
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((booking) => (
                <tr key={booking.bill_id}>
                  <td>{booking.bill_id}</td>
                  <td>{booking.customer_name}</td>
                  <td>{booking.customer_mobile_number}</td>
                  <td>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-GB') : '-'}</td>
                  <td>{booking.return_date ? new Date(booking.return_date).toLocaleDateString('en-GB') : '-'}</td>
                  <td>{booking.advance_amount !== null ? booking.advance_amount : '-'}</td>
                  <td>{booking.total_amount}</td>
                  <td>{booking.comments}</td>
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
              ))}
            </tbody>
          </table>
        ) : <p>No bookings found.</p>}
      </div>
    </Fragment>
  );
};

export default ViewReturnedOrders;

