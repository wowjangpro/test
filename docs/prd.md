# WhisperBoard Product Requirements Document (PRD)

## Goals and Background Context

### Goals

WhisperBoard PRD가 성공적으로 완료되면 달성할 목표:

- Supabase의 핵심 기능(Realtime, Storage, RLS)을 실전에서 학습하고 경험
- 계정 생성 없이도 즉시 참여 가능한 완전 익명 커뮤니티 구현
- 사용자들이 재미있게 참여할 수 있는 독특한 인터랙티브 요소 제공
- 빠르게 MVP를 출시하여 실제 사용자 피드백 수집
- 랜덤 닉네임/색상 시스템으로 익명성과 재미를 동시에 제공
- 실시간 댓글 및 반응 시스템으로 생동감 있는 커뮤니티 경험 제공

### Background Context

익명 게시판은 사용자들이 계정이나 신원 노출 없이 자유롭게 의견을 공유할 수 있는 플랫폼입니다. 기존 플랫폼들(Reddit, 디시인사이드, 4chan 등)은 대규모 커뮤니티로 성장했지만, 복잡한 인터페이스나 커뮤니티 문화의 진입 장벽이 존재합니다.

WhisperBoard는 Supabase의 강력한 백엔드 기능을 활용하여, 가벼우면서도 재미있고 인터랙티브한 익명 커뮤니티 경험을 제공하는 것을 목표로 합니다. 특히 랜덤 닉네임과 색상 배정, 실시간 반응 시스템 등을 통해 익명성을 유지하면서도 커뮤니티 참여의 재미를 극대화합니다. 이는 Supabase 기술 스택을 실전에서 익히는 토이 프로젝트이자, 실제 사용자에게 가치를 제공할 수 있는 제품을 목표로 합니다.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-15 | 0.1 | 초기 PRD 작성 시작 | Mary (Business Analyst) |

## Requirements

### Functional Requirements (기능 요구사항)

**FR1**: 사용자는 계정 생성 없이 즉시 게시글을 작성할 수 있어야 함

**FR2**: 게시글 작성 시 랜덤 닉네임과 색상이 자동으로 생성되어야 함

**FR3**: 사용자는 게시글에 선택적으로 비밀번호를 설정하여 수정/삭제 권한을 보호할 수 있어야 함

**FR4**: 게시글에는 제목, 내용, 카테고리(선택), 이미지 첨부(최대 5개, 각 5MB 이하)가 포함되어야 함

**FR5**: 사용자는 게시글 목록을 카테고리별, 페이지별로 조회할 수 있어야 하며, 정렬 옵션(최신순, 인기순, 조회수순)을 제공해야 함

**FR6**: 게시글 상세 페이지에서 조회수가 자동으로 증가해야 함

**FR7**: 사용자는 게시글에 댓글을 작성할 수 있으며, 댓글에 대댓글을 무제한으로 달 수 있어야 함 (트리 구조)

**FR8**: 댓글 작성 시에도 랜덤 닉네임과 색상이 부여되며, 게시글 작성자는 "OP" 표시가 추가되어야 함

**FR9**: 사용자는 게시글과 댓글에 좋아요/싫어요 반응을 남길 수 있으며, 세션 기반으로 중복 반응이 방지되어야 함

**FR10**: 실시간으로 새로운 댓글이 화면에 자동으로 표시되어야 함 (Supabase Realtime 활용)

**FR11**: 사용자는 키워드로 게시글을 검색할 수 있어야 함

**FR12**: 사용자는 부적절한 게시글/댓글을 신고할 수 있으며, 신고된 컨텐츠는 자동으로 블러 처리되어야 함

**FR13**: 이미지는 Supabase Storage에 업로드되며, 썸네일 및 프리뷰 기능을 제공해야 함

**FR14**: 모든 삭제는 Soft Delete(deleted_at 필드)로 처리되어야 함

**FR15**: IP 주소는 SHA-256 해싱 후 저장되며, 원본은 저장하지 않아야 함

### Non-Functional Requirements (비기능 요구사항)

**NFR1**: 첫 페이지 로딩 시간은 2초 이내여야 함

**NFR2**: API 응답 시간은 200ms 이내여야 함

**NFR3**: 동시 접속자 1000명 이상을 지원해야 함

**NFR4**: 1000개 이상의 댓글도 부드럽게 렌더링되어야 함

**NFR5**: Supabase 무료 티어 내에서 운영 가능해야 함

**NFR6**: 동일 IP에서 게시글 작성 시 30초 쿨다운을 적용하여 스팸을 방지해야 함

**NFR7**: XSS 공격 방지를 위해 DOMPurify를 사용해야 함

**NFR8**: Rate Limiting을 통해 IP 기반 요청 제한을 적용해야 함

**NFR9**: 모바일 반응형 디자인을 지원해야 함

**NFR10**: Tailwind CSS를 사용한 일관된 UI/UX를 제공해야 함

