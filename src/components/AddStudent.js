import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from "firebase/firestore"; 
import './AddStudent.css';

const AddStudent = ({ onStudentAdded }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [className, setClassName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submit button clicked. Attempting to add student...");

        if(!name || !age || !className) {
            alert('Please fill all fields');
            console.log("Validation failed: One or more fields are empty.");
            return;
        }

        const studentData = {
            name: name,
            age: Number(age),
            class: className,
            attendance: [],
            scores: []
        };

        console.log("Attempting to save the following data to Firestore:", studentData);

        try {
            const docRef = await addDoc(collection(db, "students"), studentData);
            console.log("Successfully added student with ID: ", docRef.id);
            alert('Student added!');
            setName('');
            setAge('');
            setClassName('');
            if (onStudentAdded) {
                onStudentAdded();
            }
        } catch (e) {
            console.error("Firebase Error: Failed to add document.", e);
            alert('Error adding student. Please check the console for details. Error: ' + e.message);
        }
    }

    return (
        <div className="add-student-container">
            <h3>Add New Student</h3>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)} 
                />
                <input 
                    type="number" 
                    placeholder="Age" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                />
                <input 
                    type="text" 
                    placeholder="Class" 
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                />
                <button type="submit">Add Student</button>
            </form>
        </div>
    );
}

export default AddStudent; 