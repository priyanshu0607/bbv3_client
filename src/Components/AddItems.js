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
    }, []); // Fetch items only once on component mount

    useEffect(() => {
        const calculateTotalAmount = () => {
            const total = displayedItems.reduce((accumulator, item) => accumulator + item.totalRate, 0);
            setTotalAmount(total);
            getTotalAmount(total); // Pass total amount to parent component

            const selectedItemsDescriptions = displayedItems.map(item => `item_description: ${item.item_description} item_size: ${item.item_size} quantity: ${item.quantity} rate:${item.rate*item.quantity}`);
            getSelectedItems(selectedItemsDescriptions); // Pass selected items descriptions to parent component
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
            id: Math.random(), // Generate a unique ID
            item_description: searchTerm,
            item_size: '', // Editable field
            rate: 0, // Editable field
            quantity: 1,
            totalRate: 0 // Calculated as rate * quantity
        };
        setDisplayedItems(prevDisplayedItems => [...prevDisplayedItems, newItem]);
        setSearchTerm(''); // Clear search term
        setShowDropdown(false); // Hide dropdown
    };
    

    const handleItemClick = (item) => {
        setSearchTerm(item.item_description); // Set the clicked item in the input box
        setFilteredItems([]);
        setShowDropdown(false);

        if (!selectedItems.some(selItem => selItem.id === item.id)) {
            setSelectedItems(prevSelectedItems => [...prevSelectedItems, { ...item, quantity: 1, rate: item.rate, totalRate: item.rate }]);
        }
    };

    const handleRemoveItemClick = (index) => {
        const updatedItems = [...displayedItems];
        updatedItems.splice(index, 1);
        setDisplayedItems(updatedItems);
    };

    const handleAddButtonClick = (event) => {
        event.preventDefault();
    
        if (searchTerm.trim() === '') {
            alert('Item description cannot be empty.');
            return;
        }
    
        if (!items.some(item => item.item_description === searchTerm) && searchTerm.trim() !== '') {
            addNewItem(); // Add new item if not found in fetched items
        } else {
            setDisplayedItems(prevDisplayedItems => [...prevDisplayedItems, ...selectedItems]);
            setSelectedItems([]); // Clear selectedItems after adding
            setSearchTerm(''); // Clear search term
            setFilteredItems([]); // Clear filtered items
            setShowDropdown(false); // Hide dropdown
        }
    };
    

    const handleQuantityChange = (index, newQuantity) => {
        if (isNaN(newQuantity) || newQuantity < 1) {
            alert('Quantity must be a positive integer.');
            return;
        }
    
        const updatedItems = [...displayedItems];
        updatedItems[index] = { 
            ...updatedItems[index], 
            quantity: newQuantity, 
            totalRate: updatedItems[index].rate * newQuantity 
        };
        setDisplayedItems(updatedItems);
    };
    

    const handleRateChange = (index, newRate) => {
        if (isNaN(newRate) || parseFloat(newRate) <= 0) {
            alert('Rate must be a positive number.');
            return;
        }
    
        const updatedItems = [...displayedItems];
        updatedItems[index] = { 
            ...updatedItems[index], 
            rate: parseFloat(newRate), 
            totalRate: updatedItems[index].quantity * parseFloat(newRate) 
        };
        setDisplayedItems(updatedItems);
    };
    

    const handleSizeChange = (index, newSize) => {
        if (newSize.trim() === '') {
            alert('Size cannot be empty.');
            return;
        }
    
        const updatedItems = [...displayedItems];
        updatedItems[index] = { ...updatedItems[index], item_size: newSize };
        setDisplayedItems(updatedItems);
    };
    

    return (
        <div className="container" style={{ marginBottom: "10px" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ position: 'relative', width: '100%' }}>
        <input
            type="text"
            value={searchTerm}
            onChange={handleChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Type to add..."
            className="form-control"
            style={{ width: '100%', height: '2.5rem' }}
        />
                    {showDropdown && (
                        <ul className="dropdown-menu show" style={{ width: '100%', position: 'absolute', zIndex: 1 }}>
                            {filteredItems.map((item) => (
                                <li
                                    key={item.id}
                                    onMouseDown={() => handleItemClick(item)}
                                    className="dropdown-item cursor-pointer"
                                >
                                    {item.item_description} ,size:{item.item_size} ,quantity:{item.item_quantity}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button onClick={handleAddButtonClick}
        className="btn1 btn-primary"
        style={{
            height: '3rem',
            padding: '0 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '5px'
        }}>Add Items</button>
            </div>
            {selectedItems.length > 0 && (
                <div className="mt-2">
                    <strong>Selected Items:</strong> {selectedItems.map(item => item.item_description).join(', ')}
                </div>
            )}
            {displayedItems.length > 0 && (
                <div className="selected-items mt-4">
                    <table className="table table-bordered" style={{ width: '100%' }}>
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
        </div>
    );
};

export default AddItems;
