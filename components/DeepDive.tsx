'use client'

import { useState } from 'react'

interface DeepDiveProps {
  content: string
}

export function DeepDive({ content }: DeepDiveProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={[
          'w-full bg-transparent border-none border-t border-[#1e1e1e] text-text-dim font-mono',
          'text-[0.65rem] py-2 px-4 cursor-pointer text-left tracking-[0.08em] uppercase',
          'flex justify-between items-center transition-colors hover:text-gold hover:bg-surface',
        ].join(' ')}
      >
        <span>{open ? 'Explain Less' : 'Explain More'}</span>
        <span
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          className="deep-dive px-4 py-[14px] border-t border-[#1a1a1a] bg-surface-deep"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </>
  )
}
