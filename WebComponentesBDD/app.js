
const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');

const app = express();
const port = 3000;

const upload = multer({dest: 'imagenes/'});


// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'CompV'
});

//Verificacion de errores para validar si la conexion es correcta
connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});

//middlwere
app.use(express.urlencoded({extended: true}));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

//Convierto en formato json
app.use(express.json());
//Configuro para que la aplicacon inicie desde el director o carpeta pagina principal
app.use(express.static(path.join(__dirname, 'pagina_principal')));

//imagenes

// Subir una imagen con nombre y descripción
app.post('/subir_imagenes', upload.single('imagen'), (req,res) => {
    //url datos
    const {nombre, descripcion} = req.body;

    //url imagen
    const imagen = req.file.filename;

    const sql ='insert into imagenes (nombre, descripcion, imagen) values (?, ?, ?)';

    connection.query(sql, [nombre, descripcion, imagen], (err) =>{
        //error
        if(err) throw err;

        res.redirect('zzimag.html');
    })
});

//pedir img

app.get('/imagenes', (req, res) =>{
    const sql = 'select nombre, descripcion, imagen from imagenes';
    connection.query(sql, (err, result) =>{
        if(err){
            console.error('Error al obtener la BD'+ err.stack);
            res.status(500).send('Error');
            return;
        }
        //json
        res.json(result);

    });
});


//Recibo los valores y los envio a la tabla
app.post('/guardar_componentes', (req, res) => {
    const { NombreC, MarcaC, PrecioC, DescripcionC, CantidadC } = req.body;
    
    // Validación básica de entrada (opcional pero recomendado)
    if (!NombreC || !MarcaC || !PrecioC || !DescripcionC || !CantidadC) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }
    
    const sql = 'INSERT INTO Componentes (NombreC, MarcaC, PrecioC, DescripcionC, CantidadC) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [NombreC, MarcaC, PrecioC, DescripcionC, CantidadC], (err, result) => {
        if (err) {
            console.error('Error al ingresar el componente:', err);
            return res.status(500).send('Error al ingresar el componente en la base de datos.');
        }
        console.log('Componente ingresado correctamente.');
        res.redirect('/');
    });
});


//Ruta para mostrar los Componentes 
app.get('/obtener_componentes', (req, res) => {
    //Realiza una consulta SQL para seleccionar todas las filas de la tabla "Componentes"
    connection.query('SELECT * FROM Componentes', (err, rows) => {
        //Maneja los errores, si los hay
        if (err) throw err;
        res.send(rows); 
    });
});


//Define una ruta DELETE en la aplicación Express para eliminar un Componente
app.delete('/eliminar_componente/:id', (req, res) => {
    //Obtiene el parámetro 'id' de la URL para eliminar la pelicula en especifico
    const id = req.params.id;
    //Define la consulta SQL para eliminar una película donde el ID coincida
    const sql = 'DELETE FROM Componentes WHERE id = ?';
    //Ejecuta la consulta SQL, utilizando el Id que se enviara a la consulta SQL
    connection.query(sql, [id], (err, result) => {
        // Si ocurre un error durante la ejecución de la consulta, lanza una excepción
        if (err) throw err;
        // Imprime un mensaje en la consola indicando que la película fue eliminada correctamente
        console.log('Componente eliminado correctamente.');
        // Envía una respuesta HTTP 200 OK al cliente, indicando que la eliminación fue exitosa
        res.sendStatus(200); 
    });
});


app.post('/modificar_componente', (req, res) => {
    const { id, NombreC, MarcaC, PrecioC, DescripcionC, CantidadC } = req.body;
    const sql = 'UPDATE Componentes SET NombreC = ?, MarcaC = ?, PrecioC = ?, DescripcionC = ?, CantidadC = ? WHERE id = ?';
    connection.query(sql, [NombreC, MarcaC, PrecioC, DescripcionC, CantidadC, id], (err, result) => {
        if (err) {
            console.error('Error al modificar el componente:', err);
            return res.status(500).json({ error: 'Error al modificar el componente en la base de datos.' });
        }
        res.redirect('/'); 
    });
});


// Ruta para obtener los datos de una película por su ID
app.get('/obtener_componente/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Componentes WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el componente:', err);
            return res.status(500).json({ error: 'Error al obtener el componente de la base de datos.' });
        }
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ error: 'Componente no encontrado.' });
        }
    });
});

app.post('/guardar_usuario', (req, res) => {
    const { Nombre, Apellido, Correo, Contraseña } = req.body;
    const sql = 'INSERT INTO Usuer (Nombre, Apellido, Correo, Contraseña) VALUES (?, ?, ?, ?)';
    connection.query(sql, [Nombre, Apellido, Correo, Contraseña], (err, result) => {
        if (err) {
            console.error('Error al guardar el usuario:', err);
            return res.status(500).json({ error: 'Error al guardar el usuario en la base de datos.' });
        }
        res.redirect('amenu.html'); 
    });
});

app.get('/obtener_usuario/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Usuer WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el usuario:', err);
            return res.status(500).json({ error: 'Error al obtener el usuario de la base de datos.' });
        }
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ error: 'Usuario no encontrado.' });
        }
    });
});


app.get('/obtener_usuarios', (req, res) => {
    const sql = 'SELECT * FROM Usuer';
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error al obtener los usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener los usuarios de la base de datos.' });
        }
        res.json(result);
    });
});

app.delete('/eliminar_usuario/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Usuer WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            return res.status(500).json({ error: 'Error al eliminar el usuario de la base de datos.' });
        }
        res.json({ success: true });
    });
});

app.post('/modificar_usuario', (req, res) => {
    const { id, Nombre, Apellido, Correo, Contraseña } = req.body;
    const sql = 'UPDATE Usuer SET Nombre = ?, Apellido = ?, Correo = ?, Contraseña = ? WHERE id = ?';
    connection.query(sql, [Nombre, Apellido, Correo, Contraseña, id], (err, result) => {
        if (err) {
            console.error('Error al modificar el usuario:', err);
            return res.status(500).json({ error: 'Error al modificar el usuario en la base de datos.' });
        }
        res.redirect('ausuarios.html'); 
    });
});


app.listen(port, () => {
    console.log('Servidor corriendo en http://localhost:3000/menumenu.html');
});

