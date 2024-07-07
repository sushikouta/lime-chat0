import { json } from '@sveltejs/kit';
import { makeClient, makeToken } from '$lib/database'

export async function GET({ url }) {
    let username = url.searchParams.get('username')
    let password = url.searchParams.get('password')

    const client = makeClient()

    if (!username || !password) {
        return json({
            success: false,
            message: 'ログインに失敗しました。'
        })
    }
    if (!await client.exists('*', 'accounts', `username = '${username}'`)) {
        return json({
            success: false,
            message: 'ログインに失敗しました。'
        })
    }
    if ((await client.select('password', 'accounts', `username = '${username}'`))[0].password != password) {
        return json({
            success: false,
            message: 'ログインに失敗しました。'
        })
    }

    let userId = (await client.select('id', 'accounts', `username = '${username}'`))[0].id

    return json({
        success: true,
        message: 'ログインに成功しました。',
        userId: userId,
        loginToken: await makeToken(client, userId)
    })
}