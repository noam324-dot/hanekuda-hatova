"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type Screen = "welcome" | "home" | "pain" | "need" | "pause" | "good" | "missing" | "step" | "stepCommit" | "stepCheck" | "stepSmall" | "feedback" | "finish" | "bank" | "voice" | "faith" | "journal" | "settings";
type Item = { id: number; text: string; media?: string; kind?: "image" | "audio"; date: string };
type UsageMode = "general" | "personal";

const painOptions = ["הגוף", "עייפות", "פחד", "בדידות", "בריאות", "כאב", "המראה שלי", "חוסר ודאות", "געגוע", "אחר"];
const needOptions = ["שמישהו יקשיב לי", "לבכות", "שקט", "חיבוק", "שירחמו עליי רגע", "להיזכר בכוחות שלי"];
const prompts = ["מי אוהב אותך?", "על מי את משפיעה?", "מה עדיין יפה בך?", "איזו תכונה טובה יש בך?", "מה הצלחת לעשות השבוע?", "מה גורם לך לחייך?", "מה נותן לחיים שלך משמעות?"];
const generalPrompts = ["מי אוהב אותך?", "על מי יש לך השפעה טובה?", "איזה דבר בך ראוי להערכה?", "איזו תכונה טובה יש בך?", "מה הצלחת לעשות השבוע?", "מה גורם לך לחייך?", "מה נותן לחיים שלך משמעות?"];
const stepGroups = [
  { title: "מנוחה והתחדשות", icon: "🌿", actions: ["😴 לישון קצת ולקום מחדש", "🛋️ לנוח בלי רגשות אשם", "🚿 להתקלח", "🛁 אמבטיה חמה", "💧 לשתות מים", "🍵 להכין תה או קפה", "🥗 לאכול משהו מזין", "💊 לקחת טיפול לפי הצורך"] },
  { title: "להזיז את הגוף", icon: "🚶", actions: ["🚶 הליכה קצרה", "🏃 לצאת לספורט", "🧘 מתיחות", "💪 פיזיותרפיה", "🌳 לשבת כמה דקות בחוץ", "🌞 לעמוד ליד חלון ולהרגיש את השמש"] },
  { title: "אנשים", icon: "❤️", actions: ["🤗 לבקש חיבוק", "📞 להתקשר למישהו", "💬 לשלוח הודעה לחבר", "👨‍👩‍👧 להיות עם המשפחה", "🐶 לשחק עם חיית מחמד, אם יש"] },
  { title: "לנפש", icon: "🎵", actions: ["🎵 לשים מוזיקה שאני אוהבת", "🎤 לשיר", "📖 לקרוא כמה עמודים", "🎨 ליצור משהו קטן", "✍️ לכתוב מה אני מרגישה", "📝 לכתוב שלושה משפטים שהייתי אומרת לחברה טובה במצב שלי", "😂 לראות סרטון מצחיק"] },
  { title: "אמונה ומשמעות", icon: "🙏", actions: ["🙏 להתפלל", "📖 לקרוא פסוק שנותן לי כוח", "🎧 לשמוע שיעור קצר", "🎶 לשמוע ניגון", "🕯️ להגיד תודה על דבר אחד", "💛 להיזכר בנקודה הטובה שלי"] },
  { title: "לעשות טוב", icon: "🌱", actions: ["💛 לעשות מעשה אחד קטן של אהבה", "💝 לעזור למישהו", "📱 לשלוח הודעה משמחת", "😊 לחייך למישהו", "🌸 להשקות עציץ", "🧹 לסדר משהו קטן בבית"] },
  { title: "לצאת מהראש", icon: "🌍", actions: ["🚗 לנסוע למקום שאני אוהבת", "☀️ לשבת בטבע", "🌺 להריח פרח", "🌊 ללכת לים, כשאפשר", "📷 לצלם משהו יפה"] },
  { title: "להתפנק קצת", icon: "💛", intro: "לפעמים פינוק קטן הוא דרך לומר לעצמי: אני חשובה, ומגיע לי שיטפלו בי.", actions: ["💆 ללכת למסאז׳", "🛍️ לעשות קצת קניות", "☕ לשבת בבית קפה", "🍨 לקנות לעצמי משהו שאני אוהבת, בהתאם למה שמתאים לי מבחינה בריאותית", "💅 טיפול טיפוח", "🛁 אמבטיה מפנקת", "🧴 למרוח קרם גוף או לטפל בעצמי", "🌸 לקנות לעצמי פרחים", "🍓 להכין לעצמי ארוחה שאני אוהבת", "🌳 לצאת לטיול קצר במקום יפה", "🌊 ללכת לים או לטבע, כשאפשר", "🏊 ללכת לשחות"] },
  { title: "לשחרר את מה שיושב בפנים", icon: "🎵", intro: "לפעמים הגוף והלב צריכים פשוט לפרוק את מה שנאגר בפנים.", actions: ["🎵 לשים מוזיקה שאני אוהבת ולשיר בקול רם", "🚗 לשבת באוטו, לשים מוזיקה ולצעוק או לשיר מכל הלב", "🎤 לשיר עם הזמר האהוב עליי", "😭 לבכות בלי להתנצל", "🌬️ להוציא קול חזק או צעקה במקום מתאים ובטוח", "🥁 לפרוק אנרגיה באמצעות תנועה, ריקוד או תיפוף על כרית"] },
];
const tinySteps = ["💧 לשתות מים", "🪑 לקום מהכיסא", "🪟 לפתוח חלון", "🌬️ לקחת נשימה עמוקה", "🎵 לשים שיר אחד"];
const recommendationMap: Record<string, string[]> = {
  "עייפות": ["😴 לישון קצת ולקום מחדש", "🚿 להתקלח", "🍵 להכין תה או קפה", "🛋️ לנוח בלי רגשות אשם", "🌳 לשבת כמה דקות בחוץ"],
  "פחד": ["🌬️ לקחת נשימה עמוקה", "🚶 הליכה קצרה", "🙏 להתפלל", "📞 להתקשר למישהו", "🎶 לשמוע ניגון"],
  "בדידות": ["🤗 לבקש חיבוק", "💬 לשלוח הודעה לחבר", "📞 להתקשר למישהו", "👨‍👩‍👧 להיות עם המשפחה", "💛 לעשות מעשה אחד קטן של אהבה"],
  "כאב": ["🛋️ לנוח בלי רגשות אשם", "💧 לשתות מים", "💊 לקחת טיפול לפי הצורך", "🧘 מתיחות", "🎵 לשים מוזיקה שאני אוהבת"],
  "הגוף": ["🛋️ לנוח בלי רגשות אשם", "💧 לשתות מים", "💊 לקחת טיפול לפי הצורך", "🧘 מתיחות", "🚿 להתקלח"],
  "בריאות": ["💊 לקחת טיפול לפי הצורך", "💧 לשתות מים", "🥗 לאכול משהו מזין", "🛋️ לנוח בלי רגשות אשם", "📞 להתקשר למישהו"],
  "חוסר ודאות": ["🌬️ לקחת נשימה עמוקה", "🙏 להתפלל", "📝 לכתוב שלושה משפטים שהייתי אומרת לחברה טובה במצב שלי", "📞 להתקשר למישהו", "🌳 לשבת כמה דקות בחוץ"],
  "געגוע": ["💬 לשלוח הודעה לחבר", "📞 להתקשר למישהו", "🎵 לשים מוזיקה שאני אוהבת", "✍️ לכתוב מה אני מרגישה", "💛 לעשות מעשה אחד קטן של אהבה"],
  "המראה שלי": ["📝 לכתוב שלושה משפטים שהייתי אומרת לחברה טובה במצב שלי", "🚿 להתקלח", "🎵 לשים מוזיקה שאני אוהבת", "🤗 לבקש חיבוק", "💛 להיזכר בנקודה הטובה שלי"],
};
const defaultRecommendations = ["💧 לשתות מים", "🌬️ לקחת נשימה עמוקה", "🌳 לשבת כמה דקות בחוץ", "🎵 לשים מוזיקה שאני אוהבת", "💛 לעשות מעשה אחד קטן של אהבה"];
const personalBuiltInActions = ["💊 לקחת טיפול לפי הצורך", "💪 פיזיותרפיה"];
const actionScope = (action: string): "general" | "personal" => personalBuiltInActions.includes(action) ? "personal" : "general";
const soulNeeds = ["מנוחה", "אהבה", "כוח", "תקווה", "אמונה", "שקט", "משמעות", "שמחה", "חיבור לאנשים", "להרגיש שאני מצליחה"];
const soulRecommendationMap: Record<string, string[]> = {
  "מנוחה": ["😴 לישון קצת ולקום מחדש", "🛋️ לנוח בלי רגשות אשם", "🍵 להכין תה או קפה", "🌳 לשבת כמה דקות בחוץ", "💧 לשתות מים"],
  "אהבה": ["🤗 לבקש חיבוק", "📞 להתקשר למישהו", "◉ לשמוע הקלטה של אדם אהוב", "▧ להסתכל בתמונה אהובה", "💛 לעשות מעשה אחד קטן של אהבה"],
  "כוח": ["🥗 לאכול משהו מזין", "🌞 לעמוד ליד חלון ולהרגיש את השמש", "💪 פיזיותרפיה", "🎵 לשים מוזיקה שאני אוהבת", "💛 להיזכר בנקודה הטובה שלי"],
  "תקווה": ["🌞 לעמוד ליד חלון ולהרגיש את השמש", "🎶 לשמוע ניגון", "📞 להתקשר למישהו", "💛 להיזכר בנקודה הטובה שלי", "🕯️ להגיד תודה על דבר אחד"],
  "אמונה": ["🙏 להתפלל", "📖 לקרוא פסוק שנותן לי כוח", "🎧 לשמוע שיעור קצר", "🎶 לשמוע ניגון", "🕯️ להגיד תודה על דבר אחד"],
  "שקט": ["🌬️ לקחת נשימה עמוקה", "🌳 לשבת כמה דקות בחוץ", "🎵 לשים מוזיקה שאני אוהבת", "🛁 אמבטיה חמה", "✍️ לכתוב מה אני מרגישה"],
  "משמעות": ["🙏 להתפלל", "💝 לעזור למישהו", "🚶 לצאת לעבודה או לעיסוק שנותן לי ערך", "📖 ללמוד משהו שנותן לי כוח", "✍️ לכתוב למה אני חשובה בעולם"],
  "שמחה": ["🎵 לשים מוזיקה שאני אוהבת", "😂 לראות סרטון מצחיק", "🌳 לשבת כמה דקות בחוץ", "💃 לרקוד שיר אחד", "👨‍👩‍👧 להיות עם המשפחה"],
  "חיבור לאנשים": ["🤗 לבקש חיבוק", "💬 לשלוח הודעה לחבר", "📞 להתקשר למישהו", "👨‍👩‍👧 להיות עם המשפחה", "💛 לעשות מעשה אחד קטן של אהבה"],
  "להרגיש שאני מצליחה": ["🧹 לסדר משהו קטן בבית", "🌸 להשקות עציץ", "📷 לצלם משהו יפה", "🎨 ליצור משהו קטן", "💛 להיזכר בנקודה הטובה שלי"],
};

