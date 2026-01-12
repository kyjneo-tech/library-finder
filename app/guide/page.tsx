import { ChevronLeft, HelpCircle, CheckCircle2, Bookmark, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">돌아가기</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">도서관 이용 꿀팁</h1>
        </div>

        <p className="text-gray-600 leading-relaxed mb-10">
          도서관을 더 스마트하게 이용하고 싶으신가요? <br/>
          책이음 서비스부터 희망도서 신청까지, 몰라서 못 썼던 유용한 도서관 서비스들을 정리해 드립니다.
        </p>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">1. 책이음 서비스 활용하기</h2>
            </div>
            <div className="prose prose-sm text-gray-600 leading-relaxed pl-7">
              <p>
                '책이음' 회원권 하나만 있으면 전국의 참여 도서관을 모두 이용할 수 있습니다. 
                매번 새로운 도서관에 갈 때마다 회원증을 만들 필요가 없어 편리합니다. 
                본 서비스에서도 책이음 참여 도서관 정보를 확인하실 수 있습니다.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-900">2. 책바다(국가상호대출) 서비스</h2>
            </div>
            <div className="prose prose-sm text-gray-600 leading-relaxed pl-7">
              <p>
                내가 다니는 도서관에 원하는 책이 없나요? '책바다' 서비스를 이용하면 
                전국 다른 도서관에 있는 도서를 내가 이용하는 도서관으로 배송받아 빌려볼 수 있습니다. 
                희귀 자료나 전문 서적을 구할 때 매우 유용합니다.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">3. 희망도서 신청하기</h2>
            </div>
            <div className="prose prose-sm text-gray-600 leading-relaxed pl-7">
              <p>
                신간 도서가 아직 도서관에 없다면 '희망도서 신청'을 해보세요. 
                도서관에서 검토 후 책을 구입하여 가장 먼저 빌려볼 수 있도록 우선 대출권을 주기도 합니다. 
                대부분의 지자체 도서관 홈페이지에서 신청 가능합니다.
              </p>
            </div>
          </section>

          <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">💡 확인해 보세요!</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              본 서비스의 검색 결과에서 '대출가능'으로 표시되더라도, 
              실시간 데이터 갱신 주기에 따라 실제 서가에는 없을 수 있습니다. 
              거리가 먼 도서관에 방문하실 때는 반드시 미리 확인 전화를 하시는 것이 좋습니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
