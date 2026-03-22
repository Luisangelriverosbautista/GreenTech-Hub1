const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(String(file.mimetype || '').toLowerCase())) {
      cb(new Error('Formato no permitido. Usa JPG, PNG, WEBP o GIF.'));
      return;
    }
    cb(null, true);
  }
});

function getGridFsBucket() {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    return null;
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'images' });
}

router.post('/image', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || 'No se pudo subir la imagen' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Debes adjuntar una imagen' });
      return;
    }

    const bucket = getGridFsBucket();
    if (!bucket) {
      res.status(503).json({ error: 'Base de datos no disponible para guardar imagen' });
      return;
    }

    const safeName = String(req.file.originalname || `image-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uploadStream = bucket.openUploadStream(safeName, {
      contentType: req.file.mimetype,
      metadata: {
        uploadedBy: req.user?.userId || null,
        uploadedAt: new Date().toISOString()
      }
    });

    uploadStream.on('error', (streamError) => {
      res.status(500).json({ error: streamError.message || 'Error al guardar imagen en base de datos' });
    });

    uploadStream.on('finish', () => {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageId = String(uploadStream.id);
      const imagePath = `${req.baseUrl}/image/${imageId}`;

      res.status(201).json({
        message: 'Imagen subida correctamente',
        url: `${baseUrl}${imagePath}`,
        path: imagePath,
        filename: safeName,
        id: imageId
      });
    });

    uploadStream.end(req.file.buffer);
  });
});

router.get('/image/:id', async (req, res) => {
  try {
    const bucket = getGridFsBucket();
    if (!bucket) {
      return res.status(503).json({ error: 'Base de datos no disponible' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID de imagen inválido' });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    res.setHeader('Content-Type', files[0].contentType || 'application/octet-stream');
    bucket.openDownloadStream(fileId).pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
