import { ChevronLeft, Baby, Smile, GraduationCap, School } from "lucide-react";
import Link from "next/link";

export default function AgeBooksPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link href="/guide" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">가이드로 돌아가기</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-6 leading-tight">
          우리 아이 연령별 <br/>권장 도서 가이드
        </h1>
        
        <p className="text-gray-600 mb-10 leading-relaxed">
          아이들은 성장에 따라 세상을 보는 눈이 달라집니다. 
          각 발달 단계에 꼭 맞는 책을 선물해 주세요. 독서에 대한 흥미가 배가됩니다.
        </p>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-4 text-orange-500">
              <Baby className="w-6 h-6" />
              <h2 className="text-xl font-bold">0~2세: 오감을 자극하는 책</h2>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
              <p className="text-gray-600 text-sm leading-relaxed">
                시각과 촉각이 발달하는 시기입니다. 선명한 색감의 헝겊 책, 만지면 소리가 나는 팝업북, 
                다양한 질감을 느낄 수 있는 촉감 책이 좋습니다. 의성어와 의태어가 풍부한 짧은 문장의 책을 골라주세요.
              </p>
              <ul className="text-xs text-gray-400 font-bold list-disc pl-5">
                <li>초점책, 헝겊책, 소리나는 그림책</li>
                <li>단순한 사물 그림책</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-green-500">
              <Smile className="w-6 h-6" />
              <h2 className="text-xl font-bold">3~5세: 상상력과 언어의 발달</h2>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
              <p className="text-gray-600 text-sm leading-relaxed">
                어휘력이 폭발적으로 늘어나는 시기입니다. 기승전결이 있는 이야기 그림책이나 
                주변 사물의 이름을 알려주는 인지 책이 좋습니다. 상상력을 자극하는 판타지 동화나 
                생활 습관을 바로잡아주는 생활 동화도 추천합니다.
              </p>
              <ul className="text-xs text-gray-400 font-bold list-disc pl-5">
                <li>생활 습관 그림책, 창작 동화</li>
                <li>자연 관찰 도감</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-blue-500">
              <GraduationCap className="w-6 h-6" />
              <h2 className="text-xl font-bold">6~7세: 사회성과 호기심 충족</h2>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
              <p className="text-gray-600 text-sm leading-relaxed">
                학교 갈 준비를 하는 시기로 사회성이 발달합니다. 친구 관계, 가족 사랑 등 
                정서적인 주제의 책이나 과학, 역사에 대한 호기심을 풀어주는 정보 그림책이 좋습니다. 
                글밥이 조금씩 늘어나는 그림책을 시도해 보세요.
              </p>
              <ul className="text-xs text-gray-400 font-bold list-disc pl-5">
                <li>전래 동화, 명작 동화</li>
                <li>과학 및 문화 정보 그림책</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-purple-500">
              <School className="w-6 h-6" />
              <h2 className="text-xl font-bold">초등 저학년: 독서 습관 정착</h2>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
              <p className="text-gray-600 text-sm leading-relaxed">
                스스로 읽는 즐거움을 느껴야 하는 시기입니다. 줄글로 넘어가는 단계이므로 
                아이의 관심사에 맞는 만화나 동화책을 자유롭게 읽게 해주세요. 
                교과 과정과 연계된 인물 이야기나 사회 분야의 책도 도움이 됩니다.
              </p>
              <ul className="text-xs text-gray-400 font-bold list-disc pl-5">
                <li>초등 필독서, 위인전</li>
                <li>어린이 잡지, 학습 만화</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