## User Interface Design Goals

### Overall UX Vision

WhisperBoard는 **직관적이고 가벼운 익명 게시판 경험**을 제공합니다. 사용자는 별도의 가입 절차 없이 즉시 글을 작성하고 참여할 수 있으며, 랜덤 닉네임과 색상을 통해 익명성과 재미를 동시에 느낄 수 있습니다.

주요 UX 원칙:
- **Zero Friction Onboarding**: 회원가입, 로그인 없이 즉시 참여
- **Playful Anonymity**: 랜덤 닉네임과 색상으로 재미있는 익명성 구현
- **Real-time Feedback**: 댓글과 반응이 실시간으로 반영되어 생동감 제공
- **Clean & Minimal**: 복잡한 기능보다는 핵심 게시판 기능에 집중한 깔끔한 인터페이스

### Key Interaction Paradigms

1. **무한 스크롤 게시글 목록**: 페이지네이션 대신 무한 스크롤로 부드러운 탐색 경험
2. **실시간 댓글 애니메이션**: 새 댓글이 등장할 때 부드러운 fade-in 효과
3. **원클릭 반응**: 좋아요/싫어요를 빠르게 남길 수 있는 즉각적인 피드백
4. **컬러 기반 사용자 식별**: 닉네임과 함께 색상으로 같은 사용자의 댓글을 시각적으로 구분
5. **프리뷰 기반 이미지 업로드**: 드래그 앤 드롭과 즉시 프리뷰로 직관적인 이미지 첨부
6. **모달 기반 글쓰기**: 별도 페이지 이동 없이 모달로 빠른 글 작성 (선택적으로 별도 페이지도 가능)

### Core Screens and Views

제품 관점에서 필수적인 핵심 화면:

1. **게시글 목록 페이지** (Main Feed)
2. **게시글 상세 페이지** (Post Detail + Comments)
3. **글 작성 페이지/모달** (New Post)
4. **검색 결과 페이지** (Search Results)
5. **카테고리별 필터링 뷰** (Category Filter)

### Accessibility

**WCAG AA** 수준을 목표로 하되, 토이 프로젝트이므로 우선순위는 낮게 설정합니다:
- 키보드 네비게이션 지원
- 색상 대비 기본 준수
- 이미지 alt 텍스트 제공

### Branding

**미니멀하고 모던한 다크/라이트 모드 지원**

- **컬러 팔레트**: Tailwind 기본 컬러를 활용하되, 랜덤 닉네임 색상은 Tailwind의 밝은 톤 활용
- **타이포그래피**: 한글 가독성이 좋은 시스템 폰트 (예: Pretendard, Noto Sans KR)
- **분위기**: 깔끔하고 재미있는 커뮤니티, 무겁지 않고 친근한 느낌
- **아이콘**: Heroicons 또는 Lucide Icons 사용

### Target Device and Platforms

**Web Responsive** - 모바일과 데스크톱 모두 지원

- 모바일 우선 디자인 (Mobile First)
- 태블릿 및 데스크톱에서도 최적화된 레이아웃
- PWA 기능 추가 고려 (추후 단계)

## Technical Assumptions

### Repository Structure

**Monorepo** - 단일 저장소에 Frontend와 Backend를 함께 관리

**근거:**
- 토이 프로젝트 규모에 적합한 단순한 구조
- Frontend/Backend 간 타입 공유 용이
- 배포 및 버전 관리 단순화

### Service Architecture

**Monolith 기반 분리형 아키텍처**

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (전역 상태 관리)
- React Query (서버 상태 관리)
- React Hook Form + Zod (폼 처리 및 유효성 검사)

**Backend:**
- NestJS
- TypeScript
- Prisma ORM (Supabase PostgreSQL 연동)
- JWT (선택적 세션 관리)
- class-validator, class-transformer (DTO 유효성 검사)
- Swagger (API 문서 자동 생성)

**Database & Infrastructure:**
- Supabase (PostgreSQL, Realtime, Storage, Auth)
- Prisma를 통한 Database 스키마 관리
- Supabase RLS (Row Level Security) 활용

**근거:**
- Supabase를 학습하는 것이 주 목표이므로 Supabase 기능 최대 활용
- NestJS + Next.js는 TypeScript 기반으로 타입 안정성 확보
- Prisma로 타입 안전한 DB 쿼리 및 마이그레이션 관리

### Testing Requirements

**기본적인 테스트만 구현 (토이 프로젝트 특성 고려)**

- **Unit Test**: 핵심 유틸리티 함수만 선택적으로 작성
  - 랜덤 닉네임 생성 로직
  - IP 해싱 로직
  - 비밀번호 해싱/검증 로직

- **Integration Test**: 주요 API 엔드포인트만 선택적으로 작성
  - 게시글 CRUD API
  - 댓글 CRUD API

- **E2E Test**: MVP에서는 제외, 추후 필요시 추가

