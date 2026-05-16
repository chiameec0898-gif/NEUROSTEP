// ============================================================
// src/components/PageHeader.jsx
// Header halaman dalam aplikasi dengan tombol kembali/tutup
// ============================================================

import { useNavigate } from 'react-router-dom'
import { X, ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, onClose, backTo, variant = 'close' }) {
  const navigate = useNavigate()

  function handleAction() {
    if (onClose) {
      onClose()
    } else if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 md:px-6 lg:px-8">
      <h1 className="text-lg font-bold text-gray-900 flex-1 text-center pr-8">
        {title}
      </h1>
      <button
        onClick={handleAction}
        className="absolute right-4 p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        aria-label="Tutup"
      >
        {variant === 'back' ? (
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        ) : (
          <X className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </div>
  )
}
