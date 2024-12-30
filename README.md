# YouTube to MP3 Converter

This project is a simple YouTube to MP3 converter application. It allows users to input a YouTube URL, fetch the video information, and convert the video to an MP3 file for download.

---

## Demo

Watch the video demo here: [YouTube to MP3 Converter Demo](https://youtu.be/ZPlPMopXbe0)

---

## Disclaimer

This application is **for educational purposes only**. It is not intended for commercial use or activities that may infringe on copyright laws or the intellectual property rights of others. Please ensure compliance with all applicable laws and platform terms of service before using this application.

---

## Technologies Used

- **React**: Front-end framework used for building the user interface.
- **Material-UI**: A library of pre-styled components for creating a responsive and visually appealing UI.
- **Express.js**: Back-end framework used to handle API requests, connect to YouTube, and manage file processing.
- **YouTube-DL**: A command-line program used to fetch video details and handle video-to-audio conversion.

---

## Features

1. **Fetch Video Information**:
   - Input a valid YouTube URL to fetch the video's title, author, and thumbnail.

2. **Convert to MP3**:
   - Converts the YouTube video into MP3 format for download.

3. **Download**:
   - Allows users to download the converted MP3 file.

4. **Clean Interface**:
   - A user-friendly interface built with Material-UI and React.

---

## Setup Instructions

To run this project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies

#### Front-End:
```bash
npm install
```

#### Back-End:
Navigate to the back-end directory (e.g., `server`) and install dependencies:
```bash
cd server
npm install
cd ..
```

### 3. Start the Application

#### Back-End:
```bash
cd server
npm start
```

#### Front-End:
In a new terminal, start the React development server:
```bash
npm start
```

### 4. Access the Application

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Notes for Reviewers

- The application does not require an API key to function.
- To evaluate this application, please clone the repository and run it locally as per the instructions above.

