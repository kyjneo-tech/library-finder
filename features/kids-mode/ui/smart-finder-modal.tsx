"use client";

import { useState } from "react";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import {
  SMART_QUESTIONS,
  SmartAnswers,
  QuestionOption,
  buildSearchQuery,
} from "../lib/smart-questions";

interface SmartFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (keyword: string, kdc?: string) => void;
}

export function SmartFinderModal({ isOpen, onClose, onSearch }: SmartFinderModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SmartAnswers>({});

  const currentQuestion = SMART_QUESTIONS[step];
  const totalSteps = SMART_QUESTIONS.length;

  const handleSelectOption = (option: QuestionOption) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: option,
    };
    setAnswers(newAnswers);

    if (step < totalSteps - 1) {
      // 다음 질문으로
      setStep(step + 1);
    } else {
      // 마지막 질문 → 검색 실행
      const query = buildSearchQuery(newAnswers);
      onSearch(query.keyword, query.kdc);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep(0);
    setAnswers({});
    onClose();
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 모달 */}
      <div className="fixed inset-x-4 top-[20%] max-h-[70vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-bold text-lg">우리 아이 맞춤 책 찾기</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 진행 바 */}
          <div className="flex gap-1">
            {SMART_QUESTIONS.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex-1 h-1 rounded-full transition-all",
                  idx <= step ? "bg-white" : "bg-white/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* 질문 내용 */}
        <div className="p-6 overflow-y-auto max-h-[calc(70vh-120px)]">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">
              질문 {step + 1}/{totalSteps}
            </p>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {currentQuestion.question}
            </h3>
            <p className="text-sm text-gray-500">
              하나를 선택해주세요
            </p>
          </div>

          {/* 옵션 */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                className="w-full p-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {option.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 하단 버튼 */}
        {step > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full"
            >
              이전 질문으로
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
