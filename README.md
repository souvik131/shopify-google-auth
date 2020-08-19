# Shopify Google Auth

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![Build Status](https://travis-ci.com/Shopify/shopify-app-node.svg?branch=master)](https://travis-ci.com/github/souvik131/shopify-google-auth)

Boilerplate to create an embedded Shopify app made with Node, [Next.js](https://nextjs.org/), [Shopify-koa-auth](https://github.com/Shopify/quilt/tree/master/packages/koa-shopify-auth), [Polaris](https://github.com/Shopify/polaris-react), and [App Bridge React](https://github.com/Shopify/app-bridge/tree/master/packages/app-bridge-react).


## Requirements

- If you don't have one, [register a domain](https://www.godaddy.com/garage/how-to-buy-a-domain-name/) .
- Start a [Node js Server](https://marketplace.digitalocean.com/apps/nodejs) in Digital Ocean.
- [Link the server ip](https://in.godaddy.com/help/add-an-a-record-19238) with your domain.
- [Get google creds](https://developers.google.com/adwords/api/docs/guides/authentication) for further setup.
- If you don’t have one, [create a Shopify partner account](https://partners.shopify.com/signup).
- If you don’t have one, [create a Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) where you can install and test your app.
- In the Partner dashboard, [create a new app](https://help.shopify.com/en/api/tools/partner-dashboard/your-apps#create-a-new-app). You’ll need this app’s API credentials during the setup process.

## Installation

To clone [Shopify Google Auth](https://github.com/souvik131/shopify-google-auth) run:

```sh
~/ $ git clone https://github.com/souvik131/shopify-google-auth.git
~/ $ cd shopify-google-auth
~/ $ cp .env.example .env
~/ $ nano .env
```

## Setup

Open the .env file and provide the following details

- *SHOPIFY_APP_NAME* is your app name in shopify partner.
- *SHOPIFY_API_KEY* is the api key linked to your app provided by shopify.
- *SHOPIFY_API_SECRET* is the api secret linked to your app provided by shopify.
- *SHOPIFY_SCOPES* is the shopify scopes to be used by your app provided by shopify.
- *GOOGLE_ID* is provided by google for OAuth
- *GOOGLE_SECRET* is provided by google for OAuth
- *GOOGLE_SCOPES* is the google OAuth scope.
- *JWT_SECRET* is a secret key is a unique key you provide and is internal to you.
- *HOST* is your domain name.
- *LISTEN_IP* is the ip where the app should listen to.
- *LISTEN_PORT* is the port where the app should listen to.

> [!NOTE]
> .env is not tracked by git. You need to edit it in your environment seperately.

## Running

```sh
~/ $ npm run-script start
```

## License

This respository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
