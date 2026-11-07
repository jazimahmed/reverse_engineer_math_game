import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

export type PlayfulIconName =
  | 'addition' | 'subtraction' | 'multiplication' | 'division' | 'squareRoot' | 'decimal' | 'fraction' | 'games'
  | 'practice' | 'quiz' | 'duel' | 'test' | 'time' | 'play' | 'learn' | 'hard' | 'exam'
  | 'star' | 'trophy' | 'settings' | 'profile' | 'back' | 'check' | 'retry' | 'close'
  | 'puzzle' | 'memory' | 'sudoku' | 'mix' | 'fifteen' | '2048';

const purple = '#7350CA', mint = '#56D6A6', gold = '#FFD45C', pink = '#FF83B7', blue = '#64C8F2';
const navy = '#352752';
const starPoints = '50,14 60,36 84,39 66,56 71,81 50,69 29,81 34,56 16,39 40,36';

function NumberLabel({ x, y, children, fill = navy, size = 22 }: { x: number; y: number; children: React.ReactNode; fill?: string; size?: number }) {
  return <SvgText x={x} y={y} fill={fill} fontSize={size} fontWeight="800" textAnchor="middle">{children}</SvgText>;
}

function Face({ x, y, fill }: { x: number; y: number; fill: string }) {
  return <G><Circle cx={x} cy={y} r={21} fill={fill} /><Circle cx={x - 7} cy={y - 3} r={2.5} fill={navy} /><Circle cx={x + 7} cy={y - 3} r={2.5} fill={navy} />
    <Path d={`M${x - 7} ${y + 6} Q${x} ${y + 13} ${x + 7} ${y + 6}`} stroke={navy} strokeWidth={3} strokeLinecap="round" fill="none" /></G>;
}

