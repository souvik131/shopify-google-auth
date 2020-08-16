import { Heading, Page ,Link} from "@shopify/polaris";
import {useRouter} from "next/router"

const Main = props => {
  console.log(props,"Props")
  return (<Page>
            <Heading>Congrats, you are logged in! 🎉</Heading> 
          </Page>);
}

export default Main;