- **Manual Test**: 개발 중 수동 테스트 중심
  - Swagger UI를 통한 API 테스트
  - 브라우저에서 직접 기능 검증

**근거:**
- 토이 프로젝트이므로 빠른 개발 속도 우선
- 핵심 로직만 유닛 테스트로 안정성 확보
- Swagger를 통한 수동 API 테스트로 개발 편의성 제공

### Additional Technical Assumptions and Requests

**개발 환경:**
- Node.js 18+ 사용
- pnpm 또는 npm 패키지 매니저
- ESLint + Prettier로 코드 스타일 통일
- Git을 통한 버전 관리

**배포 환경 (추후 고려):**
- Frontend: Vercel (Next.js 최적화)
- Backend: Railway, Render, 또는 Fly.io (무료/저비용 옵션)
- Database: Supabase 무료 티어

**보안:**
- 환경 변수(.env)로 민감 정보 관리
- Supabase API Key와 Database URL은 환경 변수로 분리
- Frontend에서는 Supabase Anon Key만 사용
- Backend에서는 Supabase Service Role Key 사용

**성능 최적화:**
- Next.js Image 컴포넌트로 이미지 최적화
- React Query의 캐싱 전략 활용
- Supabase Realtime은 댓글에만 선택적 적용 (리소스 효율)
- 무한 스크롤 시 가상 스크롤(Virtual Scroll) 고려

**개발 편의성:**
- Hot Reload 개발 환경
- Prisma Studio로 DB 데이터 확인
- Supabase Dashboard로 Realtime 모니터링
- Swagger UI로 API 문서 및 테스트

## Epic List

**Epic 1: 프로젝트 기반 구축 및 게시글 핵심 기능**
- 목표: Monorepo 프로젝트 구조 설정, Supabase 연동, Prisma 스키마 구축, 그리고 게시글 작성/조회 기본 기능 구현으로 첫 번째 배포 가능한 MVP 완성

**Epic 2: 댓글 시스템 및 실시간 기능**
- 목표: 트리 구조 댓글 시스템 구현 및 Supabase Realtime을 활용한 실시간 댓글 업데이트 기능 제공

**Epic 3: 반응 및 인터랙션 기능**
- 목표: 좋아요/싫어요 반응 시스템, 신고 기능, 그리고 컨텐츠 블러 처리로 커뮤니티 인터랙션 활성화

**Epic 4: 이미지 업로드 및 검색 기능**
- 목표: Supabase Storage를 활용한 이미지 업로드/관리 및 게시글 검색 기능으로 사용자 경험 완성

## Epic 1: 프로젝트 기반 구축 및 게시글 핵심 기능

Monorepo 기반 프로젝트 구조를 설정하고, Frontend(Next.js)와 Backend(NestJS)를 초기화합니다. Supabase PostgreSQL과 Prisma를 연동하여 데이터베이스 스키마를 구축하고, 게시글의 생성, 조회, 수정, 삭제 기능을 구현합니다. 랜덤 닉네임/색상 생성, IP 해싱, 비밀번호 보호 등 핵심 익명 시스템도 함께 구현하여 첫 번째 배포 가능한 MVP를 완성합니다.

### Story 1.1: Monorepo 프로젝트 구조 초기화

**As a** 개발자,
**I want** Monorepo 구조로 Frontend와 Backend 프로젝트를 설정하고,
**so that** 하나의 저장소에서 전체 프로젝트를 효율적으로 관리할 수 있다.

#### Acceptance Criteria
1. 루트 디렉토리에 `frontend/`와 `backend/` 폴더가 생성됨
2. `frontend/`에 Next.js 14 (App Router) 프로젝트가 초기화됨
3. `backend/`에 NestJS 프로젝트가 초기화됨
4. 루트에 공통 설정 파일 (`.gitignore`, `README.md`, `.env.example`) 생성됨
5. ESLint + Prettier 설정이 두 프로젝트에 적용됨
6. `npm run dev:frontend`, `npm run dev:backend` 스크립트로 각각 개발 서버 실행 가능
7. 두 프로젝트 모두 TypeScript로 설정됨

### Story 1.2: Supabase 프로젝트 설정 및 Prisma 연동

**As a** 개발자,
**I want** Supabase PostgreSQL 데이터베이스를 생성하고 Prisma를 연동하여,
**so that** 타입 안전한 데이터베이스 쿼리를 작성할 수 있다.

#### Acceptance Criteria
1. Supabase 프로젝트가 생성되고 Database URL을 획득함
2. `backend/`에 Prisma가 설치되고 초기화됨 (`prisma/schema.prisma` 생성)
3. `.env` 파일에 `DATABASE_URL`과 `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`가 설정됨
4. Prisma Client가 생성되고 NestJS에서 사용 가능하도록 PrismaService가 구현됨
5. `prisma generate` 및 `prisma migrate dev` 명령이 정상 동작함

