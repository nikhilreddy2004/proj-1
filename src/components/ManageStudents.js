import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import AddStudent from './AddStudent';
import './ManageStudents.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);

    // This hook fetches students and re-fetches when a new student is added.
    // We are passing fetchStudents down to AddStudent to trigger a refresh.
    const fetchStudents = async () => {
        const querySnapshot = await getDocs(collection(db, "students"));
        setStudents(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    
    useEffect(() => {
        fetchStudents();
    }, []);

    return (
        <div className="manage-students-container">
            <AddStudent onStudentAdded={fetchStudents}/>
            <hr />
            <div className="student-list-container">
                <h3>Current Students</h3>
                <ul>
                    {students.map(student => (
                        <li key={student.id}>
                            {student.name} - Class {student.class || 'N/A'}
                        </li>
                    ))}
                    {students.length === 0 && <p>No students have been added yet.</p>}
                </ul>
            </div>
        </div>
    );
};

const ManageStudents = () => {
    return (
        <div>
            <h2>Manage Students</h2>
            <StudentList />
        </div>
    );
};

export default ManageStudents; 