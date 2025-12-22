import React, { useState } from "react";
import Button from "../components/Button";

// Mock data - will come from backend
const mockRequestsAsStudent = [
  {
    id: 1,
    tutorName: "Daniel Cohen",
    tutorRating: 4.9,
    course: "Algorithms",
    requestedSlot: { 
      day: "Sunday", 
      startTime: "18:00", 
      endTime: "21:00",
      specificStartTime: "19:00",
      specificEndTime: "20:00"
    },
    message: "I need help with dynamic programming",
    status: "pending", // pending, approved, rejected
    requestedAt: "2025-12-20 10:30"
  },
  {
    id: 2,
    tutorName: "Sarah Klein",
    tutorRating: 5.0,
    course: "Data Structures",
    requestedSlot: { 
      day: "Wednesday", 
      startTime: "17:00", 
      endTime: "20:00",
      specificStartTime: "18:00",
      specificEndTime: "19:30"
    },
    message: "Want to review binary trees",
    status: "approved",
    requestedAt: "2025-12-19 14:20"
  },
  {
    id: 3,
    tutorName: "Amir Katz",
    tutorRating: 4.2,
    course: "SQL",
    requestedSlot: { 
      day: "Monday", 
      startTime: "19:00", 
      endTime: "22:00",
      specificStartTime: "20:00",
      specificEndTime: "21:00"
    },
    message: "",
    status: "rejected",
    requestedAt: "2025-12-18 09:15"
  }
];

const mockRequestsAsTeacher = [
  {
    id: 4,
    studentName: "Yael Cohen",
    course: "Algorithms",
    requestedSlot: { 
      day: "Sunday", 
      startTime: "18:00", 
      endTime: "21:00",
      specificStartTime: "19:00",
      specificEndTime: "20:00"
    },
    message: "I'm struggling with graph algorithms, especially BFS and DFS",
    status: "pending",
    requestedAt: "2025-12-21 16:45"
  },
  {
    id: 5,
    studentName: "Tom Levi",
    course: "SQL",
    requestedSlot: { 
      day: "Tuesday", 
      startTime: "20:00", 
      endTime: "23:00",
      specificStartTime: "20:30",
      specificEndTime: "21:30"
    },
    message: "Need help with complex joins and subqueries",
    status: "pending",
    requestedAt: "2025-12-21 11:20"
  },
  {
    id: 6,
    studentName: "Maya Avraham",
    course: "Data Structures",
    requestedSlot: { 
      day: "Thursday", 
      startTime: "18:00", 
      endTime: "21:00",
      specificStartTime: "18:30",
      specificEndTime: "19:30"
    },
    message: "",
    status: "pending",
    requestedAt: "2025-12-20 15:10"
  }
];

