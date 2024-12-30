import React, { useState } from 'react';
import { Button, TextField, Typography, Box, CircularProgress } from '@mui/material';

const ConversionTab = () => {
    const [link, setLink] = useState('');
    const [videoInfo, setVideoInfo] = useState(null);
    const [error, setError] = useState('');
    const [isConverting, setIsConverting] = useState(false);
    const [convertedFile, setConvertedFile] = useState(null);

    const extractVideoId = (url) => {
        if (!url || typeof url !== "string") return null;

        const urlPatterns = [
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
        ];

        for (const pattern of urlPatterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        if (url.length === 11) {
            return url; // Raw video ID
        }

        return null;
    };

    const handleInputChange = (e) => {
        setLink(e.target.value);
        setError('');
        setVideoInfo(null);
        setConvertedFile(null);
    };

    const handleConvert = async () => {
        const videoId = extractVideoId(link);

        if (!videoId) {
            setError('Please enter a valid YouTube URL');
            return;
        }

        try {
            setIsConverting(true);
            setError('');

            // Fetch video info
            console.log('Fetching info for video:', videoId);
            const infoResponse = await fetch(`http://localhost:3001/api/video-info/${videoId}`);
            const infoData = await infoResponse.json();

            if (!infoResponse.ok) {
                throw new Error(infoData.error || 'Failed to fetch video info');
            }

            if (infoData.success) {
                setVideoInfo({
                    id: videoId,
                    title: infoData.title,
                    thumbnail: infoData.videoInfo?.thumbnail,
                    author: infoData.videoInfo?.author
                });
            } else {
                setError('Invalid video URL');
                setIsConverting(false);
                return;
            }

            console.log('Starting conversion for video:', videoId);
            const convertResponse = await fetch('http://localhost:3001/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoId: String(videoId),
                    title: String(infoData.title),
                }),
            });

            const convertData = await convertResponse.json();

            if (!convertResponse.ok) {
                throw new Error(convertData.error || `HTTP error! status: ${convertResponse.status}`);
            }

            if (convertData.success) {
                setConvertedFile(convertData.fileName);
            } else {
                throw new Error(convertData.error || 'Conversion failed');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setIsConverting(false);
        }
    };

    const handleReset = () => {
        setLink('');
        setVideoInfo(null);
        setError('');
        setConvertedFile(null);
    };

    const handleDownload = async () => {
        if (!convertedFile) return;

        try {
            window.location.href = `http://localhost:3001/api/download/${convertedFile}`;
        } catch (err) {
            console.error('Download error:', err);
            setError('Failed to download file');
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
            <TextField
                fullWidth
                label="YouTube URL"
                variant="outlined"
                value={link}
                onChange={handleInputChange}
                error={!!error}
                helperText={error}
                sx={{ mb: 2 }}
            />

            {videoInfo && (
                <Box sx={{ my: 2, textAlign: 'center' }}>
                    {videoInfo.thumbnail && (
                        <img 
                            src={videoInfo.thumbnail} 
                            alt="Video thumbnail" 
                            style={{ maxWidth: '100%', height: 'auto', marginBottom: '1rem' }}
                        />
                    )}
                    <Typography variant="h6" gutterBottom>
                        {videoInfo.title}
                    </Typography>
                    {videoInfo.author && (
                        <Typography variant="subtitle1" color="textSecondary">
                            {videoInfo.author}
                        </Typography>
                    )}
                    {isConverting && (
                        <CircularProgress size={24} sx={{ mt: 2 }} />
                    )}
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', my: 2 }}>
                {!videoInfo && (
                    <Button
                        variant="contained"
                        onClick={handleConvert}
                        disabled={isConverting}
                    >
                        {isConverting ? <CircularProgress size={24} /> : 'Convert to MP3'}
                    </Button>
                )}

                {convertedFile && (
                    <>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleDownload}
                        >
                            Download MP3
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReset}
                        >
                            Convert Another Link
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default ConversionTab;