### Story 1.3: 게시글 데이터베이스 스키마 설계 및 마이그레이션

**As a** 개발자,
**I want** 게시글(posts) 테이블을 Prisma 스키마로 정의하고 마이그레이션하여,
**so that** 게시글 데이터를 저장할 수 있다.

#### Acceptance Criteria
1. `posts` 테이블이 다음 필드를 포함함: `id`, `title`, `content`, `category`, `anonymous_name`, `anonymous_color`, `password_hash`, `ip_hash`, `view_count`, `created_at`, `updated_at`, `deleted_at`
2. Prisma 스키마에 적절한 타입과 제약조건이 정의됨 (예: `title`은 필수, `category`는 선택)
3. `prisma migrate dev` 실행 시 Supabase DB에 `posts` 테이블이 생성됨
4. Soft Delete를 위한 `deleted_at` 필드가 nullable로 설정됨

### Story 1.4: 랜덤 닉네임 및 색상 생성 유틸리티 구현

**As a** 개발자,
**I want** 랜덤 닉네임과 색상을 생성하는 유틸리티 함수를 구현하여,
**so that** 게시글 작성 시 익명 사용자에게 재미있는 닉네임과 색상을 부여할 수 있다.

#### Acceptance Criteria
1. `backend/src/utils/anonymous-name.generator.ts` 파일이 생성됨
2. 형용사 + 명사 조합으로 랜덤 닉네임을 생성하는 함수가 구현됨 (예: "용감한 호랑이", "지혜로운 올빼미")
3. Tailwind CSS 호환 색상 이름을 랜덤으로 반환하는 함수가 구현됨 (예: "blue-500", "red-400")
4. 유닛 테스트로 함수가 항상 유효한 값을 반환하는지 검증함

### Story 1.5: IP 해싱 및 비밀번호 해싱 유틸리티 구현

**As a** 개발자,
**I want** IP 주소를 SHA-256으로 해싱하고 비밀번호를 bcrypt로 해싱하는 유틸리티를 구현하여,
**so that** 사용자 프라이버시를 보호하고 비밀번호를 안전하게 저장할 수 있다.

#### Acceptance Criteria
1. `backend/src/utils/ip-hash.helper.ts`에 IP 해싱 함수가 구현됨
2. `backend/src/utils/password.helper.ts`에 bcrypt 기반 해싱/검증 함수가 구현됨
3. IP 해싱 결과가 항상 동일한 입력에 대해 동일한 출력을 생성함
4. 비밀번호 검증 함수가 정확히 동작함
5. 유닛 테스트로 두 유틸리티 함수가 검증됨

### Story 1.6: 게시글 작성 API 구현 (Backend)

**As a** 사용자,
**I want** 제목, 내용, 카테고리(선택), 비밀번호(선택)를 입력하여 게시글을 작성할 수 있고,
**so that** 익명으로 내 생각을 커뮤니티에 공유할 수 있다.

#### Acceptance Criteria
1. `POST /api/posts` 엔드포인트가 구현됨
2. 요청 DTO(`CreatePostDto`)가 class-validator로 검증됨 (title 필수, content 필수, category 선택, password 선택)
3. 게시글 작성 시 랜덤 닉네임과 색상이 자동 생성됨
4. 요청 IP가 해싱되어 `ip_hash`로 저장됨
5. 비밀번호가 제공된 경우 bcrypt로 해싱되어 저장됨
6. 동일 IP에서 30초 이내 재작성 시 429 에러 반환 (Rate Limiting)
7. 성공 시 생성된 게시글 정보가 반환됨
8. Swagger 문서에 API 명세가 자동 생성됨

### Story 1.7: 게시글 목록 조회 API 구현 (Backend)

**As a** 사용자,
**I want** 게시글 목록을 페이지별, 카테고리별, 정렬 옵션별로 조회할 수 있고,
**so that** 원하는 게시글을 쉽게 찾아볼 수 있다.

#### Acceptance Criteria
1. `GET /api/posts?category=&page=1&limit=20&sort=latest` 엔드포인트가 구현됨
2. 쿼리 파라미터: `category` (선택), `page` (기본값 1), `limit` (기본값 20), `sort` (latest/popular/views)
3. `deleted_at`이 null인 게시글만 조회됨 (Soft Delete 적용)
4. 정렬 옵션: `latest` (최신순), `popular` (추후 반응 수 기준, 현재는 최신순), `views` (조회수 순)
5. 페이지네이션이 적용되어 총 페이지 수와 현재 페이지 정보가 반환됨
6. 각 게시글의 기본 정보 (id, title, anonymous_name, anonymous_color, view_count, created_at)가 반환됨
7. Swagger 문서에 API 명세가 자동 생성됨

### Story 1.8: 게시글 상세 조회 API 구현 (Backend)

**As a** 사용자,
**I want** 특정 게시글의 전체 내용을 조회할 수 있고,
**so that** 게시글의 세부 내용을 읽을 수 있다.

