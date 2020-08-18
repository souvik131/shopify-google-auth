import { Heading,Link, Page,Spinner } from '@shopify/polaris';
import { useEffect, useState } from 'react';

export default function Index({ statesData }) {

  const [states, setStates] = useState(statesData);
   useEffect(() => {
     async function loadData() {
       const resp = await fetch(`${HOST}/checkGoogleLogin`,{
         headers:{
           cookie:cookie
         },
         method:"POST"
       })
       const loginData = await resp.json()
       setStates({loggedIn:loginData.loggedIn,loading:true})
     }
 
     if(statesData.log!==false||statesData.log!==true) {
         loadData();
     }
   }, {loading:true});
 
     if(states.loading){
       return (<Spinner accessibilityLabel="Loading..." size="large" color="teal" />)
     }
     return (
       states.loggedIn?
       <Page>
        <Heading>Congrats, you are logged in! 🎉</Heading> 
        <Link url={`https://theuncurbed.com/logout`}>Logout of google</Link>
       </Page>:<Page>
         <Heading>Welcome, connect with your google account 🚀</Heading> 
         <Link url={`https://theuncurbed.com/auth/google`} external={true}>Connect to Google</Link>
       </Page>
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
       if(loginData.loggedIn){
         return {loggedIn:true,loading:true}
       }
     }
     return {loggedIn:false,loading:true}
 };