import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Copy, RotateCcw, Share2, Sparkles } from "lucide-react";

import fox from "./assets/fox.png";
import hamster from "./assets/hamster.png";
import cat from "./assets/cat.png";

const STORAGE_KEY = "spend-character-records-v2";

const categories = [
  { id: "쇼핑", label: "쇼핑", icon: "🛍️" },
  { id: "카페", label: "카페", icon: "🥤" },
  { id: "간식", label: "간식", icon: "🍪" },
  { id: "식비", label: "식비", icon: "🍜" },
  { id: "생활", label: "생활", icon: "🧻" },
  { id: "기타", label: "기타", icon: "✨" },
];

const reasons = [
  { id: "충동", label: "충동", icon: "⚡" },
  { id: "스트레스", label: "스트레스", icon: "🌧️" },
  { id: "보상", label: "보상", icon: "🏆" },
  { id: "습관", label: "습관", icon: "🔁" },
  { id: "필요", label: "필요", icon: "✅" },
];

const feelings = [
  { id: "만족", label: "만족", icon: "😆", state: "happy" },
  { id: "보통", label: "보통", icon: "😐", state: "neutral" },
  { id: "후회", label: "후회", icon: "🥲", state: "regret" },
];

const characters = {
  fox: {
    id: "fox",
    name: "지름신 여우",
    tagline: "참지 못했지만, 꽤 빛나는 소비",
    image: fox,
    color: "#ff7a3d",
    soft: "#fff0dd",
    keywords: ["쇼핑", "충동", "보상"],
    when: "쇼핑 / 충동 / 보상 소비",
    messages: {
      happy: {
        main: "오늘 너는 참지 않았다",
        sub: "고민은 길었고, 결제는 짧았다. 그리고 이상하게 후회는 없다.",
      },
      neutral: {
        main: "필요했을 수도, 아니었을 수도",
        sub: "지금은 판단이 흐릿하다. 일단 예쁜 건 맞다.",
      },
      regret: {
        main: "결제는 짧았고 후회는 길다",
        sub: "장바구니는 비었지만, 마음 한쪽은 아직 계산 중이다.",
      },
    },
  },
  hamster: {
    id: "hamster",
    name: "소확행 햄스터",
    tagline: "작지만 확실한 행복 추구자",
    image: hamster,
    color: "#f2a735",
    soft: "#fff4d6",
    keywords: ["카페", "간식", "습관"],
    when: "카페 / 간식 / 소소한 보상",
    messages: {
      happy: {
        main: "작은 행복으로 하루를 버텼다",
        sub: "큰일은 아니지만, 이 한 잔과 디저트가 오늘을 살렸다.",
      },
      neutral: {
        main: "익숙한 만족에 가까웠다",
        sub: "특별하진 않아도 괜찮다. 반복되는 위로도 위로다.",
      },
      regret: {
        main: "없어도 됐지만 있을 땐 좋았다",
        sub: "살짝 아깝지만, 그 순간의 귀여운 행복은 남았다.",
      },
    },
  },
  cat: {
    id: "cat",
    name: "감정소비 고양이",
    tagline: "마음이 먼저 결제한 하루",
    image: cat,
    color: "#7f7b94",
    soft: "#f0eef8",
    keywords: ["스트레스", "위로", "감정"],
    when: "스트레스 / 감정 소비",
    messages: {
      happy: {
        main: "필요한 건 아니었지만 마음에는 필요했다",
        sub: "오늘의 소비는 물건보다 위로에 가까웠다.",
      },
      neutral: {
        main: "기분은 나아졌는지 아직 모르겠다",
        sub: "그래도 멈추지 않고 버틴 것만으로도 꽤 했다.",
      },
      regret: {
        main: "잠깐 괜찮았고, 다시 현실이 왔다",
        sub: "결제는 위로였지만 마음의 피로는 아직 남아 있다.",
      },
    },
  },
};

function getCharacter(input) {
  if (input.reason === "스트레스") return characters.cat;
  if (input.category === "카페" || input.category === "간식") return characters.hamster;
  if (input.category === "쇼핑" || input.reason === "충동" || input.reason === "보상") return characters.fox;
  return characters.hamster;
}

function getState(feeling) {
  return feelings.find((item) => item.id === feeling)?.state || "neutral";
}

function getToday() {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date());
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 20)));
}

