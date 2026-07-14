import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "הצהרת נגישות | הבית של המאפרים",
  description: "מידע על נגישות האתר של הבית של המאפרים, נטלי ארצי עוסק מורשה",
};

export default function AccessibilityPage() {
  return (
    <main
      id="main-content"
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#080608",
        color: "rgba(255,248,245,0.92)",
        fontFamily: "Heebo, system-ui, sans-serif",
        padding: "80px 24px 120px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Back */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#C4857A",
            textDecoration: "none",
            fontSize: "0.85rem",
            marginBottom: 40,
          }}
        >
          ← חזרה לדף הבית
        </Link>

        <h1
          style={{
            fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          הצהרת נגישות
        </h1>

        <p style={{ color: "rgba(255,248,245,0.5)", fontSize: "0.82rem", marginBottom: 48 }}>
          עודכן לאחרונה: יולי 2025
        </p>

        <Section title="מחויבות לנגישות">
          <p>
            <strong>נטלי ארצי, עוסק מורשה</strong> מחויבת להנגיש את האתר{" "}
            <strong>academy.natalieartsi.com</strong> לאנשים עם מוגבלות,
            בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות (התשנ&quot;ח–1998)
            ותקנות הנגישות הנגזרות ממנו.
          </p>
          <p style={{ marginTop: 12 }}>
            האתר עומד ברמת תאימות <strong>AA</strong> של תקן{" "}
            <strong>WCAG 2.1</strong> ותקן ישראלי <strong>5568</strong> —
            הרמה המחמירה הנדרשת על-פי החוק בישראל.
          </p>
        </Section>

        <Section title="מה בוצע">
          <ul style={{ paddingRight: 20, lineHeight: 2 }}>
            <li>התאמת האתר לניגודיות צבעים תקינה (יחס 4.5:1 לפחות לטקסט רגיל)</li>
            <li>תיוג תמונות עם טקסט חלופי (alt text) לשימוש בקוראי מסך</li>
            <li>ניווט מלא במקלדת לכל האלמנטים האינטראקטיביים</li>
            <li>רכיב נגישות מובנה — הגדלת טקסט, ניגודיות גבוהה, עצירת אנימציות ועוד</li>
            <li>מבנה כותרות היררכי (H1–H4) לניווט בקורא מסך</li>
            <li>הגדרת כיוון טקסט (RTL) ושפה (עברית) באלמנט ה-HTML</li>
            <li>קישור &quot;דלג לתוכן הראשי&quot; בראש כל עמוד</li>
            <li>תמיכה בהגדלת גופן מערכת ב-200% ללא פגיעה בפונקציונליות</li>
          </ul>
        </Section>

        <Section title="מגבלות ידועות">
          <p>
            אנו ממשיכים לשפר את הנגישות ועשויים להיתקל בפערים בחלקים
            שנוצרו על-ידי ספקים חיצוניים (כגון נגן וידאו מוטמע). אם נתקלת
            בבעיה — פני/ה אלינו ונטפל בה בהקדם.
          </p>
        </Section>

        <Section title="פנייה בנושא נגישות">
          <p style={{ marginBottom: 16 }}>
            נציג/ת הנגישות שלנו עומד/ת לרשותך לכל שאלה, תקלה או בקשת
            התאמה:
          </p>
          <div
            style={{
              background: "rgba(196,133,122,0.08)",
              border: "1px solid rgba(196,133,122,0.22)",
              borderRadius: 14,
              padding: "20px 24px",
              lineHeight: 2.2,
            }}
          >
            <ContactRow label="שם" value="שי ארצי" />
            <ContactRow
              label="טלפון"
              value="054-674-2039"
              href="tel:0546742039"
            />
            <ContactRow
              label="מייל"
              value="office@natalieartsi.com"
              href="mailto:office@natalieartsi.com"
            />
          </div>
          <p style={{ marginTop: 16, fontSize: "0.82rem", color: "rgba(255,248,245,0.55)" }}>
            בקשות נגישות יטופלו תוך 5 ימי עסקים.
          </p>
        </Section>

        <Section title="תאריך בדיקה">
          <p>
            בדיקת נגישות אחרונה בוצעה ביולי 2025 בהתאם לתקן ישראלי 5568
            ותקן WCAG 2.1 ברמה AA.
          </p>
        </Section>

      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 44 }}>
      <h2
        style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "#C4857A",
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: "1px solid rgba(196,133,122,0.18)",
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: "0.92rem", lineHeight: 1.85, color: "rgba(255,248,245,0.82)" }}>
        {children}
      </div>
    </section>
  );
}

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <span style={{ color: "rgba(255,248,245,0.5)", minWidth: 52 }}>{label}:</span>
      {href ? (
        <a
          href={href}
          style={{ color: "#C4857A", textDecoration: "none", fontWeight: 600 }}
        >
          {value}
        </a>
      ) : (
        <span style={{ fontWeight: 600 }}>{value}</span>
      )}
    </div>
  );
}
