import { ChevronLeft, Zap, Globe, Coffee, Calendar } from "lucide-react";
import Link from "next/link";

export default function LibraryHacksPage() {
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
          도서관 전문가만 아는 <br/>200% 활용 꿀팁
        </h1>
        
        <p className="text-gray-600 mb-10 leading-relaxed">
          도서관은 단순히 책을 빌리는 곳 그 이상입니다. 
          세금으로 운영되는 수많은 혜택들을 빠짐없이 누리고 계신가요? 
          지금 바로 활용할 수 있는 도서관 이용 꿀팁을 공개합니다.
        </p>

        <div className="space-y-10">
          <section className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold">희망도서 신청의 마법</h2>
            </div>
            <p className="text-gray-600 leading-relaxed pl-13">
              원하는 신간 도서가 아직 서가에 없나요? 대부분의 도서관은 '희망도서 신청'을 받습니다. 
              도서관에서 검토 후 책을 구매하면 신청자에게 가장 먼저 대출할 수 있는 우선권을 줍니다. 
              새 책을 가장 먼저 읽고 싶은 분들에게 강력 추천합니다.
            </p>
          </section>

          <section className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">전자도서관은 연중무휴</h2>
            </div>
            <p className="text-gray-600 leading-relaxed pl-13">
              휴관일이거나 늦은 밤이라도 걱정 마세요. 도서관 정회원이라면 '전자도서관' 앱을 통해 
              수만 권의 전자책과 오디오북을 무료로 이용할 수 있습니다. 
              따로 도서관에 방문할 필요 없이 스마트폰이나 태블릿으로 바로 읽을 수 있어 편리합니다.
            </p>
          </section>

          <section className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">문화 프로그램 무료 수강</h2>
            </div>
            <p className="text-gray-600 leading-relaxed pl-13">
              도서관은 지역 문화의 거점입니다. 인문학 강연, 작가와의 만남, 아이들을 위한 독서 교실, 
              코딩 수업 등 수많은 양질의 프로그램이 무료 혹은 저렴한 가격에 제공됩니다. 
              매월 초 도서관 홈페이지 공지사항을 확인하는 습관을 가져보세요.
            </p>
          </section>

          <section className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold">도서관 시설 활용하기</h2>
            </div>
            <p className="text-gray-600 leading-relaxed pl-13">
              노트북 좌석, 멀티미디어실(DVD 시청), 스터디룸 대여 등 도서관은 최고의 공유 오피스이자 휴식처입니다. 
              최근 리모델링된 도서관들은 카페보다 더 멋진 인테리어를 자랑하며 쾌적한 환경을 제공합니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
