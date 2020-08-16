import { Heading, Page , Button,Link} from "@shopify/polaris";

const Index = () => (
  <Page>
    <Heading>Welcome to uncurbed. Please Login 🎉</Heading>
    <Link  external={true} url="https://theuncurbed.com/auth/google">Sign in</Link>
  </Page>
);

export default Index;