#### Acceptance Criteria
1. `GET /api/posts/:id` 엔드포인트가 구현됨
2. 게시글이 존재하지 않거나 삭제된 경우 404 에러 반환
3. 조회 시 `view_count`가 1 증가함
4. 게시글의 전체 정보가 반환됨 (비밀번호 해시는 제외)
5. Swagger 문서에 API 명세가 자동 생성됨

### Story 1.9: 게시글 수정/삭제 API 구현 (Backend)

**As a** 사용자,
**I want** 내가 작성한 게시글을 비밀번호로 인증하여 수정하거나 삭제할 수 있고,
**so that** 잘못 작성한 내용을 고치거나 삭제할 수 있다.

#### Acceptance Criteria
1. `PATCH /api/posts/:id` 엔드포인트가 구현됨 (제목, 내용 수정)
2. `DELETE /api/posts/:id` 엔드포인트가 구현됨
3. 요청 시 `password` 필드가 필수이며, 비밀번호가 일치하지 않으면 401 에러 반환
4. 비밀번호가 설정되지 않은 게시글은 수정/삭제 불가 (403 에러)
5. 삭제는 Soft Delete로 처리되어 `deleted_at`에 현재 시각이 기록됨
6. 수정 시 `updated_at`이 갱신됨
7. Swagger 문서에 API 명세가 자동 생성됨

### Story 1.10: Frontend 게시글 목록 페이지 구현

**As a** 사용자,
**I want** 게시글 목록을 보고 카테고리/정렬 옵션을 선택할 수 있고,
**so that** 관심 있는 게시글을 탐색할 수 있다.

#### Acceptance Criteria
1. `/` 경로에 게시글 목록 페이지가 구현됨
2. React Query로 `GET /api/posts` API를 호출하여 게시글 목록을 가져옴
3. 각 게시글은 카드 형태로 표시되며, 닉네임/색상/제목/조회수/작성일이 포함됨
4. 카테고리 필터와 정렬 드롭다운이 제공됨
5. 페이지네이션 또는 무한 스크롤이 구현됨
6. 로딩 상태와 에러 상태가 적절히 표시됨
7. Tailwind CSS로 모바일 반응형 디자인이 적용됨

### Story 1.11: Frontend 게시글 상세 페이지 구현

**As a** 사용자,
**I want** 게시글을 클릭하여 전체 내용을 볼 수 있고,
**so that** 게시글을 자세히 읽을 수 있다.

#### Acceptance Criteria
1. `/posts/[id]` 경로에 게시글 상세 페이지가 구현됨
2. React Query로 `GET /api/posts/:id` API를 호출하여 게시글을 가져옴
3. 게시글 제목, 내용, 작성자 닉네임/색상, 조회수, 작성일이 표시됨
4. 로딩 상태와 에러 상태 (404 포함)가 적절히 표시됨
5. Tailwind CSS로 모바일 반응형 디자인이 적용됨
6. 뒤로가기 버튼으로 목록으로 돌아갈 수 있음

### Story 1.12: Frontend 게시글 작성 페이지/모달 구현

**As a** 사용자,
**I want** 게시글 작성 폼을 통해 제목, 내용, 카테고리, 비밀번호를 입력하여 게시글을 작성할 수 있고,
**so that** 내 의견을 커뮤니티에 공유할 수 있다.

#### Acceptance Criteria
1. `/posts/new` 경로 또는 모달에 게시글 작성 폼이 구현됨
2. React Hook Form + Zod로 폼 검증이 구현됨 (title 필수, content 필수)
3. 카테고리 선택 드롭다운과 비밀번호 입력 필드가 제공됨
4. `POST /api/posts` API를 호출하여 게시글을 생성함
5. 성공 시 생성된 게시글 상세 페이지로 리다이렉트됨
6. 에러 시 사용자에게 알림 메시지가 표시됨
7. Rate Limiting 에러(429) 시 "30초 후 다시 시도해주세요" 메시지 표시
8. Tailwind CSS로 깔끔한 폼 디자인이 적용됨

### Story 1.13: Frontend 게시글 수정/삭제 기능 구현

**As a** 사용자,
**I want** 게시글 상세 페이지에서 수정/삭제 버튼을 클릭하여 비밀번호를 입력하고 수정하거나 삭제할 수 있고,
**so that** 내 게시글을 관리할 수 있다.

#### Acceptance Criteria
1. 게시글 상세 페이지에 "수정" 및 "삭제" 버튼이 표시됨
2. 버튼 클릭 시 비밀번호 입력 모달이 표시됨
3. 수정의 경우 비밀번호 검증 후 게시글 수정 폼으로 이동하여 `PATCH /api/posts/:id` 호출
4. 삭제의 경우 비밀번호 검증 후 확인 다이얼로그를 표시하고 `DELETE /api/posts/:id` 호출
5. 성공 시 적절한 피드백 (수정 시 업데이트된 페이지 표시, 삭제 시 목록으로 리다이렉트)
6. 비밀번호 오류 시 "비밀번호가 일치하지 않습니다" 메시지 표시
7. 비밀번호가 설정되지 않은 게시글은 수정/삭제 불가 메시지 표시