export default function LessonRequestsPage() {
  const [activeTab, setActiveTab] = useState("student"); // student or teacher
  const [requestsAsStudent, setRequestsAsStudent] = useState(mockRequestsAsStudent);
  const [requestsAsTeacher, setRequestsAsTeacher] = useState(mockRequestsAsTeacher);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestForRejection, setSelectedRequestForRejection] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState("");

  const handleApprove = (requestId) => {
    setRequestsAsTeacher(prev => 
      prev.map(req => req.id === requestId ? { ...req, status: "approved" } : req)
    );
    // Here: send to backend
    // POST /api/lesson-requests/{requestId}/approve
    alert("Lesson request approved!");
  };

  const openRejectModal = (request) => {
    setSelectedRequestForRejection(request);
    setRejectionMessage("");
    setRejectModalOpen(true);
  };

  const handleReject = () => {
    if (!rejectionMessage.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setRequestsAsTeacher(prev => 
      prev.map(req => 
        req.id === selectedRequestForRejection.id 
          ? { ...req, status: "rejected", rejectionReason: rejectionMessage } 
          : req
      )
    );
    
    // Here: send to backend
    // POST /api/lesson-requests/{requestId}/reject
    // body: { reason: rejectionMessage }
    
    alert("Lesson request rejected.");
    setRejectModalOpen(false);
    setSelectedRequestForRejection(null);
    setRejectionMessage("");
  };

  const handleCancel = (requestId) => {
    if (confirm("Are you sure you want to cancel this request?")) {
      setRequestsAsStudent(prev => prev.filter(req => req.id !== requestId));
      // Here: send to backend
      // DELETE /api/lesson-requests/{requestId}
      alert("Request cancelled.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return { bg: "#fef3c7", border: "#fde68a", text: "#92400e" };
      case "approved": return { bg: "#d1fae5", border: "#a7f3d0", text: "#065f46" };
      case "rejected": return { bg: "#fee2e2", border: "#fecaca", text: "#991b1b" };
      default: return { bg: "#f3f4f6", border: "#e5e7eb", text: "#374151" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "⏳ Pending";
      case "approved": return "✅ Approved";
      case "rejected": return "❌ Rejected";
      default: return status;
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginTop: 0 }}>Lesson Requests</h1>
      <p style={{ marginTop: 0, color: "#64748b", marginBottom: 20 }}>
        Manage your lesson requests as a student and teacher
      </p>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab("student")}
          style={{
            ...styles.tab,
            ...(activeTab === "student" ? styles.tabActive : {})
          }}
        >
          My Requests as Student ({requestsAsStudent.length})
        </button>
        <button
          onClick={() => setActiveTab("teacher")}
          style={{
            ...styles.tab,
            ...(activeTab === "teacher" ? styles.tabActive : {})
          }}
        >
          Requests from Students ({requestsAsTeacher.filter(r => r.status === "pending").length})
        </button>
      </div>

      {/* Student Requests */}
      {activeTab === "student" && (
        <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Requests I Sent to Tutors</h2>
          {requestsAsStudent.length === 0 ? (
            <div style={styles.emptyState}>
              No lesson requests yet. Find a tutor and book a lesson!
            </div>
          ) : (
            requestsAsStudent.map(req => {
              const statusStyle = getStatusColor(req.status);
              return (
                <div key={req.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18 }}>{req.tutorName}</h3>
                      <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                        ⭐ {req.tutorRating} • {req.course}
                      </div>
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      background: statusStyle.bg,
                      border: `1px solid ${statusStyle.border}`,
                      color: statusStyle.text
                    }}>
                      {getStatusText(req.status)}
                    </div>
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.infoRow}>
                      <strong>Requested Time:</strong>
                      <span>
                        {req.requestedSlot.day}, {req.requestedSlot.specificStartTime} - {req.requestedSlot.specificEndTime}
                        <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 8 }}>
                          (Available: {req.requestedSlot.startTime} - {req.requestedSlot.endTime})
                        </span>
                      </span>
                    </div>
                    {req.message && (
                      <div style={styles.infoRow}>
                        <strong>My Message:</strong>
                        <span style={{ fontStyle: "italic" }}>"{req.message}"</span>
                      </div>
                    )}
                    {req.rejectionReason && (
                      <div style={styles.infoRow}>
                        <strong>Rejection Reason:</strong>
                        <span style={{ color: "#dc2626", fontStyle: "italic" }}>"{req.rejectionReason}"</span>
                      </div>
                    )}
                    <div style={styles.infoRow}>
                      <strong>Requested At:</strong>
                      <span>{req.requestedAt}</span>
                    </div>
                  </div>

                  {req.status === "pending" && (
                    <div style={styles.cardActions}>
                      <button
                        onClick={() => handleCancel(req.id)}
                        style={styles.cancelBtn}
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Teacher Requests */}
      {activeTab === "teacher" && (
        <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Requests from My Students</h2>
          {requestsAsTeacher.length === 0 ? (
            <div style={styles.emptyState}>
              No requests from students yet.
            </div>
          ) : (
            requestsAsTeacher.map(req => {
              const statusStyle = getStatusColor(req.status);
              return (
                <div key={req.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18 }}>{req.studentName}</h3>
                      <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                        {req.course}
                      </div>
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      background: statusStyle.bg,
                      border: `1px solid ${statusStyle.border}`,
                      color: statusStyle.text
                    }}>
                      {getStatusText(req.status)}
                    </div>
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.infoRow}>
                      <strong>Requested Time:</strong>
                      <span>
                        {req.requestedSlot.day}, {req.requestedSlot.specificStartTime} - {req.requestedSlot.specificEndTime}
                        <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 8 }}>
                          (Available: {req.requestedSlot.startTime} - {req.requestedSlot.endTime})
                        </span>
                      </span>
                    </div>
                    {req.message && (
                      <div style={styles.infoRow}>
                        <strong>Student's Message:</strong>
                        <span style={{ fontStyle: "italic" }}>"{req.message}"</span>
                      </div>
                    )}
                    <div style={styles.infoRow}>
                      <strong>Requested At:</strong>
                      <span>{req.requestedAt}</span>
                    </div>
                  </div>

                  {req.status === "pending" && (
                    <div style={styles.cardActions}>
                      <button
                        onClick={() => openRejectModal(req)}
                        style={styles.rejectBtn}
                      >
                        Reject
                      </button>
                      <Button onClick={() => handleApprove(req.id)}>
                        Approve Lesson
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && selectedRequestForRejection && (
        <div style={styles.modalOverlay} onClick={() => setRejectModalOpen(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Reject Lesson Request</h3>
              <button onClick={() => setRejectModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ margin: "0 0 16px", color: "#64748b" }}>
                You are about to reject a lesson request from <strong>{selectedRequestForRejection.studentName}</strong>.
                Please provide a reason so they can understand why.
              </p>
              <label style={{ display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 600 }}>Reason for rejection *</div>
                <textarea
                  value={rejectionMessage}
                  onChange={e => setRejectionMessage(e.target.value)}
                  placeholder="e.g., I'm not available at that time, or I don't feel qualified to teach this topic..."
                  style={styles.modalTextarea}
                  autoFocus
                />
              </label>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setRejectModalOpen(false)} style={styles.modalCancelBtn}>
                Cancel
              </button>
              <button onClick={handleReject} style={styles.modalRejectBtn}>
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  tabContainer: {
    display: "flex",
    gap: 8,
    borderBottom: "2px solid #e2e8f0",
    marginBottom: 8
  },
  tab: {
    padding: "12px 20px",
    background: "none",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
    color: "#64748b",
    transition: "all 0.2s"
  },
  tabActive: {
    color: "#0ea5e9",
    borderBottomColor: "#0ea5e9"
  },
  card: {
    background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
    border: "1px solid #dbeafe",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
    flexWrap: "wrap"
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: "nowrap"
  },
  cardContent: {
    display: "grid",
    gap: 10,
    padding: "12px 0",
    borderTop: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0"
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    gap: 12,
    fontSize: 14,
    alignItems: "start"
  },
  cardActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 12
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #f87171",
    background: "white",
    color: "#dc2626",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  rejectBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#64748b",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  emptyState: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 32,
    textAlign: "center",
    color: "#64748b",
    fontSize: 16
  },
  modalOverlay: {
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
  modalContent: {
    background: "white",
    borderRadius: 16,
    maxWidth: 500,
    width: "100%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottom: "1px solid #e2e8f0"
  },
  modalCloseBtn: {
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
    borderRadius: 8
  },
  modalBody: {
    padding: 20
  },
  modalTextarea: {
    width: "100%",
    minHeight: 100,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: 14
  },
  modalActions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    padding: 20,
    borderTop: "1px solid #e2e8f0"
  },
  modalCancelBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  modalRejectBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #dc2626",
    background: "#dc2626",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  }
};