function CharacterImage({ character, compact = false }) {
  return (
    <div
      className={`character ${compact ? "compact" : ""}`}
      style={{ "--char": character.color, "--soft": character.soft }}
    >
      <span className="glow" />
      <img src={character.image} alt={character.name} draggable="false" />
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState("home");
  const [category, setCategory] = useState("쇼핑");
  const [reason, setReason] = useState("충동");
  const [feeling, setFeeling] = useState("만족");
  const [memo, setMemo] = useState("");
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const previews = useMemo(() => [characters.fox, characters.hamster, characters.cat], []);

  function createResult() {
    const input = { category, reason, feeling, memo };
    const character = getCharacter(input);
    const state = getState(feeling);
    const message = character.messages[state];

    const next = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      createdAt: new Date().toISOString(),
      date: getToday(),
      category,
      reason,
      feeling,
      memo: memo.trim(),
      characterId: character.id,
      characterName: character.name,
      main: message.main,
      sub: message.sub,
    };

    const nextRecords = [next, ...records];
    setResult({ ...next, character, message });
    setRecords(nextRecords);
    saveRecords(nextRecords);
    setStep("result");
  }

  function openRecord(record) {
    const character = characters[record.characterId] || characters.fox;
    setResult({
      ...record,
      character,
      message: { main: record.main, sub: record.sub },
    });
    setStep("result");
  }

  async function shareResult() {
    if (!result) return;

    const text = `[소비 캐릭터 진단]\n${result.character.name}\n"${result.main}"\n${result.sub}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "오늘의 소비 캐릭터",
          text,
        });
        return;
      } catch {
        // 사용자가 공유를 취소할 수 있으므로 조용히 복사로 fallback
      }
    }

    await navigator.clipboard.writeText(text);
    alert("결과 문장이 복사됐어.");
  }

  function resetRecords() {
    if (!confirm("최근 기록을 모두 지울까?")) return;
    setRecords([]);
    saveRecords([]);
  }

  if (step === "input") {
    return (
      <main className="appShell">
        <section className="phone">
          <div className="screen">
            <button className="back" onClick={() => setStep("home")}>
              <ArrowLeft size={18} /> 처음으로
            </button>

            <section className="inputCard">
              <p className="eyebrow">오늘의 소비 입력</p>
              <div className="titleRow">
                <h1>어떤 소비였어?</h1>
                <Sparkles size={28} />
              </div>

              <OptionGroup
                title="소비 항목"
                items={categories}
                value={category}
                onChange={setCategory}
              />

              <OptionGroup
                title="소비 이유"
                items={reasons}
                value={reason}
                onChange={setReason}
              />

              <OptionGroup
                title="기분은 어땠어?"
                items={feelings}
                value={feeling}
                onChange={setFeeling}
              />

              <label className="memoBox">
                <span>짧은 메모 선택</span>
                <input
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                  placeholder="예: 시험 끝나고 보상으로..."
                />
              </label>

              <button className="primary sticky" onClick={createResult}>
                결과 보기
              </button>
            </section>
          </div>
        </section>
      </main>
    );
  }

  if (step === "result" && result) {
    return (
      <main className="appShell">
        <section className="phone">
          <div className="screen">
            <button className="back" onClick={() => setStep("home")}>
              <ArrowLeft size={18} /> 처음으로
            </button>

            <section
              className="resultCard"
              style={{ "--char": result.character.color, "--soft": result.character.soft }}
            >
              <div className="resultTop">
                <span>{result.date}</span>
                <span>오늘의 소비 캐릭터</span>
              </div>

              <CharacterImage character={result.character} />

              <p className="namePill">{result.character.name}</p>
              <h1>{result.main}</h1>
              <p className="bodyText">{result.sub}</p>

              <p className="metaText">
                {result.category} · {result.reason} · {result.feeling}
                {result.memo ? ` · ${result.memo}` : ""}
              </p>

              <div className="actions">
                <button onClick={shareResult}>
                  <Share2 size={18} /> 공유 / 복사
                </button>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${result.character.name} - ${result.main}`);
                    alert("짧은 결과가 복사됐어.");
                  }}
                >
                  <Copy size={18} /> 한 줄 복사
                </button>
              </div>

              <button className="ghost" onClick={() => setStep("input")}>
                다시 진단하기
              </button>
            </section>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="appShell">
      <section className="phone">
        <div className="screen">
          <div className="badge">MVP · 소비 캐릭터 진단</div>

          <section className="heroCard">
            <p className="eyebrow">Spend Character</p>
            <h1>오늘의 소비,<br />어떤 캐릭터였을까?</h1>
            <p>
              소비 항목과 기분을 고르면 오늘의 소비 성향을 캐릭터로 보여줘.
              가볍게 기록하고, 결과는 공유하기 좋게 남겨봐.
            </p>

            <CharacterImage character={characters.fox} />

            <button className="primary" onClick={() => setStep("input")}>
              시작하기
            </button>
          </section>

          <section className="characterPreview">
            {previews.map((character) => (
              <article key={character.id}>
                <CharacterImage character={character} compact />
                <div>
                  <strong>{character.name}</strong>
                  <span>{character.when}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="historyBlock">
            <div className="sectionHead">
              <div>
                <h2>최근 기록</h2>
                <span>새로고침해도 남아 있어</span>
              </div>
              {records.length > 0 && (
                <button className="iconButton" onClick={resetRecords} title="기록 초기화">
                  <RotateCcw size={17} />
                </button>
              )}
            </div>

            {records.length === 0 ? (
              <p className="empty">
                아직 기록이 없어. 첫 소비 캐릭터를 만들어보자.
              </p>
            ) : (
              <div className="recordList">
                {records.slice(0, 5).map((record) => {
                  const character = characters[record.characterId] || characters.fox;
                  return (
                    <button
                      className="latestCard"
                      key={record.id}
                      onClick={() => openRecord(record)}
                    >
                      <CharacterImage character={character} compact />
                      <div>
                        <strong>{record.characterName}</strong>
                        <p>{record.category} · {record.reason} · {record.feeling}</p>
                      </div>
                      <time>
                        <CalendarDays size={14} /> {record.date}
                      </time>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function OptionGroup({ title, items, value, onChange }) {
  return (
    <section className="optionGroup">
      <h3>{title}</h3>
      <div className="options">
        {items.map((item) => (
          <button
            className={`option ${value === item.id ? "selected" : ""}`}
            key={item.id}
            onClick={() => onChange(item.id)}
            type="button"
          >
            <span>{item.icon}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