function Illustration({ name, color }: { name: PlayfulIconName; color?: string }) {
  const ink = color || navy;
  switch (name) {
    case 'addition': return <G>
      <Rect x={12} y={23} width={34} height={40} rx={9} fill={mint} transform="rotate(-10 29 43)" />
      <Rect x={54} y={30} width={34} height={40} rx={9} fill={gold} transform="rotate(10 71 50)" />
      <Circle cx={28} cy={37} r={5} fill="#FFFFFF" /><Circle cx={28} cy={52} r={5} fill="#FFFFFF" />
      <Circle cx={70} cy={43} r={5} fill="#FFFFFF" /><Circle cx={70} cy={58} r={5} fill="#FFFFFF" />
      <Circle cx={50} cy={66} r={22} fill={purple} stroke="#FFFFFF" strokeWidth={4} />
      <Path d="M40 66 H60 M50 56 V76" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" /></G>;
    case 'subtraction': return <G>
      <Circle cx={25} cy={31} r={16} fill={pink} /><Circle cx={62} cy={30} r={16} fill={gold} />
      <Circle cx={27} cy={70} r={16} fill={blue} /><Circle cx={68} cy={69} r={16} fill="none" stroke={purple} strokeWidth={3} strokeDasharray="4 5" />
      <Circle cx={50} cy={50} r={21} fill={purple} stroke="#FFFFFF" strokeWidth={4} /><Path d="M40 50 H60" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" /></G>;
    case 'multiplication': return <G>
      {[0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => <Rect key={`${row}${col}`} x={13 + col * 23} y={16 + row * 23} width={18} height={18} rx={5} fill={[gold, mint, blue][row]} />))}
      <Circle cx={73} cy={73} r={19} fill={pink} stroke="#FFFFFF" strokeWidth={4} /><Path d="M67 67 L79 79 M79 67 L67 79" stroke={navy} strokeWidth={5} strokeLinecap="round" /></G>;
    case 'division': return <G>
      <Rect x={14} y={17} width={72} height={66} rx={17} fill={blue} />
      <Path d="M22 50 H78 M50 25 V75" stroke="#FFFFFF" strokeWidth={3} strokeDasharray="3 4" />
      {[32, 68].flatMap((x) => [33, 67].map((y) => <Circle key={`${x}${y}`} cx={x} cy={y} r={10} fill={gold} />))}
      <Circle cx={50} cy={50} r={21} fill={purple} stroke="#FFFFFF" strokeWidth={4} /><Circle cx={50} cy={40} r={3} fill="#FFFFFF" /><Circle cx={50} cy={60} r={3} fill="#FFFFFF" /><Path d="M40 50 H60" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" /></G>;
    case 'squareRoot': return <G>
      <Rect x={30} y={18} width={53} height={57} rx={12} fill={gold} transform="rotate(7 56 46)" />
      <NumberLabel x={60} y={60} size={34}>9</NumberLabel>
      <Path d="M13 53 H22 L32 72 L44 25 H82" stroke={purple} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx={19} cy={23} r={5} fill={mint} /></G>;
    case 'decimal': return <G>
      <Rect x={9} y={27} width={33} height={49} rx={11} fill={blue} transform="rotate(-7 25 52)" />
      <Rect x={60} y={21} width={33} height={49} rx={11} fill={pink} transform="rotate(7 76 45)" />
      <NumberLabel x={26} y={62} size={32}>0</NumberLabel><NumberLabel x={77} y={57} size={32}>5</NumberLabel>
      <Circle cx={51} cy={66} r={6} fill={purple} /><Circle cx={48} cy={20} r={5} fill={gold} /></G>;
    case 'fraction': return <G>
      <Circle cx={48} cy={50} r={34} fill={gold} stroke="#FFFFFF" strokeWidth={4} />
      <Path d="M48 50 V16 A34 34 0 0 1 82 50 Z" fill={pink} stroke="#FFFFFF" strokeWidth={4} />
      <Path d="M48 50 L24 74 M48 50 L24 26 M48 50 L72 74" stroke="#FFFFFF" strokeWidth={4} />
      <Circle cx={36} cy={36} r={4} fill="#D99830" /><Circle cx={35} cy={63} r={4} fill="#D99830" /><Circle cx={61} cy={65} r={4} fill="#D99830" />
      <Path d="M58 22 L58 40 L77 40" stroke={purple} strokeWidth={3} fill="none" strokeLinecap="round" /></G>;
    case 'games': return <G>
      <Path d="M28 32 H72 Q82 32 86 49 L92 69 Q94 85 80 83 L63 70 H37 L20 83 Q6 85 8 69 L14 49 Q18 32 28 32 Z" fill={purple} stroke="#FFFFFF" strokeWidth={3} />
      <Path d="M22 51 H40 M31 42 V60" stroke={mint} strokeWidth={7} strokeLinecap="round" /><Circle cx={69} cy={47} r={5} fill={gold} /><Circle cx={78} cy={58} r={5} fill={pink} />
      <Path d="M46 32 V24 Q46 15 57 15" stroke={purple} strokeWidth={5} fill="none" strokeLinecap="round" /></G>;
    case 'practice': return <G>
      <Circle cx={45} cy={54} r={34} fill={pink} /><Circle cx={45} cy={54} r={24} fill="#FFFFFF" /><Circle cx={45} cy={54} r={15} fill={pink} /><Circle cx={45} cy={54} r={6} fill={purple} />
      <Path d="M45 54 L77 22" stroke={purple} strokeWidth={6} strokeLinecap="round" /><Path d="M70 17 L82 11 L80 27 L91 25 L81 37 L69 34 Z" fill={gold} /></G>;
    case 'quiz': return <G>
      <Rect x={21} y={26} width={58} height={58} rx={13} fill={purple} transform="rotate(-7 50 55)" />
      <Path d="M39 42 Q39 30 52 32 Q66 35 59 46 L51 53 V57" fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" /><Circle cx={51} cy={69} r={4} fill={gold} />
      <Path d="M16 11 V23 M10 17 H22 M81 10 V20 M76 15 H86" stroke={pink} strokeWidth={4} strokeLinecap="round" /></G>;
    case 'duel': return <G>
      <Path d="M5 84 Q10 62 31 65 Q45 65 48 84" fill={purple} /><Path d="M52 84 Q55 62 74 65 Q92 66 95 84" fill={blue} />
      <Face x={28} y={42} fill={gold} /><Face x={73} y={42} fill={mint} />
      <Path d="M54 9 L45 25 H54 L48 39 L65 20 H55 L60 9 Z" fill={pink} stroke="#FFFFFF" strokeWidth={2} /></G>;
    case 'test': return <G>
      <Rect x={8} y={22} width={42} height={57} rx={11} fill={mint} transform="rotate(-9 29 50)" /><Rect x={52} y={22} width={42} height={57} rx={11} fill={pink} transform="rotate(9 73 50)" />
      <Path d="M18 50 L27 60 L42 40 M65 42 L80 59 M80 42 L65 59" fill="none" stroke={navy} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /></G>;
    case 'time': return <G>
      <Rect x={40} y={9} width={20} height={10} rx={4} fill={gold} /><Path d="M50 19 V26" stroke={purple} strokeWidth={7} /><Circle cx={50} cy={57} r={32} fill={blue} />
      <Circle cx={50} cy={57} r={24} fill="#FFFFFF" /><Path d="M50 39 V57 L62 65" stroke={purple} strokeWidth={5} strokeLinecap="round" fill="none" /><Circle cx={50} cy={57} r={4} fill={pink} />
      <Path d="M24 28 L17 21 M76 28 L83 21" stroke={gold} strokeWidth={8} strokeLinecap="round" /></G>;
    case 'play': return <G>
      <Rect x={20} y={12} width={60} height={76} rx={14} fill={blue} /><Rect x={28} y={21} width={44} height={19} rx={6} fill="#FFFFFF" />
      <NumberLabel x={50} y={36} size={16}>123</NumberLabel>
      {[0, 1].flatMap((row) => [0, 1, 2].map((col) => <Rect key={`${row}${col}`} x={29 + col * 15} y={48 + row * 17} width={12} height={12} rx={4} fill={[gold, mint, pink][col]} />))}</G>;
    case 'learn': return <G>
      <Path d="M10 26 Q28 16 50 28 Q72 16 90 26 V80 Q69 71 50 83 Q31 71 10 80 Z" fill={purple} />
      <Path d="M15 22 Q33 16 48 28 V75 Q31 66 15 73 Z" fill="#FFFFFF" /><Path d="M52 28 Q69 16 85 22 V73 Q69 66 52 75 Z" fill="#FFF1BF" />
      <Path d="M24 39 H38 M24 49 H38 M24 59 H35" stroke={blue} strokeWidth={4} strokeLinecap="round" /><Circle cx={68} cy={44} r={9} fill={pink} /><Path d="M60 61 H76" stroke={gold} strokeWidth={4} strokeLinecap="round" /></G>;
    case 'hard': return <G transform="rotate(20 50 50)">
      <Path d="M39 66 Q34 82 50 94 Q66 82 61 66" fill={gold} /><Path d="M44 69 Q42 80 50 86 Q58 80 56 69" fill="#FF9368" />
      <Path d="M34 46 L20 74 L38 70 M66 46 L80 74 L62 70" fill={pink} /><Path d="M50 7 Q24 29 34 68 H66 Q76 29 50 7" fill={purple} />
      <Circle cx={50} cy={36} r={11} fill={blue} stroke="#FFFFFF" strokeWidth={4} /><Path d="M43 64 H57" stroke={mint} strokeWidth={5} strokeLinecap="round" /></G>;
    case 'exam': return <G>
      <Path d="M26 10 H44 L52 40 L36 48 Z" fill={blue} /><Path d="M58 10 H76 L65 48 L48 40 Z" fill={pink} />
      <Circle cx={51} cy={61} r={29} fill={gold} stroke="#E4A839" strokeWidth={4} />
      <Polygon points={starPoints} fill="#FFFFFF" transform="translate(23 33) scale(.56)" /></G>;
    case 'star': return <G><Polygon points={starPoints} fill={gold} stroke="#E2A131" strokeWidth={3} strokeLinejoin="round" /><Circle cx={42} cy={48} r={2.5} fill={navy} /><Circle cx={58} cy={48} r={2.5} fill={navy} /><Path d="M44 57 Q50 62 56 57" stroke={navy} strokeWidth={3} strokeLinecap="round" fill="none" /></G>;
    case 'trophy': return <G>
      <Path d="M28 25 H12 V40 Q12 58 35 58 M72 25 H88 V40 Q88 58 65 58" fill="none" stroke="#F2AF3A" strokeWidth={8} strokeLinecap="round" />
      <Path d="M27 16 H73 V43 Q73 65 50 67 Q27 65 27 43 Z" fill={gold} />
      <Rect x={44} y={64} width={12} height={14} fill="#F2AF3A" /><Rect x={30} y={78} width={40} height={10} rx={5} fill={purple} />
      <Polygon points={starPoints} fill="#FFFFFF" transform="translate(31 22) scale(.38)" />
      <Path d="M10 10 L15 14 M87 8 L82 15" stroke={pink} strokeWidth={4} strokeLinecap="round" /></G>;
    case 'settings': return <G>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation) => <Rect key={rotation} x={42} y={10} width={16} height={24} rx={4} fill={purple} transform={`rotate(${rotation} 50 50)`} />)}
      <Circle cx={50} cy={50} r={29} fill={purple} /><Circle cx={50} cy={50} r={15} fill={blue} stroke="#FFFFFF" strokeWidth={5} /></G>;
    case 'profile': return <G><Circle cx={50} cy={50} r={40} fill={blue} /><Path d="M20 85 Q24 62 50 64 Q76 62 80 85" fill={purple} /><Face x={50} y={43} fill={gold} /><Path d="M30 37 Q27 12 53 19 Q75 18 73 38 Q57 35 52 27 Q44 39 30 37" fill={purple} /></G>;
    case 'back': return <G><Circle cx={50} cy={50} r={35} fill={blue} /><Path d="M57 30 L36 50 L57 70 M38 50 H72" fill="none" stroke={ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></G>;
    case 'check': return <G><Circle cx={50} cy={50} r={36} fill={mint} /><Path d="M29 50 L44 65 L72 36" stroke={ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" /></G>;
    case 'retry': return <G><Circle cx={50} cy={50} r={37} fill={gold} /><Path d="M73 47 A24 24 0 1 0 65 70 M73 27 V48 H52" stroke={ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" /></G>;
    case 'close': return <G><Circle cx={50} cy={50} r={36} fill={pink} /><Path d="M36 36 L64 64 M64 36 L36 64" stroke={ink} strokeWidth={7} strokeLinecap="round" /></G>;
    case 'puzzle': return <G><Path d="M18 25 H41 Q35 9 50 9 Q65 9 59 25 H81 V46 Q96 40 96 55 Q96 69 81 63 V84 H58 Q64 68 50 68 Q36 68 42 84 H18 V62 Q34 68 34 54 Q34 40 18 46 Z" fill={mint} stroke="#FFFFFF" strokeWidth={3} /></G>;
    case 'memory': return <G><Rect x={12} y={18} width={47} height={65} rx={10} fill={pink} transform="rotate(-10 35 50)" /><Rect x={40} y={18} width={47} height={65} rx={10} fill={purple} transform="rotate(8 64 50)" /><Polygon points={starPoints} fill={gold} transform="translate(42 30) scale(.43)" /></G>;
    case 'sudoku': return <G><Rect x={13} y={13} width={74} height={74} rx={13} fill="#FFFFFF" stroke={purple} strokeWidth={4} /><Path d="M38 15 V85 M62 15 V85 M15 38 H85 M15 62 H85" stroke={blue} strokeWidth={3} /><NumberLabel x={26} y={32} size={18}>1</NumberLabel><NumberLabel x={50} y={57} size={18}>2</NumberLabel><NumberLabel x={74} y={80} size={18}>3</NumberLabel></G>;
    case 'mix': return <G><Rect x={17} y={17} width={66} height={66} rx={17} fill={pink} transform="rotate(12 50 50)" />{[[33, 33], [67, 33], [50, 50], [33, 67], [67, 67]].map(([x, y]) => <Circle key={`${x}${y}`} cx={x} cy={y} r={6} fill="#FFFFFF" />)}</G>;
    case 'fifteen': return <G>{[[15, 15, '1'], [53, 15, '2'], [15, 53, '3']].map(([x, y, label]) => <G key={label}><Rect x={Number(x)} y={Number(y)} width={32} height={32} rx={8} fill={blue} /><NumberLabel x={Number(x) + 16} y={Number(y) + 24}>{label}</NumberLabel></G>)}<Rect x={53} y={53} width={32} height={32} rx={8} fill="none" stroke={purple} strokeWidth={3} strokeDasharray="4 4" /></G>;
    case '2048': return <G><Rect x={10} y={17} width={48} height={56} rx={12} fill={gold} transform="rotate(-9 34 45)" /><NumberLabel x={33} y={55} size={32}>2</NumberLabel><Rect x={43} y={30} width={48} height={56} rx={12} fill={mint} transform="rotate(8 67 58)" /><NumberLabel x={68} y={69} size={32}>4</NumberLabel></G>;
  }
}

// Decorative illustrations are hidden from assistive tech; the containing
// action supplies a concise visible label and an explanatory accessibility hint.
export function PlayfulIcon({ name, size = 64, color }: { name: PlayfulIconName; size?: number; color?: string }) {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
      <Ellipse cx={50} cy={89} rx={32} ry={5} fill={navy} opacity={0.1} />
      <Illustration name={name} color={color} />
    </Svg>
  </View>;
}
