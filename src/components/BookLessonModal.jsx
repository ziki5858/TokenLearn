import React, { useState } from "react";
import { useApp } from "../context/useApp";
import Button from "./Button";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BookLessonModal({ tutor, onClose, onBook }) {
  const { createLessonRequest, addNotification } = useApp();
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [specificStartTime, setSpecificStartTime] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock availability data - in real app, this would come from the tutor's profile
  const availability = tutor?.availability || [
    { id: 1, day: "Sunday", startTime: "18:00", endTime: "21:00" },
    { id: 2, day: "Monday", startTime: "18:00", endTime: "21:00" },
    { id: 3, day: "Wednesday", startTime: "17:00", endTime: "20:00" }
  ];

  const selectedSlot = availability.find(slot => slot.id === selectedSlotId);

  const handleBook = async () => {
    if (!selectedSlot) {
      addNotification("Please select a time slot", "error");
      return;
    }

    if (!specificStartTime) {
      addNotification("Please select a start time for your lesson", "error");
      return;
    }

    // Convert times to minutes for accurate comparison
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(specificStartTime);
    const slotStartMinutes = timeToMinutes(selectedSlot.startTime);
    const slotEndMinutes = timeToMinutes(selectedSlot.endTime);

    // Calculate end time (1 hour = 60 minutes after start time)
    const endMinutes = startMinutes + 60;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const specificEndTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    console.log('Validation:', {
      specificStartTime,
      specificEndTime,
      slotRange: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
      startMinutes,
      slotStartMinutes,
      endMinutes,
      slotEndMinutes
    });

    // Validate start time is within available range
    if (startMinutes < slotStartMinutes) {
      addNotification(`Start time must be at or after ${selectedSlot.startTime}`, "error");
      return;
    }

    // Validate end time (1 hour later) is within available range
    if (endMinutes > slotEndMinutes) {
      addNotification(`The lesson would end at ${specificEndTime}, which is after the available time (${selectedSlot.endTime}). Please select an earlier start time.`, "error");
      return;
    }

    setIsSubmitting(true);
    
    const requestData = {
      tutorId: tutor.id,
      tutorName: tutor.name,
      slot: {
        ...selectedSlot,
        specificStartTime,
        specificEndTime
      },
      message
    };
    
    const result = await createLessonRequest(requestData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      onBook?.(requestData);
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Book a Lesson with {tutor.name}</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.content}>
          {/* Tutor Info */}
          <div style={styles.tutorInfo}>
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{tutor.name}</div>
              <div style={{ fontSize: 14, color: "#64748b" }}>
                Rating: ⭐ {tutor.rating} • {tutor.course || `Course ${tutor.courseNumber}`}
              </div>
            </div>
          </div>

          {/* About the tutor */}
          {tutor.aboutMeAsTeacher && (
            <div style={styles.section}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>About the Teacher</h3>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
                {tutor.aboutMeAsTeacher}
              </p>
            </div>
          )}

          {/* Available Time Slots */}
          <div style={styles.section}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>Select Available Time Slot</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {availability.map(slot => (
                <label
                  key={slot.id}
                  style={{
                    ...styles.slotCard,
                    background: selectedSlotId === slot.id ? "#dbeafe" : "white",
                    borderColor: selectedSlotId === slot.id ? "#0ea5e9" : "#e2e8f0",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="timeSlot"
                    checked={selectedSlotId === slot.id}
                    onChange={() => {
                      setSelectedSlotId(slot.id);
                      setSpecificStartTime("");
                    }}
                    style={{ marginRight: 10 }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{slot.day}</div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>
                      Available: {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Specific Time Selection */}
          {selectedSlot && (
            <div style={styles.section}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>
                Choose Your Lesson Start Time
              </h3>
              <div style={{
                padding: 16,
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 12,
                marginBottom: 12
              }}>
                <div style={{ fontSize: 14, color: "#0c4a6e", marginBottom: 8 }}>
                  ℹ️ All lessons are 1 hour. Select a start time within the available range: {selectedSlot.startTime} - {(() => {
                    // Calculate latest possible start time (1 hour before end time)
                    const [endHours, endMinutes] = selectedSlot.endTime.split(':').map(Number);
                    const endTotalMinutes = endHours * 60 + endMinutes;
                    const latestStartMinutes = endTotalMinutes - 60;
                    const latestHours = Math.floor(latestStartMinutes / 60);
                    const latestMins = latestStartMinutes % 60;
                    return `${latestHours.toString().padStart(2, '0')}:${latestMins.toString().padStart(2, '0')}`;
                  })()}
                </div>
              </div>
              <label style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  Lesson Start Time *
                </div>
                <input
                  type="time"
                  value={specificStartTime}
                  onChange={e => {
                    const newTime = e.target.value;
                    console.log('Selected time:', newTime, 'Slot range:', selectedSlot.startTime, '-', selectedSlot.endTime);
                    setSpecificStartTime(newTime);
                  }}
                  min={selectedSlot.startTime}
                  max={(() => {
                    // Calculate max time: must allow 1 hour lesson to end by endTime
                    const [endHours, endMinutes] = selectedSlot.endTime.split(':').map(Number);
                    const endTotalMinutes = endHours * 60 + endMinutes;
                    const maxStartMinutes = endTotalMinutes - 60; // 60 minutes before end
                    const maxHours = Math.floor(maxStartMinutes / 60);
                    const maxMins = maxStartMinutes % 60;
                    const result = `${maxHours.toString().padStart(2, '0')}:${maxMins.toString().padStart(2, '0')}`;
                    console.log('Max start time calculated:', result);
                    return result;
                  })()}
                  style={styles.timeInput}
                />
                {specificStartTime && (() => {
                  const [hours, minutes] = specificStartTime.split(':').map(Number);
                  const startMinutes = hours * 60 + minutes;
                  const endMinutes = startMinutes + 60;
                  const endHours = Math.floor(endMinutes / 60);
                  const endMins = endMinutes % 60;
                  const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
                  
                  // Check if valid
                  const [slotStartHours, slotStartMinutes] = selectedSlot.startTime.split(':').map(Number);
                  const slotStartTotalMinutes = slotStartHours * 60 + slotStartMinutes;
                  const [slotEndHours, slotEndMinutes] = selectedSlot.endTime.split(':').map(Number);
                  const slotEndTotalMinutes = slotEndHours * 60 + slotEndMinutes;
                  
                  const isStartValid = startMinutes >= slotStartTotalMinutes;
                  const isEndValid = endMinutes <= slotEndTotalMinutes;
                  const isValid = isStartValid && isEndValid;
                  
                  return (
                    <div style={{ 
                      marginTop: 8,
                      padding: 12,
                      borderRadius: 8,
                      background: isValid ? "#dcfce7" : "#fee2e2",
                      border: `2px solid ${isValid ? "#16a34a" : "#dc2626"}`,
                    }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: isValid ? "#15803d" : "#dc2626",
                        marginBottom: 4
                      }}>
                        {isValid ? "✅ Valid Time" : "❌ Invalid Time"}
                      </div>
                      <div style={{ 
                        fontSize: 13, 
                        color: isValid ? "#166534" : "#991b1b",
                      }}>
                        {isValid 
                          ? `Lesson will run from ${specificStartTime} to ${endTime}` 
                          : !isStartValid
                            ? `⚠️ Start time ${specificStartTime} is before available range (starts at ${selectedSlot.startTime})`
                            : `⚠️ Lesson would end at ${endTime}, which is after available time (ends at ${selectedSlot.endTime})`}
                      </div>
                    </div>
                  );
                })()}
              </label>
            </div>
          )}

          {/* Message to tutor */}
          <div style={styles.section}>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                Message to the tutor (optional)
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell the tutor what you'd like to learn or any special requests..."
                style={styles.textarea}
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button onClick={onClose} style={styles.cancelBtn} disabled={isSubmitting}>
              Cancel
            </button>
            <Button onClick={handleBook} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Lesson Request"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16
  },
  modal: {
    background: "white",
    borderRadius: 16,
    maxWidth: 600,
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    background: "white",
    zIndex: 1
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    color: "#64748b",
    padding: 0,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    transition: "background 0.2s"
  },
  content: {
    padding: 20,
    display: "grid",
    gap: 20
  },
  tutorInfo: {
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    border: "1px solid #bae6fd",
    borderRadius: 12,
    padding: 16
  },
  section: {
    display: "grid",
    gap: 8
  },
  slotCard: {
    display: "flex",
    alignItems: "center",
    padding: 12,
    border: "2px solid",
    borderRadius: 10,
    transition: "all 0.2s"
  },
  timeInput: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: 14,
    fontFamily: "inherit"
  },
  textarea: {
    width: "100%",
    minHeight: 80,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: 14
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    paddingTop: 8
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  }
};
