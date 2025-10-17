# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

WhisperBoard는 완전한 익명성을 보장하는 게시판 플랫폼입니다. 계정 없이도 사용자가 자유롭게 글과 댓글을 작성할 수 있으며, 게시글마다 랜덤 닉네임과 색상이 부여됩니다.

## 기술 스택

### Frontend
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand / React Query (상태 관리)
- React Hook Form + Zod (폼 처리)

### Backend
- NestJS + TypeScript
- JWT (선택적 세션 관리)
- class-validator, class-transformer
- Swagger (API 문서화)

### Database
- Supabase (PostgreSQL)
- Prisma ORM
- Supabase Realtime (실시간 기능)
- Supabase Storage (이미지)

## 개발 환경 설정

```bash
# Frontend 개발
cd frontend
npm install
npm run dev

# Backend 개발
cd backend
npm install
npm run start:dev

# Prisma 마이그레이션
cd backend
npx prisma migrate dev
npx prisma generate
```

## 핵심 아키텍처 개념

### 익명성 시스템
- **랜덤 닉네임 생성**: 게시글 작성 시마다 새로운 익명 닉네임이 자동 생성됩니다
- **세션 기반 식별**: 브라우저 로컬에서 생성된 세션 ID로 사용자를 구분합니다
- **IP 해싱**: IP 주소는 SHA-256 해싱 후 저장하며 원본은 저장하지 않습니다
- **선택적 비밀번호**: 게시글/댓글 수정/삭제를 위한 비밀번호는 bcrypt로 해싱됩니다

### 댓글 트리 구조
- 무제한 대댓글 지원 (parent_id를 통한 재귀 구조)
- depth 필드로 댓글 깊이 추적
- 게시글 작성자는 "OP" 표시

### 데이터베이스 설계
주요 테이블:
- **posts**: 게시글 (title, content, anonymous_name, anonymous_color, password_hash, view_count)
- **comments**: 댓글 (post_id, parent_id, content, depth, anonymous_name)
- **reactions**: 좋아요/싫어요 (target_type, target_id, reaction_type, session_id)
- **images**: 이미지 첨부 (post_id, file_path, supabase storage 연동)
- **reports**: 신고 시스템 (target_type, target_id, reason, status)

모든 삭제는 Soft Delete (deleted_at 필드 사용)

### API 엔드포인트 구조

#### Posts
- `GET /api/posts?category=&page=1&limit=20&sort=latest` - 게시글 목록
- `GET /api/posts/:id` - 게시글 상세
- `POST /api/posts` - 게시글 작성 (title, content, category?, password?, images?)
- `PATCH /api/posts/:id` - 게시글 수정 (password 필수)
- `DELETE /api/posts/:id` - 게시글 삭제 (password 필수)
- `GET /api/posts/search?q=keyword` - 검색

#### Comments
- `GET /api/posts/:postId/comments` - 댓글 목록 (트리 구조로 반환)
- `POST /api/posts/:postId/comments` - 댓글 작성 (parentId?, password?)
- `PATCH /api/comments/:id` - 댓글 수정
- `DELETE /api/comments/:id` - 댓글 삭제

#### Reactions
- `POST /api/reactions` - 반응 추가/제거 (targetType, targetId, reactionType)

### 보안 고려사항
- Rate Limiting: IP 기반 요청 제한
- 연속 게시 제한: 동일 IP에서 30초 쿨다운
- XSS 방지: DOMPurify 사용
- 이미지 업로드: 최대 5개, 각 5MB 제한
- 신고된 컨텐츠: 자동 블러 처리

### Frontend 디렉토리 구조
```
frontend/
├── app/
│   ├── (main)/
│   │   ├── page.tsx                 # 게시글 목록 페이지
│   │   ├── posts/[id]/page.tsx      # 게시글 상세 페이지
│   │   ├── posts/new/page.tsx       # 글 작성 페이지
│   │   └── search/page.tsx          # 검색 페이지
├── components/
│   ├── post/                        # PostCard, PostDetail, PostForm, PostList
│   ├── comment/                     # CommentItem, CommentForm, CommentTree
│   └── ui/                          # 재사용 가능한 UI 컴포넌트
├── hooks/                           # usePost, useComment, useReaction, useSession
├── stores/                          # Zustand 스토어 (sessionStore 등)
└── lib/                             # API 클라이언트, Supabase 클라이언트, 유틸리티
```

### Backend 디렉토리 구조
```
backend/
├── src/
│   ├── posts/                       # 게시글 모듈 (controller, service, dto, entity)
│   ├── comments/                    # 댓글 모듈
│   ├── reactions/                   # 반응 모듈
│   ├── images/                      # 이미지 업로드 모듈
│   ├── reports/                     # 신고 모듈
│   ├── common/                      # 공통 데코레이터, 가드, 인터셉터, 파이프
│   └── utils/
│       ├── anonymous-name.generator.ts  # 랜덤 닉네임 생성
│       ├── password.helper.ts           # 비밀번호 해싱/검증
│       └── ip-hash.helper.ts            # IP 해싱
└── prisma/
    └── schema.prisma
```

## 성능 목표
- 첫 페이지 로딩: < 2초
- API 응답 시간: < 200ms
- 동시 접속자: 1000명 이상 지원
- 댓글 렌더링: 1000개까지 부드럽게 처리
