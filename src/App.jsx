import { useState } from "react";
import fox from "./assets/fox.png";
import hamster from "./assets/hamster.png";
import cat from "./assets/cat.png";

const rules = [
  {
    name: "지름신 여우",
    image: fox,
    condition: (input) => input.category === "쇼핑"
  },
  {
    name: "소확행 햄스터",
    image: hamster,
    condition: (input) => input.category === "카페"
  },
  {
    name: "감정소비 고양이",
    image: cat,
    condition: (input) => input.reason === "스트레스"
  }
];

const texts = {
  happy: [
    "오늘은 꽤 만족스러운 선택이었다",
    "기분 좋은 소비였다"
  ],
  neutral: [
    "필요했는지 아직 모르겠다",
    "그냥 그런 하루다"
  ],
  regret: [
    "결제는 짧았고 후회는 길다",
    "조금 참을 수도 있었다"
  ]
};

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function App() {
  const [result, setResult] = useState(null);

  const handleClick = () => {
    const input = {
      category: "쇼핑",
      reason: "충동"
    };

    let selected = rules.find(r => r.condition(input)) || rules[0];

    setResult({
      ...selected,
      text: getRandom(texts.happy)
    });
  };

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <button onClick={handleClick}>결과 보기</button>

      {result && (
        <div style={{
          marginTop: "30px",
          padding: "20px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
          <img src={result.image} style={{ width: "200px" }} />
          <h2>{result.name}</h2>
          <p>{result.text}</p>
        </div>
      )}
    </div>
  );
}
