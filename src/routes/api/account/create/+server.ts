import { json } from '@sveltejs/kit'
import { makeClient, makeToken } from '$lib/database'

export async function GET({ url }) {
    let username = url.searchParams.get('username')
    let password = url.searchParams.get('password')

    if (!username) {
        return json({
            success: false,
            message: 'ユーザーネームが空です。'
        })
    }
    if (username.length < 4) {
        return json({
            success: false,
            message: 'ユーザーネームが短すぎます。'
        })
    }
    if (username.length > 16) {
        return json({
            success: false,
            message: 'ユーザーネームが長すぎます。'
        })
    }
    if (!password) {
        return json({
            success: false,
            message: 'パスワードが空です。'
        })
    }
    if (password.length < 4) {
        return json({
            success: false,
            message: 'パスワードが短すぎます。'
        })
    }
    if (password.length > 16) {
        return json({
            success: false,
            message: 'パスワードが長すぎます。'
        })
    }

    const client = makeClient()

    if (await client.exists('*', 'accounts', `username = '${username}'`)) {
        return json({
            success: false,
            message: 'その名前はすでに使用されています。'
        })
    }

    let userId = crypto.randomUUID()

    client.insert('accounts', `'${userId}', DEFAULT, '${username}', '${password}'`)
    client.insert('profiles', `'${userId}', '${username}', DEFAULT`)

	return json({
        success: true,
        message: 'アカウントの作成が完了しました。',
        loginToken: await makeToken(client, userId)
    })
}