const readStore = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [pains, setPains] = useState<string[]>([]);
  const [need, setNeed] = useState("");
  const [goodPoints, setGoodPoints] = useState<Item[]>([]);
  const [journal, setJournal] = useState<Item[]>([]);
  const [voices, setVoices] = useState<Item[]>([]);
  const [faith, setFaith] = useState<Item[]>([]);
  const [text, setText] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [chosenStep, setChosenStep] = useState("");
  const [customStep, setCustomStep] = useState("");
  const [customActions, setCustomActions] = useState<string[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [usageMode, setUsageMode] = useState<UsageMode>("general");
  const [hiddenPersonalActions, setHiddenPersonalActions] = useState<string[]>([]);
  const [missingNeed, setMissingNeed] = useState("");
  const [actionScores, setActionScores] = useState<Record<string, { total: number; contexts: Record<string, number> }>>({});
  const [seconds, setSeconds] = useState(180);
  const [running, setRunning] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    setGoodPoints(readStore("good-points", []));
    setJournal(readStore("good-journal", []));
    setVoices(readStore("good-voices", []));
    setFaith(readStore("good-faith", []));
    const storedScores = readStore<Record<string, { total: number; contexts: Record<string, number> }>>("good-action-scores", {});
    const storedCustom = readStore<string[]>("good-custom-actions", []);
    const storedMode = readStore<UsageMode | null>("good-usage-mode", null);
    setActionScores(storedScores);
    setCustomActions(storedCustom);
    setHiddenPersonalActions(readStore("good-hidden-personal-actions", []));
    if (readStore("good-intro-seen", false)) setScreen("home");
    const hasPersonalHistory = storedCustom.length > 0 || Object.keys(storedScores).some((action) => personalBuiltInActions.includes(action) || storedCustom.includes(action));
    const migratedMode: UsageMode = storedMode || (hasPersonalHistory ? "personal" : "general");
    setUsageMode(migratedMode);
    if (!storedMode) try { localStorage.setItem("good-usage-mode", JSON.stringify(migratedMode)); } catch { /* נשמור בזיכרון לביקור הזה */ }
  }, []);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearInterval(timer);
  }, [running, seconds]);

  const save = (key: string, setter: (v: Item[]) => void, items: Item[]) => {
    setter(items);
    try { localStorage.setItem(key, JSON.stringify(items)); } catch { alert("לא נשאר מספיק מקום במכשיר לשמירה נוספת."); }
  };

  const addText = (key: string, list: Item[], setter: (v: Item[]) => void, media?: string, kind?: "image" | "audio") => {
    if (!text.trim() && !media) return;
    const item = { id: Date.now(), text: text.trim(), media, kind, date: new Date().toLocaleDateString("he-IL") };
    save(key, setter, [item, ...list]);
    setText("");
  };

  const remove = (key: string, list: Item[], setter: (v: Item[]) => void, id: number) => save(key, setter, list.filter((x) => x.id !== id));

  const imageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addText("good-points", goodPoints, setGoodPoints, String(reader.result), "image");
    reader.readAsDataURL(file);
  };

  const startRecording = async (target: "voice" | "point") => {
    if (!navigator.mediaDevices || !window.MediaRecorder) return alert("ההקלטה אינה זמינה בדפדפן הזה.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: mr.mimeType });
        const reader = new FileReader();
        reader.onload = () => target === "voice"
          ? addText("good-voices", voices, setVoices, String(reader.result), "audio")
          : addText("good-points", goodPoints, setGoodPoints, String(reader.result), "audio");
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.current = mr; mr.start(); setRecording(true);
    } catch { alert("כדי להקליט, צריך לאפשר גישה למיקרופון."); }
  };

  const stopRecording = () => { recorder.current?.stop(); setRecording(false); };
  const saveCustomAction = (action: string) => {
    const clean = action.trim();
    if (!clean) return "";
    const next = customActions.includes(clean) ? customActions : [clean, ...customActions];
    setCustomActions(next);
    try { localStorage.setItem("good-custom-actions", JSON.stringify(next)); } catch { /* הפעולה תישאר לביקור הזה */ }
    return clean;
  };
  const removeCustomAction = (action: string) => {
    const next = customActions.filter((item) => item !== action);
    const nextScores = { ...actionScores };
    delete nextScores[action];
    setCustomActions(next);
    setActionScores(nextScores);
    if (chosenStep === action) setChosenStep("");
    try { localStorage.setItem("good-custom-actions", JSON.stringify(next)); } catch { /* נשאיר את המצב בזיכרון */ }
    try { localStorage.setItem("good-action-scores", JSON.stringify(nextScores)); } catch { /* נשאיר את המצב בזיכרון */ }
  };
  const changeUsageMode = (mode: UsageMode) => {
    setUsageMode(mode);
    try { localStorage.setItem("good-usage-mode", JSON.stringify(mode)); } catch { /* נשמור בזיכרון לביקור הזה */ }
  };
  const toggleBuiltInAction = (action: string) => {
    const next = hiddenPersonalActions.includes(action) ? hiddenPersonalActions.filter((item) => item !== action) : [...hiddenPersonalActions, action];
    setHiddenPersonalActions(next);
    try { localStorage.setItem("good-hidden-personal-actions", JSON.stringify(next)); } catch { /* נשמור בזיכרון לביקור הזה */ }
  };
  const rememberHelp = (weight: number) => {
    if (!weight || !chosenStep) { setScreen("finish"); return; }
    const context = [...pains].sort().join("|") + "::" + missingNeed;
    const current = actionScores[chosenStep] || { total: 0, contexts: {} };
    const next = { ...actionScores, [chosenStep]: { total: current.total + weight, contexts: { ...current.contexts, [context]: (current.contexts[context] || 0) + weight } } };
    setActionScores(next);
    try { localStorage.setItem("good-action-scores", JSON.stringify(next)); } catch { /* ההעדפה תישאר רק לביקור הזה */ }
    setScreen("finish");
  };
  const goHome = () => { setScreen("home"); setPains([]); setNeed(""); setSeconds(180); setRunning(false); setText(""); };
  const finishWelcome = () => {
    try { localStorage.setItem("good-intro-seen", JSON.stringify(true)); } catch { /* נמשיך גם ללא שמירה */ }
    setScreen("home");
  };
  const formatTime = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const contextKey = [...pains].sort().join("|") + "::" + missingNeed;
  const isActionVisible = (action: string) => {
    const personal = customActions.includes(action) || actionScope(action) === "personal";
    return !personal || (usageMode === "personal" && !hiddenPersonalActions.includes(action));
  };
  const learnedSteps = Object.entries(actionScores).filter(([action, score]) => isActionVisible(action) && ((score.contexts[contextKey] || 0) > 0 || score.total >= 3)).sort(([, a], [, b]) => ((b.contexts[contextKey] || 0) * 3 + b.total) - ((a.contexts[contextKey] || 0) * 3 + a.total)).map(([action]) => action);
  const recommendedSteps = [...new Set([...learnedSteps, ...(soulRecommendationMap[missingNeed] || []), ...pains.flatMap((pain) => recommendationMap[pain] || [])])].filter(isActionVisible).slice(0, 5);
  const recommendations = recommendedSteps.length ? recommendedSteps : defaultRecommendations;
  const activePrompts = usageMode === "personal" ? prompts : generalPrompts;
  const sortedGroupActions = (actions: string[]) => actions.filter(isActionVisible).sort((a, b) => (actionScores[b]?.total || 0) - (actionScores[a]?.total || 0));
  const toggleCategory = (category: string) => setOpenCategory(openCategory === category ? null : category);

  const Header = ({ back = true }: { back?: boolean }) => <header className="topbar">{back ? <button className="iconButton" onClick={goHome} aria-label="חזרה לבית">⌂</button> : <button className="iconButton" onClick={() => setScreen("settings")} aria-label="הגדרות והתאמה אישית">⚙</button>}<span className="miniBrand">הנקודה הטובה <i>•</i></span></header>;
  const CardList = ({ items, storageKey, setter }: { items: Item[]; storageKey: string; setter: (v: Item[]) => void }) => items.length ? <div className="cardList">{items.map((item) => <article className="memoryCard" key={item.id}>{item.kind === "image" && <img src={item.media} alt="זיכרון שבחרת לשמור" />}{item.kind === "audio" && <audio controls src={item.media} />}{item.text && <p>{item.text}</p>}<div className="cardMeta"><span>{item.date}</span><button onClick={() => remove(storageKey, items, setter, item.id)} aria-label="מחיקת הפריט">×</button></div></article>)}</div> : <div className="empty"><span>♡</span><p>המקום הזה מחכה למה שתרצי לשמור בו.</p></div>;

  if (screen === "welcome") return <main className="shell welcome"><section className="welcomeContent"><div className="welcomeMark">✦</div><p className="eyebrow">לגלות, לזכור ולחזק את כוחות החיים שבך</p><h1>ברוכים הבאים<br />ל<span>״הנקודה הטובה״</span></h1><div className="welcomeCopy"><p>יש ימים שבהם קל לנו להרגיש את כוחות החיים שלנו.</p><p>ויש ימים שבהם הכאב, העייפות, הדאגות או העומס מסתירים אותם.</p><div className="welcomePromise"><p>האפליקציה הזאת לא באה להגיד לך מי אתה.</p><strong>היא נועדה לעזור לך להתחבר מחדש לכוחות החיים שכבר קיימים בך.</strong></div><p>עם הזמן אפשר לשמור כאן דברים שמחזקים אותך באמת: רגעים טובים, מחשבות, אנשים, פעולות, זיכרונות, אמונה וכל דבר שנותן לך כוח.</p><p>כך, ברגעים קשים, האפליקציה תזכיר לך דווקא את הדברים שאתה עצמך גילית שמחזקים את כוחות החיים שלך.</p><p className="welcomeQuiet">אין צורך למלא הכול עכשיו.<br />פשוט להתחיל בקצב שלך.</p><p>האפליקציה תלמד להכיר אותך בעדינות, ותשתפר יחד איתך.</p></div><button className="primary warm" onClick={finishWelcome}>💛 בואו נתחיל</button></section></main>;

  if (screen === "home") return <main className="shell home"><Header back={false} /><section className="hero"><div className="sun"><span>✦</span></div><p className="eyebrow">מקום קטן לנשום בו</p><h1>הנקודה<br /><em>הטובה</em></h1><p className="lead">גם אם היום קשה,<br />תמיד נשארת בתוכך נקודה אחת של טוב.</p><p className="together">בואי נמצא אותה יחד.</p><button className="primary warm" onClick={() => setScreen("pain")}><span>♡</span> קשה לי עכשיו</button><button className="secondary" onClick={() => setScreen("journal")}><span>🌱</span> מצאתי נקודת חיים</button></section><nav className="homeNav" aria-label="האוסף האישי"><button onClick={() => setScreen("bank")}><b>♡</b><span>הנקודות שלי</span></button><button onClick={() => setScreen("voice")}><b>◉</b><span>הקול שלי</span></button><button onClick={() => setScreen("faith")}><b>✦</b><span>מה נותן לי כוח</span></button></nav><p className="privacy">כל מה שנכתב כאן נשאר רק במכשיר שלך</p></main>;

  if (screen === "settings") return <main className="shell"><Header /><section className="library settings"><p className="stepLabel">הגדרות</p><h2>התאמה אישית</h2><p className="sub">אפשר לבחור כמה אישי יהיה התוכן שמופיע לך.</p><fieldset className="modePicker"><legend>מצב שימוש</legend><label className={usageMode === "general" ? "selected" : ""}><input type="radio" name="usage-mode" checked={usageMode === "general"} onChange={() => changeUsageMode("general")} /><span><b>גרסה כללית</b><small>רעיונות שמתאימים לרוב האנשים</small></span></label><label className={usageMode === "personal" ? "selected" : ""}><input type="radio" name="usage-mode" checked={usageMode === "personal"} onChange={() => changeUsageMode("personal")} /><span><b>הגרסה האישית שלי</b><small>כולל פעולות אישיות ודברים שהוספת</small></span></label></fieldset>{usageMode === "personal" && <section className="personalSettings"><h3>פעולות אישיות מובנות</h3><p>אפשר להסתיר ולהחזיר. שום מידע לא נמחק.</p>{personalBuiltInActions.map((action) => <label className="visibilityRow" key={action}><span>{action}</span><input type="checkbox" checked={!hiddenPersonalActions.includes(action)} onChange={() => toggleBuiltInAction(action)} aria-label={`להציג את ${action}`} /></label>)}<h3>דברים שעוזרים לי</h3>{customActions.length > 0 ? <div className="settingsActions">{customActions.map((action) => <div key={action}><span>{action}</span><button onClick={() => removeCustomAction(action)} aria-label={`למחוק את ${action}`}>×</button></div>)}</div> : <p className="quietNote">עדיין לא הוספת פעולות משלך.</p>}<div className="addSettingAction"><input value={customStep} onChange={(e) => setCustomStep(e.target.value)} placeholder="פעולה חדשה שעוזרת לי" /><button disabled={!customStep.trim()} onClick={() => { saveCustomAction(customStep); setCustomStep(""); }}>להוסיף</button></div></section>}</section></main>;

  if (screen === "pain") return <main className="shell"><Header /><section className="flow"><p className="stepLabel">רגע אחד, בקצב שלך</p><h2>מה הכי כואב עכשיו?</h2><p className="sub">אפשר לבחור יותר מדבר אחד.</p><div className="choices">{painOptions.map((x) => <button className={pains.includes(x) ? "selected" : ""} onClick={() => setPains(pains.includes(x) ? pains.filter((p) => p !== x) : [...pains, x])} key={x}><span>{pains.includes(x) ? "✓" : ""}</span>{x}</button>)}</div><button disabled={!pains.length} className="primary" onClick={() => setScreen("need")}>להמשיך בעדינות</button></section></main>;

  if (screen === "need") return <main className="shell"><Header /><section className="flow"><div className="validation"><span>♡</span><p>זה באמת נשמע קשה.<br /><strong>אין צורך להילחם בזה כרגע.</strong></p></div><h2>מה את צריכה עכשיו?</h2><div className="needList">{needOptions.map((x) => <button className={need === x ? "selected" : ""} onClick={() => setNeed(x)} key={x}><span>♡</span>{x}</button>)}</div><button disabled={!need} className="primary" onClick={() => { if (["לבכות", "שירחמו עליי רגע", "שקט"].includes(need)) setScreen("pause"); else setScreen("good"); }}>זה מה שאני צריכה</button></section></main>;

  if (screen === "pause") return <main className="shell pause"><Header /><section className="flow centered"><p className="eyebrow">שלוש דקות בלי שום משימה</p><div className={`breathing ${running ? "active" : ""}`}><div><span>נושמת</span><b>{formatTime}</b></div></div><h2>{seconds === 0 ? "היית כאן עם עצמך." : "גם לזה יש מקום."}</h2><p className="sub">אין עצות. אין צורך לעשות דבר.<br />רק להיות כאן לרגע.</p>{seconds > 0 && <button className="primary" onClick={() => setRunning(!running)}>{running ? "להשהות" : seconds < 180 ? "להמשיך" : "להתחיל"}</button>}<button className="textButton" onClick={() => setScreen("good")}>לחזור אל הנקודה הטובה ←</button></section></main>;

  if (screen === "good") return <main className="shell"><Header /><section className="flow centered"><div className="goodMark">✦</div><p className="stepLabel">הנקודה הטובה</p><h2>{activePrompts[promptIndex]}</h2><p className="sub">אין תשובה נכונה. רק מה שעולה עכשיו.</p><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="אפשר לכתוב כאן..." rows={4} /><div className="mediaRow"><label className="smallAction">▧ להוסיף תמונה<input hidden type="file" accept="image/*" onChange={imageUpload} /></label><button className="smallAction" onClick={() => recording ? stopRecording() : startRecording("point")}>{recording ? "■ לסיים הקלטה" : "◉ להקליט"}</button></div><button className="primary" disabled={!text.trim()} onClick={() => { addText("good-points", goodPoints, setGoodPoints); setScreen("missing"); }}>לשמור ולהמשיך</button><button className="textButton" onClick={() => setPromptIndex((promptIndex + 1) % activePrompts.length)}>שאלה אחרת</button></section></main>;

  if (screen === "missing") return <main className="shell soulScreen"><Header /><section className="flow"><p className="stepLabel">לפני שבוחרים צעד</p><div className="soulMark">♡</div><h2>מה כרגע הנשמה שלך צריכה?</h2><p className="sub">לא תמיד צריך לדעת מה לעשות. אפשר להתחיל ממה שחסר.</p><div className="soulNeeds">{soulNeeds.map((item) => <button className={missingNeed === item ? "selected" : ""} onClick={() => setMissingNeed(item)} key={item}><span>{missingNeed === item ? "●" : "○"}</span>{item}</button>)}</div><button className="primary" disabled={!missingNeed} onClick={() => setScreen("step")}>לראות מה אולי יעזור</button><button className="textButton" onClick={() => setScreen("step")}>אני לא יודעת כרגע</button></section></main>;

  if (screen === "step") return <main className="shell stepPage"><Header /><section className="flow"><p className="stepLabel">צעד קטן אל החיים</p><h2>🌱 מה יעזור לי לחזור לחיים עכשיו?</h2><p className="sub">המטרה היא לא להספיק דברים. רק לבחור צעד אחד שמקרב אותך לחיים שאת רוצה.</p><section className="recommended"><div className="recommendedTitle"><span>✦</span><div><h3>אולי יתאים לך עכשיו</h3><p>לפי מה ששיתפת קודם</p></div></div><div className="actionCards">{recommendations.map((action) => <button className={chosenStep === action ? "selected" : ""} onClick={() => setChosenStep(action)} key={action}><span className="check">{chosenStep === action ? "✓" : ""}</span><b>{action}</b></button>)}</div></section><div className="categoryAccordions">{usageMode === "personal" && customActions.length > 0 && <section className="categoryCard savedActions"><button className="categoryToggle" onClick={() => toggleCategory("דברים שעוזרים לי")} aria-expanded={openCategory === "דברים שעוזרים לי"} aria-controls="category-custom"><span><i>💛</i>דברים שעוזרים לי</span><b aria-hidden="true">⌄</b></button><div id="category-custom" className={openCategory === "דברים שעוזרים לי" ? "accordionPanel open" : "accordionPanel"} aria-hidden={openCategory !== "דברים שעוזרים לי"}><div className="accordionInner"><div className="savedActionList">{customActions.sort((a, b) => (actionScores[b]?.total || 0) - (actionScores[a]?.total || 0)).map((action) => <div className={chosenStep === action ? "savedAction selected" : "savedAction"} key={action}><button className="savedActionSelect" onClick={() => setChosenStep(action)}><span className="check">{chosenStep === action ? "✓" : ""}</span><b>{action}</b></button><button className="deleteAction" onClick={() => removeCustomAction(action)} aria-label={`למחוק את ${action}`}>×</button></div>)}</div></div></div></section>}{stepGroups.map((group, index) => { const actions = sortedGroupActions(group.actions); if (!actions.length) return null; const panelId = `category-${index}`; const isOpen = openCategory === group.title; return <section className="categoryCard" key={group.title}><button className="categoryToggle" onClick={() => toggleCategory(group.title)} aria-expanded={isOpen} aria-controls={panelId}><span><i>{group.icon}</i>{group.title}</span><b aria-hidden="true">⌄</b></button><div id={panelId} className={isOpen ? "accordionPanel open" : "accordionPanel"} aria-hidden={!isOpen}><div className="accordionInner">{"intro" in group && group.intro && <p className="groupIntro">{group.intro}</p>}<div className="actionCards">{actions.map((action) => <button className={chosenStep === action ? "selected" : ""} onClick={() => setChosenStep(action)} key={action}><span className="check">{chosenStep === action ? "✓" : ""}</span><b>{action}</b></button>)}</div></div></div></section>})}{usageMode === "personal" && <section className="categoryCard"><button className="categoryToggle" onClick={() => toggleCategory("פעולה אישית")} aria-expanded={openCategory === "פעולה אישית"} aria-controls="category-add"><span><i>⚙️</i>הוספת פעולה אישית</span><b aria-hidden="true">⌄</b></button><div id="category-add" className={openCategory === "פעולה אישית" ? "accordionPanel open" : "accordionPanel"} aria-hidden={openCategory !== "פעולה אישית"}><div className="accordionInner customGroup"><input value={customStep} onChange={(e) => setCustomStep(e.target.value)} placeholder="מה יעזור לך עכשיו?" aria-label="פעולה אישית" /><button className="personalAction" disabled={!customStep.trim()} onClick={() => { const action = saveCustomAction(customStep); setChosenStep(action); setCustomStep(""); }}>להוסיף ולבחור</button></div></div></section>}</div><button className="primary stickyAction" disabled={!chosenStep} onClick={() => setScreen("stepCommit")}>זה הצעד שלי</button><button className="textButton" onClick={() => setScreen("finish")}>אין לי כוח לצעד עכשיו, וזה בסדר</button></section></main>;

  if (screen === "stepCommit") return <main className="shell stepMoment"><Header /><section className="flow centered"><div className="chosenIcon">🌱</div><p className="stepLabel">הצעד שבחרת</p><h2>{chosenStep}</h2><div className="encouragement"><p>זו לא חייבת להיות פעולה גדולה.</p><strong>מספיק צעד קטן אחד.</strong><p>לפעמים דווקא הצעד הקטן מחזיר אותנו לחיים.</p></div><button className="primary" onClick={() => setScreen("stepCheck")}>אני רוצה לנסות</button><button className="textButton" onClick={() => setScreen("step")}>לבחור צעד אחר</button></section></main>;

  if (screen === "stepCheck") return <main className="shell stepMoment"><Header /><section className="flow centered"><div className="chosenIcon">♡</div><p className="stepLabel">רק בדיקה עדינה</p><h2>עשית את הצעד?</h2><p className="selectedReminder">{chosenStep}</p><div className="checkOptions"><button onClick={() => setScreen("feedback")}><span>✅</span><b>כן</b></button><button onClick={() => setScreen("feedback")}><span>🌱</span><b>עשיתי חלק</b></button><button onClick={() => setScreen("stepSmall")}><span>💛</span><b>עדיין לא</b></button></div></section></main>;

  if (screen === "stepSmall") return <main className="shell stepPage"><Header /><section className="flow"><div className="softMessage"><span>💛</span><div><h2>זה בסדר.</h2><p>אולי נבחר צעד קטן יותר?</p></div></div><p className="sub">משהו כל כך קטן, שלא צריך להתכונן אליו.</p><div className="tinyCards">{tinySteps.map((action) => <button className={chosenStep === action ? "selected" : ""} onClick={() => setChosenStep(action)} key={action}>{action}<span>{chosenStep === action ? "✓" : ""}</span></button>)}</div><button className="primary" disabled={!tinySteps.includes(chosenStep)} onClick={() => setScreen("stepCommit")}>זה מספיק קטן בשבילי</button><button className="textButton" onClick={() => setScreen("finish")}>גם לבחור עכשיו זה יותר מדי, וזה בסדר</button></section></main>;

  if (screen === "feedback") return <main className="shell feedback"><Header /><section className="flow centered"><p className="stepLabel">לשים לב למה שהשתנה</p><div className="moonArc">☾</div><h2>האם זה קצת עזר?</h2><p className="sub">אין כאן תשובה טובה יותר. גם שינוי קטן ראוי למקום.</p><div className="moonOptions"><button onClick={() => rememberHelp(0)}><span>🌑</span><div><b>עדיין קשה לי.</b><small>אפשר פשוט להיות כאן.</small></div></button><button onClick={() => rememberHelp(1)}><span>🌒</span><div><b>קצת יותר טוב.</b><small>גם קצת הוא שינוי.</small></div></button><button onClick={() => rememberHelp(2)}><span>🌓</span><div><b>חזר לי קצת כוח.</b><small>אפשר לשמור את הרגע הזה.</small></div></button><button onClick={() => rememberHelp(3)}><span>🌕</span><div><b>אני מרגישה שחזרתי לעצמי.</b><small>החיים עדיין כאן.</small></div></button></div></section></main>;

  if (screen === "finish") return <main className="shell finish"><Header /><section className="flow centered"><div className="finishGlow"><span>✦</span></div><h2>הכאב עדיין יכול להיות כאן.</h2><p className="finishLine">אבל גם את כאן.</p><div className="softRule" /><p>ובתוכך נשארת עוד נקודה אחת<br />שאפשר לחזור אליה.</p><p className="finishThanks">תודה שנתת מקום לכוחות החיים שלך היום. 💛</p><button className="primary" onClick={goHome}>♡ זה מספיק להיום</button></section></main>;

  const library = screen === "bank" ? { title: "הנקודות שלי", desc: "דברים אמיתיים שכבר מצאת בתוכך ובחיים שלך.", items: goodPoints, key: "good-points", setter: setGoodPoints } : screen === "journal" ? { title: "מצאתי נקודת חיים", desc: "רגע שבו הרגשת חיה, אוהבת, נותנת, צוחקת או פשוט קרובה לעצמך.", items: journal, key: "good-journal", setter: setJournal } : screen === "faith" ? { title: "מה נותן לי כוח", desc: "אמונה, שיר, תפילה או משפט אישי — רק מה שמתאים לך.", items: faith, key: "good-faith", setter: setFaith } : null;
  if (library) return <main className="shell"><Header /><section className="library"><p className="stepLabel">האוסף האישי שלי</p><h2>{library.title}</h2><p className="sub">{library.desc}</p><div className="composer"><textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={screen === "journal" ? "מה היה טוב, אפילו לרגע?" : "מה תרצי לזכור?"} /><button className="primary" disabled={!text.trim()} onClick={() => addText(library.key, library.items, library.setter)}>לשמור כאן</button></div><CardList items={library.items} storageKey={library.key} setter={library.setter} /></section></main>;

  return <main className="shell"><Header /><section className="library voice"><p className="stepLabel">ממני, אליי</p><h2>הקול שלי</h2><p className="sub">ביום טוב אפשר להשאיר כאן כמה מילים ליום קשה.</p><div className="recordPanel"><div className={`mic ${recording ? "live" : ""}`}>◉</div><textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="כותרת קטנה להקלטה (לא חובה)" /><button className="primary" onClick={() => recording ? stopRecording() : startRecording("voice")}>{recording ? "■ לסיים ולשמור" : "להתחיל להקליט"}</button><p>ההקלטה נשמרת רק במכשיר שלך</p></div><CardList items={voices} storageKey="good-voices" setter={setVoices} /></section></main>;
}
