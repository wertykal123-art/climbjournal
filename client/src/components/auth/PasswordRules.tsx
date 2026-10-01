import { Check, Circle } from 'lucide-react'
import { PASSWORD_RULES } from '@/utils/validation'

export default function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-x-4 gap-y-1 text-xs" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password)
        return (
          <li key={rule.label} className={`flex items-center gap-1.5 ${ok ? 'text-send' : 'text-rock-500'}`}>
            {ok ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Circle className="w-3 h-3" aria-hidden="true" />}
            <span>{rule.label}</span>
            <span className="sr-only">{ok ? '(met)' : '(not met)'}</span>
          </li>
        )
      })}
    </ul>
  )
}
