# 우리동네 도서관 📚

근처 도서관을 찾고 원하는 책의 대출 가능 여부를 확인할 수 있는 모바일 최우선 웹 애플리케이션입니다.

## ✨ 주요 기능

### 📍 도서관 검색
- 현재 위치 기반 근처 도서관 찾기
- Kakao Map으로 도서관 위치 시각화
- 거리별 필터링 (500m / 1km / 3km / 전체)

### 📖 도서 검색
- 책 제목, 저자, 출판사로 검색
- 실시간 자동완성 (이달의 키워드 활용)
- 도서 상세 정보 및 소장 도서관 확인

### 🔥 추천 시스템
- **인기 대출 도서**: 지금 가장 많이 빌리는 책
- **트렌딩 도서**: 요즘 급상승 중인 책
- **신간 도서**: 이번 주 새로 나온 책
- **마니아 추천**: 깊이 있는 독서를 위한 추천
- **다독자 추천**: 비슷한 책을 읽은 사람들의 추천

### 📱 모바일 최우선 UI
- Bottom Sheet 드래그 인터페이스
- 반응형 디자인 (모바일 / 태블릿 / 데스크톱)
- 부드러운 애니메이션 (Framer Motion)

## 🛠️ 기술 스택

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5
- **Validation**: Zod 4
- **Animation**: Framer Motion 11
- **Map**: Kakao Map JavaScript API
- **API**: 도서관정보나루 Open API (19개 엔드포인트)

## 🏗️ 아키텍처

FSD Lite (Feature-Sliced Design Lite) 아키텍처를 따릅니다:

```
src/
├── app/                  # Next.js App Router (Pages & Layouts)
├── entities/             # Business Entities (Book, Library, Location)
│   ├── book/
│   │   ├── model/       # Types & Schemas
│   │   └── repository/  # Data Access Layer
│   ├── library/
│   └── location/
├── features/            # Feature Modules
│   ├── book-search/     # 도서 검색 기능
│   ├── library-map/     # 지도 기능
│   ├── library-list/    # 도서관 목록
│   ├── recommendations/ # 추천 시스템
│   └── bottom-sheet/    # Bottom Sheet UI
└── shared/              # Shared Resources
    ├── ui/              # Design System Components
    ├── lib/             # Utilities & Hooks
    └── config/          # Configuration
```

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd library-finder
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 `.env.local`로 복사하고 API 키를 입력하세요:

```bash
cp .env.example .env.local
```

#### API 키 발급 방법:

**도서관정보나루 API 키**
1. [도서관정보나루](https://www.data4library.kr/) 접속
2. 회원가입 및 로그인
3. 마이페이지 > 인증키 신청
4. 발급받은 키를 `.env.local`의 `NEXT_PUBLIC_LIBRARY_API_KEY`에 입력

**Kakao Map API 키**
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 앱 생성
3. 플랫폼 추가 (Web 플랫폼)
4. JavaScript 키를 `.env.local`의 `NEXT_PUBLIC_KAKAO_MAP_KEY`에 입력

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 5. 프로덕션 빌드

```bash
npm run build
npm run start
```

## 📦 주요 명령어

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행
```

## 🌐 API 활용

이 프로젝트는 **도서관정보나루 API 19개**를 활용합니다:

### 핵심 API (P0)
- API #1: 도서관 조회 (위치 정보 포함)
- API #11: 도서별 대출 가능 여부
- API #13: 도서 소장 도서관 조회
- API #16: 도서 검색
- API #19: 신착 도서 조회

### 추천 시스템 (P1)
- API #3: 인기 대출 도서
- API #4: 마니아 추천 도서
- API #5: 다독자 추천 도서
- API #12: 대출 급상승 도서
- API #17: 이달의 키워드

### 통계 및 상세 정보 (P2)
- API #2, #6, #7, #8, #9, #10, #14, #15, #18

## 🔒 보안 체크리스트

- ✅ S-1: 환경 변수를 통한 API 키 관리
- ✅ S-2: Server Components 우선 사용
- ✅ S-3: Repository Pattern으로 데이터 접근 계층 분리
- ✅ S-4: Zod를 통한 서버 측 데이터 검증
- ✅ S-5: SOLID, DRY 원칙 준수
- ✅ S-6: SEO를 위한 generateMetadata 구현
- ✅ S-7: next/image를 통한 이미지 최적화
- ✅ S-8: JSON-LD 구조화된 데이터

## 📱 모바일 지원

- iOS Safari 최적화
- Android Chrome 최적화
- PWA 지원 준비 (향후 업데이트)
- 다크 모드 지원

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License

## 👥 팀

이 프로젝트는 Claude Code로 생성되었습니다.

---

**문의사항이나 버그 리포트는 Issues에 남겨주세요!** 🐛
