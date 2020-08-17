import { EmptyState, Layout, Page, Link } from '@shopify/polaris';
import { ResourcePicker } from '@shopify/app-bridge-react';
import store from 'store-js';
import ResourceListWithProducts from '../components/ResourceList';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

class Index extends React.Component {
  state = { open: false };
  static async getInitialProps(ctx){
    const cookie = ctx.req.headers.cookie;
    const resp = await fetch(`${HOST}/init`,{
      headers:{
        cookie:cookie
      },
      method:"POST"
    })
    const json = await resp.json()
    return {shop:json.shopOrigin}
  }
  render() {
    const emptyState = !store.get('ids');
    console.log(this.props)
    return (
      <Page
        primaryAction={{
          content: 'Select products',
          onAction: () => this.setState({ open: true }),
        }}
      >
        <Link url={`https://theuncurbed.com/auth/google?shop=${this.props.shop}`} external={true}>Login to Google for {this.props.shop}</Link>
        <ResourcePicker
          resourceType="Product"
          showVariants={false}
          open={this.state.open}
          onSelection={(resources) => this.handleSelection(resources)}
          onCancel={() => this.setState({ open: false })}
        />
        {emptyState ? (
          <Layout>
            <EmptyState
              heading="Discount your products temporarily"
              action={{
                content: 'Select products',
                onAction: () => this.setState({ open: true }),
              }}
              image={img}
            >
              <p>Select products to change their price temporarily.</p>
            </EmptyState>
          </Layout>
        ) : (
            <ResourceListWithProducts />
          )}
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