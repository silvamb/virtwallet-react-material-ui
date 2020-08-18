import React from 'react'
import { injectIntl } from 'react-intl'
import Page from 'material-ui-shell/lib/containers/Page/Page'
import Scrollbar from 'material-ui-shell/lib/components/Scrollbar'

const AboutPage = ({ intl }) => {
  return (
    <Page pageTitle={intl.formatMessage({ id: 'about' })}>
      <Scrollbar>
        
      </Scrollbar>
    </Page>
  )
}
export default injectIntl(AboutPage)
