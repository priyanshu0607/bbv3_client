// src/App.js
// src/App.js
import './App.css';
import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, AuthContext } from './contexts/AuthContext';

import CreateBill from "./Components/CreateBill";
import ViewBill from "./Components/ViewBill";
import BookingItems from "./Components/Booking_items";
import ViewBookings from './Components/ViewBookings';
import ViewBillAfterBooking from './Components/ViewBillAfterBooking';
import ViewReturnedOrders from './Components/ViewReturnedOrders';
import EditBill from './Components/EditBill';
import Login from './Components/Login_Page';
import Inventory from './Components/Inventory';
import EditBill2 from './Components/EditBill2';
import ViewItems from './Components/InventoryManagement';
import ViewOrders from './Components/ViewOrders';
import ViewBill2 from './Components/ViewBill2';
import UsersManipulation from './Components/UsersManipulation';
import ViewReturnedBill from './Components/ViewReturnedBills';
import ViewSaleBill from './Components/ViewSaleBill';

import Sidebar from './DesignComponents/SideBar';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="container1">
      {!isLoginPage && <Sidebar />}
      <div className="content8">{children}</div>
    </div>
  );
};

// 🟩 Private route guard
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 🟧 Admin route guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, role } = useContext(AuthContext);
  return isAuthenticated && role === 'admin' ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><ViewOrders /></PrivateRoute>} />
            <Route path="/create-bill" element={<PrivateRoute><CreateBill /></PrivateRoute>} />
            <Route path="/view-bill" element={<PrivateRoute><ViewBill /></PrivateRoute>} />
            <Route path="/view-return-bill/:id" element={<PrivateRoute><ViewReturnedBill /></PrivateRoute>} />
            <Route path="/view-bill/:id" element={<PrivateRoute><ViewBill2 /></PrivateRoute>} />
            <Route path="/booking" element={<PrivateRoute><BookingItems /></PrivateRoute>} />
            <Route path="/view-bookings" element={<PrivateRoute><ViewBookings /></PrivateRoute>} />
            <Route path="/view-bill-afterbook/:bookingId" element={<PrivateRoute><ViewBillAfterBooking /></PrivateRoute>} />
            <Route path="/view-past-orders" element={<PrivateRoute><ViewReturnedOrders /></PrivateRoute>} />
            <Route path="/edit-bookings" element={<PrivateRoute><EditBill /></PrivateRoute>} />
            <Route path="/edit-orders-before-return/:id" element={<PrivateRoute><EditBill /></PrivateRoute>} />
            <Route path="/edit-orders/:id" element={<PrivateRoute><EditBill2 /></PrivateRoute>} />
            <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
            <Route path="/inventoryManagement" element={<PrivateRoute><ViewItems /></PrivateRoute>} />
            <Route path="/viewSale" element={<PrivateRoute><ViewSaleBill /></PrivateRoute>} />
            <Route path="/users" element={<AdminRoute><UsersManipulation /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
};

export default App;
