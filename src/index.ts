import { Hono } from 'hono';

import {  getUser  } from './route/user/user';

import { cors } from 'hono/cors'

import { verifyUserToken } from './utils/generator/token/token';

import { loginUser, registerUser } from './route/auth/auth';

import { showRoutes } from 'hono/dev'

const app = new Hono();

app.use('/v1/user/*', cors())

app.use(
  '/v1/user/*',
  cors({
    origin: '*',
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  })
)

app.get('/v1/user/getUser',verifyUserToken, getUser)

app.post('/v1/user/register', registerUser);

app.post('/v1/user/login', loginUser)

showRoutes(app)

export default app;
