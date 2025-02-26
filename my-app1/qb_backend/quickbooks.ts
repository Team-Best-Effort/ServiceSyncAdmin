import { Router, Request, Response } from 'express';
import OAuthClient from 'intuit-oauth';

interface Token {
  realmId: string;
  [key: string]: any;
}

const router = Router();

const oauthClient = new OAuthClient({
  clientId: process.env.CLIENT_ID || '',
  clientSecret: process.env.CLIENT_SECRET || '',
  environment: (process.env.ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  redirectUri: process.env.REDIRECT_URI || '',
});

let tokenData: Token | null = null;

router.get('/auth', (req: Request, res: Response) => {
  try {
    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
      state: 'testState',
    });
    res.redirect(authUri);
  } catch (error: any) {
    console.error('Error generating auth URI:', error);
    res.status(500).send('Failed to initiate QuickBooks auth: ' + error.message);
  }
});

router.get('/callback', async (req: Request, res: Response) => {
  console.log('Callback route hit with query:', req.query);
  try {
    const parseRedirect = req.url;
    const tokenResponse = await oauthClient.createToken(parseRedirect);
    tokenData = tokenResponse.getJson();
    console.log('Token received:', tokenData);
    res.redirect('http://localhost:3000/payroll');
  } catch (error: any) {
    console.error('Error in callback route:', error);
    res.status(400).send('Error during QuickBooks OAuth callback: ' + error.message);
  }
});

router.get('/company-info', async (req: Request, res: Response) => {
  try {
    const token = oauthClient.getToken();
    if (!token || !token.realmId) {
      res.status(401).json({ error: 'No valid token or realmId found. Please authenticate first.' });
      return;
    }
    const companyID = token.realmId;

    const baseURL =
      oauthClient.environment === 'sandbox'
        ? 'https://sandbox-quickbooks.api.intuit.com/'
        : 'https://quickbooks.api.intuit.com/';

    const apiResponse = await oauthClient.makeApiCall({
      url: `${baseURL}v3/company/${companyID}/companyinfo/${companyID}`,
    });

    res.json(JSON.parse(apiResponse.text()));
  } catch (error: any) {
    console.error('Error fetching company info:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;