// עטיפה משותפת להעלאת תמונות מהאדמין — מונעת נפילה שקטה ל-base64 כשההעלאה ל-Storage נכשלת.
// ראה CLAUDE.md: תקלת מובייל (תגובת דף הבית 28MB) נגרמה מהתבנית הישנה (FileReader.readAsDataURL בתוך catch).

export async function uploadImageStrict(
  file: File,
  uploadFn: (file: File) => Promise<string>,
  label?: string
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("סוג קובץ לא נתמך — יש להעלות תמונה בלבד");
  }
  try {
    return await uploadFn(file);
  } catch (err) {
    console.error(`[upload]${label ? " " + label : ""}:`, err);
    throw new Error("העלאת התמונה נכשלה — נסי שוב או בדקי את החיבור לאינטרנט");
  }
}
