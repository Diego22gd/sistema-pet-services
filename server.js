const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Habilitar CORS
app.use(cors());

app.get('/', (req, res) => {
    res.send('¡Hola desde Express!');
});

// Puerto donde corre el servidor Express
app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
