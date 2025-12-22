import { useRef, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";

const cardStyle = {
  background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
  border: "1px solid #dbeafe",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  display: "grid",
  gap: 12
};

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function PersonalAreaPage() {
  const tutorRating = 4.8; // later from server

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const objectUrlRef = useRef(null);

  // Courses
  const [coursesAsTeacher, setCoursesAsTeacher] = useState([
    { id: Date.now(), name: "" }
  ]);
  const [coursesAsStudent, setCoursesAsStudent] = useState([
    { id: Date.now() + 1, name: "" }
  ]);

  // Availability - separate for teacher and student
  const [availabilityAsTeacher, setAvailabilityAsTeacher] = useState([
    { id: Date.now(), day: "", startTime: "", endTime: "" }
  ]);
  const [availabilityAsStudent, setAvailabilityAsStudent] = useState([
    { id: Date.now() + 2, day: "", startTime: "", endTime: "" }
  ]);

  // About me - separate for teacher and student
  const [aboutMeAsTeacher, setAboutMeAsTeacher] = useState("");
  const [aboutMeAsStudent, setAboutMeAsStudent] = useState("");

  const generalComplete = Boolean(firstName && lastName && phone);

  function addCourseAsTeacher() {
    setCoursesAsTeacher([...coursesAsTeacher, { id: Date.now(), name: "" }]);
  }

  function removeCourseAsTeacher(id) {
    if (coursesAsTeacher.length > 1) {
      setCoursesAsTeacher(coursesAsTeacher.filter(c => c.id !== id));
    }
  }

  function updateCourseAsTeacher(id, value) {
    setCoursesAsTeacher(coursesAsTeacher.map(c => 
      c.id === id ? { ...c, name: value } : c
    ));
  }

  function addCourseAsStudent() {
    setCoursesAsStudent([...coursesAsStudent, { id: Date.now(), name: "" }]);
  }

  function removeCourseAsStudent(id) {
    if (coursesAsStudent.length > 1) {
      setCoursesAsStudent(coursesAsStudent.filter(c => c.id !== id));
    }
  }

  function updateCourseAsStudent(id, value) {
    setCoursesAsStudent(coursesAsStudent.map(c => 
      c.id === id ? { ...c, name: value } : c
    ));
  }

  function addAvailabilityAsTeacher() {
    setAvailabilityAsTeacher([...availabilityAsTeacher, { id: Date.now(), day: "", startTime: "", endTime: "" }]);
  }

  function removeAvailabilityAsTeacher(id) {
    if (availabilityAsTeacher.length > 1) {
      setAvailabilityAsTeacher(availabilityAsTeacher.filter(a => a.id !== id));
    }
  }

  function updateAvailabilityAsTeacher(id, field, value) {
    setAvailabilityAsTeacher(availabilityAsTeacher.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  }

  function addAvailabilityAsStudent() {
    setAvailabilityAsStudent([...availabilityAsStudent, { id: Date.now(), day: "", startTime: "", endTime: "" }]);
  }

  function removeAvailabilityAsStudent(id) {
    if (availabilityAsStudent.length > 1) {
      setAvailabilityAsStudent(availabilityAsStudent.filter(a => a.id !== id));
    }
  }

  function updateAvailabilityAsStudent(id, field, value) {
    setAvailabilityAsStudent(availabilityAsStudent.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  }

  function handleImageUrlChange(value) {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPhotoUrl(value);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPhotoUrl(objectUrl);
  }

  function handleSave() {
    if (!generalComplete) {
      alert("Please complete the general details before saving.");
      return;
    }

    alert("Saved (mock) - wire to backend later");
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h1 style={{ marginTop: 0 }}>Personal Area</h1>

      <section style={{
        ...cardStyle,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12
      }}>
        <div>
          <div style={{ fontSize: 14, color: "#475569" }}>Your tutor rating</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{tutorRating.toFixed(1)}</div>
        </div>
        <div style={{
          padding: "10px 14px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
          color: "#0b1021",
          fontWeight: 700,
          border: "1px solid #0ea5e9"
        }}>
          Rated by your students
        </div>
      </section>

      {!generalComplete && (
        <div style={{
          border: "1px solid #f97316",
          background: "#fff7ed",
          color: "#9a3412",
          borderRadius: 12,
          padding: 12
        }}>
          Please fill out your general details before completing your teacher/student profiles.
        </div>
      )}

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>General</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: "2px solid #dbeafe",
              overflow: "hidden",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontWeight: 700
            }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              "No photo"
            )}
          </div>

          <div style={{ display: "grid", gap: 8, minWidth: 240 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Upload from computer</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <label style={{ fontSize: 14, fontWeight: 600 }}>Or paste image URL</label>
            <Input
              label={null}
              value={photoUrl}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>

        <Input label="First Name" value={firstName} onChange={setFirstName} placeholder="Enter your first name" />
        <Input label="Last Name" value={lastName} onChange={setLastName} placeholder="Enter your last name" />
        <Input label="Phone Number" value={phone} onChange={setPhone} placeholder="e.g., +1 555 123 4567" />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>Courses I Want to Teach</h2>
        {coursesAsTeacher.map((course, index) => (
          <div key={course.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 12,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <Input
              label={`Course ${index + 1}`}
              value={course.name}
              onChange={(value) => updateCourseAsTeacher(course.id, value)}
              placeholder="e.g., Introduction to Algorithms"
              disabled={!generalComplete}
            />
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => removeCourseAsTeacher(course.id)}
                disabled={!generalComplete || coursesAsTeacher.length === 1}
                style={{
                  padding: "10px 14px",
                  background: coursesAsTeacher.length === 1 ? "#e2e8f0" : "#fee2e2",
                  color: coursesAsTeacher.length === 1 ? "#94a3b8" : "#991b1b",
                  border: "1px solid",
                  borderColor: coursesAsTeacher.length === 1 ? "#cbd5e1" : "#fecaca",
                  borderRadius: 8,
                  cursor: coursesAsTeacher.length === 1 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <Button
          onClick={addCourseAsTeacher}
          disabled={!generalComplete}
          style={{ justifySelf: "start" }}
        >
          + Add Course to Teach
        </Button>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>My Availability as a Teacher</h2>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "#64748b" }}>
          Set your available time slots for teaching
        </p>
        {availabilityAsTeacher.map((slot, index) => (
          <div key={slot.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: 12,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Day</div>
              <select
                value={slot.day}
                onChange={(e) => updateAvailabilityAsTeacher(slot.id, "day", e.target.value)}
                disabled={!generalComplete}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 14,
                  background: "white"
                }}
              >
                <option value="">Select day</option>
                {DAYS_OF_WEEK.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Start Time</div>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateAvailabilityAsTeacher(slot.id, "startTime", e.target.value)}
                disabled={!generalComplete}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 14
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>End Time</div>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateAvailabilityAsTeacher(slot.id, "endTime", e.target.value)}
                disabled={!generalComplete}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 14
                }}
              />
            </label>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => removeAvailabilityAsTeacher(slot.id)}
                disabled={!generalComplete || availabilityAsTeacher.length === 1}
                style={{
                  padding: "10px 14px",
                  background: availabilityAsTeacher.length === 1 ? "#e2e8f0" : "#fee2e2",
                  color: availabilityAsTeacher.length === 1 ? "#94a3b8" : "#991b1b",
                  border: "1px solid",
                  borderColor: availabilityAsTeacher.length === 1 ? "#cbd5e1" : "#fecaca",
                  borderRadius: 8,
                  cursor: availabilityAsTeacher.length === 1 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <Button
          onClick={addAvailabilityAsTeacher}
          disabled={!generalComplete}
          style={{ justifySelf: "start" }}
        >
          + Add Time Slot
        </Button>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>About Me as a Teacher</h2>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Tell us about yourself as a teacher</div>
          <textarea
            value={aboutMeAsTeacher}
            onChange={e => setAboutMeAsTeacher(e.target.value)}
            placeholder="Share your teaching style, strengths, and experience"
            style={textareaStyle}
            disabled={!generalComplete}
          />
        </label>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>Courses I Want to Learn</h2>
        {coursesAsStudent.map((course, index) => (
          <div key={course.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 12,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <Input
              label={`Course ${index + 1}`}
              value={course.name}
              onChange={(value) => updateCourseAsStudent(course.id, value)}
              placeholder="e.g., Data Structures"
              disabled={!generalComplete}
            />
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => removeCourseAsStudent(course.id)}
                disabled={!generalComplete || coursesAsStudent.length === 1}
                style={{
                  padding: "10px 14px",
                  background: coursesAsStudent.length === 1 ? "#e2e8f0" : "#fee2e2",
                  color: coursesAsStudent.length === 1 ? "#94a3b8" : "#991b1b",
                  border: "1px solid",
                  borderColor: coursesAsStudent.length === 1 ? "#cbd5e1" : "#fecaca",
                  borderRadius: 8,
                  cursor: coursesAsStudent.length === 1 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <Button
          onClick={addCourseAsStudent}
          disabled={!generalComplete}
          style={{ justifySelf: "start" }}
        >
          + Add Course to Learn
        </Button>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>My Availability as a Student</h2>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "#64748b" }}>
          Set your available time slots for learning
        </p>
        {availabilityAsStudent.map((slot, index) => (
          <div key={slot.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: 12,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Day</div>
              <select
                value={slot.day}
                onChange={(e) => updateAvailabilityAsStudent(slot.id, "day", e.target.value)}
                disabled={!generalComplete}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 14,
                  background: "white"
                }}
              >
                <option value="">Select day</option>
                {DAYS_OF_WEEK.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Start Time</div>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateAvailabilityAsStudent(slot.id, "startTime", e.target.value)}
                disabled={!generalComplete}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 14
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>End Time</div>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateAvailabilityAsStudent(slot.id, "endTime", e.target.value)}
                disabled={!generalComplete}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 14
                }}
              />
            </label>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => removeAvailabilityAsStudent(slot.id)}
                disabled={!generalComplete || availabilityAsStudent.length === 1}
                style={{
                  padding: "10px 14px",
                  background: availabilityAsStudent.length === 1 ? "#e2e8f0" : "#fee2e2",
                  color: availabilityAsStudent.length === 1 ? "#94a3b8" : "#991b1b",
                  border: "1px solid",
                  borderColor: availabilityAsStudent.length === 1 ? "#cbd5e1" : "#fecaca",
                  borderRadius: 8,
                  cursor: availabilityAsStudent.length === 1 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <Button
          onClick={addAvailabilityAsStudent}
          disabled={!generalComplete}
          style={{ justifySelf: "start" }}
        >
          + Add Time Slot
        </Button>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>About Me as a Student</h2>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Tell us about yourself as a student</div>
          <textarea
            value={aboutMeAsStudent}
            onChange={e => setAboutMeAsStudent(e.target.value)}
            placeholder="Share your goals, learning preferences, and what you're looking for in a tutor"
            style={textareaStyle}
            disabled={!generalComplete}
          />
        </label>
      </section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={handleSave} disabled={!generalComplete}>Save</Button>
      </div>
    </div>
  );
}

const textareaStyle = {
  width: "100%",
  minHeight: 90,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  outline: "none",
  resize: "vertical",
  fontFamily: "inherit",
  fontSize: 14
};
