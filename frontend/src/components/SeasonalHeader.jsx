import React, { useMemo } from 'react';

// --- 季節ごとのエフェクト ---
import FallingSnow from './FallingSnow';
import FallingSakura from './FallingSakura';
import FallingRain from './FallingRain';
import SunflowerField from './SunflowerField';
import AutumnLeaves from './AutumnLeaves';
import StartingSnow from './StartingSnow';

// --- 季節ごとのマスコット ---
import SnowmanMascot from './SnowmanMascot';
import SnailMascot from './SnailMascot';
import SquirrelMascot from './SquirrelMascot';

const SeasonalHeader = () => {
  // 現在の月（1〜12）を自動取得
  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);

  // 月ごとにレンダリングするコンポーネントを決定
  let BackgroundEffect = null;
  let Mascot = null;

  if (currentMonth === 1 || currentMonth === 2) {
    // 1〜2月：雪だるま ＋ 降る雪（こんこん）
    BackgroundEffect = FallingSnow;
    Mascot = SnowmanMascot;
  } else if (currentMonth === 3 || currentMonth === 4) {
    // 3〜4月：マスコットなし ＋ さくらの花びら
    BackgroundEffect = FallingSakura;
    Mascot = () => null; // マスコットなし
  } else if (currentMonth === 5 || currentMonth === 6) {
    // 5〜6月：カタツムリ ＋ ポツポツ降る雨
    BackgroundEffect = FallingRain;
    Mascot = SnailMascot;
  } else if (currentMonth === 7 || currentMonth === 8) {
    // 7〜8月：マスコットなし ＋ ひまわり畑（横スクロール）
    BackgroundEffect = SunflowerField;
    Mascot = () => null; // マスコットなし
  } else if (currentMonth === 9 || currentMonth === 10) {
    // 9〜10月：リス ＋ 紅葉の落ち葉
    BackgroundEffect = AutumnLeaves;
    Mascot = SquirrelMascot;
  } else if (currentMonth === 11 || currentMonth === 12) {
    // 11〜12月：マスコットなし ＋ 降り始めの雪（ゆっくり落ちる結晶）
    BackgroundEffect = StartingSnow;
    Mascot = () => null; // マスコットなし
  }

  return (
    <>
      {BackgroundEffect && <BackgroundEffect />}
      {Mascot && <Mascot />}
    </>
  );
};

export default SeasonalHeader;
