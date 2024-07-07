import { json } from '@sveltejs/kit';
import { makeClient } from '$lib/database'

export async function GET({ url }) {
    let loginToken = url.searchParams.get('loginToken')

    if (!loginToken) {
        return json({
            'success': false,
            'message': 'トークンが不明です。'
        })
    }

    const client = makeClient()

    if (!await client.exists('*', 'tokens', `login_token = '${loginToken}'`)) {
        return json({
            'success': false,
            'message': '無効なトークンです。'
        })
    }

    await client.delete('tokens', `login_token = '${loginToken}'`)

    return json({
        'success': true,
        'message': 'ログアウトが完了しました。'
    })
}