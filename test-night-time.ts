import { getOperatingStatus } from './shared/lib/utils/library-status';

// 현재 시간 2026-01-12 19:40 (월요일) 가정
const testData = [
  { libName: "광명시연서도서관 (22시까지)", operatingTime: "평일 09:00~22:00", closed: "매주 금요일" },
  { libName: "수원도서관 (18시까지)", operatingTime: "09:00~18:00", closed: "매주 월요일" },
  { libName: "데이터부족 도서관", operatingTime: "-", closed: "매주 월요일" }
];

console.log("테스트 시점: 월요일 오후 7시 40분");
console.log("------------------------------------------");

testData.forEach(lib => {
  const result = getOperatingStatus(lib.operatingTime, lib.closed);
  console.log(`도서관: ${lib.libName}`);
  console.log(`결과: ${result.label} (${result.status})`);
  console.log("------------------------------------------");
});
