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

export default function PersonalAreaPage() {
  const tutorRating = 4.8; // later from server

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const objectUrlRef = useRef(null);

  const [teacherCourses, setTeacherCourses] = useState("");
  const [teacherAvailability, setTeacherAvailability] = useState("");
  const [teacherAbout, setTeacherAbout] = useState("");

  const [studentCourses, setStudentCourses] = useState("");
  const [studentAvailability, setStudentAvailability] = useState("");
  const [studentAbout, setStudentAbout] = useState("");

  const generalComplete = Boolean(firstName && lastName && phone);

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
        <h2 style={{ margin: 0 }}>Teacher Profile</h2>
        <Input
          label="Courses you want to teach (course numbers)"
          value={teacherCourses}
          onChange={setTeacherCourses}
          placeholder="e.g., 20431, 30112"
          disabled={!generalComplete}
        />
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Availability (days & hours)</div>
          <textarea
            value={teacherAvailability}
            onChange={e => setTeacherAvailability(e.target.value)}
            placeholder="e.g., Sun-Tue 18:00-21:00"
            style={textareaStyle}
            disabled={!generalComplete}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>About me as a teacher</div>
          <textarea
            value={teacherAbout}
            onChange={e => setTeacherAbout(e.target.value)}
            placeholder="Share your teaching style, strengths, and experience"
            style={textareaStyle}
            disabled={!generalComplete}
          />
        </label>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>Student Profile</h2>
        <Input
          label="Courses you want to learn (course numbers)"
          value={studentCourses}
          onChange={setStudentCourses}
          placeholder="e.g., 20431, 30112"
          disabled={!generalComplete}
        />
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Availability (days & hours)</div>
          <textarea
            value={studentAvailability}
            onChange={e => setStudentAvailability(e.target.value)}
            placeholder="e.g., Wed-Thu 17:00-20:00"
            style={textareaStyle}
            disabled={!generalComplete}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>About me as a student</div>
          <textarea
            value={studentAbout}
            onChange={e => setStudentAbout(e.target.value)}
            placeholder="Share your goals and learning preferences"
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
