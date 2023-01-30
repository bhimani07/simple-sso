# Single sign-on

## Introduction

Inspired from <a href="https://codeburst.io/building-a-simple-single-sign-on-sso-server-and-solution-from-scratch-in-node-js-ea6ee5fdf340">blog</a>

The web application uses the browser/server architecture, HTTP as the communication protocol. HTTP is a stateless protocol. Each time the browser requests, the server processes it independently and does not associate with the previous or subsequent request. But it also means that any user can access the server resources through the browser. If you want to protect some resources of the server, you must restrict the browser request; to limit the browser request, you must authenticate the browser request, respond to the legitimate request, ignore Illegal request; to authenticate a browser request, you must be aware of the browser request status. Since the HTTP protocol is stateless, so we let the server and browser maintain a state together, using the mechanism such as ‘Cookies’ or ‘Sessions’ or ‘JWT’.

When we have a single system the state mechanism, through the the login authentication is easy to maintain. But when a single system evolves into multiple system, how do we maintain the state of each individual system, do users have to log in one by one and then log out one by one?

The golden rule of the good users solution is that, the growing complexity of your architecture should be borne by the system rather than the user. No matter how complex the internals of the web system is, it is a unified whole for the users. That is to say, the entire application group of the user accessing the web system is the same as accessing a single system.

So how do we write the system using single-system login solution?
Remember the Good old ‘Cookies’ solution, but then we hit domain restriction of the cookie street, until we unified the domain names of all subsystems in the web application group under a top-level domain name.

> But then, Microservices ate the Cookies

People started using different technologies to build their services sometime utilizing different domains too, where key value of the cookie (JSESSIONID in Java) is different than (session in Node.js), and suddenly the session was not easier to be maintained.

And, we all started building a new login method to enable login for multi-system application groups. This is single sign-on.

## Single Sign-On(SSO)

> The basic working principle on which SSO works is you can log in to a system in a multi-system application group and be authorized in all other systems without having to log in again, including single sign-on and single sign-off.

Going forward we are going to write the same for us, for learning perspective.

> Enterprise solutions needs much more efforts than what we we are going to put😅. That’s a sole reason Enterprise solutions are in business.

**So how do we login using SSO?**

At the Heart ❤️ of SSO we have a single independent authentication server, which can accept security information such as user’s email, username and password. Other systems do not provide login access and only accept indirect authorization from the authentication server. The indirect authorization is implemented using the token.
