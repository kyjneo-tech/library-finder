import { ChevronLeft, Star, Heart, MessageCircle, Clock, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function ReadingTipsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link
            href="/guide"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">가이드로 돌아가기</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-6 leading-tight">
          아이에게 책 읽어주는 <br />
          즐거운 5가지 방법
        </h1>

        <p className="text-gray-600 mb-10 leading-relaxed">
          독서는 단순히 지식을 전달하는 시간이 아닙니다. 부모와 아이가 정서적으로 교감하고, 아이의
          상상력이 자라나는 소중한 시간입니다. 어떻게 하면 더 즐거운 독서 시간을 만들 수 있을까요?
        </p>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-4 text-purple-600">
              <Clock className="w-6 h-6" />
              <h2 className="text-xl font-bold">1. 매일 일정한 시간을 정하세요</h2>
            </div>
            <p className="text-gray-600 leading-relaxed pl-9">
              잠들기 전 15분, 혹은 저녁 식사 후처럼 일정한 시간을 '책 읽는 시간'으로 정하면 아이는
              이를 자연스러운 일과로 받아들입니다. 정해진 시간은 아이에게 안정감을 주며 독서 습관을
              기르는 데 큰 도움이 됩니다.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <MessageCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">2. 질문을 던지며 대화하세요</h2>
            </div>
            <p className="text-gray-600 leading-relaxed pl-9">
              "그다음에는 무슨 일이 일어날까?", "주인공의 기분은 어떨까?"와 같은 열린 질문을
              던져보세요. 아이는 질문에 답하며 스스로 생각하는 힘을 기르고, 이야기에 더 깊이
              몰입하게 됩니다.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-pink-600">
              <Heart className="w-6 h-6" />
              <h2 className="text-xl font-bold">3. 풍부한 감정을 담아 읽어주세요</h2>
            </div>
            <p className="text-gray-600 leading-relaxed pl-9">
              등장인물에 따라 목소리 톤을 바꾸거나 효과음을 넣어보세요. 부모님이 즐겁게 읽어줄 때
              아이도 독서가 '공부'가 아닌 '놀이'라고 느끼게 됩니다. 부모님의 연기가 서툴러도 아이는
              그 정성을 사랑합니다.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-orange-600">
              <Star className="w-6 h-6" />
              <h2 className="text-xl font-bold">4. 아이가 직접 책을 고르게 하세요</h2>
            </div>
            <p className="text-gray-600 leading-relaxed pl-9">
              아이가 같은 책을 수십 번 읽어달라고 해도 인내심을 갖고 읽어주세요. 반복 독서는 아이가
              언어의 구조를 이해하고 어휘를 습득하는 중요한 과정입니다. 스스로 책을 고르는 행위는
              주도적인 독서 습관의 시작입니다.
            </p>
          </section>

          <section className="bg-purple-50 p-8 rounded-[2.5rem] border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-bold text-purple-900">핵심 포인트</h3>
            </div>
            <p className="text-purple-800 text-sm leading-relaxed">
              가장 중요한 것은 '완독'이 아니라 '즐거움'입니다. 아이가 집중하지 않는다면 언제든
              멈춰도 괜찮습니다. 독서 시간이 부모와 아이 모두에게 행복한 기억으로 남는 것이 평생의
              독서가를 만드는 비결입니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
