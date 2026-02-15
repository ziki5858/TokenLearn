import { useEffect, useState } from 'react';
import { useApp } from '../context/useApp';
import { useI18n } from "../i18n/useI18n";

export default function RatingPage() {
  const { language } = useI18n();
  const isHe = language === 'he';
  const { user, getUserRatings } = useApp();
  const [ratingsData, setRatingsData] = useState({ averageRating: 0, totalRatings: 0, ratings: [] });

  useEffect(() => {
    let isMounted = true;
    const loadRatings = async () => {
      const result = await getUserRatings(user.id);
      if (result.success && isMounted) {
        setRatingsData(result.data);
      }
    };
    loadRatings();
    return () => {
      isMounted = false;
    };
  }, [getUserRatings, user.id]);

  const { averageRating, totalRatings, ratings } = ratingsData;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h1 style={{ marginTop: 0 }}>{isHe ? 'דירוג' : 'Rating'}</h1>

      <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)", border: "1px solid #dbeafe", borderRadius: 16, padding: 16, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, color: "#475569" }}>{isHe ? 'דירוג ממוצע מתלמידים' : 'Average rating from students'}</div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>{averageRating.toFixed(2)}</div>
        </div>
        <div style={{ padding: "10px 14px", borderRadius: 999, background: "linear-gradient(135deg, #22d3ee, #0ea5e9)", color: "#0b1021", fontWeight: 700, border: "1px solid #0ea5e9" }}>
          {isHe ? `מבוסס על ${totalRatings} שיעורים` : `Based on ${totalRatings} lessons`}
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {ratings.map((rating) => (
          <div key={rating.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "white", boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)", display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{isHe ? 'מאת' : 'From'}: {rating.ratedBy}</div>
              <div style={{ padding: "6px 10px", borderRadius: 999, background: "#ecfeff", color: "#0ea5e9", fontWeight: 700 }}>{rating.rating.toFixed(1)} ★</div>
            </div>
            <div style={{ color: "#1f2937", fontSize: 14 }}>{rating.comment}</div>
          </div>
        ))}

        {ratings.length === 0 && (
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, textAlign: "center", color: "#475569" }}>
            {isHe ? 'אין עדיין שיעורים עם דירוג.' : 'No lessons rated yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
