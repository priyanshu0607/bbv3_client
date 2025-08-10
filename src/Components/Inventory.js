import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../DesignComponents/SideBar';
import * as XLSX from 'xlsx';

const ItemForm = () => {
    const [formMode, setFormMode] = useState('single'); // single or bulk
    const [itemType, setItemType] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [itemQuantity, setItemQuantity] = useState('');
    const [itemSize, setItemSize] = useState('');
    const [rate, setRate] = useState('');
    const [items, setItems] = useState([]);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formMode === 'bulk' && items.length > 0) {
            try {
                const response = await fetch(`http://localhost:3000/api/items/AddInventory`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ items })
                });

                if (!response.ok) {
                    throw new Error('Failed to submit bulk items');
                }

                const result = await response.json();
                console.log('Bulk items submitted successfully:', result);
                clearForm();
                navigate('/inventory'); // Redirect after successful submission
            } catch (error) {
                console.error('Error submitting bulk items:', error);
            }
        } else {
            const newItem = {
                item_type: itemType,
                item_description: itemDescription,
                item_quantity: parseInt(itemQuantity, 10),
                item_size: itemSize, // Treat item_size as a string
                rate: parseFloat(rate)
            };

            try {
                const response = await fetch(`http://localhost:3000/api/items/AddInventory`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newItem)
                });

                if (!response.ok) {
                    throw new Error('Failed to submit single item');
                }

                const result = await response.json();
                console.log('Single item submitted successfully:', result);
                clearForm();
                navigate('/inventory'); // Redirect after successful submission
            } catch (error) {
                console.error('Error submitting single item:', error);
            }
        }
    };

    const clearForm = () => {
        setItemType('');
        setItemDescription('');
        setItemQuantity('');
        setItemSize('');
        setRate('');
        setItems([]);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);

            setItems(data.map(item => ({
                item_type: item.item_type,
                item_description: item.item_description,
                item_quantity: parseInt(item.item_quantity, 10),
                item_size: item.item_size, // Keep item_size as string
                rate: parseFloat(item.rate)
            })));
        };
        reader.readAsBinaryString(file);
    };

    return (
        <Fragment>
            <Sidebar />
            <div className="container">
                <h1 className="text-center mt-5">Add Item</h1>
                <div className="text-center">
                    <button
                        className={`btn ${formMode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFormMode('single')}
                    >
                        Add Single Item
                    </button>
                    <button
                        className={`btn ${formMode === 'bulk' ? 'btn-primary' : 'btn-secondary'} ml-3`}
                        onClick={() => setFormMode('bulk')}
                    >
                        Add Multiple Items
                    </button>
                </div>
                <form className="mt-5" onSubmit={handleSubmit}>
                    {formMode === 'single' ? (
                        <>
                            <div className="form-group">
                                <label htmlFor="itemType">Item Type</label>
                                <select
                                    className="form-control"
                                    id="itemType"
                                    value={itemType}
                                    onChange={(e) => setItemType(e.target.value)}
                                    required
                                >
                                    <option value="">Select Item Type</option>
                                    <option value="costume">Costume</option>
                                    <option value="single">Single</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="itemDescription">Item Description</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="itemDescription"
                                    value={itemDescription}
                                    onChange={(e) => setItemDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="itemQuantity">Item Quantity</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="itemQuantity"
                                    value={itemQuantity}
                                    onChange={(e) => setItemQuantity(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="itemSize">Item Size</label>
                                <input
                                    type="text" // Changed to text
                                    className="form-control"
                                    id="itemSize"
                                    value={itemSize}
                                    onChange={(e) => setItemSize(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="rate">Rate</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="rate"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <div className="form-group">
                            <label htmlFor="fileUpload">Upload Excel</label>
                            <input
                                type="file"
                                className="form-control"
                                id="fileUpload"
                                onChange={handleFileUpload}
                                required
                            />
                        </div>
                    )}
                    <div className="text-center d-flex justify-content-center mt-3">
                        <button type="submit" className="btn btn-primary mx-2">
                            {formMode === 'single' ? 'Add Item' : 'Upload Items'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                clearForm();
                                navigate('/inventory');
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-info mx-2"
                            onClick={() => navigate('/inventoryManagement')}
                        >
                            Inventory Management
                        </button>
                    </div>
                </form>
            </div>
        </Fragment>
    );
};

export default ItemForm;
