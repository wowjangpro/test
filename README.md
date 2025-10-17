# WhisperBoard 🎭

완전 익명 게시판 플랫폼 - Supabase 기반 토이 프로젝트

## 프로젝트 개요

WhisperBoard는 계정 생성 없이 즉시 참여 가능한 익명 게시판입니다. 랜덤 닉네임/색상, 실시간 댓글, 반응 시스템 등 재미있는 인터랙티브 요소를 제공합니다.

## 기술 스택

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5.7+, Tailwind CSS 4, React Query, Zustand
- **Backend:** NestJS 11, TypeScript 5.7+, Prisma ORM 5.x
- **Database:** Supabase (PostgreSQL, Realtime, Storage)
- **Deployment:** Vercel (Frontend), Railway/Render (Backend)

## 시작하기

### Prerequisites

- Node.js 24+
- npm 10+ (or pnpm)
- Supabase 계정

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd whisper-board

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example frontend/.env.local
cp .env.example backend/.env
# .env 파일들을 편집하여 Supabase credentials 입력

# 데이터베이스 마이그레이션
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

### 개발 서버 실행

```bash
# 모든 서비스 동시 실행
npm run dev

# 또는 개별 실행
npm run dev:frontend  # Frontend only (http://localhost:3000)
npm run dev:backend   # Backend only (http://localhost:3001)
```

### 기타 명령어

```bash
# 빌드
npm run build

# 테스트
npm run test

# Lint
npm run lint

# Format
npm run format

# Prisma Studio (데이터베이스 GUI)
cd backend && npx prisma studio
```

## 프로젝트 구조

```
whisper-board/
├── frontend/          # Next.js 앱
├── backend/           # NestJS 앱
├── packages/          # 공유 패키지
├── docs/              # 문서
└── package.json       # Root workspace
```

## 문서

- [PRD (Product Requirements Document)](docs/prd.md)
- [Architecture Document](docs/architecture.md)

## 라이선스

MIT

## 기여

이 프로젝트는 학습 목적의 토이 프로젝트입니다.