## Epic 2: 댓글 시스템 및 실시간 기능

트리 구조 댓글 시스템 구현 및 Supabase Realtime을 활용한 실시간 댓글 업데이트 기능 제공

### Story 2.1: 댓글 데이터베이스 스키마 설계 및 마이그레이션

**As a** 개발자,
**I want** 댓글(comments) 테이블을 Prisma 스키마로 정의하고 마이그레이션하여,
**so that** 트리 구조의 댓글 데이터를 저장할 수 있다.

#### Acceptance Criteria
1. `comments` 테이블이 다음 필드를 포함함: `id`, `post_id`, `parent_id`, `content`, `depth`, `anonymous_name`, `anonymous_color`, `password_hash`, `ip_hash`, `created_at`, `updated_at`, `deleted_at`
2. `post_id`는 posts 테이블의 외래 키
3. `parent_id`는 자기 참조 외래 키 (nullable)
4. `depth`는 댓글 깊이를 나타내는 정수
5. Prisma 마이그레이션이 성공적으로 실행됨

### Story 2.2: 댓글 작성 API 구현 (Backend)

**As a** 사용자,
**I want** 게시글에 댓글을 작성하고 댓글에 대댓글을 달 수 있고,
**so that** 게시글에 대한 토론에 참여할 수 있다.

#### Acceptance Criteria
1. `POST /api/posts/:postId/comments` 엔드포인트가 구현됨
2. `parentId`가 제공되면 대댓글로 처리하고 `depth`를 부모 depth + 1로 설정
3. 게시글 작성자와 동일한 `ip_hash`면 "OP" 표시 플래그 추가
4. 랜덤 닉네임과 색상 자동 생성
5. 비밀번호 선택적으로 설정 가능
6. Swagger 문서 자동 생성

### Story 2.3: 댓글 목록 조회 API 구현 (Backend)

**As a** 사용자,
**I want** 게시글의 댓글을 트리 구조로 조회할 수 있고,
**so that** 대댓글 관계를 쉽게 파악할 수 있다.

#### Acceptance Criteria
1. `GET /api/posts/:postId/comments` 엔드포인트가 구현됨
2. 댓글이 트리 구조로 반환됨 (부모 댓글 안에 자식 댓글 배열 포함)
3. `deleted_at`이 null인 댓글만 조회
4. OP 표시가 포함됨
5. Swagger 문서 자동 생성

### Story 2.4: 댓글 수정/삭제 API 구현 (Backend)

**As a** 사용자,
**I want** 내 댓글을 비밀번호로 인증하여 수정하거나 삭제할 수 있고,
**so that** 댓글 내용을 관리할 수 있다.

#### Acceptance Criteria
1. `PATCH /api/comments/:id` 엔드포인트가 구현됨
2. `DELETE /api/comments/:id` 엔드포인트가 구현됨
3. 비밀번호 검증 로직 적용
4. Soft Delete 처리
5. Swagger 문서 자동 생성

### Story 2.5: Supabase Realtime 설정 및 연동

**As a** 개발자,
**I want** Supabase Realtime을 설정하여 comments 테이블 변경을 감지하고,
**so that** 실시간으로 새 댓글을 클라이언트에 전달할 수 있다.

#### Acceptance Criteria
1. Supabase에서 comments 테이블에 대한 Realtime 활성화
2. Backend 또는 Frontend에서 Realtime 채널 구독 설정
3. INSERT 이벤트 감지 확인
4. 개발 환경에서 Realtime 동작 테스트 완료

### Story 2.6: Frontend 댓글 트리 컴포넌트 구현

**As a** 사용자,
**I want** 게시글 상세 페이지에서 댓글을 트리 구조로 볼 수 있고,
**so that** 대댓글 관계를 시각적으로 이해할 수 있다.

#### Acceptance Criteria
1. `CommentTree` 컴포넌트가 구현됨
2. `CommentItem` 컴포넌트가 재귀적으로 대댓글을 렌더링함
3. 댓글 깊이에 따라 들여쓰기 표시
4. 닉네임 색상 및 OP 표시가 렌더링됨
5. Tailwind CSS로 모바일 반응형 디자인 적용

### Story 2.7: Frontend 댓글 작성 폼 구현

**As a** 사용자,
**I want** 게시글 하단과 각 댓글 하단에 댓글 작성 폼이 있고,
**so that** 댓글과 대댓글을 쉽게 작성할 수 있다.

