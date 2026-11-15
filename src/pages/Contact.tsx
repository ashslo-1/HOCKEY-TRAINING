import { useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react'
import { Card, EmptyNote, Page, PageHeader } from '../components/ui'
import { site } from '../data/site'
import { buttonStyle, colors, eyebrow, fonts } from '../theme'

const topics = ['Private lesson', 'Group session', 'Camp or clinic', 'Other'] as const

const limits = { name: 80, email: 120, level: 80, message: 2000 }

type Fields = { name: string; email: string; level: string; topic: string; message: string }
type Errors = Partial<Record<keyof Fields, string>>

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]+$/

// Only use the configured address if it looks like a plain email, so it cannot add extra mailto parameters
const recipient = EMAIL_RE.test(site.contactEmail.trim()) ? site.contactEmail.trim() : ''

function httpsUrl(url: string): string | null {
  try {
    return new URL(url).protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

const socials = site.socials.flatMap((s) => {
  const url = httpsUrl(s.url)
  return url ? [{ label: s.label, url }] : []
})

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Enter your name.'
  if (!f.email.trim()) e.email = 'Enter your email address.'
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter an email address like name@example.com.'
  if (!f.topic) e.topic = 'Choose a topic.'
  if (!f.message.trim()) e.message = 'Enter a message.'
  return e
}

const labelStyle: CSSProperties = { ...eyebrow, color: colors.textMuted, display: 'block', marginBottom: '8px' }
const inputStyle: CSSProperties = {
  width: '100%', padding: '13px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${colors.border}`,
  color: colors.text, fontFamily: fonts.sans, fontSize: '16px', lineHeight: 1.4,
}
const inputClass = 'transition-colors focus:border-[#9fd8ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fd8ff] disabled:opacity-50'
const errorStyle: CSSProperties = { fontFamily: fonts.sans, fontSize: '13.5px', color: '#ff9aa1', marginTop: '6px' }

export default function ContactPage() {
  const [fields, setFields] = useState<Fields>({ name: '', email: '', level: '', topic: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const disabled = !recipient

  const update = (key: keyof Fields) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value.slice(0, limits[key as keyof typeof limits] ?? 200)
    setFields((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
    setSent(false)
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (disabled) return
    const found = validate(fields)
    setErrors(found)
    const firstBad = (Object.keys(found) as (keyof Fields)[])[0]
    if (firstBad) {
      document.getElementById(`contact-${firstBad}`)?.focus()
      return
    }
    const subject = `${fields.topic} inquiry from ${fields.name.trim()}`
    const body = [
      `Name: ${fields.name.trim()}`,
      `Email: ${fields.email.trim()}`,
      `Player age or level: ${fields.level.trim() || 'Not given'}`,
      `Topic: ${fields.topic}`,
      '',
      fields.message.trim(),
    ].join('\n')
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  const field = (key: keyof Fields, label: string, opts: { required?: boolean; type?: string; autoComplete?: string; hint?: string } = {}) => (
    <div>
      <label htmlFor={`contact-${key}`} style={labelStyle}>{label}{opts.required ? ' (required)' : ''}</label>
      <input
        id={`contact-${key}`}
        type={opts.type ?? 'text'}
        value={fields[key]}
        onChange={update(key)}
        maxLength={limits[key as keyof typeof limits]}
        autoComplete={opts.autoComplete}
        required={opts.required}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `contact-${key}-error` : undefined}
        placeholder={opts.hint}
        disabled={disabled}
        className={inputClass}
        style={inputStyle}
      />
      {errors[key] && <p id={`contact-${key}-error`} style={errorStyle}>{errors[key]}</p>}
    </div>
  )

  return (
    <Page>
      <PageHeader kicker="Contact" title="Get in touch" intro={`Ask ${site.coachName} about private lessons, group sessions, camps and clinics.`} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'flex-start' }}>
        <Card style={{ flex: '2 1 420px', minWidth: 0 }}>
          {disabled && (
            <div style={{ marginBottom: '22px' }}>
              <EmptyNote>
                The contact email has not been added yet, so this form cannot send. Set <code style={{ color: colors.ice }}>contactEmail</code> in <code style={{ color: colors.ice }}>src/data/site.ts</code> to turn it on.
              </EmptyNote>
            </div>
          )}
          <form onSubmit={onSubmit} noValidate style={{ display: 'grid', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '18px' }}>
              {field('name', 'Name', { required: true, autoComplete: 'name' })}
              {field('email', 'Email', { required: true, type: 'email', autoComplete: 'email' })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '18px' }}>
              {field('level', 'Player age or level', { hint: 'e.g. 12U, high school' })}
              <div>
                <label htmlFor="contact-topic" style={labelStyle}>Topic (required)</label>
                <select
                  id="contact-topic"
                  value={fields.topic}
                  onChange={update('topic')}
                  required
                  aria-invalid={errors.topic ? true : undefined}
                  aria-describedby={errors.topic ? 'contact-topic-error' : undefined}
                  disabled={disabled}
                  className={inputClass}
                  style={{ ...inputStyle, appearance: 'auto', colorScheme: 'dark' }}
                >
                  <option value="">Choose a topic</option>
                  {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.topic && <p id="contact-topic-error" style={errorStyle}>{errors.topic}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="contact-message" style={labelStyle}>Message (required)</label>
              <textarea
                id="contact-message"
                value={fields.message}
                onChange={update('message')}
                maxLength={limits.message}
                rows={6}
                required
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={`contact-message-count${errors.message ? ' contact-message-error' : ''}`}
                disabled={disabled}
                className={inputClass}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              {errors.message && <p id="contact-message-error" style={errorStyle}>{errors.message}</p>}
              <p id="contact-message-count" style={{ ...eyebrow, marginTop: '6px', textAlign: 'right' }}>{fields.message.length} / {limits.message}</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
              <button
                type="submit"
                disabled={disabled}
                className="transition-transform enabled:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9fd8ff] disabled:cursor-not-allowed disabled:opacity-40"
                style={buttonStyle('solid')}
              >
                Open email to send
              </button>
              <p role="status" style={{ fontFamily: fonts.sans, fontSize: '14px', color: colors.textMuted }}>
                {sent ? 'Your email app should open with the message filled in. Press send there to deliver it.' : ''}
              </p>
            </div>
            {!disabled && (
              <p style={{ fontFamily: fonts.sans, fontSize: '13.5px', lineHeight: 1.6, color: colors.textFaint }}>
                Submitting opens your email app with this message ready to send. Nothing is stored on this site.
              </p>
            )}
          </form>
        </Card>

        {(site.location || socials.length > 0 || recipient) && (
          <div style={{ flex: '1 1 260px', minWidth: 0, display: 'grid', gap: '14px' }}>
            {recipient && (
              <Card>
                <div style={eyebrow}>Email</div>
                <a href={`mailto:${recipient}`} className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#9fd8ff]" style={{ display: 'inline-block', marginTop: '8px', color: colors.text, fontFamily: fonts.sans, fontSize: '16px', overflowWrap: 'anywhere' }}>{recipient}</a>
              </Card>
            )}
            {site.location && (
              <Card>
                <div style={eyebrow}>Location</div>
                <p style={{ marginTop: '8px', fontFamily: fonts.sans, fontSize: '16px' }}>{site.location}</p>
              </Card>
            )}
            {socials.length > 0 && (
              <Card>
                <div style={eyebrow}>Social</div>
                <ul style={{ listStyle: 'none', marginTop: '8px', display: 'grid', gap: '8px' }}>
                  {socials.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#9fd8ff]" style={{ color: colors.ice, fontFamily: fonts.sans, fontSize: '15px' }}>{s.label}</a>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>
    </Page>
  )
}
