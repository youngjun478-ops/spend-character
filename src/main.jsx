import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Download, RotateCcw, Share2, Sparkles } from "lucide-react";
import foxImage from "./assets/fox.png";
import hamsterImage from "./assets/hamster.png";
import "./styles.css";

const STORAGE_KEY = "spend-character-records-v2";

const categories = [
  { id: "shopping", label: "쇼핑", emoji: "🛍️" },
  { id: "cafe", label: "카페/간식", emoji: "🧋" },
  { id: "food", label: "식비", emoji: "🍜" },
  { id: "culture", label: "취미/문화", emoji: "🎧" },
  { id: "life", label: "생활/교통", emoji: "🚌" },
];

const reasons = [
  { id: "impulse", label: "충동", short: "참지 못해서" },
  { id: "reward", label: "보상", short: "나를 위해서" },
  { id: "stress", label: "스트레스", short: "마음 달래려고" },
  { id: "need", label: "필요", short: "필요해서" },
  { id: "habit", label: "습관", short: "그냥 하던 대로" },
];

const feelings = [
  { id: "happy", label: "만족", emoji: "😆" },
  { id: "neutral", label: "애매", emoji: "😐" },
  { id: "regret", label: "후회", emoji: "😭" },
];

const characters = {
  fox: {
    name: "지름신 여우",
    type: "욕망 직진형",
    image: foxImage,
    color: "#ff7a38",
    softColor: "#fff0df",
    description: "사고 싶은 마음이 결제보다 먼저 도착하는 타입",
  },
  hamster: {
    name: "소확행 햄스터",
    type: "작은 행복 수집형",
    image: hamsterImage,
    color: "#f4a933",
    softColor: "#fff5d8",
    description: "작은 간식과 음료로 하루를 굴리는 타입",
  },
};

const resultLines = {
  fox: {
    happy: [
      ["오늘 너는 참지 않았다", "고민은 길었고, 결제는 짧았다. 그리고 이상하게 후회는 없다."],
      ["장바구니보다 손이 빨랐다", "계획에는 없던 소비였지만, 지금의 너에겐 꽤 필요한 에너지였을지도."],
    ],
    neutral: [
      ["필요했을 수도, 아니었을 수도", "아직은 판단 보류. 일단 마음은 조금 가벼워졌다."],
      ["지름 본능이 살짝 흔들렸다", "확신은 없지만, 오늘의 너는 설득당할 준비가 되어 있었다."],
    ],
    regret: [
      ["결제는 짧고 후회는 길다", "살 때는 반짝였고, 잔고는 조용히 흐려졌다."],
      ["영수증이 말을 걸기 시작했다", "조금만 더 참았어도 됐다는 생각이 뒤늦게 따라왔다."],
    ],
  },
  hamster: {
    happy: [
      ["작지만 확실한 행복을 챙겼다", "큰 변화는 아니어도 오늘을 버티기엔 충분했다."],
      ["기분 충전 완료", "음료 하나, 디저트 하나. 별거 아닌데 하루가 조금 둥글어졌다."],
    ],
    neutral: [
      ["익숙한 만족을 골랐다", "소확행인지 습관인지 아직은 애매하지만, 나쁘진 않았다."],
      ["무난하게 마음을 달랬다", "큰 감동은 아니어도 손에 들고 있으니 조금 안정됐다."],
    ],
    regret: [
      ["작은 소비도 모이면 존재감이 있다", "없어도 괜찮았지만, 있을 때는 분명 좋았다."],
      ["달콤함은 짧고 잔액은 현실적이다", "오늘의 위로는 귀여웠지만, 계산서는 덜 귀여웠다."],
    ],
  },
};

function getById(list, id) {
  return list.find((item) => item.id === id) || list[0];
}

function pickCharacter(input) {
  if (input.category === "cafe" || (input.category === "food" && ["reward", "habit", "stress"].includes(input.reason))) {
    return "hamster";
  }
  return "fox";
}

