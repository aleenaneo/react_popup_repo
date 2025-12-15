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

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get offset date (start availability from 3 days from now)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 3);
  startDate.setHours(0, 0, 0, 0);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDateSelect = (day) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (selected >= startDate) {
      const year = selected.getFullYear();
      const month = String(selected.getMonth() + 1).padStart(2, '0');
      const dateStr = String(day).padStart(2, '0');
      setAppointment(prev => ({ ...prev, date: `${year}-${month}-${dateStr}` }));
    }
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

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    
    // Day names
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    // Calendar grid generation
    const grid = [];
    
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateToCheck = new Date(year, month, day);
      dateToCheck.setHours(0, 0, 0, 0);
      
      const isAvailable = dateToCheck >= startDate;
      const isSelected = appointment.date === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      grid.push(
        <button
          key={day}
          className={`calendar-day ${!isAvailable ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => isAvailable && handleDateSelect(day)}
          disabled={!isAvailable}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="calendar-widget">
        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)}>&lt;</button>
          <span>{monthName} {year}</span>
          <button onClick={() => changeMonth(1)}>&gt;</button>
        </div>
        <div className="calendar-weekdays">
          {days.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="calendar-grid">
          {grid}
        </div>
      </div>
    );
  };

  const isFormComplete = appointment.date && appointment.time;

  return (
    <div className="step-schedule">
      <div className="step-header">
        <div className="step-icon">📅</div>
        <h3>Schedule Installation</h3>
        <p>Choose your preferred date and time for installation</p>
      </div>

      <div className="schedule-layout">
        {/* Left Side: Calendar */}
        <div className="schedule-left">
          {renderCalendar()}
        </div>

        {/* Right Side: Options */}
        <div className="schedule-right">
          {/* Time Slots */}
          <div className="option-group">
            <h4>Select Time</h4>
            <div className="radio-list">
              {TIME_SLOTS.map((slot) => (
                <label key={slot.id} className="radio-label">
                  <input
                    type="radio"
                    name="timeSlot"
                    checked={appointment.time === slot.value}
                    onChange={() => handleTimeSelect(slot.value)}
                    disabled={!appointment.date}
                  />
                  <span className="radio-text">{slot.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Service Preference */}
          <div className="option-group">
            <h4>What Would you Like:</h4>
            <div className="radio-list">
              <label className="radio-label">
                <input
                  type="radio"
                  name="vehicleOption"
                  checked={!appointment.stayWithVehicle}
                  onChange={() => handleVehicleOptionChange(false)}
                />
                <span className="radio-text">Drop off the vehicle</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="vehicleOption"
                  checked={appointment.stayWithVehicle}
                  onChange={() => handleVehicleOptionChange(true)}
                />
                <span className="radio-text">Wait with the vehicle</span>
              </label>
            </div>
          </div>
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
