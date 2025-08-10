import React, { useState, Fragment, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddItems from "./AddItems";
import Sidebar from "../DesignComponents/SideBar";
import "react-toastify/dist/ReactToastify.css";

const CreateBill = () => {
    const [isSale, setIsSale] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [advanceAmountPaid, setAdvanceAmountPaid] = useState('');
    const [isAdvancePaidInFull, setIsAdvancePaidInFull] = useState(false);
    const [discount, setDiscount] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [comments, setComments] = useState('');
    const [rentMode, setRentMode] = useState('upi');
const [depositMode, setDepositMode] = useState('upi');
    const navigate = useNavigate();

    useEffect(() => {
        validateForm();
    }, [customerName, customerPhone, advanceAmount, advanceAmountPaid, discount]);

    const handleBookingDateChange = (event) => {
        const date = new Date(event.target.value);
        setBookingDate(event.target.value);

        const returnDate = new Date(date);
        returnDate.setDate(date.getDate() + 1);
        setReturnDate(returnDate.toISOString().split('T')[0]);
    };

    const handleReturnDateChange = (event) => {
        setReturnDate(event.target.value);
    };

    const validateInputs = () => {
        const newErrors = {};

        if (/\d/.test(customerName)) {
            newErrors.customerName = "Customer name cannot contain numbers.";
        }
        if (!/^\d{10,11}$/.test(customerPhone)) {
            newErrors.customerPhone = "Invalid phone number. Must be 10 or 11 digits and no alphabets.";
        }

        if (!isSale) {
            if (isNaN(advanceAmount) || advanceAmount === '') {
                newErrors.advanceAmount = "Advance amount must be a number.";
            }
            if (isNaN(advanceAmountPaid) || advanceAmountPaid === '') {
                newErrors.advanceAmountPaid = "Advance amount paid must be a number.";
            }
        }

        if (discount !== '' && isNaN(discount)) {
            newErrors.discount = "Discount must be a number.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = () => {
        setIsFormValid(validateInputs());
    };

    const handleAdvanceAmountChange = (e) => {
        setAdvanceAmount(e.target.value);
        if (isAdvancePaidInFull) {
            setAdvanceAmountPaid(e.target.value);
        }
    };

    const handleAdvancePaidInFullChange = () => {
        setIsAdvancePaidInFull(!isAdvancePaidInFull);
        if (!isAdvancePaidInFull) {
            setAdvanceAmountPaid(advanceAmount);
        } else {
            setAdvanceAmountPaid('');
        }
    };

    const onSubmitForm = async (e) => {
        e.preventDefault();

        if (!validateInputs()) return;

        try {
            const body = {
                customer_name: customerName,
                customer_mobile_number: customerPhone,
                booking_date: isSale ? null : bookingDate,
                return_date: isSale ? null : returnDate,
                advance_amount: isSale ? 0 : advanceAmount,
                advance_amount_paid: isSale ? 0 : advanceAmountPaid,
                total_amount: totalAmount,
                online_offline_mode: `${rentMode}_${depositMode}`,
                discount: discount || 0,
                status: isSale ? "Sale" : "Billed",
                comments: comments,
                items_ordered: selectedItems
            };

            const response = await fetch(`http://localhost:3000/api/bill/createBill`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error("Billing failed");

            const data = await response.json();
            const createdBillId = data.bill_id;

            const insertItemPromises = selectedItems.map(async (item, index) => {
                const itemParts = item.split(/\s*item_description:|\s*item_size:|\s*quantity:|\s*rate:/).filter(part => !!part);
                if (itemParts.length !== 4) throw new Error(`Invalid item format at index ${index}`);

                const item_description = itemParts[0].trim();
                const item_size = parseInt(itemParts[1].trim(), 10);
                const quantity = parseInt(itemParts[2].trim(), 10);
                const rate = parseFloat(itemParts[3].trim());

                const itemBody = {
                    bill_id: createdBillId,
                    item_description,
                    item_size,
                    quantity,
                    rate,
                    status: "Billed"
                };

                const itemResponse = await fetch(`http://localhost:3000/api/items/insertItems`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(itemBody)
                });

                if (!itemResponse.ok) throw new Error(`Failed to insert item ${index + 1}`);

                await adjustInventoryQuantity(item_description, quantity);
                return itemResponse.json();
            });

            await Promise.all(insertItemPromises);

            navigate(isSale ? '/viewSale' : '/view-bill');
        } catch (err) {
            console.error(err.message);
        }
    };

    const adjustInventoryQuantity = async (itemDescription, quantity) => {
        try {
            const response = await fetch(`http://localhost:3000/api/bill/updateQuantity`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_description: itemDescription, quantity: -quantity })
            });

            if (!response.ok) throw new Error(`Failed to adjust inventory for ${itemDescription}`);
        } catch (err) {
            console.error(`Error adjusting inventory for ${itemDescription}:`, err.message);
        }
    };

    const handleDiscountChange = (e) => {
        setDiscount(e.target.value === '' ? 0 : e.target.value);
    };

    return (
        <Fragment>
            <Sidebar />
            <div className="text-center mt-5">
                <h1 style={{ fontFamily: 'Times New Roman, Times, serif' }}>Create Bill</h1>
            </div>

            <form className="mt-4 px-4" onSubmit={onSubmitForm}>
                <div className="form-group">
                    <div className="form-check mb-3">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="saleCheck"
                            checked={isSale}
                            onChange={() => setIsSale(!isSale)}
                        />
                        <label className="form-check-label" htmlFor="saleCheck">Sale</label>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group col-md-6">
                        <label>Customer Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                        {errors.customerName && <small className="text-danger">{errors.customerName}</small>}
                    </div>
                    <div className="form-group col-md-6">
                        <label>Customer Phone</label>
                        <input
                            type="text"
                            className="form-control"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                        {errors.customerPhone && <small className="text-danger">{errors.customerPhone}</small>}
                    </div>
                </div>

                {!isSale && (
                    <>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label>Booking Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={bookingDate}
                                    onChange={handleBookingDateChange}
                                />
                            </div>
                            <div className="form-group col-md-6">
                                <label>Return Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={returnDate}
                                    onChange={handleReturnDateChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label>Advance Amount</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={advanceAmount}
                                    onChange={handleAdvanceAmountChange}
                                />
                                {errors.advanceAmount && <small className="text-danger">{errors.advanceAmount}</small>}
                            </div>
                            <div className="form-group col-md-6">
                                <label>Advance Amount Paid</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={advanceAmountPaid}
                                    onChange={(e) => setAdvanceAmountPaid(e.target.value)}
                                    disabled={isAdvancePaidInFull}
                                />
                                {errors.advanceAmountPaid && <small className="text-danger">{errors.advanceAmountPaid}</small>}
                                <div className="form-check mt-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={isAdvancePaidInFull}
                                        onChange={handleAdvancePaidInFullChange}
                                    />
                                    <label className="form-check-label">Check if advance amount paid in full</label>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="form-row">
  <div className="form-group col-md-6">
    <label>Discount</label>
    <input
      type="number"
      className="form-control"
      value={discount}
      onChange={handleDiscountChange}
    />
    {errors.discount && <small className="text-danger">{errors.discount}</small>}
  </div>
</div>

<div className="form-row mt-3">
  <div className="form-group col-md-6">
    <label>Rent Mode</label>
    <div className="d-flex">
      <div className="form-check me-3">
        <input
          type="radio"
          id="rent-upi"
          name="rentMode"
          value="upi"
          className="form-check-input"
          checked={rentMode === 'upi'}
          onChange={() => setRentMode('upi')}
        />
        <label className="form-check-label ms-1" htmlFor="rent-upi">UPI</label>
      </div>
      <div className="form-check">
        <input
          type="radio"
          id="rent-cash"
          name="rentMode"
          value="cash"
          className="form-check-input"
          checked={rentMode === 'cash'}
          onChange={() => setRentMode('cash')}
        />
        <label className="form-check-label ms-1" htmlFor="rent-cash">Cash</label>
      </div>
    </div>
  </div>

  <div className="form-group col-md-6">
    <label>Deposit Mode</label>
    <div className="d-flex">
      <div className="form-check me-3">
        <input
          type="radio"
          id="deposit-upi"
          name="depositMode"
          value="upi"
          className="form-check-input"
          checked={depositMode === 'upi'}
          onChange={() => setDepositMode('upi')}
        />
        <label className="form-check-label ms-1" htmlFor="deposit-upi">UPI</label>
      </div>
      <div className="form-check">
        <input
          type="radio"
          id="deposit-cash"
          name="depositMode"
          value="cash"
          className="form-check-input"
          checked={depositMode === 'cash'}
          onChange={() => setDepositMode('cash')}
        />
        <label className="form-check-label ms-1" htmlFor="deposit-cash">Cash</label>
      </div>
    </div>
  </div>
</div>


                <div className="form-row">
                    <div className="form-group col-md-6">
                        <label>Total Amount</label>
                        <input
                            type="number"
                            className="form-control"
                            value={totalAmount}
                            readOnly
                        />
                    </div>
                    <div className="form-group col-md-6">
                    <label>Comments</label>
                        <input
                            type="text"
                            className="form-control"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)} // <-- this line is required
                            />
                    </div>
                </div>

                <AddItems
                    getTotalAmount={setTotalAmount}
                    getSelectedItems={setSelectedItems}
                />

                <button className="btn btn-success mt-3" disabled={!isFormValid}>Create Bill</button>
            </form>
        </Fragment>
    );
};

export default CreateBill;
