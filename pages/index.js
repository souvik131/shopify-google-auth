import { Link, Page } from '@shopify/polaris';
import Router from 'next/router'

class Index extends React.Component {

  static async getInitialProps(ctx){
    if(ctx.req&&ctx.req.headers&&ctx.req.headers.cookie){
      const cookie = ctx.req.headers.cookie;
      const resp = await fetch(`${HOST}/checkGoogleLogin`,{
        headers:{
          cookie:cookie
        },
        method:"POST"
      })
      const loginData = await resp.json()
      if(loginData.loggedIn){
        ctx.res.writeHead(302, {Location: '/view'})
        ctx.res.end()
      }
    }
    return {}
    
  }

  render() {
    return (
      <Page>
        <Link url={`https://theuncurbed.com/auth/google`} external={true}>Connect to Google</Link>
      </Page>
    );
  }


}

export default Index;