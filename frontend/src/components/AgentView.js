import React from 'react'
import { useState } from 'react';

const TEST_CUSTOMERS = [
    { id: 'cust_1042', name: 'Soham Mule', phone: '+91 9871237683' },
    { id: 'cust_1043', name: 'Ayush Ghadghe', phone: '+91 9936549271' },
    { id: 'cust_1044', name: 'Aryan Bhadjoshi', phone: '+91 9982634861' },
]

const samples = [
    "Hi, my order #4471 hasn't arrived yet. Can I change the delivery address?",
    'What is your return policy?',
    'Do you deliver to Dubai?',
    'Is cash on delivery available for a ₹3,500 order?',
    "I think I'm allergic to the serum I bought. What should I do?",
];


const AgentView = () => {
    const [choice, setChoice] = useState('cust_1042')
    const [custom, setCustom] = useState({name:'', phone:''})

    return (
        <div>

        </div>
    )
}

export default AgentView