function makeResult(input) {
  const characterId = pickCharacter(input);
  const character = characters[characterId];
  const pool = resultLines[characterId][input.feeling];
  const seed = `${input.category}-${input.reason}-${input.feeling}-${input.memo}`.length;
  const [headline, body] = pool[seed % pool.length];
  const category = getById(categories, input.category);
  const reason = getById(reasons, input.reason);
  const feeling = getById(feelings, input.feeling);

  return {
    id: crypto.randomUUID?.() || String(Date.now()),
    createdAt: new Date().toISOString(),
    characterId,
    characterName: character.name,
    characterType: character.type,
    headline,
    body,
    metaText: `${category.label} · ${reason.label} · ${feeling.label}`,
    input,
  };
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function OptionGroup({ title, items, value, onChange }) {
  return (
    <section className="optionGroup">
      <h3>{title}</h3>
      <div className="options">
        {items.map((item) => (
          <button key={item.id} className={value === item.id ? "option selected" : "option"} onClick={() => onChange(item.id)}>
            <span>{item.emoji}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function CharacterImage({ id, compact = false }) {
  const character = characters[id];
  return (
    <div className={compact ? "character compact" : "character"} style={{ "--char": character.color, "--soft": character.softColor }}>
      <div className="glow" />
      <img src={character.image} alt={character.name} />
    </div>
  );
}

function StartScreen({ records, onStart, onResult }) {
  const latest = records[0];
  return (
    <main className="screen startScreen">
      <div className="badge">MVP 실험 버전</div>
      <section className="heroCard">
        <div className="copy">
          <p className="eyebrow">Spend Character</p>
          <h1>오늘의 소비가<br />캐릭터가 된다</h1>
          <p>무엇을 샀는지보다 중요한 건 왜 샀는지. 10초만 입력하면 오늘의 소비 성향을 카드로 만들어줘.</p>
        </div>
        <CharacterImage id="fox" />
        <button className="primary" onClick={onStart}>오늘 소비 입력하기</button>
      </section>

      <section className="characterPreview">
        <article>
          <CharacterImage id="fox" compact />
          <div>
            <strong>지름신 여우</strong>
            <span>쇼핑 · 충동 소비</span>
          </div>
        </article>
        <article>
          <CharacterImage id="hamster" compact />
          <div>
            <strong>소확행 햄스터</strong>
            <span>카페 · 간식 · 작은 행복</span>
          </div>
        </article>
      </section>

      <section className="historyBlock">
        <div className="sectionHead">
          <h2>최근 기록</h2>
          <span>{records.length}개 저장됨</span>
        </div>
        {latest ? (
          <button className="latestCard" onClick={() => onResult(latest)}>
            <CharacterImage id={latest.characterId} compact />
            <div>
              <strong>{latest.characterName}</strong>
              <p>{latest.headline}</p>
            </div>
          </button>
        ) : (
          <div className="empty">아직 기록이 없어. 첫 소비 캐릭터를 만들어보자.</div>
        )}
      </section>
    </main>
  );
}

function InputScreen({ onBack, onComplete }) {
  const [input, setInput] = useState({ category: "shopping", reason: "impulse", feeling: "happy", memo: "" });
  const previewId = useMemo(() => pickCharacter(input), [input]);

  const setField = (key, value) => setInput((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    const result = makeResult(input);
    onComplete(result);
  };

  return (
    <main className="screen inputScreen">
      <button className="back" onClick={onBack}>← 돌아가기</button>
      <section className="inputCard">
        <div className="titleRow">
          <div>
            <p className="eyebrow">Quick Check</p>
            <h1>오늘 소비를<br />기록해볼까?</h1>
          </div>
          <CharacterImage id={previewId} compact />
        </div>

        <OptionGroup title="무엇에 가까웠어?" items={categories} value={input.category} onChange={(v) => setField("category", v)} />
        <OptionGroup title="왜 샀어?" items={reasons} value={input.reason} onChange={(v) => setField("reason", v)} />
        <OptionGroup title="기분은 어땠어?" items={feelings} value={input.feeling} onChange={(v) => setField("feeling", v)} />

        <label className="memoBox">
          <span>짧은 메모 선택</span>
          <input value={input.memo} onChange={(e) => setField("memo", e.target.value)} placeholder="예: 과제 끝나고 보상으로" />
        </label>

        <button className="primary sticky" onClick={submit}>결과 카드 보기</button>
      </section>
    </main>
  );
}

function ResultScreen({ result, onRestart, onHome, onSave }) {
  const character = characters[result.characterId];
  const [saved, setSaved] = useState(false);

  const shareText = `${result.characterName}\n${result.headline}\n${result.body}`;

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "오늘의 소비 캐릭터", text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("결과 문장을 복사했어.");
      }
    } catch {
      // 공유 취소는 무시
    }
  };

  const save = () => {
    onSave(result);
    setSaved(true);
  };

  return (
    <main className="screen resultScreen">
      <section className="resultCard" style={{ "--char": character.color, "--soft": character.softColor }}>
        <div className="resultTop">
          <span>오늘의 소비 캐릭터</span>
          <Sparkles size={18} />
        </div>
        <CharacterImage id={result.characterId} />
        <div className="namePill">{result.characterType}</div>
        <h1>{result.characterName}</h1>
        <h2>“{result.headline}”</h2>
        <p className="bodyText">{result.body}</p>
        <div className="metaText">{result.metaText}</div>
      </section>

      <section className="actions">
        <button onClick={save} disabled={saved}><Download size={18} /> {saved ? "저장됨" : "기록 저장"}</button>
        <button onClick={share}><Share2 size={18} /> 공유하기</button>
        <button onClick={onRestart}><RotateCcw size={18} /> 다시 하기</button>
      </section>
      <button className="ghost" onClick={onHome}>처음으로</button>
    </main>
  );
}

function App() {
  const [screen, setScreen] = useState("start");
  const [records, setRecords] = useState(loadRecords);
  const [current, setCurrent] = useState(null);

  const saveResult = (result) => {
    const next = [result, ...records.filter((item) => item.id !== result.id)].slice(0, 20);
    setRecords(next);
    saveRecords(next);
  };

  const complete = (result) => {
    setCurrent(result);
    setScreen("result");
  };

  return (
    <div className="appShell">
      <div className="phone">
        {screen === "start" && <StartScreen records={records} onStart={() => setScreen("input")} onResult={(r) => { setCurrent(r); setScreen("result"); }} />}
        {screen === "input" && <InputScreen onBack={() => setScreen("start")} onComplete={complete} />}
        {screen === "result" && current && (
          <ResultScreen result={current} onSave={saveResult} onRestart={() => setScreen("input")} onHome={() => setScreen("start")} />
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
