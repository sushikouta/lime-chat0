import { json } from '@sveltejs/kit';
import { makeClient, checkToken } from '$lib/database'

export async function GET({ url }) {
    let userId = url.searchParams.get('userId')
    let loginToken = url.searchParams.get('loginToken')

    if (!userId || !loginToken) {
        return json({
            success: false,
            message: 'ログインに失敗しました。'
        })
    }
    if (await checkToken(makeClient(), userId, loginToken)) {
        return json({
            success: true,
            message: 'ログインに成功しました。'
        })
    } else {
        return json({
            success: false,
            message: 'ログインに失敗しました。'
        })
    }
}