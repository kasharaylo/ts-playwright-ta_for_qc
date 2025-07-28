import { test, expect, request } from '@playwright/test'
import { userData, developerData } from '../testData/users.data'
import { regisration, signIn } from '../pages/register.page'
import * as fs from 'fs/promises'
import * as path from 'path'
import { SignInPage } from '../pages/register.page'

const adminFilePath = path.resolve(__dirname, '../testData/registeredAdmin.json')
const tokenFilePath = path.resolve(__dirname, '../testData/tokenAdmin.json')
const projectName = `project_${Date.now()}`

    // When I register 'project admin' user via Gitlab 'UI'
    // Then I see the 'project admin' user is registered
    // And I become logged in as 'project admin' user

test('Register project admin user', async ({ page }) => {
    await page.goto('https://gitlab.testautomate.me/users/sign_up')
    
    await page.fill(regisration.firstName, userData.firstName)
    await page.fill(regisration.lastName, userData.lastName)
    await page.fill(regisration.userName, userData.userName)
    await page.fill(regisration.email, userData.email)
    await page.fill(regisration.password, userData.password)

    await page.click(regisration.registerButton)
    await expect(page).toHaveURL('https://gitlab.testautomate.me/users/sign_up/welcome')

    // Save user data to file
    await fs.writeFile(adminFilePath, JSON.stringify({
        email: userData.email,
        password: userData.password,
        userName: userData.userName
    }, null, 3))

    await page.getByLabel('Role').selectOption('other')
    await page.getByLabel('I\'m signing up for GitLab').selectOption('basics')
    await page.getByRole('button', { name: 'Get started!' }).click()
})

    // When I create a project
    // Then I see that project is created on 'UI' level
    // And I see that project is created on 'API' level

test('Create a project and verify on UI', async ({ page, request }) => {
    const signInPage = new SignInPage(page)
    
    // Read user info from file
    const adminData = await fs.readFile(adminFilePath, 'utf-8')
    const registeredUser = JSON.parse(adminData)

    await page.goto('https://gitlab.testautomate.me/users/sign_in')
    await signInPage.userName.fill(registeredUser.email)
    await signInPage.password.fill(registeredUser.password)
    await signInPage.rememberMe.check({ force: true })
    await signInPage.signInButton.click()

    // Create a new project via UI
    await page.goto('https://gitlab.testautomate.me/projects/new#blank_project')
    await page.fill('input[name="project[name]"]', projectName)
    await page.getByRole('button', { name: 'Create project' }).click()

    // UI check: Project page should open
    await expect(page).toHaveURL(`https://gitlab.testautomate.me/${registeredUser.userName}/${projectName}`)
})

test('API Sign In and Verify Project Creation', async ({ request }) => {
    // API check: Login to get access token
    const adminDataAPI = await fs.readFile(adminFilePath, 'utf-8')
    const registeredAdmin = JSON.parse(adminDataAPI)
        
    const response = await request.post('https://gitlab.testautomate.me/oauth/token', {
        form: {
            grant_type: 'password',
            username: registeredAdmin.email,
            password: registeredAdmin.password
        }
    })
    expect(response.status()).toBe(200)
    const responseBody = await response.json()
    expect(responseBody).toHaveProperty('access_token')
    
    // Save registered user info to file
    await fs.writeFile(tokenFilePath, JSON.stringify({
        access_token: responseBody.access_token
    }, null, 2))
    
    // API check: Verify project creation via API
    const tokenData = JSON.parse(await fs.readFile(tokenFilePath, 'utf-8'))
    const encodedPath = encodeURIComponent(`${registeredAdmin.userName}/${projectName}`);
    const apiResponse = await request.get(`https://gitlab.testautomate.me/api/v4/projects/${encodedPath}`, {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
    })
    console.log(registeredAdmin.userName)
	console.log(projectName)
	console.log(encodedPath)

    // Todo: Uncomment the next line to enable API response status check
    //expect(apiResponse.status()).toBe(200)
})

    // When I register 'developer' user via Gitlab 'API'
    // Then I see the 'developer' user is registered

