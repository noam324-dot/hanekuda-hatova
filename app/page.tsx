"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type Screen = "home" | "pain" | "need" | "pause" | "good" | "step" | "finish" | "bank" | "voice" | "faith" | "journal";
type Item = { id: number; text: string; media?: string; kind?: "image" | "audio"; date: string };

const painOptions = ["הגוף", "עייפות", "פחד", "בריאות", "כאב", "המראה שלי", "חוסר ודאות", "געגוע", "אחר"];
const needOptions = ["שמישהו יקשיב לי", "לבכות", "שקט", "חיבוק", "שירחמו עליי רגע", "להיזכר בכוחות שלי"];
const prompts = ["מי אוהב אותך?", "על מי את משפיעה?", "מה עדיין יפה בך?", "איזו תכונה טובה יש בך?", "מה הצלחת לעשות השבוע?", "מה גורם לך לחייך?", "מה נותן לחיים שלך משמעות?"];
const steps = ["לשתות מים", "לצאת למרפסת", "להתקלח", "לשים מוזיקה", "לעשות פיזיו", "לחבק מישהו אהוב", "להתקשר למישהו", "לנוח בלי רגשות אשם"];

const readStore = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [pains, setPains] = useState<string[]>([]);
  const [need, setNeed] = useState("");
  const [goodPoints, setGoodPoints] = useState<Item[]>([]);
  const [journal, setJournal] = useState<Item[]>([]);
  const [voices, setVoices] = useState<Item[]>([]);
  const [faith, setFaith] = useState<Item[]>([]);
  const [text, setText] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
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
  const goHome = () => { setScreen("home"); setPains([]); setNeed(""); setSeconds(180); setRunning(false); setText(""); };
  const formatTime = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const Header = ({ back = true }: { back?: boolean }) => <header className="topbar">{back ? <button className="iconButton" onClick={goHome} aria-label="חזרה לבית">⌂</button> : <span />}<span className="miniBrand">הנקודה הטובה <i>•</i></span></header>;
  const CardList = ({ items, storageKey, setter }: { items: Item[]; storageKey: string; setter: (v: Item[]) => void }) => items.length ? <div className="cardList">{items.map((item) => <article className="memoryCard" key={item.id}>{item.kind === "image" && <img src={item.media} alt="זיכרון שבחרת לשמור" />}{item.kind === "audio" && <audio controls src={item.media} />}{item.text && <p>{item.text}</p>}<div className="cardMeta"><span>{item.date}</span><button onClick={() => remove(storageKey, items, setter, item.id)} aria-label="מחיקת הפריט">×</button></div></article>)}</div> : <div className="empty"><span>♡</span><p>המקום הזה מחכה למה שתרצי לשמור בו.</p></div>;

  if (screen === "home") return <main className="shell home"><Header back={false} /><section className="hero"><div className="sun"><span>✦</span></div><p className="eyebrow">מקום קטן לנשום בו</p><h1>הנקודה<br /><em>הטובה</em></h1><p className="lead">גם אם היום קשה,<br />תמיד נשארת בתוכך נקודה אחת של טוב.</p><p className="together">בואי נמצא אותה יחד.</p><button className="primary warm" onClick={() => setScreen("pain")}><span>♡</span> קשה לי עכשיו</button><button className="secondary" onClick={() => setScreen("journal")}><span>⌁</span> היום מצאתי נקודת טוב</button></section><nav className="homeNav" aria-label="האוסף האישי"><button onClick={() => setScreen("bank")}><b>♡</b><span>הנקודות שלי</span></button><button onClick={() => setScreen("voice")}><b>◉</b><span>הקול שלי</span></button><button onClick={() => setScreen("faith")}><b>✦</b><span>מה נותן לי כוח</span></button></nav><p className="privacy">כל מה שנכתב כאן נשאר רק במכשיר שלך</p></main>;

  if (screen === "pain") return <main className="shell"><Header /><section className="flow"><p className="stepLabel">רגע אחד, בקצב שלך</p><h2>מה הכי כואב עכשיו?</h2><p className="sub">אפשר לבחור יותר מדבר אחד.</p><div className="choices">{painOptions.map((x) => <button className={pains.includes(x) ? "selected" : ""} onClick={() => setPains(pains.includes(x) ? pains.filter((p) => p !== x) : [...pains, x])} key={x}><span>{pains.includes(x) ? "✓" : ""}</span>{x}</button>)}</div><button disabled={!pains.length} className="primary" onClick={() => setScreen("need")}>להמשיך בעדינות</button></section></main>;

  if (screen === "need") return <main className="shell"><Header /><section className="flow"><div className="validation"><span>♡</span><p>זה באמת נשמע קשה.<br /><strong>אין צורך להילחם בזה כרגע.</strong></p></div><h2>מה את צריכה עכשיו?</h2><div className="needList">{needOptions.map((x) => <button className={need === x ? "selected" : ""} onClick={() => setNeed(x)} key={x}><span>♡</span>{x}</button>)}</div><button disabled={!need} className="primary" onClick={() => { if (["לבכות", "שירחמו עליי רגע", "שקט"].includes(need)) setScreen("pause"); else setScreen("good"); }}>זה מה שאני צריכה</button></section></main>;

  if (screen === "pause") return <main className="shell pause"><Header /><section className="flow centered"><p className="eyebrow">שלוש דקות בלי שום משימה</p><div className={`breathing ${running ? "active" : ""}`}><div><span>נושמת</span><b>{formatTime}</b></div></div><h2>{seconds === 0 ? "היית כאן עם עצמך." : "גם לזה יש מקום."}</h2><p className="sub">אין עצות. אין צורך לעשות דבר.<br />רק להיות כאן לרגע.</p>{seconds > 0 && <button className="primary" onClick={() => setRunning(!running)}>{running ? "להשהות" : seconds < 180 ? "להמשיך" : "להתחיל"}</button>}<button className="textButton" onClick={() => setScreen("good")}>לחזור אל הנקודה הטובה ←</button></section></main>;

  if (screen === "good") return <main className="shell"><Header /><section className="flow centered"><div className="goodMark">✦</div><p className="stepLabel">הנקודה הטובה</p><h2>{prompts[promptIndex]}</h2><p className="sub">אין תשובה נכונה. רק מה שעולה עכשיו.</p><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="אפשר לכתוב כאן..." rows={4} /><div className="mediaRow"><label className="smallAction">▧ להוסיף תמונה<input hidden type="file" accept="image/*" onChange={imageUpload} /></label><button className="smallAction" onClick={() => recording ? stopRecording() : startRecording("point")}>{recording ? "■ לסיים הקלטה" : "◉ להקליט"}</button></div><button className="primary" disabled={!text.trim()} onClick={() => { addText("good-points", goodPoints, setGoodPoints); setScreen("step"); }}>לשמור ולהמשיך</button><button className="textButton" onClick={() => setPromptIndex((promptIndex + 1) % prompts.length)}>שאלה אחרת</button></section></main>;

  if (screen === "step") return <main className="shell"><Header /><section className="flow"><p className="stepLabel">רק צעד אחד קטן</p><h2>מה יעזור לך להתקרב קצת לחיים?</h2><p className="sub">לא צריך להספיק. רק לבחור.</p><div className="choices stepChoices">{steps.map((x) => <button className={text === x ? "selected" : ""} onClick={() => setText(x)} key={x}><span>{text === x ? "✓" : ""}</span>{x}</button>)}</div><button className="primary" disabled={!text} onClick={() => { setText(""); setScreen("finish"); }}>זה הצעד שלי</button><button className="textButton" onClick={() => setScreen("finish")}>אין לי כוח לצעד עכשיו, וזה בסדר</button></section></main>;

  if (screen === "finish") return <main className="shell finish"><Header /><section className="flow centered"><div className="finishGlow"><span>✦</span></div><h2>הכאב עדיין יכול להיות כאן.</h2><p className="finishLine">אבל גם את כאן.</p><div className="softRule" /><p>ובתוכך נשארת עוד נקודה אחת<br />שאפשר לחזור אליה.</p><button className="primary" onClick={goHome}>♡ זה מספיק להיום</button></section></main>;

  const library = screen === "bank" ? { title: "הנקודות שלי", desc: "דברים אמיתיים שכבר מצאת בתוכך ובחיים שלך.", items: goodPoints, key: "good-points", setter: setGoodPoints } : screen === "journal" ? { title: "נקודת טוב מהיום", desc: "גם רגע קטן יכול לקבל כאן מקום.", items: journal, key: "good-journal", setter: setJournal } : screen === "faith" ? { title: "מה נותן לי כוח", desc: "אמונה, שיר, תפילה או משפט אישי — רק מה שמתאים לך.", items: faith, key: "good-faith", setter: setFaith } : null;
  if (library) return <main className="shell"><Header /><section className="library"><p className="stepLabel">האוסף האישי שלי</p><h2>{library.title}</h2><p className="sub">{library.desc}</p><div className="composer"><textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={screen === "journal" ? "מה היה טוב, אפילו לרגע?" : "מה תרצי לזכור?"} /><button className="primary" disabled={!text.trim()} onClick={() => addText(library.key, library.items, library.setter)}>לשמור כאן</button></div><CardList items={library.items} storageKey={library.key} setter={library.setter} /></section></main>;

  return <main className="shell"><Header /><section className="library voice"><p className="stepLabel">ממני, אליי</p><h2>הקול שלי</h2><p className="sub">ביום טוב אפשר להשאיר כאן כמה מילים ליום קשה.</p><div className="recordPanel"><div className={`mic ${recording ? "live" : ""}`}>◉</div><textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="כותרת קטנה להקלטה (לא חובה)" /><button className="primary" onClick={() => recording ? stopRecording() : startRecording("voice")}>{recording ? "■ לסיים ולשמור" : "להתחיל להקליט"}</button><p>ההקלטה נשמרת רק במכשיר שלך</p></div><CardList items={voices} storageKey="good-voices" setter={setVoices} /></section></main>;
}
