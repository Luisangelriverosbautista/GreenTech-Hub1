const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const VideoPost = require('../models/VideoPost');
const BlogPost = require('../models/BlogPost');

function toSlug(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function extractVideoInfo(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
    let id = '';
    if (host === 'youtu.be') {
      id = parsed.pathname.replace('/', '').trim();
    } else if (parsed.pathname.startsWith('/watch')) {
      id = parsed.searchParams.get('v') || '';
    } else if (parsed.pathname.startsWith('/shorts/')) {
      id = parsed.pathname.split('/')[2] || '';
    } else if (parsed.pathname.startsWith('/embed/')) {
      id = parsed.pathname.split('/')[2] || '';
    }

    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
      return null;
    }

    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}`
    };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const parts = parsed.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1] || '';

    if (!/^\d+$/.test(id)) {
      return null;
    }

    return {
      platform: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${id}`
    };
  }

  return null;
}

async function getCurrentUser(req) {
  return User.findById(req.user.userId);
}

router.get('/videos', async (req, res) => {
  try {
    const status = String(req.query.status || 'published').toLowerCase();
    const filter = status === 'all' ? {} : { status };
    const videos = await VideoPost.find(filter)
      .populate('author', 'name email role walletAddress')
      .populate('project', 'title status')
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/videos', auth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { title, description = '', url, tags = [], project, status = 'published' } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'title y url son requeridos' });
    }

    const videoInfo = extractVideoInfo(url);
    if (!videoInfo) {
      return res.status(400).json({ error: 'URL de video no soportada. Usa YouTube o Vimeo.' });
    }

    const newVideo = new VideoPost({
      title,
      description,
      platform: videoInfo.platform,
      originalUrl: url,
      embedUrl: videoInfo.embedUrl,
      tags: Array.isArray(tags) ? tags : [],
      project,
      status,
      author: user._id
    });

    const savedVideo = await newVideo.save();
    const populated = await savedVideo.populate('author', 'name email role walletAddress');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/blogs', async (req, res) => {
  try {
    const status = String(req.query.status || 'published').toLowerCase();
    const filter = status === 'all' ? {} : { status };
    const blogs = await BlogPost.find(filter)
      .populate('author', 'name email role walletAddress')
      .populate('project', 'title status')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/blogs/:slug', async (req, res) => {
  try {
    const blog = await BlogPost.findOne({ slug: req.params.slug })
      .populate('author', 'name email role walletAddress')
      .populate('project', 'title status');

    if (!blog) {
      return res.status(404).json({ error: 'Blog no encontrado' });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/blogs', auth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const {
      title,
      slug,
      excerpt = '',
      content,
      coverImageUrl = '',
      tags = [],
      project,
      status = 'draft'
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'title y content son requeridos' });
    }

    const finalSlug = toSlug(slug || title);
    if (!finalSlug) {
      return res.status(400).json({ error: 'No se pudo generar un slug válido' });
    }

    const exists = await BlogPost.findOne({ slug: finalSlug });
    if (exists) {
      return res.status(409).json({ error: 'El slug ya existe, usa otro título o slug.' });
    }

    const blog = new BlogPost({
      title,
      slug: finalSlug,
      excerpt,
      content,
      coverImageUrl,
      tags: Array.isArray(tags) ? tags : [],
      project,
      status,
      author: user._id
    });

    const saved = await blog.save();
    const populated = await saved.populate('author', 'name email role walletAddress');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
