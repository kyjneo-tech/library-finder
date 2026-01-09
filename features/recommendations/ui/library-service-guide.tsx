"use client";

import { Info, CreditCard, Ship, HelpCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";

export function LibraryServiceGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mx-4 mt-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between group transition-all hover:bg-indigo-100/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <HelpCircle className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-indigo-900 leading-tight">처음이신가요?</p>
            <p className="text-[11px] text-indigo-600 font-bold">책이음·책바다 이용 방법 알아보기</p>
          </div>
        </div>
        <div className={cn("transition-transform duration-300", isOpen ? "rotate-180" : "")}>
           <Info className="w-5 h-5 text-indigo-300" />
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 grid grid-cols-1 gap-3 animate-in slide-in-from-top-2 duration-300">
          {/* 책이음 설명 */}
          <div className="p-5 bg-white border-2 border-amber-50 rounded-[2rem] shadow-sm relative overflow-hidden">
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

          {/* 책바다 설명 */}
          <div className="p-5 bg-white border-2 border-emerald-50 rounded-[2rem] shadow-sm relative overflow-hidden">
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
        </div>
      )}
    </section>
  );
}
