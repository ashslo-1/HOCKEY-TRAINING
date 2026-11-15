import { Link } from '../components/Link'
import { Page, PageHeader } from '../components/ui'
import { buttonStyle } from '../theme'

export default function NotFoundPage() {
  return (
    <Page>
      <PageHeader kicker="404" title="Page not found" intro="That page does not exist." />
      <Link to="/" style={buttonStyle('solid')}>Back home</Link>
    </Page>
  )
}