#### Acceptance Criteria
1. 게시글 하단에 댓글 작성 폼이 표시됨
2. 각 댓글에 "답글" 버튼이 있고 클릭 시 대댓글 폼이 표시됨
3. React Hook Form + Zod로 폼 검증
4. `POST /api/posts/:postId/comments` API 호출
5. 작성 성공 시 폼 초기화 및 댓글 목록 갱신

### Story 2.8: Frontend 실시간 댓글 업데이트 구현

**As a** 사용자,
**I want** 다른 사용자가 댓글을 작성하면 자동으로 내 화면에 표시되고,
**so that** 실시간으로 토론에 참여할 수 있다.

#### Acceptance Criteria
1. Supabase Realtime 구독이 게시글 상세 페이지에서 시작됨
2. 새 댓글 INSERT 이벤트 수신 시 댓글 목록에 자동 추가
3. 새 댓글에 fade-in 애니메이션 효과 적용
4. 페이지 이탈 시 구독 정리
5. 실시간 업데이트가 부드럽게 동작함

## Epic 3: 반응 및 인터랙션 기능

좋아요/싫어요 반응 시스템, 신고 기능, 그리고 컨텐츠 블러 처리로 커뮤니티 인터랙션 활성화

### Story 3.1: 반응 및 신고 데이터베이스 스키마 설계

**As a** 개발자,
**I want** reactions와 reports 테이블을 생성하여,
**so that** 사용자 반응과 신고 데이터를 저장할 수 있다.

#### Acceptance Criteria
1. `reactions` 테이블: `id`, `target_type`, `target_id`, `reaction_type`, `session_id`, `created_at`
2. `target_type`은 'post' 또는 'comment'
3. `reaction_type`은 'like' 또는 'dislike'
4. `reports` 테이블: `id`, `target_type`, `target_id`, `reason`, `status`, `reporter_ip_hash`, `created_at`
5. Prisma 마이그레이션 성공

### Story 3.2: 세션 관리 시스템 구현

**As a** 개발자,
**I want** Frontend에서 세션 ID를 생성하고 localStorage에 저장하여,
**so that** 사용자의 반응을 세션 기반으로 관리할 수 있다.

#### Acceptance Criteria
1. 앱 초기화 시 localStorage에서 세션 ID 확인
2. 없으면 UUID 생성하여 저장
3. Zustand 스토어에서 세션 ID 관리
4. 모든 반응 API 요청 시 세션 ID 포함

### Story 3.3: 반응 추가/제거 API 구현 (Backend)

**As a** 사용자,
**I want** 게시글이나 댓글에 좋아요/싫어요를 남길 수 있고,
**so that** 내 의견을 빠르게 표현할 수 있다.

#### Acceptance Criteria
1. `POST /api/reactions` 엔드포인트가 구현됨
2. `targetType`, `targetId`, `reactionType`, `sessionId`를 받음
3. 동일 세션이 이미 반응한 경우 기존 반응 제거 또는 변경
4. 게시글/댓글의 반응 수 카운트 반환
5. Swagger 문서 자동 생성

### Story 3.4: 신고 API 구현 (Backend)

**As a** 사용자,
**I want** 부적절한 게시글이나 댓글을 신고할 수 있고,
**so that** 커뮤니티를 건강하게 유지할 수 있다.

#### Acceptance Criteria
1. `POST /api/reports` 엔드포인트가 구현됨
2. `targetType`, `targetId`, `reason`을 받음
3. 신고자 IP를 해싱하여 저장
4. 신고 수가 임계값(예: 5회) 초과 시 해당 컨텐츠에 `reported` 플래그 설정
5. Swagger 문서 자동 생성

### Story 3.5: Frontend 반응 버튼 UI 구현

**As a** 사용자,
**I want** 게시글과 댓글에 좋아요/싫어요 버튼이 있고 클릭하면 즉시 반영되며,
**so that** 간편하게 반응을 남길 수 있다.

#### Acceptance Criteria
1. 게시글 및 댓글 컴포넌트에 좋아요/싫어요 버튼 추가
2. 버튼 클릭 시 `POST /api/reactions` API 호출
3. 낙관적 업데이트(Optimistic Update)로 즉시 UI 반영
4. 클릭 시 작은 애니메이션 효과 (예: scale, color change)
5. 현재 세션의 반응 상태 표시 (이미 누른 버튼 하이라이트)

### Story 3.6: Frontend 신고 기능 및 블러 처리 구현

**As a** 사용자,
**I want** 부적절한 컨텐츠를 신고할 수 있고 신고된 컨텐츠는 블러 처리되며,
**so that** 불쾌한 콘텐츠를 피할 수 있다.

#### Acceptance Criteria
1. 게시글 및 댓글에 "신고" 버튼 추가
2. 클릭 시 신고 사유를 선택하는 모달 표시
3. `POST /api/reports` API 호출
4. 신고된 컨텐츠(`reported` 플래그가 true)는 blur 효과 적용
5. 블러된 컨텐츠에 "신고된 콘텐츠입니다. 클릭하여 보기" 메시지 표시
6. 클릭 시 블러 해제

