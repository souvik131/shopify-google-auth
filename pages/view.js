import { Heading,Link, Page } from "@shopify/polaris";
import Router from 'next/router'

class Main extends React.Component {

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
      if(!loginData.loggedIn){
        ctx.res.writeHead(302, {Location: '/'})
        ctx.res.end()
      }
    }
    return {}
    
  }

  render() {
    return (
      <Page>
       <Heading>Congrats, you are logged in! 🎉</Heading> 
       <Link url={`${HOST}/logout`}  external={true}>Logout of google</Link>
      </Page>
    );
  }


}

export default Main;
