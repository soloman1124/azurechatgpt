import { simplePromptDataGPT } from '@/features/chat/chat-api-data'
import { WebClient } from '@slack/web-api'

const slackWebClient = new WebClient(process.env.SLACK_BOT_TOKEN)

const respondAnswer = async (question: string, channel: string, ts: string) => {
  await slackWebClient.chat.postMessage({
    channel: channel,
    text: 'wait a sec... let me think about it...',
    thread_ts: ts, // Use the timestamp of the user's message to create a thread
  })
  const answer = await simplePromptDataGPT(question)
  await slackWebClient.chat.postMessage({
    channel: channel,
    text: answer,
    thread_ts: ts, // Use the timestamp of the user's message to create a thread
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  console.log(body)
  if (body.challenge) {
    return new Response(body.challenge, { status: 200 })
  }

  const { token } = body
  if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
    return new Response('Invalid token', { status: 401 })
  }

  const { event } = body
  const { channel, ts, bot_id, text } = event

  if (!bot_id) {
    respondAnswer(text, channel, ts)
  }

  return new Response('OK', { status: 200 })
}
