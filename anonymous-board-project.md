# 🎭 WhisperBoard - 익명 게시판 프로젝트

> "목소리는 익명으로, 생각은 자유롭게"

## 📋 프로젝트 개요

WhisperBoard는 완전한 익명성을 보장하는 현대적인 게시판 플랫폼입니다. 사용자들이 신분을 노출하지 않고 자유롭게 의견을 공유하고 토론할 수 있는 안전한 공간을 제공합니다.

### 🎯 핵심 가치
- **완전한 익명성**: 계정 없이도 참여 가능
- **자유로운 소통**: 검열 없는 열린 대화
- **깊이 있는 토론**: 무제한 댓글 트리 구조
- **빠른 반응성**: 실시간 업데이트 지원

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand / React Query
- **Form Handling**: React Hook Form + Zod

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Authentication**: JWT (선택적 세션 관리)
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger

### Database
- **Platform**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (이미지 첨부 기능용)

### DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)
- **Monitoring**: Sentry

---

## ✨ 주요 기능

### 1. 게시글 관리
- ✍️ 익명 글 작성 (닉네임 랜덤 생성)
- 🏷 카테고리/태그 시스템
- 📎 이미지 첨부 (최대 5개)
- 👀 조회수 카운팅
- 🔥 인기글 필터링
- 🔍 전체 검색 기능

### 2. 댓글 시스템
- 💬 무제한 댓글 작성
- 🔄 무제한 대댓글 (트리 구조)
- ↩️ 특정 댓글에 답글
- 👍 댓글 좋아요/싫어요
- 🎨 작성자 구분 (OP 표시)

### 3. 익명성 관리
- 🎲 게시글마다 랜덤 닉네임 할당
- 🎨 게시글마다 고유 색상 아이콘
- 🔐 선택적 비밀번호 보호 (수정/삭제용)
- 🕐 임시 세션 ID (브라우저 기반)

### 4. 실시간 기능
- ⚡️ 새 게시글 알림
- 💫 실시간 댓글 업데이트
- 🔴 현재 접속자 수 표시

### 5. 관리 기능
- 🚫 신고 시스템
- 🛡 자동 스팸 필터링
- 📊 통계 대시보드

---

## 🗃 데이터베이스 스키마

```sql
-- 게시글 테이블
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  anonymous_name VARCHAR(50) NOT NULL,
  anonymous_color VARCHAR(7) NOT NULL,
  password_hash VARCHAR(255), -- 선택적
  category VARCHAR(50),
  view_count INTEGER DEFAULT 0,
  ip_hash VARCHAR(64), -- 보안/스팸 방지용
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- 댓글 테이블
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  anonymous_name VARCHAR(50) NOT NULL,
  anonymous_color VARCHAR(7) NOT NULL,
  password_hash VARCHAR(255),
  depth INTEGER DEFAULT 0,
  ip_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- 좋아요/싫어요 테이블
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type VARCHAR(20) NOT NULL, -- 'post' or 'comment'
  target_id UUID NOT NULL,
  reaction_type VARCHAR(20) NOT NULL, -- 'like' or 'dislike'
  session_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(target_type, target_id, session_id)
);

-- 이미지 테이블
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 신고 테이블
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type VARCHAR(20) NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  reporter_session VARCHAR(64),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_reactions_target ON reactions(target_type, target_id);
```

---

## 🔌 API 설계

### Posts API

```typescript
// 게시글 목록 조회
GET /api/posts?category=&page=1&limit=20&sort=latest

// 게시글 상세 조회
GET /api/posts/:id

// 게시글 작성
POST /api/posts
Body: {
  title: string,
  content: string,
  category?: string,
  password?: string, // 선택적
  images?: File[]
}

// 게시글 수정
PATCH /api/posts/:id
Body: { password: string, title?: string, content?: string }

// 게시글 삭제
DELETE /api/posts/:id
Body: { password: string }

// 게시글 검색
GET /api/posts/search?q=keyword
```

### Comments API

```typescript
// 댓글 목록 조회
GET /api/posts/:postId/comments

// 댓글 작성
POST /api/posts/:postId/comments
Body: {
  content: string,
  parentId?: string, // 대댓글인 경우
  password?: string
}

// 댓글 수정
PATCH /api/comments/:id
Body: { password: string, content: string }

// 댓글 삭제
DELETE /api/comments/:id
Body: { password: string }
```

### Reactions API

```typescript
// 반응 추가/제거
POST /api/reactions
Body: {
  targetType: 'post' | 'comment',
  targetId: string,
  reactionType: 'like' | 'dislike'
}
```

---

## 🎨 프론트엔드 구조