## Epic 4: 이미지 업로드 및 검색 기능

Supabase Storage를 활용한 이미지 업로드/관리 및 게시글 검색 기능으로 사용자 경험 완성

### Story 4.1: 이미지 데이터베이스 스키마 설계

**As a** 개발자,
**I want** images 테이블을 생성하여,
**so that** 게시글에 첨부된 이미지 정보를 저장할 수 있다.

#### Acceptance Criteria
1. `images` 테이블: `id`, `post_id`, `file_path`, `file_size`, `created_at`
2. `post_id`는 posts 테이블의 외래 키
3. Prisma 마이그레이션 성공

### Story 4.2: Supabase Storage 버킷 설정

**As a** 개발자,
**I want** Supabase Storage에 이미지 업로드용 버킷을 생성하고,
**so that** 이미지 파일을 안전하게 저장할 수 있다.

#### Acceptance Criteria
1. Supabase Dashboard에서 public 버킷 생성 (예: `post-images`)
2. 적절한 파일 크기 및 타입 제한 설정
3. Public 접근 권한 설정
4. Backend에서 Supabase Storage API 연동 확인

### Story 4.3: 이미지 업로드 API 구현 (Backend)

**As a** 개발자,
**I want** 이미지 업로드 API를 구현하여,
**so that** Frontend에서 이미지를 Supabase Storage에 업로드할 수 있다.

#### Acceptance Criteria
1. `POST /api/images` 엔드포인트가 구현됨
2. Multipart form-data로 이미지 파일 수신
3. 파일 타입 검증 (jpg, png, gif 등)
4. 파일 크기 검증 (최대 5MB)
5. Supabase Storage에 업로드 후 public URL 반환
6. Swagger 문서 자동 생성

### Story 4.4: 게시글 작성 시 이미지 연결

**As a** 사용자,
**I want** 게시글 작성 시 이미지를 첨부할 수 있고,
**so that** 시각적인 컨텐츠를 공유할 수 있다.

#### Acceptance Criteria
1. `CreatePostDto`에 `imageIds` 배열 필드 추가
2. 게시글 생성 시 제공된 imageIds를 post_id와 연결
3. 최대 5개 이미지 제한 검증
4. 게시글 조회 시 연결된 이미지 URL 목록 포함

### Story 4.5: 게시글 검색 API 구현 (Backend)

**As a** 사용자,
**I want** 키워드로 게시글을 검색할 수 있고,
**so that** 원하는 정보를 빠르게 찾을 수 있다.

#### Acceptance Criteria
1. `GET /api/posts/search?q=keyword` 엔드포인트가 구현됨
2. 제목과 내용에서 키워드 검색 (Prisma full-text search 또는 LIKE 검색)
3. `deleted_at`이 null인 게시글만 검색
4. 페이지네이션 지원
5. Swagger 문서 자동 생성

### Story 4.6: Frontend 이미지 업로드 UI 구현

**As a** 사용자,
**I want** 게시글 작성 폼에서 이미지를 드래그 앤 드롭 또는 선택하여 업로드할 수 있고,
**so that** 쉽게 이미지를 첨부할 수 있다.

#### Acceptance Criteria
1. 게시글 작성 폼에 이미지 업로드 영역 추가
2. 드래그 앤 드롭 및 파일 선택 버튼 지원
3. 선택한 이미지의 프리뷰 표시
4. 개별 이미지 삭제 버튼 제공
5. `POST /api/images` API 호출하여 이미지 업로드
6. 업로드된 이미지 ID를 게시글 작성 시 함께 전송

### Story 4.7: Frontend 이미지 갤러리 표시

**As a** 사용자,
**I want** 게시글 상세 페이지에서 첨부된 이미지를 갤러리 형태로 볼 수 있고,
**so that** 이미지를 확대하여 볼 수 있다.

#### Acceptance Criteria
1. 게시글 상세 페이지에 이미지 갤러리 컴포넌트 추가
2. 썸네일 형태로 이미지 목록 표시
3. 이미지 클릭 시 Lightbox 또는 모달로 확대 보기
4. 화살표 키로 이미지 간 이동 가능
5. 모바일 반응형 디자인 적용

### Story 4.8: Frontend 검색 페이지 구현

**As a** 사용자,
**I want** 검색 페이지에서 키워드를 입력하여 게시글을 찾을 수 있고,
**so that** 관심 있는 주제의 게시글을 탐색할 수 있다.

#### Acceptance Criteria
1. `/search` 경로에 검색 페이지가 구현됨
2. 검색어 입력 필드와 검색 버튼 제공
3. `GET /api/posts/search` API 호출
4. 검색 결과를 게시글 목록 형태로 표시
5. 검색어가 없을 때 안내 메시지 표시
6. 검색 결과가 없을 때 "검색 결과가 없습니다" 메시지 표시
