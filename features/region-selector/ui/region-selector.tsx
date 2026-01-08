"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { useRegionStore, REGIONS } from "../lib/use-region-store";
import { cn } from "@/shared/lib/cn";
import { RegionData, SubRegion } from "@/shared/config/region-codes";

interface RegionSelectorProps {
  className?: string;
}

export function RegionSelector({ className }: RegionSelectorProps) {
  const {
    selectedRegion,
    selectedSubRegion,
    isOpen,
    setRegion,
    setSubRegion,
    setIsOpen,
    getDisplayName,
  } = useRegionStore();

  const [step, setStep] = useState<"region" | "subRegion">("region");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setStep(selectedRegion ? "subRegion" : "region");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleRegionSelect = (region: RegionData) => {
    setRegion(region);
    if (region.subRegions && region.subRegions.length > 0) {
      setStep("subRegion");
    } else {
      setIsOpen(false);
    }
  };

  const handleSubRegionSelect = (subRegion: SubRegion) => {
    setSubRegion(subRegion);
  };

  const handleBack = () => {
    setStep("region");
  };

  return (
    <div className={cn("relative", className)}>
      {/* 선택 버튼 */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm w-full"
      >
        <MapPin className="w-4 h-4 text-blue-500" />
        <span className="flex-1 text-left font-medium text-gray-800 truncate">
          {mounted ? getDisplayName() : "지역을 선택하세요"}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={handleClose}
          />

          {/* 드롭다운 패널 */}
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[60vh] overflow-hidden">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
              {step === "subRegion" && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
                >
                  ←
                </button>
              )}
              <div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-0.5">Step {step === "region" ? "01" : "02"}</span>
                <span className="font-extrabold text-gray-900">
                    {step === "region" ? "어디에 사시나요?" : `${selectedRegion?.name} 어디인가요?`}
                </span>
              </div>
            </div>

            {/* 목록 */}
            <div className="overflow-y-auto max-h-[50vh] p-3">
              {step === "region" ? (
                <div className="grid grid-cols-2 gap-2">
                  {REGIONS.map((region) => (
                    <button
                      key={region.code}
                      type="button"
                      onClick={() => handleRegionSelect(region)}
                      className={cn(
                        "px-4 py-3 text-left rounded-2xl text-sm font-bold transition-all border-2",
                        selectedRegion?.code === region.code
                          ? "bg-blue-500 text-white border-transparent shadow-lg shadow-blue-100"
                          : "bg-white text-gray-600 border-gray-50 hover:border-blue-100 hover:bg-blue-50/30"
                      )}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {/* 시/군/구 목록 */}
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRegion?.subRegions?.map((subRegion) => (
                        <button
                        key={subRegion.code}
                        type="button"
                        onClick={() => handleSubRegionSelect(subRegion)}
                        className={cn(
                            "px-4 py-3 text-left rounded-2xl text-sm font-bold transition-all border-2 flex items-center justify-between",
                            selectedSubRegion?.code === subRegion.code
                            ? "bg-purple-500 text-white border-transparent shadow-lg shadow-purple-100"
                            : "bg-white text-gray-600 border-gray-50 hover:border-purple-100 hover:bg-purple-50/30"
                        )}
                        >
                        <span>{subRegion.name}</span>
                        {selectedSubRegion?.code === subRegion.code && (
                            <Check className="w-4 h-4" />
                        )}
                        </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
