import express from 'express';

const app = express();

const PORT = 5000;

app.listen(5000, () => {
   console.log(`Server is running on port ${PORT} 🚀`);
});
