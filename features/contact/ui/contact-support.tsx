'use client';

import { useState } from 'react';
import { MessageCircle, Send, Loader2, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

export function ContactSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '메시지 전송에 실패했습니다.');
      }

      toast.success('문의가 접수되었습니다!', {
        description: '빠른 시일 내에 답변 드리겠습니다.',
      });
      setIsOpen(false);
      setFormData({ email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('전송 실패', {
        description: error instanceof Error ? error.message : '일시적인 오류가 발생했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-800 hover:-translate-y-1 transition-all flex items-center gap-2 group"
            aria-label="문의하기"
          >
            <MessageCircle className="w-5 h-5 group-hover:animate-bounce" />
            <span className="font-bold">문의하기</span>
          </motion.button>
        )}
      </AnimatePresence>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-purple-600" />
              </span>
              문의하기
            </DialogTitle>
            <DialogDescription>
              서비스 이용 중 불편한 점이나 건의사항을 남겨주세요.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-bold text-gray-700">이메일</label>
              <Input
                id="email"
                type="email"
                required
                placeholder="답변 받으실 이메일 주소"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-gray-50 border-gray-100 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="subject" className="text-sm font-bold text-gray-700">제목</label>
              <Input
                id="subject"
                required
                placeholder="문의 제목을 입력해주세요"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="bg-gray-50 border-gray-100 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="text-sm font-bold text-gray-700">내용</label>
              <textarea
                id="message"
                required
                placeholder="내용을 자세히 적어주시면 도움이 됩니다."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="flex w-full rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] resize-none focus:bg-white transition-all"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl px-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    보내기
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