test('Register Developer User via API', async ({ request }) => {
    const response = await request.post('https://gitlab.testautomate.me/api/v4/users', {
          headers: {
            Authorization: 'Bearer FKzy_BpV5wAybKf7Z9JX',
        },
        form: {
            email: developerData.email,
            password: developerData.password,
            username: developerData.userName,
            name: developerData.lastName,
            skip_confirmation: true,
            projects_limit: 10,
            can_create_group: true
        }
    })
    expect(response.status()).toBe(201)

    // Save developer user data to file, including password
    const developerUserResponse = await response.json()
    await fs.writeFile(
        path.resolve(__dirname, '../testData/developerUser.json'),
        JSON.stringify(
            {
                ...developerUserResponse,
                password: developerData.password, // Ensure password is saved
                email: developerData.email        // Ensure email is saved
            },
            null,
            2
        )
    )
})

    // When I add 'developer' user as a member of the project
    // Then I can can see 'developer' user in the project member list

test('Add Developer User to Project Members', async ({ page, request }) => {
    const developerData = JSON.parse(await fs.readFile(path.resolve(__dirname, '../testData/developerUser.json'), 'utf-8'))

    // Read admin token from file
    const tokenData = JSON.parse(await fs.readFile(tokenFilePath, 'utf-8'))

    // Add developer to project via API
    const encodedPath = encodeURIComponent(`${userData.userName}/${projectName}`);
    const response = await request.post(`https://gitlab.testautomate.me/api/v4/projects/${encodedPath}/members`, {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
        form: {
            user_id: developerData.id,
            access_level: 30 // Developer access level
        }
    })
    // Todo: Uncomment the next line to enable API response status check
    expect(response.status()).toBe(201)

    // Verify in UI
    await page.goto(`https://gitlab.testautomate.me/${userData.userName}/${projectName}/-/project_members`)
    await expect(page.getByText(developerData.username)).toBeVisible()
})

    // When I create an issue and assign 'developer' user to created issue
    // Then I see the issue is created
    //  And I see 'developer' user is assigned to the issue

test('Create Issue and Assign Developer User', async ({ page, request }) => {
    // Read admin token from file
    const tokenData = JSON.parse(await fs.readFile(tokenFilePath, 'utf-8'))

    // Create an issue via API
    const encodedPath = encodeURIComponent(`${userData.userName}/${projectName}`);
    const response = await request.post(`https://gitlab.testautomate.me/api/v4/projects/${encodedPath}/issues`, {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
        form: {
            title: `Issue for ${developerData.userName}`,
            description: 'This is a test issue',
            assignee_ids: String(developerData.id)
        }
    })
    // Todo: Uncomment the next line to enable API response status check
    expect(response.status()).toBe(201)

    const issueData = await response.json()
    
    // Verify in UI
    await page.goto(`https://gitlab.testautomate.me/${userData.userName}/${projectName}/-/issues/${issueData.iid}`)
    await expect(page.getByText(issueData.title)).toBeVisible()
    await expect(page.getByText(developerData.userName)).toBeVisible()
})

    // When I logout
    // Then I am not logged in visitor

test('Logout and Verify Not Logged In', async ({ page }) => {
    const signInPage = new SignInPage(page)

    // Read admin info from file
    const adminData = await fs.readFile(adminFilePath, 'utf-8')
    const registeredUser = JSON.parse(adminData)

    await page.goto('https://gitlab.testautomate.me/users/sign_in')
    await signInPage.userName.fill(registeredUser.email)
    await signInPage.password.fill(registeredUser.password)
    await signInPage.rememberMe.check({ force: true })
    await signInPage.signInButton.click()

    // Logout
    await page.locator('.header-user-avatar').click()
    await page.getByRole('link', { name: 'Sign out' }).click()
    
    
    // Verify not logged in
    await expect(page).toHaveURL('https://gitlab.testautomate.me/users/sign_in')
})

    // When I login as 'developer' user
    // Then I become logged in as 'developer' user

test('Login as Developer User', async ({ page }) => {
    const developerData = JSON.parse(await fs.readFile(path.resolve(__dirname, '../testData/developerUser.json'), 'utf-8'))
    const signInPage = new SignInPage(page)

    await page.goto('https://gitlab.testautomate.me/users/sign_in')
    await signInPage.userName.fill(developerData.email)
    await signInPage.password.fill(developerData.password)
    await signInPage.rememberMe.check({ force: true })
    await signInPage.signInButton.click()

    // Verify login
    await expect(page).toHaveURL(`https://gitlab.testautomate.me/`)
})