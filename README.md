# virtwallet-react-material-ui

Front-end built in React JS and Material UI for the [Virtwallet Serverless App](https://github.com/silvamb/virtwallet-serverless).

This project was created using the Material UI template, with the  [Create React App](https://reactjs.org/docs/create-a-new-react-app.html).

The template includes all features from `base-shell` expanded with [Material-UI](https://material-ui.com). It has some basic pages like `Page not found`, a responsive `menu` and other configurations for `Material-UI`. To start a new project with this template just run this command:

```js
npx create-react-app my-app --template material-ui
cd my-app
npm start
```

## Installation

1. Clone the Repository
2. Create the file `src/utils/external-config.json`
3. Define the configurations in the file. It should look like:

```json
{
    "AmplifyConfig": {
        "Auth": {
            "region": "us-east-1",
            "userPoolId": "us-east-1_abcDEfgh",
            "userPoolWebClientId": "4c51u8i9asx31gkv2ea5md5yb"
        }
    },
    "ApiConfig" : {
        "baseURL": "http://localhost:3000",
        "timeout": 5000
    }
}
```
4. Set proxy settings in `package.json` to avoid CORS issues.

```json
"proxy": "https://<restapiid>.execute-api.<region>.amazonaws.com/dev"
```

5. Start the development server

```js
npm start
```