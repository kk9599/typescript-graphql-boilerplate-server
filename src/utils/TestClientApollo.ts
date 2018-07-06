/* tslint:disable no-implicit-dependencies*/
import { ApolloClient } from "apollo-client";
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { setContext } from "apollo-link-context";
import gql from "graphql-tag";
import * as fetch from "node-fetch";

// let subscriptionToken = null;
// Create an http link:
// const httpLink = new HttpLink({
//   uri: process.env.TEST_HOST,
//   fetch
// } as any);

// Create a WebSocket link:
// const wsLink = new WebSocketLink({
//   uri: process.env.TEST_HOST_WS,
//   options: {
//     reconnect: true,
//     connectionParams: () => ({})
//   }
// } as any);

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
// const link = split(
//   // split based on operation type
//   ({ query }) => {
//     const { kind, operation } = getMainDefinition(query);
//     return kind === "OperationDefinition" && operation === "subscription";
//   },
//   wsLink,
//   httpLink
// );

export class TestClientApollo {
  url: string;
  token: any;
  client: ApolloClient<NormalizedCacheObject>;
  httpLink: HttpLink;
  wsLink: WebSocketLink;
  authLink: any;
  // options: { jar: any; withCredentials: boolean; json: true };
  constructor(iUrl: string, iToken: any = null) {
    this.url = iUrl;
    // this.options = { withCredentials: true, jar: rp.jar(), json: true };
    this.token = iToken;
    // console.log("!!! in constructor, ", this.url, this.token);
    this.httpLink = new HttpLink({ uri: this.url, fetch } as any);
    // credentials: "include"

    this.wsLink = new WebSocketLink({
      uri: this.url.replace("http://", "ws://"),
      options: {
        reconnect: true,
        connectionParams: () => ({
          token: this.token
        })
      }
    } as any);

    this.authLink = setContext((_, { headers }) => {
      // get the authentication token from local storage if it exists
      // const token = localStorage.getItem("token");
      // return the headers to the context so httpLink can read them
      // console.log("TOKEN!!!", this.token);
      return { headers: { ...headers, authorization: `Bearer ${this.token}` } };
    });

    this.client = new ApolloClient({
      link: split(
        // split based on operation type
        ({ query }) => {
          const {
            kind,
            operation
          }: {
            kind: string;
            operation?: string;
          } = getMainDefinition(query);
          return kind === "OperationDefinition" && operation === "subscription";
        },
        this.wsLink,
        this.authLink.concat(this.httpLink)
      ),
      cache: new InMemoryCache({ addTypename: false })
    });
  }

  async login(email: string, password: string) {
    const responseLogin = await this.client.mutate({
      mutation: gql`
      mutation {
          login(email: "${email}", password: "${password}") {
            error {
              path
              message
            }
            login
          }
        }
      `
    });
    this.token = (responseLogin as any).data.login.login;
    return responseLogin;
  }

  async register(email: string, password: string) {
    return this.client.mutate({
      mutation: gql`
      mutation {
        register(email: "${email}", password: "${password}") {
          error {
            path
            message
          }
          register
        }
      }
      `
    });
  }

  async me() {
    return this.client.query({
      query: gql`
        query {
          me {
            id
            email
          }
        }
      `
    });
  }

  async logout() {
    this.token = null;
    return this.client.mutate({
      mutation: gql`
        mutation {
          logout
        }
      `
    });
  }

  async forgotPasswordChange(newPassword: string, key: string) {
    this.token = null;
    return this.client.mutate({
      mutation: gql`
        mutation {
          forgotPasswordChange(newPassword: "${newPassword}", key: "${key}") {
            path
            message
          }
        }
      `
    });
  }

  // async forgotPasswordChange(newPassword: string, key: string) {
  //   return rp.post(this.url, {
  //     ...this.options,
  //     body: {
  //       query: `

  //       `
  //     }
  //   });
  // }
}