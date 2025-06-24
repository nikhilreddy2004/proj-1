# NGO Management MVP

This project is a comprehensive Management Vortal (MVP) for a non-governmental organization (NGO) focused on education. It provides a suite of tools to manage students, volunteers, and educational data, leveraging AI to provide intelligent insights and assistance.

## ✨ Features

The application is split into a React frontend and a Node.js (Express) backend.

### Core Platform Features

*   **Secure Authentication**: Users must sign up and log in to access the platform. The system uses Firebase Authentication for robust security.
*   **Student Management**: Easily add new students to the database and manage their records.
*   **Attendance Tracking**:
    *   **Manual Entry**: Mark daily attendance for students.
    *   **QR Code System**: Generate unique QR codes for each student and use a built-in scanner for efficient check-ins.
*   **Test Score Management**: Record test scores for students by subject and view a historical log of all submitted scores.
*   **Volunteer Coordination**:
    *   **Interactive Map**: View all volunteer locations on a map of India. The map is constrained to India's borders to ensure geographical relevance.
    *   **Location Picker**: Add new volunteers by simply clicking their location on the map.

---

### 🧠 AI-Powered Features

The backend is integrated with the Google Generative AI API to provide several intelligent features:

*   **Attendance Anomaly Detection**: The dashboard automatically flags "at-risk" students who have been absent more than a set number of times in the last 7 days.
*   **AI Progress Summaries**: Generate a concise, AI-written progress report for any student based on their recent test scores and attendance records.
*   **Personalized Learning Paths**: For any test score, generate a custom, one-week micro-learning plan. The AI acts as an expert tutor, providing targeted advice based on the student's performance. The system uses special rules for very low (<=35%) or excellent (>=95%) scores to provide tailored feedback.
*   **NGO Information Chatbot ("Sahay")**:
    *   A friendly chatbot, available on all pages, trained to answer questions about the NGO.
    *   Its knowledge comes from a local text file (`ngo-knowledge-base.txt`) and by scraping live information from the NGO's official website, ensuring its answers are always up-to-date.

## 🚀 Getting Started

To run this project locally, you need to run both the frontend React application and the backend Node.js server.

### Prerequisites

*   Node.js and npm installed.
*   A Firebase project with Firestore and Authentication (Email/Password provider) enabled.
*   A Google Generative AI API Key.

### Backend Setup

1.  Navigate to the server directory:
    ```sh
    cd my-app/server
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Create a `.env` file in the `my-app/server` directory and add your API key:
    ```
    GEMINI_API_KEY=YOUR_GOOGLE_AI_API_KEY
    ```
4.  Start the server:
    ```sh
    npm start
    ```
    The server will be running on `http://localhost:5001`.

### Frontend Setup

1.  Navigate to the app's root directory:
    ```sh
    cd my-app
    ```
2.  Fill in your Firebase project configuration in `my-app/src/firebase.js`.
3.  Install dependencies:
    ```sh
    npm install
    ```
4.  Start the React app:
    ```sh
    npm start
    ```
    The application will open in your browser at `http://localhost:3000`.

---
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
