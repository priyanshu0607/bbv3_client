import React, { useState, useEffect } from 'react';
import axios from 'axios';

const initialItems = [];
const initialSelectedItems = [];

const AddItems = ({ getTotalAmount, getSelectedItems }) => {
    const [items, setItems] = useState(initialItems);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedItems, setSelectedItems] = useState(initialSelectedItems);
    const [displayedItems, setDisplayedItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/bill/items`);
                setItems(response.data.rows);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    }, []);

    useEffect(() => {
        const calculateTotalAmount = () => {
            const total = displayedItems.reduce((acc, item) => acc + item.totalRate, 0);
            setTotalAmount(total);
            getTotalAmount(total);

            const selectedItemsDescriptions = displayedItems.map(item =>
                `item_description: ${item.item_description} item_size: ${item.item_size} quantity: ${item.quantity} rate:${item.rate * item.quantity}`
            );
            getSelectedItems(selectedItemsDescriptions);
        };

        calculateTotalAmount();
    }, [displayedItems, getTotalAmount, getSelectedItems]);

    const handleChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (value.trim() !== '') {
            const filtered = items.filter(item =>
                item.item_description.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredItems(filtered);
            setShowDropdown(true);
        } else {
            setFilteredItems([]);
            setShowDropdown(false);
        }
    };

    const addNewItem = () => {
        if (searchTerm.trim() === '') {
            alert('Item description cannot be empty.');
            return;
        }

        const newItem = {
            id: Math.random(),
            item_description: searchTerm,
            item_size: '',
            rate: 0,
            quantity: 1,
            totalRate: 0
        };
        setDisplayedItems(prev => [...prev, newItem]);
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleItemClick = (item) => {
        setSearchTerm(item.item_description);
        setFilteredItems([]);
        setShowDropdown(false);

        if (!selectedItems.some(selItem => selItem.id === item.id)) {
            setSelectedItems(prev => [...prev, { ...item, quantity: 1, rate: item.rate, totalRate: item.rate }]);
        }
    };

    const handleRemoveItemClick = (index) => {
        const updated = [...displayedItems];
        updated.splice(index, 1);
        setDisplayedItems(updated);
    };

    const handleAddButtonClick = (event) => {
        event.preventDefault();

        if (searchTerm.trim() === '') {
            alert('Item description cannot be empty.');
            return;
        }

        if (!items.some(item => item.item_description === searchTerm)) {
            addNewItem();
        } else {
            setDisplayedItems(prev => [...prev, ...selectedItems]);
            setSelectedItems([]);
            setSearchTerm('');
            setFilteredItems([]);
            setShowDropdown(false);
        }
    };

    const handleQuantityChange = (index, newQuantity) => {
        if (isNaN(newQuantity) || newQuantity < 1) {
            alert('Quantity must be positive.');
            return;
        }

        const updated = [...displayedItems];
        updated[index] = {
            ...updated[index],
            quantity: newQuantity,
            totalRate: updated[index].rate * newQuantity
        };
        setDisplayedItems(updated);
    };

    const handleRateChange = (index, newRate) => {
        if (isNaN(newRate) || parseFloat(newRate) <= 0) {
            alert('Rate must be positive.');
            return;
        }

        const updated = [...displayedItems];
        updated[index] = {
            ...updated[index],
            rate: parseFloat(newRate),
            totalRate: updated[index].quantity * parseFloat(newRate)
        };
        setDisplayedItems(updated);
    };

    const handleSizeChange = (index, newSize) => {
        const updated = [...displayedItems];
        updated[index] = { ...updated[index], item_size: newSize };
        setDisplayedItems(updated);
    };

    return (
        <div className="container" style={{ marginBottom: "10px" }}>
            <div className="input-group-wrapper">
                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleChange}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        placeholder="Type to add..."
                        className="form-control"
                        style={{ height: '2.5rem' }}
                    />
                    {showDropdown && (
                        <ul className="dropdown-menu show dropdown-custom">
                            {filteredItems.map((item) => (
                                <li
                                    key={item.id}
                                    onMouseDown={() => handleItemClick(item)}
                                    className="dropdown-item"
                                >
                                    {item.item_description}, size: {item.item_size}, qty: {item.item_quantity}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button
                    onClick={handleAddButtonClick}
                    className="btn btn-primary add-btn"
                >
                    Add Items
                </button>
            </div>

            {selectedItems.length > 0 && (
                <div className="mt-2">
                    <strong>Selected Items:</strong> {selectedItems.map(item => item.item_description).join(', ')}
                </div>
            )}

            {displayedItems.length > 0 && (
                <div className="table-responsive mt-4">
                    <table className="table table-bordered">
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
                            {displayedItems.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{item.item_description}</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={item.item_size}
                                            onChange={(e) => handleSizeChange(index, e.target.value)}
                                            className="form-control"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={item.rate}
                                            onChange={(e) => handleRateChange(index, e.target.value)}
                                            className="form-control"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                            className="form-control"
                                        />
                                    </td>
                                    <td>{item.totalRate}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRemoveItemClick(index)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Inline Styles for Mobile */}
            <style>{`
                .input-group-wrapper {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                @media (max-width: 576px) {
                    .input-group-wrapper {
                        flex-direction: column;
                    }
                    .add-btn {
                        width: 100%;
                        height: 2.8rem;
                        font-size: 1rem;
                    }
                    .dropdown-custom {
                        max-height: 200px;
                        overflow-y: auto;
                        font-size: 0.9rem;
                    }
                    table {
                        font-size: 0.85rem;
                    }
                    td input {
                        min-width: 70px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AddItems;
