"use client";

import { CreditCard, Ship } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";

type ServiceType = 'chaekium' | 'chaekbada' | null;

export function LibraryServiceGuide() {
  const [activeService, setActiveService] = useState<ServiceType>(null);

  return (
    <section className="mx-4 mt-6">
      <div className="flex gap-3">
        {/* 책이음 버튼 */}
        <button
          onClick={() => setActiveService(activeService === 'chaekium' ? null : 'chaekium')}
          className={cn(
            "flex-1 p-4 rounded-2xl border-2 transition-all",
            activeService === 'chaekium'
              ? "bg-amber-50 border-amber-200 shadow-md"
              : "bg-white border-amber-100 hover:border-amber-200"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-black text-amber-900">책이음</span>
          </div>
          <p className="text-[10px] text-amber-600 font-bold">전국 통합 회원증</p>
        </button>

        {/* 책바다 버튼 */}
        <button
          onClick={() => setActiveService(activeService === 'chaekbada' ? null : 'chaekbada')}
          className={cn(
            "flex-1 p-4 rounded-2xl border-2 transition-all",
            activeService === 'chaekbada'
              ? "bg-emerald-50 border-emerald-200 shadow-md"
              : "bg-white border-emerald-100 hover:border-emerald-200"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <Ship className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-black text-emerald-900">책바다</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold">국가 상호대차</p>
        </button>
      </div>

      {/* 책이음 설명 */}
      {activeService === 'chaekium' && (
        <div className="mt-3 p-5 bg-white border-2 border-amber-50 rounded-[2rem] shadow-sm relative overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <div className="absolute right-[-10px] top-[-10px] opacity-5">
            <CreditCard className="w-24 h-24 rotate-12" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md">💳 전국 통합 회원증</span>
            <h4 className="font-black text-gray-900">책이음 서비스</h4>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            살고 있는 지역에 상관없이, **책이음 회원권 하나만 있으면** 전국 참여 도서관 어디서든 별도 가입 없이 책을 빌릴 수 있어요. 한 번만 가입하면 전국 도서관이 내 집 앞 도서관이 됩니다!
          </p>
        </div>
      )}

      {/* 책바다 설명 */}
      {activeService === 'chaekbada' && (
        <div className="mt-3 p-5 bg-white border-2 border-emerald-50 rounded-[2rem] shadow-sm relative overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <div className="absolute right-[-10px] top-[-10px] opacity-5">
            <Ship className="w-24 h-24 -rotate-12" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md">🌊 국가 상호대차</span>
            <h4 className="font-black text-gray-900">책바다 서비스</h4>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            원하는 책이 우리 동네에 없나요? 전국의 다른 도서관 책을 **집 근처 도서관으로 택배 배달**해 드려요.
            <br/>
            <span className="inline-block mt-2 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              💰 비용: 왕복 약 5,200원 (지자체에 따라 할인/지원 가능)
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
