export default function RatingPage() {
  // Mock data - matching API format (GET /api/users/{userId}/ratings)
  const ratingsData = {
    averageRating: 4.87,
    totalRatings: 3,
    ratings: [
      {
        id: 1,
        ratedBy: "Noa Levi",
        rating: 4.9,
        comment: "Very clear explanations and great practice problems."
      },
      {
        id: 2,
        ratedBy: "Itai Cohen",
        rating: 4.7,
        comment: "Helped me optimize queries and understand execution plans."
      },
      {
        id: 3,
        ratedBy: "Dana Azulay",
        rating: 5.0,
        comment: "Excellent pacing and examples."
      }
    ]
  };

  const { averageRating, totalRatings, ratings } = ratingsData;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h1 style={{ marginTop: 0 }}>Rating</h1>

      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
          border: "1px solid #dbeafe",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <div style={{ fontSize: 14, color: "#475569" }}>Average rating from students</div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>{averageRating.toFixed(2)}</div>
        </div>
        <div style={{
          padding: "10px 14px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
          color: "#0b1021",
          fontWeight: 700,
          border: "1px solid #0ea5e9"
        }}>
          Based on {totalRatings} lessons
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {ratings.map(rating => (
          <div
            key={rating.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 14,
              background: "white",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
              display: "grid",
              gap: 6
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>From: {rating.ratedBy}</div>
              <div style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "#ecfeff",
                color: "#0ea5e9",
                fontWeight: 700
              }}>
                {rating.rating.toFixed(1)} ★
              </div>
            </div>
            <div style={{ color: "#1f2937", fontSize: 14 }}>{rating.comment}</div>
          </div>
        ))}

        {ratings.length === 0 && (
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
            color: "#475569"
          }}>
            No lessons rated yet.
          </div>
        )}
      </div>
    </div>
  );
}
