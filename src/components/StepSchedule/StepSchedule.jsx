import React, { useState } from 'react';
import { getAvailableDates, TIME_SLOTS } from '../../utils/helpers';
import './StepSchedule.css';

const StepSchedule = ({ onNext, onBack, onClose, initialAppointment = {} }) => {
  const [appointment, setAppointment] = useState({
    date: initialAppointment.date || '',
    time: initialAppointment.time || '',
    stayWithVehicle: initialAppointment.stayWithVehicle !== undefined 
      ? initialAppointment.stayWithVehicle 
      : true
  });

  // Get offset date (start availability from 8 days from now)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 8);
  startDate.setHours(0, 0, 0, 0);

  // Availability window: 30 days starting from startDate (inclusive)
  const availableEndDate = new Date(startDate);
  availableEndDate.setDate(availableEndDate.getDate() + 29);
  availableEndDate.setHours(23, 59, 59, 999);

  // Calendar State - default to start month so users see available dates immediately
  const [currentDate, setCurrentDate] = useState(new Date(startDate));

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDateSelect = (day) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    selected.setHours(0, 0, 0, 0);
    if (selected >= startDate && selected <= availableEndDate) {
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
    const proposed = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    const minMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const maxMonth = new Date(availableEndDate.getFullYear(), availableEndDate.getMonth(), 1);
    // prevent navigating outside months that contain available dates
    if (proposed < minMonth || proposed > maxMonth) return;
    setCurrentDate(proposed);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    // Limit navigation to months that intersect the availability window
    const monthStart = new Date(year, month, 1);
    const minMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const maxMonth = new Date(availableEndDate.getFullYear(), availableEndDate.getMonth(), 1);
    const prevDisabled = monthStart.getTime() <= minMonth.getTime();
    const nextDisabled = monthStart.getTime() >= maxMonth.getTime();
    
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
      
      const isAvailable = dateToCheck >= startDate && dateToCheck <= availableEndDate;
      
      // Calculate if this date is within the 8-day window before availability
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() - 1); // Last unavailable date
      const startDateWindow = new Date(endDate);
      startDateWindow.setDate(startDateWindow.getDate() - 7); // First of the 8 days
      
      const isInEightDayWindow = dateToCheck >= startDateWindow && dateToCheck <= endDate;
      
      const isSelected = appointment.date === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Determine the appropriate class based on date availability
      let dayClass = 'calendar-day';
      if (isSelected) {
        dayClass += ' selected';
      } else if (isInEightDayWindow) {
        // Apply dark color to the 8 days before available dates
        dayClass += ' eight-day-window';
      } else if (!isAvailable) {
        dayClass += ' disabled';
      }
      
      grid.push(
        <button
          key={day}
          className={dayClass}
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
          <button onClick={() => changeMonth(-1)} disabled={prevDisabled}>&lt;</button>
          <span>{monthName} {year}</span>
          <button onClick={() => changeMonth(1)} disabled={nextDisabled}>&gt;</button>
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
        <h3>Select your desired appointment date</h3>
        <p className="schedule-note">
          Note: You must allow at least 8 business days when requesting an appointment to ensure you have
          received your product (Saturday Appointments may be longer).
          This is only a request; appointment confirmation is required.
        </p>
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
            {!appointment.date && <p className="small-note">Select a date to enable available times.</p>}
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
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary btn-back" onClick={onBack}>
          Go Back
        </button>
        <button className="btn btn-secondary btn-cancel" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn-primary btn-continue"
          onClick={handleNext}
          disabled={!isFormComplete}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepSchedule;
