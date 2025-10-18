import { PrismaClient } from '@prisma/client';
import { generateAnonymousName } from '../src/utils/anonymous-name.generator';
import { generateAnonymousColor } from '../src/utils/anonymous-color.generator';
import { hashPassword } from '../src/utils/password.helper';
import { hashIp } from '../src/utils/ip-hash.helper';

const prisma = new PrismaClient();

const categories = ['자유게시판', '질문', '유머', '정보', '토론'];

const postTitles = [
  '오늘 점심 뭐 먹을까요?',
  '이번 주말 날씨 좋네요',
  '추천할만한 책 있나요?',
  '최근에 본 영화 리뷰',
  '프로그래밍 공부 방법 공유',
  '운동 시작하려는데 조언 부탁드려요',
  '요즘 핫한 게임 추천해주세요',
  '여행 가고 싶은 곳',
  '취미 생활 어떤 거 하시나요?',
  '맛집 추천 부탁드립니다',
  '이직 고민 중입니다',
  '부업 추천해주세요',
  '건강관리 팁 공유',
  '고민 상담 받습니다',
  '재테크 어떻게 하시나요?',
  '반려동물 키우시는 분?',
  '카페 추천해주세요',
  '스트레스 푸는 방법',
  '좋아하는 음악 장르는?',
  '주말에 뭐하세요?',
  'PC 조립 견적 봐주세요',
  '노트북 추천 부탁드려요',
  '헬스장 vs 홈트 어떤게 나을까요?',
  '새해 목표 세우셨나요?',
  '좋은 습관 만들기',
];

const postContents = [
  '궁금한게 있어서 글 남깁니다. 여러분의 의견을 듣고 싶어요.',
  '요즘 이것 저것 고민이 많네요. 조언 부탁드립니다.',
  '제 생각엔 이게 맞는 것 같은데 다들 어떻게 생각하시나요?',
  '정보 공유 차원에서 올려봅니다. 도움이 되셨으면 좋겠어요.',
  '최근에 경험한 내용을 정리해봤습니다.',
  '여러분은 어떻게 하시나요? 궁금합니다.',
  '관련해서 좋은 자료나 팁 있으면 공유 부탁드려요.',
  '처음 해보는 거라 조언이 필요합니다.',
  '이런 경우 어떻게 대처하는게 좋을까요?',
  '경험담을 공유해주시면 감사하겠습니다.',
];

const commentContents = [
  '좋은 정보 감사합니다!',
  '저도 비슷한 고민을 하고 있었는데 도움이 되네요.',
  '이건 좀 아닌 것 같은데요...',
  '완전 공감합니다!',
  '제 경험상으로는 이렇게 하는게 좋더라고요.',
  '한번 시도해봐야겠네요.',
  '좋은 글 잘 읽었습니다.',
  '저는 다르게 생각하는데요.',
  '정말 유익한 정보네요!',
  '이런 관점도 있군요.',
  '궁금한게 있는데요...',
  '더 자세히 알려주실 수 있나요?',
  '맞아요, 저도 그렇게 생각해요.',
  '아 그렇군요, 몰랐던 사실이네요.',
  '실용적인 팁 감사합니다!',
];

const replyContents = [
  '맞습니다! 저도 동의해요.',
  '그건 좀 다른 문제 아닌가요?',
  '추가로 이런 방법도 있어요.',
  '좋은 의견이네요.',
  '한번 더 생각해볼 문제인 것 같아요.',
  '그렇게 볼 수도 있겠네요.',
  '감사합니다!',
  '아 그렇군요!',
  '이건 처음 알았어요.',
  '도움이 많이 되었습니다.',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('테스트 데이터 생성을 시작합니다...');

  const password = 'test1234';
  const hashedPassword = await hashPassword(password);

  let totalItems = 0;

  // 25개의 게시글 생성
  for (let i = 0; i < 25; i++) {
    const title = getRandomElement(postTitles);
    const content = getRandomElement(postContents);
    const category = getRandomElement(categories);
    const ipHash = hashIp(`192.168.1.${getRandomInt(1, 255)}`);

    const post = await prisma.post.create({
      data: {
        title: `${title} ${i + 1}`,
        content: `${content}\n\n상세 내용이 여기 들어갑니다. ${getRandomInt(1, 100)}번째 게시글입니다.`,
        category,
        anonymous_name: generateAnonymousName(),
        anonymous_color: generateAnonymousColor(),
        password_hash: hashedPassword,
        ip_hash: ipHash,
      },
    });

    totalItems++;
    console.log(`게시글 생성: ${post.title}`);

    // 각 게시글에 1~5개의 댓글 추가
    const commentCount = getRandomInt(1, 5);
    const commentIds: string[] = [];

    for (let j = 0; j < commentCount; j++) {
      const commentContent = getRandomElement(commentContents);
      const commentIpHash = hashIp(`192.168.2.${getRandomInt(1, 255)}`);

      const comment = await prisma.comment.create({
        data: {
          post_id: post.id,
          content: commentContent,
          anonymous_name: generateAnonymousName(),
          anonymous_color: generateAnonymousColor(),
          password_hash: hashedPassword,
          ip_hash: commentIpHash,
          depth: 0,
        },
      });

      commentIds.push(comment.id);
      totalItems++;
      console.log(`  댓글 생성: ${comment.content.substring(0, 20)}...`);

      // 30% 확률로 대댓글 추가
      if (Math.random() < 0.3) {
        const replyCount = getRandomInt(1, 3);
        for (let k = 0; k < replyCount; k++) {
          const replyContent = getRandomElement(replyContents);
          const replyIpHash = hashIp(`192.168.3.${getRandomInt(1, 255)}`);

          const reply = await prisma.comment.create({
            data: {
              post_id: post.id,
              parent_id: comment.id,
              content: replyContent,
              anonymous_name: generateAnonymousName(),
              anonymous_color: generateAnonymousColor(),
              password_hash: hashedPassword,
              ip_hash: replyIpHash,
              depth: 1,
            },
          });

          totalItems++;
          console.log(`    대댓글 생성: ${reply.content.substring(0, 20)}...`);
        }
      }
    }

    // 일부 댓글에 반응 추가
    if (commentIds.length > 0 && Math.random() < 0.5) {
      const targetCommentId = getRandomElement(commentIds);
      const reactionCount = getRandomInt(1, 3);

      for (let r = 0; r < reactionCount; r++) {
        const sessionId = `session-${getRandomInt(1000, 9999)}-${r}`;
        const reactionType = Math.random() < 0.7 ? 'like' : 'dislike';

        await prisma.reaction.create({
          data: {
            target_type: 'comment',
            target_id: targetCommentId,
            reaction_type: reactionType,
            session_id: sessionId,
          },
        });
      }
    }

    // 게시글에도 반응 추가
    if (Math.random() < 0.6) {
      const reactionCount = getRandomInt(1, 5);
      for (let r = 0; r < reactionCount; r++) {
        const sessionId = `session-${getRandomInt(1000, 9999)}-${r}`;
        const reactionType = Math.random() < 0.75 ? 'like' : 'dislike';

        await prisma.reaction.create({
          data: {
            target_type: 'post',
            target_id: post.id,
            reaction_type: reactionType,
            session_id: sessionId,
          },
        });
      }
    }
  }

  console.log('\n✅ 테스트 데이터 생성 완료!');
  console.log(`총 ${totalItems}개의 항목(게시글 + 댓글 + 대댓글)이 생성되었습니다.`);
}

main()
  .catch((e) => {
    console.error('에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
