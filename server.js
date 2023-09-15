import express from 'express';
import getLocation from './status.js';  
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.get('/', (req, res) => {
  res.send('testing testing');
});

app.get('/scraped-data', async (req, res) => {
  try {
    const data = await getLocation(); 
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});