import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import App, { Container } from "next/app";
import { AppProvider } from "@shopify/polaris";
import { Provider } from "@shopify/app-bridge-react";
import Cookies from "js-cookie";
import "@shopify/polaris/styles.css";
import translations from "@shopify/polaris/locales/en.json";

const client = new ApolloClient({
  fetchOptions: {
    credentials: "include"
  }
});
class MyApp extends App {
  static async getInitialProps(ctx){
    if(ctx.req&&ctx.req.headers&&ctx.req.headers.cookie){
      const cookie = ctx.req.headers.cookie;
      const resp = await fetch(`${HOST}/getMyShopOrigin`,{
        headers:{
          cookie:cookie
        },
        method:"POST"
      })
      const validatedData = await resp.json()
      if(validatedData.validated){
        return {shop:json.data}
      }
    }
    return {}
    
  }

  render() {
    const { Component, pageProps } = this.props;
    const shopOrigin = this.props.shop||Cookies.get("shopOrigin");
    return (
      <Container>
        <AppProvider i18n={translations}>
          <Provider
            config={{
              apiKey: API_KEY,
              shopOrigin: shopOrigin,
              forceRedirect: true
            }}
          >
            <ApolloProvider client={client}>
              <Component {...pageProps} />
            </ApolloProvider>
          </Provider>
        </AppProvider>
      </Container>
    );
  }
}

export default MyApp;
