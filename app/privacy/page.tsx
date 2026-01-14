import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">돌아가기</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 flex-1 w-full">
        <h1 className="text-2xl font-black text-gray-900 mb-8">개인정보처리방침</h1>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-600">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. 개인정보의 처리 목적</h2>
            <p>
              '우리 가족 도서관'(이하 '서비스')은 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이
              변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>사용자 위치 기반 도서관 검색 서비스 제공</li>
              <li>도서 대출 가능 여부 조회</li>
              <li>서비스 이용 통계 및 품질 개선</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. 수집하는 개인정보 항목</h2>
            <p>
              서비스는 회원가입 없이 이용 가능하며, 서비스 제공을 위해 최소한의 정보를 수집(또는
              이용)합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong>필수항목:</strong> 접속 IP 정보, 쿠키, 브라우저 정보 (통계 및 부정 이용 방지
                목적)
              </li>
              <li>
                <strong>선택항목:</strong> 위치 정보 (사용자 기기의 GPS 정보를 이용하며, 서버에
                저장되지 않고 실시간 검색용으로만 사용됨)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. 쿠키(Cookie)의 운용 및 거부</h2>
            <p>
              서비스는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로
              불러오는 '쿠키(cookie)'를 사용합니다.
            </p>
            <p className="mt-2">
              <strong>쿠키 설정 거부 방법:</strong> 웹 브라우저 상단의 도구 &gt; 인터넷 옵션 &gt;
              개인정보 메뉴의 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다. 단, 쿠키 저장을
              거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. 광고 게재</h2>
            <p>
              본 서비스는 Google AdSense를 포함한 타사 광고 서비스를 이용할 수 있습니다. 광고
              사업자는 쿠키를 사용하여 사용자의 이전 웹사이트 방문 기록을 기반으로 광고를 게재할 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. 문의처</h2>
            <p>개인정보 처리와 관련한 문의사항은 아래 연락처로 문의해 주시기 바랍니다.</p>
            <p className="mt-2 font-medium bg-gray-50 p-3 rounded-lg inline-block">
              이메일: kyjneo1@naver.com
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
