import React from "react";
import { useI18n } from "../i18n/useI18n";

export default function FooterStoryAndRules() {
  const { language } = useI18n();
  const isHe = language === 'he';

  return (
    <footer style={styles.footer}>
      <div>
        <h3>{isHe ? 'הסיפור שלנו' : 'Our Story'}</h3>
        <p>
          {isHe
            ? 'TokenLearn היא פלטפורמת למידה שיתופית שבה משתמשים מלמדים, מרוויחים טוקנים ולומדים אחד מהשני.'
            : 'TokenLearn is a collaborative learning platform where users teach, earn tokens, and learn from one another.'}
        </p>
      </div>

      <div>
        <h3>{isHe ? 'כללי שיעורים' : 'Lesson Rules'}</h3>
        <ul>
          <li>{isHe ? 'אי אפשר לבקש שיעור בלי מספיק טוקנים.' : 'You cannot request a lesson without enough tokens.'}</li>
          <li>{isHe ? 'הטוקנים מתעדכנים רק אחרי השלמת שיעור.' : 'Tokens update only after a lesson is completed.'}</li>
          <li>{isHe ? 'לכל בקשה יש סטטוס ברור.' : 'Every request has a clear status.'}</li>
          <li>{isHe ? 'אפשר לבטל רק כשהסטטוס הוא Pending.' : 'You can cancel only while status is Pending.'}</li>
        </ul>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
    border: "1px solid #dbeafe",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12
  }
};
