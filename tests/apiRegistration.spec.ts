import { test, expect } from '@playwright/test'
import { userData } from '../testData/users.data'
import * as fs from 'fs/promises'
import * as path from 'path'

const userFilePath = path.resolve(__dirname, '../testData/registeredUser.json')
const tokenFilePath = path.resolve(__dirname, '../testData/tokenUser.json')

test('API Sign Up', async ({ request }) => {
const response = await request.post('https://gitlab.testautomate.me/api/v4/users', {
  headers: {
    Authorization: 'Bearer FKzy_BpV5wAybKf7Z9JX',
  },
  form: {
    name: userData.firstName,
    username: userData.userName,
    email: userData.email,
    password: userData.password,
    skip_confirmation: true,
  }
});
    expect(response.status()).toBe(201);

    await fs.writeFile(userFilePath, JSON.stringify({
        email: userData.email,
        password: userData.password
    }, null, 2))
});

test('API Sign In', async ({ request }) => {
    const userData = await fs.readFile(userFilePath, 'utf-8')
    const registeredUser = JSON.parse(userData)
    
    const response = await request.post('https://gitlab.testautomate.me/oauth/token', {
        form: {
            grant_type: 'password',
            username: registeredUser.email,
            password: registeredUser.password
        }
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('access_token');

    // Save registered user info to file
    await fs.writeFile(tokenFilePath, JSON.stringify({
        access_token: responseBody.access_token
    }, null, 2))
});