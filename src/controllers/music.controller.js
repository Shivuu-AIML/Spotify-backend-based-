const musicModel = require('../models/music.model');
const albumModel = require('../models/album.model');
const { uploadToImageKit } = require('../services/storage.services');
const jwt = require('jsonwebtoken');

async function createMusic(req, res) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'artist') {
      return res.status(403).json({ message: 'You dont have access to create a music' });
    }

    const title = req.body.title;

    // multer(any) puts files into req.files
    const uploaded = req.files?.[0] || req.file;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'title is required' });
    }

    if (!uploaded) {
      return res.status(400).json({ message: 'file is required' });
    }

    const fileBase64 = uploaded.buffer.toString('base64');
    const result = await uploadToImageKit(fileBase64);

    const music = await musicModel.create({
      uri: result.url,
      title,
      artist: decoded.userId,
    });

    return res.status(201).json({
      message: 'Music uploaded successfully',
      music,
    });
  } catch (error) {
    return res.status(401).json({ message: error?.message || 'Unauthorized' });
  }
}

async function createAlbum(req, res) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'artist') {
      return res.status(403).json({ message: "You dont have acces " });
    }

    const { title, musicIds } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'title is required' });
    }

    if (!Array.isArray(musicIds) || musicIds.length === 0) {
      return res.status(400).json({ message: 'musicIds is required and must be a non-empty array' });
    }

    const album = await albumModel.create({
      title,
      artist: decoded.userId,
      musicIds,
    });

    return res.status(201).json({
      message: 'album created succesfully',
      album: {
        id: album._id,
        title: album.title,
        artist: album.artist,
        musicIds: album.musicIds,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: 'unauthorized' });
  }
}

async function getAllMusics(req, res) {
  const musics = await musicModel.find();

  return res.status(200).json({
    message: 'musics fetched succesfully',
    musics,
  });
}

async function getAllAlbums(req, res) {
  const albums = await albumModel.find().limit(20);

  return res.status(200).json({
    message: 'albums fetched succesfully',
    albums,
  });
}

module.exports = {
  createMusic,
  createAlbum,
  getAllMusics,
  getAllAlbums,
};
