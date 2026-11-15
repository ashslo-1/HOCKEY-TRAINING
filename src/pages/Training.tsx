import { Card, Page, PageHeader, Section } from '../components/ui'
import { Link } from '../components/Link'
import { ProgramList } from '../components/training/ProgramList'
import { DrillLibrary } from '../components/training/DrillLibrary'
import { PracticePlan } from '../components/training/PracticePlan'
import { usePracticePlan } from '../components/training/usePracticePlan'
import { bodyText, trainingCss } from '../components/training/styles'
import { colors, fonts } from '../theme'

const safetyNotes = [
  { title: 'Warm up first', text: 'Spend 5 to 10 minutes on light movement and stretching before skating drills or explosive off-ice work.' },
  { title: 'Wear full gear on the ice', text: 'Use a certified helmet and cage, throat protector, chest protector, pads, gloves and cup for any drill with pucks or shooters.' },
  { title: 'Work with a coach', text: 'A coach can watch technique, set the shot speed and adjust drills to your level. Younger goalies should always have an adult on the ice.' },
  { title: 'Build up gradually', text: 'Start with the beginner version, get the movement clean, then add speed or shots. Stop if something hurts.' },
]

export default function TrainingPage() {
  const plan = usePracticePlan()

  return (
    <Page>
      <style>{trainingCss}</style>
      <PageHeader
        kicker="Training"
        title="Goalie Training"
        intro="Training formats, a library of common goaltending drills, and a tool to build your own practice plan."
      />

      <Section kicker="Programs" title="Training formats">
        <p style={{ ...bodyText, marginBottom: '22px', maxWidth: '640px' }}>
          These are the formats goalie training usually takes. For prices, session length and availability,{' '}
          <Link to="/contact" className="tr-focus" style={{ color: colors.ice }}>get in touch</Link>.
        </p>
        <ProgramList />
      </Section>

      <Section kicker="Drill library" title="Goalie drills" id="drills">
        <p style={{ ...bodyText, marginBottom: '26px', maxWidth: '640px' }}>
          Filter by category or level, or search by name. Open a drill to see the steps and coaching points, then add it to your practice plan.
        </p>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <DrillLibrary plan={plan} />
          <div className="lg:sticky lg:top-24" style={{ minWidth: 0 }}>
            <PracticePlan plan={plan} />
          </div>
        </div>
      </Section>

      <Section kicker="Safety" title="How to use these drills">
        <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
          {safetyNotes.map((n) => (
            <Card key={n.title}>
              <h3 style={{ fontFamily: fonts.serif, fontSize: '19px', fontWeight: 700, margin: '0 0 8px' }}>{n.title}</h3>
              <p style={{ ...bodyText, fontSize: '14px' }}>{n.text}</p>
            </Card>
          ))}
        </div>
        <p style={{ ...bodyText, fontSize: '13px', marginTop: '18px', color: colors.textFaint }}>
          These descriptions are general goaltending information. Adjust them to the goalie’s age and level.
        </p>
      </Section>
    </Page>
  )
}
