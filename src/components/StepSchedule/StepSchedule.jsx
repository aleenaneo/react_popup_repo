import React, { useState } from 'react';
import { getAvailableDates, TIME_SLOTS } from '../../utils/helpers';
import './StepSchedule.css';

const StepSchedule = ({ onNext, onBack, initialAppointment = {} }) => {
  const [appointment, setAppointment] = useState({
    date: initialAppointment.date || '',
    time: initialAppointment.time || '',
    stayWithVehicle: initialAppointment.stayWithVehicle !== undefined 
      ? initialAppointment.stayWithVehicle 
      : true
  });

  const availableDates = getAvailableDates(14);

  const handleDateSelect = (date) => {
    setAppointment(prev => ({ ...prev, date }));
  };

  const handleTimeSelect = (time) => {
    setAppointment(prev => ({ ...prev, time }));
  };

  const handleVehicleOptionChange = (stayWithVehicle) => {
    setAppointment(prev => ({ ...prev, stayWithVehicle }));
  };

  const handleNext = () => {
    if (appointment.date && appointment.time) {
      onNext(appointment);
    }
  };

  const isFormComplete = appointment.date && appointment.time;

  return (
    <div className="step-schedule">
      <div className="step-header">
        <div className="step-icon">📅</div>
        <h3>Schedule Installation</h3>
        <p>Choose your preferred date and time for installation</p>
      </div>

      {/* Date Selection */}
      <div className="schedule-section">
        <h4>Select Date</h4>
        <p className="section-note">Available dates start 3 days from today</p>
        <div className="date-grid">
          {availableDates.map((date) => {
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = dateObj.getDate();
            const month = dateObj.toLocaleDateString('en-US', { month: 'short' });

            return (
              <button
                key={date}
                className={`date-card ${appointment.date === date ? 'selected' : ''}`}
                onClick={() => handleDateSelect(date)}
              >
                <div className="date-day">{dayName}</div>
                <div className="date-number">{dayNum}</div>
                <div className="date-month">{month}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slot Selection */}
      <div className="schedule-section">
        <h4>Select Time Slot</h4>
        <div className="time-slots">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot.id}
              className={`time-slot ${appointment.time === slot.value ? 'selected' : ''}`}
              onClick={() => handleTimeSelect(slot.value)}
              disabled={!appointment.date}
            >
              <span className="time-icon">🕐</span>
              <span className="time-label">{slot.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Drop-off Option */}
      <div className="schedule-section">
        <h4>Service Preference</h4>
        <div className="radio-group">
          <label className={`radio-option ${appointment.stayWithVehicle ? 'selected' : ''}`}>
            <input
              type="radio"
              name="vehicleOption"
              checked={appointment.stayWithVehicle}
              onChange={() => handleVehicleOptionChange(true)}
            />
            <div className="radio-content">
              <span className="radio-icon">⏱️</span>
              <div>
                <div className="radio-title">Wait with the vehicle</div>
                <div className="radio-description">Stay at the service center during installation</div>
              </div>
            </div>
          </label>

          <label className={`radio-option ${!appointment.stayWithVehicle ? 'selected' : ''}`}>
            <input
              type="radio"
              name="vehicleOption"
              checked={!appointment.stayWithVehicle}
              onChange={() => handleVehicleOptionChange(false)}
            />
            <div className="radio-content">
              <span className="radio-icon">🚶</span>
              <div>
                <div className="radio-title">Drop off vehicle</div>
                <div className="radio-description">Leave your vehicle and pick it up later</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!isFormComplete}
        >
          Continue to Checkout
        </button>
      </div>
    </div>
  );
};

export default StepSchedule;
