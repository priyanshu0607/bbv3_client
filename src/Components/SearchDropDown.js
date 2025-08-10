import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchDropdown = ({ onSelectItem }) => {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

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

    const handleItemClick = (item) => {
        setSearchTerm('');
        setFilteredItems([]);
        setShowDropdown(false);
        onSelectItem({
            item_description: item.item_description,
            item_size: item.item_size,
            rate: item.rate // Include rate in the selected item object
        });
    };
    

    return (
        <div style={{ position: 'relative', width: '300px' }}>
            <input
                type="text"
                value={searchTerm}
                onChange={handleChange}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Type to add..."
                className="form-control"
                style={{ width: '100%' }}
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
    );
};

export default SearchDropdown;