const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Middleware, routes, etc.
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Hello World!');
});
const odds= {
    data: [
      {
        deep_link: null,
        fixture_id: '88695C958453',
        game_id: '12972-20783-2024-08-23',
        grouping_key: 'grobinas_sc:2.5',
        id: '12972-20783-2024-08-23:1xbet:team_total:grobinas_sc_under_2_5',
        is_live: false,
        is_main: false,
        league: 'Latvia - Virsliga',
        market: 'Team Total',
        name: 'Grobinas SC Under 2.5',
        player_id: '',
        points: 2.5,
        price: -507,
        selection: 'Grobinas SC',
        selection_line: 'under',
        selection_points: 2.5,
        sport: 'soccer',
        sportsbook: '1XBet',
        team_id: '2C6B6E1097F9',
        timestamp: 1724407405.828991
      },
      {
        deep_link: null,
        fixture_id: '88695C958453',
        game_id: '12972-20783-2024-08-23',
        grouping_key: 'grobinas_sc:2.0',
        id: '12972-20783-2024-08-23:1xbet:team_total:grobinas_sc_over_2',
        is_live: false,
        is_main: false,
        league: 'Latvia - Virsliga',
        market: 'Team Total',
        name: 'Grobinas SC Over 2',
        player_id: '',
        points: 2,
        price: 193,
        selection: 'Grobinas SC',
        selection_line: 'over',
        selection_points: 2,
        sport: 'soccer',
        sportsbook: '1XBet',
        team_id: '2C6B6E1097F9',
        timestamp: 1724407405.828991
      },
      {
        deep_link: null,
        fixture_id: '88695C958453',
        game_id: '12972-20783-2024-08-23',
        grouping_key: 'grobinas_sc:2.0',
        id: '12972-20783-2024-08-23:1xbet:team_total:grobinas_sc_under_2',
        is_live: false,
        is_main: false,
        league: 'Latvia - Virsliga',
        market: 'Team Total',
        name: 'Grobinas SC Under 2',
        player_id: '',
        points: 2,
        price: -303,
        selection: 'Grobinas SC',
        selection_line: 'under',
        selection_points: 2,
        sport: 'soccer',
        sportsbook: '1XBet',
        team_id: '2C6B6E1097F9',
        timestamp: 1724407405.828991
      }
    ],
    entry_id: '1724407405853-6',
    type: 'odds'
  }
  
  app.post('/stream-odds', async (req, res) => {
    const oddsData = odds.data;
    const type = odds.type;
  
    try {
      const collection = mongoose.connection.collection('stream'); // Use your collection name here
  
      // Iterate over the data array and add type to each document
      const documents = oddsData.map(odds => ({
        ...odds,
        type: type // Add the type key from the request body
      }));
  
      // Insert the documents into the collection
      await collection.insertMany(documents);
  
      res.status(200).send({ message: 'Data inserted successfully' });
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).send({ message: 'Error inserting data' });
    }
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
