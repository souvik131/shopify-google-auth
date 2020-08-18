import { Link, Page } from '@shopify/polaris';
import Router from 'next/router'
class Index extends React.Component {

  // static async getInitialProps(){    
  // }

  render() {
    return (
      <Page>
        <Link url={`https://theuncurbed.com/auth/google`} external={true}>Connect to Google</Link>
      </Page>
    );
  }


}

export default Index;