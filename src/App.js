import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './AuthContext'; // No longer needed here
import ProtectedRoute from './ProtectedRoute';

import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AddStudent from './components/AddStudent';
import ManageStudents from './components/ManageStudents';
import StudentQRCode from './components/StudentQRCode';
import Attendance from './components/Attendance';
import TestScore from './components/TestScore';
import Volunteer from './components/Volunteer';
import MainLayout from './components/MainLayout'; // We will create this next

function App() {
  return (
    // <AuthProvider> // No longer needed here
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/add-student" element={<AddStudent />} />
                    <Route path="/manage-students" element={<ManageStudents />} />
                    <Route path="/student-qrcode" element={<StudentQRCode />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/test-scores" element={<TestScore />} />
                    <Route path="/volunteers" element={<Volunteer />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    // </AuthProvider> // No longer needed here
  );
}

export default App;
