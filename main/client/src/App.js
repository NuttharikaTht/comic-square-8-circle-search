import React, { useState } from 'react';
import './styles.css';
import axios from 'axios';

const App = () => {
    const [previewData, setPreviewData] = useState([]);
    const [searchTextFandom, setSearchTextFandom] = useState(""); // Separate search text for fandoms
    const [filterTextFandom, setFilterTextFandom] = useState([]); // Selected fandoms
    const [searchTextZone, setSearchTextZone] = useState(""); // Separate search text for zones
    const [filterTextZone, setFilterTextZone] = useState([]); // Selected zones
    const [distinctFandoms, setDistinctFandoms] = useState([]);
    const [distinctZones, setDistinctZones] = useState([]);
    const [isFandomDropdownVisible, setIsFandomDropdownVisible] = useState(false);
    const [isZoneDropdownVisible, setIsZoneDropdownVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch data from the server
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:5001/data");
                setPreviewData(response.data);

                // Extract distinct fandoms and zones
                const fandoms = new Set();
                const zones = new Set();

                response.data.forEach(item => {
                    item.fandoms.forEach(fandom => fandoms.add(fandom.toLowerCase()));
                    zones.add(item.zone.toLowerCase());
                });

                setDistinctFandoms([...fandoms]);
                setDistinctZones([...zones]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    // Handle search input for fandoms
    const handleFandomSearchChange = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTextFandom(value);
        setIsFandomDropdownVisible(value.length > 0);
    };

    // Handle search input for zones
    const handleZoneSearchChange = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTextZone(value);
        setIsZoneDropdownVisible(value.length > 0);
    };

    // Handle selecting a fandom
    const handleFandomClick = (fandom) => {
        setFilterTextFandom((prev) =>
            prev.includes(fandom) ? prev.filter((f) => f !== fandom) : [...prev, fandom]
        );
        setIsFandomDropdownVisible(false);
    };

    // Handle selecting a zone
    const handleZoneClick = (zone) => {
        setFilterTextZone((prev) =>
            prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
        );
        setIsZoneDropdownVisible(false);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilterTextFandom([]);
        setFilterTextZone([]);
        setSearchTextFandom("");
        setSearchTextZone("");
    };

    // Filter fandoms and zones based on user input
    const filteredFandoms = distinctFandoms.filter((fandom) =>
        fandom.includes(searchTextFandom.toLowerCase())
    );

    const filteredZones = distinctZones.filter((zone) =>
        zone.includes(searchTextZone.toLowerCase())
    );

    // Apply filters to preview data
    const filteredData = previewData.filter((item) => {
        const fandomMatch =
            filterTextFandom.length === 0 ||
            item.fandoms.some((fandom) => filterTextFandom.includes(fandom.toLowerCase()));

        const zoneMatch =
            filterTextZone.length === 0 || filterTextZone.includes(item.zone.toLowerCase());

        return fandomMatch && zoneMatch;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container">
            <div className="header">
                <h1>Comic Square 8 Circle Search</h1>
            </div>
            <div>
            {/* Fandom Search Bar */}
            <div className="dropdown-container">
                <input
                    type="text"
                    placeholder="Search Fandoms"
                    value={searchTextFandom}
                    onChange={handleFandomSearchChange}
                    onClick={() => setIsFandomDropdownVisible(true)}
                />
                {isFandomDropdownVisible && (
                    <div className="dropdown">
                        {filteredFandoms.map((fandom, index) => (
                            <span
                                key={index}
                                className={`tag ${filterTextFandom.includes(fandom) ? 'selected' : ''}`}
                                onClick={() => handleFandomClick(fandom)}
                            >
                                {fandom.charAt(0).toUpperCase() + fandom.slice(1)}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {/* Zone Search Bar */}
            <div className="dropdown-container">
                <input
                    type="text"
                    placeholder="Search Zones"
                    value={searchTextZone}
                    onChange={handleZoneSearchChange}
                    onClick={() => setIsZoneDropdownVisible(true)}
                />
                {isZoneDropdownVisible && (
                    <div className="dropdown">
                        {filteredZones.map((zone, index) => (
                            <span
                                key={index}
                                className={`tag ${filterTextZone.includes(zone) ? 'selected' : ''}`}
                                onClick={() => handleZoneClick(zone)}
                            >
                                {zone.charAt(0).toUpperCase() + zone.slice(1)}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Filters */}
            <div className="selected-filters">
                {filterTextFandom.length > 0 && (
                    <div className="filter-labels">
                        <strong>Selected Fandoms: </strong>
                        {filterTextFandom.map((fandom, index) => (
                            <span key={index} className="label">
                                {fandom.charAt(0).toUpperCase() + fandom.slice(1)}
                                <button onClick={() => setFilterTextFandom(filterTextFandom.filter(f => f !== fandom))}>x</button>
                            </span>
                        ))}
                    </div>
                )}
                {filterTextZone.length > 0 && (
                    <div className="filter-labels">
                        <strong>Selected Zones: </strong>
                        {filterTextZone.map((zone, index) => (
                            <span key={index} className="label">
                                {zone.charAt(0).toUpperCase() + zone.slice(1)}
                                <button onClick={() => setFilterTextZone(filterTextZone.filter(z => z !== zone))}>x</button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
                <br/>
            </div>
            {/* Clear Filters Button */}
            <button onClick={clearFilters} className="clear-button">
                Clear All Filters
            </button>

            <div>
                <h2> หมายเหตุ </h2>
                <p> ภาพใบเมนูเป็น preview album บน page สามารถกดเข้าไปดูเพิ่มเติมได้</p>
            </div>
            {/* Grid of Preview Cards */}
            <div className="preview-grid">
                {currentItems.length > 0 ? (
                    currentItems.map((item, index) => (
                        <div className="preview-card" key={index}>
                            <h2>{item.booth}</h2>
                            <div className="facebook-post">
                                <iframe
                                    src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(item.facebook_url)}&width=500`}
                                    width="500"
                                    height="600"
                                    style={{ border: 'none', overflow: 'hidden' }}
                                    scrolling="no"
                                    frameBorder="0"
                                    allowTransparency="true"
                                    allow="encrypted-media"
                                ></iframe>
                            </div>
                            <h3>Fandoms</h3>
                            <p>{item.fandoms.join(', ')}</p>
                            <p>Zone : {item.zone}</p>
                            <br/>
                        </div>
                    ))
                ) : (
                    <p>No results found.</p>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                </div>
            )}
        </div>
    );
};

export default App;
