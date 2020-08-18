import { Heading,Link, Page,Spinner } from '@shopify/polaris';
import Router from 'next/router'

class Index extends React.Component {

  static async getInitialProps(ctx){
    if(!ctx.req){
      return {loading:true}
    }

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
        return {loggedIn:true,loading:true}
      }
    }
    return {loggedIn:false,loading:true}
    
  }

  render() {
    if(this.props.loading){
      return (<Spinner accessibilityLabel="Loading..." size="large" color="teal" />)
    }
    return (
      this.props.loggedIn?
      <Page>
       <Heading>Congrats, you are logged in! 🎉</Heading> 
       <Link url={`https://theuncurbed.com/logout`}>Logout of google</Link>
      </Page>:<Page>
        <Heading>Welcome, connect with your google account 🚀</Heading> 
        <Link url={`https://theuncurbed.com/auth/google`} external={true}>Connect to Google</Link>
      </Page>
    );
  }


}

export default Index;