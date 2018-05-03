# SmartCharts

SmartCharts is both the name of the app ([charts.binary.com](https://charts.binary.com/)) and the charting library. You can install the library to your project via:

    yarn add @binary-com/smartcharts

**Important Note:** the license for the library is tied to the `binary.com` domain name; it will not work in github pages.

## Commands:
- use `yarn install` to install dependencies
- use `yarn start` to launch webpack dev server
- use `yarn build` to build the library
- use `yarn build:app` to build the [charts.binary.com](https://charts.binary.com/) app
- use `yarn analyze` to run webpack-bundle-analyzer

> Note: eventhough both `yarn build` and `yarn build:app` outputs `smartcharts.js` and `smartcharts.css`, **they are not the same files**. One outputs a library and the the other outputs an app.

## Quick Start

In the `app` folder, we provide a working webpack project that uses the smartcharts library. Simply `cd` to that directory and run:

    yarn install
    yarn start

The sample app should be running in http://localhost:8080. 

Refer to library usage inside `app/index.jsx`:

```jsx
import { SmartChart } from '@binary-com/smartcharts';

class App extends React.Component {
    render() {
        return (
            <SmartChart
                onSymbolChange={(symbol) => console.log('Symbol has changed to:', symbol)}
                requestSubscribe={({ symbol, granularity, ... }, cb) => {}}   // Passes the whole req object
                requestForget={({ symbol, granularity }, cb) => {}}         // cb is exactly the same reference passed to subscribe
                // for active_symbols, trading_times, ... (NOT streaming)
                requestAPI={({...}) => Promise} // whole request object, shouldn't contain req_id
            />
        );
    }
};
```

SmartCharts expects library user to provide `requestSubscribe`, `requestForget` and `requestAPI`. `requestSubscribe` and `requestForget` handles streaming data (which in this case is just `tick_history`), whereas `requestAPI` accept single calls.

The job of loading the active symbols or trading times or stream data from cache or retrieving from websocket is therefore NOT the responsibility of SmartCharts but the host application. SmartCharts simply makes the requests and expect a response in return.

Some important notes on your webpack.config.js (refer to `app/webpack.config.js`):

 - The ChartIQ library and the smartcharts CSS file will need to be copied from the npm library (remember to include in your `index.html`). In the example we use the `copy-webpack-plugin` webpack plugin to do this:
 
 ```js
new CopyWebpackPlugin([
    { from: './node_modules/@binary-com/smartcharts/dist/chartiq.min.js' },
    { from: './node_modules/@binary-com/smartcharts/dist/smartcharts.css' },
])
```

 - You need to expose `CIQ` (the ChartIQ library) as a global object:
 
```js
externals: {
    CIQ: 'CIQ'
}
```

### Translations

All strings that need to be translated must be inside `t.translate()`:

```js
t.translate('[currency] [amount] payout if the last tick.', { 
    currency: 'USD',
    amount: 43.12
});
t.setLanguage('fr'); // components need to be rerendered for changes to take affect
```

Each time a new translation string is added to the code, you need to update the `messages.pot` via:

    yarn translations

Once the new `messages.pot` is merged into the `dev` branch, it will automatically be updated in [CrowdIn](https://crowdin.com/project/smartcharts/settings#files). You should expect to see a PR with the title **New Crowdin translations**
 in a few minutes; this PR will update the `*.po` files.
 
### Contribute

To contribute to SmartCharts, fork this project and checkout the `dev` branch. When adding features or performing bug fixes, it is recommended you make a separate branch off `dev`. Prior to sending pull requests, make sure all unit tests passed:

    yarn test

Once your changes have been merged to `dev`, it will immediately deployed to [charts.binary.com/beta](https://charts.binary.com/beta/). 

### Developer Notes

#### Separation of App and Library

There should be a clear distinction between developing for app and developing for library. Library source code is all inside `src` folder, whereas app source code is inside `app`.

Webpack determines whether to build an app or library depending on whether an environment variable `BUILD_MODE` is set to `app`. Setting this variable switches the entry point of the project, but on the **same** `webpack.config.js` (the one on the root folder). The `webpack.config.js` and `index.html` in the `app` folder is never actually used in this process; they serve as a guide to how to use the smartcharts library as an npm package. We do it this way to develop the app to have hot reload available when we modify library files.



### Manual Deployment

#### Deploy to NPM

    yarn build && yarn publish

#### Deploy to [charts.binary.com](https://charts.binary.com/)

> Note: This is usually not required, since Travis will automatically deploy to [charts.binary.com](https://charts.binary.com/) and [charts.binary.com/beta](https://charts.binary.com/beta/) when `master` and `dev` is updated.

The following commands will build and deploy to charts.binary.com (*Make sure you are in the right branch!*); you will need push access to this repository for the commands to work:

    yarn deploy:beta        # charts.binary.com/beta
    yarn deploy:production  # charts.binary.com

#### Deploy to Github Pages

As ChartIQ license is tied to the `binary.com` domain name, we provide developers with a `binary.sx` to test out the library on their Github Pages.

Assuming you have a `binary.sx` subdomain pointed to your `github.io` page, you can deploy the SmartCharts app by doing the following:

 1.  add a file with named `CNAME`  in your project directory with your site name, Ex: `developer.binary.sx`
 2. run `yarn build-travis  && yarn gh-pages`

Now you should be able to see your SmartCharts app on (`developer.binary.sx` )

> Note: `yarn build-travis` will add hashing inside `index.html`; **do not push those changes to git!**
