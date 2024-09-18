const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs'); // Importar fs para manipular archivos
const path = require('path');

const app = express();
const PORT = 3000;

// Usar cors para permitir todas las solicitudes de cualquier origen
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Ruta raíz para confirmar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('Servidor Hexo en funcionamiento');
});

// Endpoint para crear un nuevo post
/* app.post('/create-post', (req, res) => {
  const postTitle = req.body.title;
  if (!postTitle) {
    return res.status(400).send('El título del post es necesario.');
  }

  // Ejecuta el comando 'hexo new'
  exec(`hexo new "${postTitle}"`, { cwd: path.resolve(__dirname, '../blog') }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al crear el post: ${error.message}`);
      return res.status(500).send('Error al crear el post.');
    }
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return res.status(500).send('Error al crear el post.');
    }
    console.log(`Resultado: ${stdout}`);
    res.send('Post creado exitosamente.');
  });
}); */

// Endpoint para eliminar un post
app.delete('/delete/:postName', (req, res) => {
  const postName = req.params.postName;

  // Ruta del archivo a eliminar (en ./source/_posts/)
  const postPath = path.resolve(__dirname, `../blog/source/_posts/${postName}.md`);

  // Verificar si el archivo existe
  fs.access(postPath, fs.constants.F_OK, err => {
    if (err) {
      // Si el archivo no existe
      return res.status(404).json({ success: false, message: 'El post no existe.' });
    }

    // Eliminar el archivo
    fs.unlink(postPath, err => {
      if (err) {
        // Si hubo un error al eliminar
        console.error(`Error al eliminar el post: ${err.message}`);
        return res.status(500).json({ success: false, message: 'Error al eliminar el post.' });
      }

      // Si el archivo fue eliminado correctamente
      console.log(`Post ${postName} eliminado con éxito.`);
      res.json({ success: true, message: 'Post eliminado con éxito.' });
    });
  });
});

// Endpoint para editar un post
app.put('/edit-post', (req, res) => {
  const postName = req.body.postName;
  const newContent = req.body.content;

  if (!postName || !newContent) {
    return res.status(400).send('El nombre del post y el contenido son necesarios.');
  }

  const postPath = path.resolve(__dirname, '../blog/source/_posts', `${postName}.md`);

  // Leer el contenido del archivo original
  fs.readFile(postPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('Post no encontrado.');
    }

    // Separar el encabezado YAML del contenido principal
    const parts = data.split('---');
    const headerYAML = `---${parts[1]}---\n`; // Preserva el encabezado YAML

    // Escribir el nuevo contenido conservando el encabezado
    const updatedContent = headerYAML + newContent;

    fs.writeFile(postPath, updatedContent, err => {
      if (err) {
        return res.status(500).send('Error al editar el post.');
      }
      res.send('Post editado exitosamente.');
    });
  });
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
