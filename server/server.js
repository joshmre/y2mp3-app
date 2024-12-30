import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import ytdlp from 'youtube-dl-exec';
import cors from 'cors';
import fs from 'fs';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Use middleware to parse JSON
app.use(express.json());

const downloadsDir = join(__dirname, 'downloads');

// Create downloads directory if it doesn't exist
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

// Serve static files from the React app
app.use(express.static(join(__dirname, '../build')));

// Video info endpoint
app.get('/api/video-info/:videoId', async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || typeof videoId !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Invalid videoId',
        });
    }

    try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        console.log('Fetching video info for:', videoUrl);

        const videoInfo = await ytdlp(videoUrl, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true,
        });

        res.json({
            success: true,
            title: videoInfo.title,
            videoInfo: {
                thumbnail: videoInfo.thumbnail,
                author: videoInfo.uploader,
                duration: videoInfo.duration,
                description: videoInfo.description,
            },
        });
    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch video information',
        });
    }
});

// Convert video endpoint
app.post('/api/convert', async (req, res) => {
    try {
        const { videoId, title } = req.body;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const tempName = `${safeTitle}`;
        const filePath = join(downloadsDir, tempName);

        console.log('Starting download for:', videoUrl);
        console.log('Output path:', filePath);
        console.log('Directory contents before:', fs.readdirSync(downloadsDir));

        try {
            const output = await ytdlp(videoUrl, {
                extractAudio: true,
                audioFormat: 'mp3',
                output: `${filePath}.%(ext)s`,
                format: 'bestaudio',
                addHeader: [
                    'referer:youtube.com',
                    'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                ]
            });

            console.log('yt-dlp output:', output);
        } catch (dlError) {
            console.error('Download error:', dlError);
            throw new Error(`Download failed: ${dlError.message}`);
        }

        // Wait for file system
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check for both .mp3 and .webm files
        const webmPath = `${filePath}.webm`;
        const mp3Path = `${filePath}.mp3`;

        console.log('Checking for files:');
        console.log('WebM path:', webmPath);
        console.log('MP3 path:', mp3Path);
        console.log('Directory contents:', fs.readdirSync(downloadsDir));

        if (fs.existsSync(webmPath)) {
            // If we have a .webm file rename it to .mp3
            try {
                fs.renameSync(webmPath, mp3Path);
                console.log('Successfully renamed webm to mp3');
            } catch (renameErr) {
                console.error('Rename error:', renameErr);
                throw new Error('Failed to rename file');
            }
        }

        if (!fs.existsSync(mp3Path)) {
            console.error('No MP3 file found after conversion');
            throw new Error('Conversion failed');
        }

        console.log('Conversion completed successfully');
        console.log('Final file path:', mp3Path);

        res.json({
            success: true,
            fileName: `${safeTitle}.mp3`
        });
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to convert video'
        });
    }
});


app.get('/api/download/:fileName', (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = join(downloadsDir, fileName);
        
        console.log('Attempting to download file:', filePath);

        let finalPath = filePath;
        if (!fs.existsSync(filePath)) {
            if (fs.existsSync(`${filePath}.webm`)) {
                finalPath = `${filePath}.webm`;
                // Attempt to rename the file
                try {
                    fs.renameSync(finalPath, filePath);
                    finalPath = filePath;
                } catch (err) {
                    console.error('Error renaming file:', err);
                }
            } else {
                console.error('File not found:', filePath);
                return res.status(404).json({
                    success: false,
                    error: 'File not found'
                });
            }
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        const fileStream = fs.createReadStream(finalPath);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Error downloading file'
                });
            }
        });

        fileStream.on('end', () => {
            console.log('File stream completed successfully');
        });
    } catch (error) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Failed to process download request'
            });
        }
    }
});


// Cleanup endpoint to manually delete files
app.delete('/api/cleanup/:fileName', (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = join(downloadsDir, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'File deleted successfully' });
        } else {
            res.status(404).json({ success: false, error: 'File not found' });
        }
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete file'
        });
    }
});

// Handle all other GET requests by serving the React app
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../build/index.html'));
});

// Server setup
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Downloads directory: ${downloadsDir}`);
});

// Handle termination
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});
