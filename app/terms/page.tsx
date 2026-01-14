import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
        <h1 className="text-2xl font-black text-gray-900 mb-8">이용약관</h1>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-600">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">제 1 조 (목적)</h2>
            <p>
              본 약관은 '우리 가족 도서관'(이하 '서비스')이 제공하는 위치 기반 도서관 정보 조회 및
              도서 추천 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              제 2 조 (서비스의 제공 및 변경)
            </h2>
            <p>
              1. 서비스는 공공 도서관 데이터(국립중앙도서관 등)를 활용하여 대출 가능 여부, 도서 위치
              정보 등을 제공합니다.
              <br />
              2. 서비스는 기술적 사양의 변경이나 공공 데이터 제공처의 사정에 따라 서비스의 내용을
              변경할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">제 3 조 (책임의 제한)</h2>
            <p>
              1. 서비스에서 제공하는 도서의 대출 가능 여부는 공공 데이터의 갱신 시점에 따라 실제
              도서관 상황과 일부 차이가 있을 수 있습니다. 정확한 확인을 위해서는 해당 도서관에 유선
              문의를 권장합니다.
              <br />
              2. 서비스는 무료로 제공되는 정보 검색 도구이며, 데이터 오류로 인해 발생하는 직간접적
              손해에 대하여 책임을 지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">제 4 조 (광고 게재 및 링크)</h2>
            <p>
              서비스는 이용자에게 무료 서비스를 제공하기 위해 광고를 게재할 수 있으며, 타 사이트로의
              링크를 포함할 수 있습니다. 광고주와의 거래나 외부 사이트 방문은 이용자의 책임하에
              이루어집니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">제 5 조 (저작권)</h2>
            <p>
              서비스가 자체적으로 제작한 콘텐츠 및 디자인에 대한 저작권은 서비스 운영자에게 있으며,
              제공되는 도서 정보 및 이미지는 각 저작권자 및 데이터 제공처의 정책을 따릅니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
