import { Link, Page } from '@shopify/polaris';

class Index extends React.Component {
  render() {
    return (
      <Page>
        <Link url={`https://theuncurbed.com/auth/google`} external={true}>Connect to Google</Link>
      </Page>
    );
  }

  handleSelection = (resources) => {
    const idsFromResources = resources.selection.map((product) => product.id);
    this.setState({ open: false });
    store.set('ids', idsFromResources);
  };
}

export default Index;