```
frontend/
├── app/
│   ├── (main)/
│   │   ├── page.tsx              # 메인 게시글 목록
│   │   ├── posts/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # 게시글 상세
│   │   │   └── new/
│   │   │       └── page.tsx      # 새 글 작성
│   │   └── search/
│   │       └── page.tsx          # 검색 페이지
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── post/
│   │   ├── PostCard.tsx
│   │   ├── PostDetail.tsx
│   │   ├── PostForm.tsx
│   │   └── PostList.tsx
│   ├── comment/
│   │   ├── CommentItem.tsx
│   │   ├── CommentForm.tsx
│   │   ├── CommentTree.tsx
│   │   └── CommentList.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Avatar.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── hooks/
│   ├── usePost.ts
│   ├── useComment.ts
│   ├── useReaction.ts
│   └── useSession.ts
├── lib/
│   ├── api.ts
│   ├── supabase.ts
│   └── utils.ts
├── stores/
│   └── sessionStore.ts
└── types/
    └── index.ts
```

---

## 🏗 백엔드 구조

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── posts/
│   │   ├── posts.module.ts
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   ├── dto/
│   │   │   ├── create-post.dto.ts
│   │   │   ├── update-post.dto.ts
│   │   │   └── query-post.dto.ts
│   │   └── entities/
│   │       └── post.entity.ts
│   ├── comments/
│   │   ├── comments.module.ts
│   │   ├── comments.controller.ts
│   │   ├── comments.service.ts
│   │   └── dto/
│   ├── reactions/
│   │   ├── reactions.module.ts
│   │   ├── reactions.controller.ts
│   │   └── reactions.service.ts
│   ├── images/
│   │   ├── images.module.ts
│   │   ├── images.controller.ts
│   │   └── images.service.ts
│   ├── reports/
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts
│   │   └── reports.service.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   └── utils/
│       ├── anonymous-name.generator.ts
│       ├── password.helper.ts
│       └── ip-hash.helper.ts
├── prisma/
│   └── schema.prisma
└── test/
```

---

## 🔒 보안 고려사항

### 익명성 보호
- IP 주소를 SHA-256 해싱하여 저장 (원본 미저장)
- 세션 ID는 브라우저 로컬 생성 (HttpOnly Cookie)
- 개인 식별 정보 수집 최소화

### 스팸/악용 방지
- Rate Limiting (IP 기반)
- 동일 IP에서 연속 게시 제한 (30초 쿨다운)
- 이미지 업로드 크기 제한 (5MB)
- XSS 방지 (DOMPurify)
- SQL Injection 방지 (Parameterized Query)

### 컨텐츠 관리
- 비밀번호는 bcrypt 해싱
- 삭제는 Soft Delete (복구 가능)
- 신고된 게시물 자동 블러 처리

---

## 🚀 개발 로드맵

### Phase 1: MVP (4주)
- [x] 프로젝트 세팅
- [x] 데이터베이스 스키마 설계
- [x] 게시글 CRUD API
- [x] 댓글 CRUD API
- [x] 기본 UI 구현

### Phase 2: 핵심 기능 (3주)
- [x] 대댓글 무한 트리 구조
- [x] 이미지 업로드
- [x] 반응 시스템
- [x] 검색 기능

### Phase 3: 최적화 (2주)
- [x] 실시간 업데이트
- [ ] 페이지네이션 최적화
- [ ] 이미지 최적화
- [ ] SEO 최적화

### Phase 4: 추가 기능 (2주)
- [x] 신고 시스템
- [ ] 관리자 대시보드
- [ ] 통계 기능
- [ ] 다크모드

---

## 📊 예상 아키텍처

```
┌─────────────┐
│   사용자    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   Next.js Frontend          │
│   (Vercel)                  │
│   - SSR/SSG                 │
│   - React Query Cache       │
└──────────┬──────────────────┘
           │ REST API
           ▼
┌─────────────────────────────┐
│   NestJS Backend            │
│   (Railway/Render)          │
│   - JWT Auth                │
│   - Rate Limiting           │
│   - Image Processing        │
└──────────┬──────────────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
┌─────────┐  ┌──────────┐
│Supabase │  │Supabase  │
│Database │  │Storage   │
│(Postgres│  │(Images)  │
└─────────┘  └──────────┘
```

---

## 🎯 성능 목표

- **첫 페이지 로딩**: < 2초
- **API 응답 시간**: < 200ms
- **이미지 로딩**: < 1초 (lazy loading)
- **동시 접속자**: 1000명 이상 지원
- **댓글 렌더링**: 1000개까지 부드럽게

---

## 📝 라이선스

MIT License

---

## 👥 기여하기

이 프로젝트는 오픈소스입니다. Pull Request를 환영합니다!

### 개발 환경 설정
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run start:dev
```

---

**WhisperBoard** - 목소리는 익명으로, 생각은 자유롭게 🎭
