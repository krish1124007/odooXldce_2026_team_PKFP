import React, { useState } from 'react';
import { Compass, Cake } from 'lucide-react';
import './BirthdaysWidget.css';

const upcomingTripsList = [
  { id: 1, name: 'Japan Culture & Food Tour', date: 'Oct 10 - Oct 20' },
  { id: 2, name: 'European Grand Highlights', date: 'Dec 01 - Dec 15' },
  { id: 3, name: 'Bali Wellness & Beach Escape', date: 'Jan 05 - Jan 12' },
  { id: 4, name: 'Paris Art & Culinary Walk', date: 'Feb 14 - Feb 20' },
  { id: 5, name: 'Swiss Alps Hiking Expedition', date: 'Mar 10 - Mar 18' },
];

const birthdaysList = [
  { id: 101, name: 'Parikshit Thakkar', date: 'Sep 8' },
  { id: 102, name: 'Himali Parekh', date: 'Sep 15' },
  { id: 103, name: 'Nensi Poshiya', date: 'Sep 17' },
  { id: 104, name: 'Darshna Dharajiya', date: 'Oct 3' },
  { id: 105, name: 'Harsh Patodia', date: 'Nov 7' },
  { id: 106, name: 'Dhruv Darji', date: 'Nov 8' },
  { id: 107, name: 'Ankit Gosai', date: 'Dec 11' },
  { id: 108, name: 'Ajay Danidhariya', date: 'Jan 8' }
];

export default function BirthdaysWidget() {
  const [activeTab, setActiveTab] = useState('trips');

  return (
    <div className="dashboard-card birthdays-card">
      <div className="birthdays-header">
        <h3 className="birthdays-title">Upcoming Trips & Birthdays</h3>
        <div className="tab-pills">
          <button 
            className={`tab-btn ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
          >
            Trips
          </button>
          <button 
            className={`tab-btn ${activeTab === 'birthdays' ? 'active' : ''}`}
            onClick={() => setActiveTab('birthdays')}
          >
            Birthdays
          </button>
        </div>
      </div>

      {activeTab === 'trips' ? (
        <div className="section-container">
          <div className="section-label">
            <Compass size={15} className="section-icon" />
            <span>UPCOMING ITINERARIES</span>
          </div>

          <div className="birthday-list custom-scrollbar">
            {upcomingTripsList.map((item) => (
              <div key={item.id} className="birthday-row">
                <span className="person-name">{item.name}</span>
                <span className="person-date">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="section-container">
          <div className="section-label">
            <Cake size={15} className="section-icon" />
            <span>COMMUNITY BIRTHDAYS</span>
          </div>

          <div className="birthday-list custom-scrollbar">
            {birthdaysList.map((item) => (
              <div key={item.id} className="birthday-row">
                <span className="person-name">{item.name}</span>
                <span className="person-date">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
