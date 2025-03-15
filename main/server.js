const express = require('express');
const cors = require('cors'); // Import the CORS module
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const port = process.env.PORT || 5001;

// Use CORS middleware to allow requests from your frontend (React app)
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "client/build")));

app.get('/data', (req, res) => {
    const results = [];

    fs.createReadStream(path.join(__dirname, '/server/cq8_menu.csv'))
        .pipe(csv())
        .on('data', (row) => {
            // Processing row if needed (e.g., split fandoms)
            const rowData = {
                booth: row.booth,
                fandoms: row.fandoms.split(',').map(f => f.trim()),
                facebook_url: row.facebook_url,
                zone: row.zone,
            };
            results.push(rowData);
        })
        .on('end', () => {
            res.json(results);
        })
        .on('error', (err) => {
            res.status(500).send('Error reading CSV file');
        });
});

app.get('/get-facebook-photos', async (req, res) => {
    const { access_token, page_id } = req.query;

    // Check if the access_token and page_id are provided
    if (!access_token || !page_id) {
        return res.status(400).send('Access token or page ID is missing');
    }

    try {
        // Make the request to Facebook Graph API
        const response = await axios.get(`https://graph.facebook.com/v22.0/${page_id}/photos`, {
            params: {
                access_token
            }
        });

        // Return the fetched data to the frontend
        res.json(response.data);  // Sends back the data (e.g., list of photos)
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).send('Error fetching Facebook photos');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
