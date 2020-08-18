import { Heading,Link, Page,Spinner } from '@shopify/polaris';
import { useEffect, useState } from 'react';

export default function Index(statesData) {

  const [states, setStates] = useState(statesData);
  
  useEffect(() => {
    if(statesData.loading===true) {
    ;(async()=>{
      const resp = await fetch(`${HOST}/checkGoogleLogin`,{method:"POST"})
      const loginData = await resp.json()
      setStates(loginData)
    })();
    }
  }, []);
 
  return (
    states.loading?
      <Spinner accessibilityLabel="Loading..." size="large" color="teal" />
      :(states.loggedIn?
        <Page>
          <Heading>Congrats, you are logged in! 🎉</Heading> 
          <Link url={`https://theuncurbed.com/logout`}>Logout of google</Link>
        </Page>
        :<Page>
          <Heading>Welcome, connect with your google account 🚀</Heading> 
          <Link url={`https://theuncurbed.com/auth/google`} external={true}>Connect to Google</Link>
        </Page>)
  );
 }
 
 Index.getInitialProps = async ctx => {
     if(!ctx.req) {
         return { loading:true };
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
       return loginData
     }
     return {loggedIn:false}
 };