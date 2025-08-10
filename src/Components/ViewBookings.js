import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../DesignComponents/SideBar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ViewBookings.css"; // Assuming you have a CSS file for styling

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // This will format the date as DD/MM/YYYY
};

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState({});
    const [searchInput, setSearchInput] = useState(localStorage.getItem("searchInput") || "");
    const [startDate, setStartDate] = useState(localStorage.getItem("startDate") || "");
    const [endDate, setEndDate] = useState(localStorage.getItem("endDate") || "");
    const [itemSearch, setItemSearch] = useState(localStorage.getItem("itemSearch") || "");
    const [filteredOrders, setFilteredOrders] = useState(JSON.parse(localStorage.getItem("filteredOrders")) || []);
    const [isFiltered, setIsFiltered] = useState(localStorage.getItem("isFiltered") === "true");

  const getBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/bill/getBookings`);
      const jsonData = await response.json();

      if (Array.isArray(jsonData)) {
        setBookings(jsonData);
      } else {
        setBookings([]);
        console.error("Failed to fetch bookings, invalid response format:", jsonData);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createBill = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/bill/getBookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to get booking");
      }


      toast.success("Bill created successfully!");
      getBookings(); // Refresh the bookings list
       // Navigate to the bill details
    } catch (err) {
      toast.error("Error creating bill.");
      console.error("Error creating bill:", err);
    } finally {
      setIsLoading(false);
    }
  };
const function1 = async(id)=>{
  const response1 = await fetch(`http://localhost:3000/api/bill/setBookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response1.ok) {
        throw new Error("Failed to set booking");
      }
}
const function2= async(id)=>{
  const response1 = await fetch(`http://localhost:3000/api/items/setItems/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });

  if (!response1.ok) {
    
}
}
const combination = async (id) => {
  const isPaid = window.confirm("Has the amount been paid?");
  if (isPaid) {
    try {
      await createBill(id);
      await function1(id);
      await function2(id);
      toast.success("Bill processed successfully!");
      navigate(`/view-bill-afterbook/${id}`);
    } catch (error) {
      toast.error("Error processing the bill.");
      console.error("Error in combination process:", error);
    }
  } else {
    toast.info("Bill creation canceled. Please ensure payment is made.");
  }
};

  useEffect(() => {
    getBookings();
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

  const filteredBookings = bookings.filter((booking) => {
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

  const handleDelete = async (bookingId) => {
    try {
      // Make API call to delete booking with bookingId
      await fetch(`http://localhost:3000/api/bill/deleteBill/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Update bookings list after deletion
      const updatedBookings = bookings.filter((booking) => booking.bill_id !== bookingId);
      setBookings(updatedBookings);
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  const handleViewBooking = (bookingId) => {
    navigate(`/view-bill-afterbook/${bookingId}`);
  };
  const handleSearch = () => {
    const searchLower = searchInput.toLowerCase();
    const filtered = bookings.filter((booking) => {
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
        <h1 className="text-center mt-5" style={{ fontFamily: 'Times New Roman, Times, serif' }}>View Bookings</h1>
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
          <div className="button-container1" >
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
          <button className="btn btn-secondary" onClick={handleReset}>Refresh</button>
        </div>
          {(isFiltered ? filteredOrders : bookings).length > 0 ?  (
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
            {(isFiltered ? filteredOrders : bookings).map((booking) => {
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
                      onClick={() => combination(booking.bill_id)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Bill"}
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
          <p className="text-center mt-3">
          <strong>Bookings count: {filteredBookings.length}</strong>
        </p>
        </>
        ) : (
          <p>No bookings found.</p>
        )}
      </div>
    </Fragment>
  );
};

export default ViewBookings;