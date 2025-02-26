declare module 'intuit-oauth' {
    type Environment = 'sandbox' | 'production';
  
    interface OAuthClientOptions {
      clientId: string;
      clientSecret: string;
      environment: Environment;
      redirectUri: string;
    }
  
    class OAuthClient {
      constructor(options: OAuthClientOptions);
      environment: Environment;
      authorizeUri(options: { scope: string[]; state: string }): string;
      createToken(redirectUri: string): Promise<any>;
      getToken(): any;
      makeApiCall(options: { url: string }): Promise<any>;
      static scopes: {
        Accounting: string;
        OpenId: string;
      };
    }
  
    export default OAuthClient;
  }