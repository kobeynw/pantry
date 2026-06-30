import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, onSubmit, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed top-0 bottom-0 right-0 left-0 flex justify-center items-center bg-gray-50/50" onClick={onClose}>
      <div className="flex flex-col justify-center items-center bg-accent-content min-w-3/4 rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-8 py-4">
          <div className="text-2xl">{title}</div>
        </div>
        <div>
          {children}
        </div>
        <div className="flex flex-row justify-between gap-4 px-8 py-4">
          <button className="btn" onClick={onSubmit}>
            <div className="text-lg">Submit</div>
          </button>
          <button className="btn" onClick={onClose}>
            <div className="text-lg">Cancel</div>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
